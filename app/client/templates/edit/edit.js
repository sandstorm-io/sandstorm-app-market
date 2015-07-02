// Create and declare app object outside template callbacks, then it will
// persist across route visits.

var appProto = function() {
      return {
        name: '',
        category: '',
        author: Meteor.userId()
      };
    };

Template.Edit.onCreated(function() {

  var tmp = this,
      app = new ReactiveDict();

  tmp.file = new ReactiveVar();
  tmp.categories = new ReactiveVar();
  tmp.seedString = new ReactiveVar(Random.id());
  tmp.imageUrl = new ReactiveVar(false);
  tmp.screenshotsVis = new ReactiveVar(3);
  tmp.suggestNewGenre = new ReactiveVar(false);
  tmp.editingFields = new ReactiveVar({});
  tmp.newVersion = new ReactiveVar(false);
  tmp.message = new ReactiveVar({});
  tmp.changedOriginal = new ReactiveVar(false);
  tmp.validator = Schemas.AppsBase.namedContext();
  tmp.descriptionWarning = false;

  tmp.validate = function() {
    var valid = tmp.validator.validate(tmp.app.all());
    if (tmp.app.get('versions').length === 0) {
      tmp.validator.addInvalidKeys([{
        name: 'version',
        type: 'version number required'
      }]);
      valid = false;
    }
    return valid;
  };

  var resetScreenshotsVis = function() {
    var width = $(window).width(),
        vis = (width > 1279) ? 3 : (width > 720 ? 2 : 1);
    tmp.screenshotsVis.set(vis);
  };
  resetScreenshotsVis();

  tmp.app = app;
  var newApp = appProto();
  Schemas.AppsBase.clean(newApp);
  var thisApp = Apps.findOne(FlowRouter.getParam('appId')),
      lastVersion = thisApp && thisApp.latestVersion();
  newApp.versions = [lastVersion];
  tmp.app.set(newApp);

  tmp.setCategories = function(categories) {

    var allCategories = tmp.categories.get();

    _.each(categories, function(cat) {
      var thisCat = _.findWhere(allCategories, {name: cat});
      if (thisCat) thisCat.selected = true;
      else allCategories.push({
        name: cat,
        showSummary: true,
        new: true,
        selected: true
      });
    });
    _.each(allCategories, function(cat) {
      if (categories.indexOf(cat.name) < 0) cat.selected = false;
    });

    tmp.categories.set(allCategories);
    // tmp.app.set('categories', allCategories);
    tmp.categories.dep.changed();

  };

  tmp.toggleCategory = function(category) {

    var categories = tmp.categories.get();
    if (typeof category === 'string') category = _.findWhere(categories, {name: category});
    if (!category) return;

    if (category.selected) {
      delete category.selected;
      tmp.app.set('categories', _.without(tmp.app.get('categories'), category.name));
      if (category.new) tmp.categories.set(_.reject(categories, function(thisCat) { return thisCat.name === category.name; }));
    } else {
      category.selected = true;
      tmp.app.set('categories', tmp.app.get('categories').concat(category.name));
    }
    tmp.categories.dep.changed();

  };

  tmp.unsetCategories = function() {

    var allCategories = tmp.categories.get();

    _.each(allCategories, function(cat) {
      cat.selected = false;
    });

    tmp.categories.set(allCategories);
    tmp.categories.dep.changed();

  };

  tmp.clearApp = function() {

    var newApp = appProto(),
        oldApp = tmp.app.all();
    Schemas.AppsBase.clean(newApp);
    _.each(oldApp, function(val, key) {
      tmp.app.set(key, newApp[key]);
    });
    tmp.unsetCategories();
    Meteor.call('user/deleteSavedApp', function(err) {
      if (err) console.log(err);
    });

  };

  // Autorun to regenerate identicon when required
  tmp.autorun(function() {
    tmp.app.set('image', App.blockies.create({
      seed: tmp.seedString.get(),
      size: 5,
      scale: 50
    }).toDataURL());
  });

  // Need to wait for categories sub to be ready before recording
  // existing categories.
  tmp.autorun(function(c) {

    if (FlowRouter.subsReady()) {

      // Now we can store the genre list
      var categories = Categories.find().fetch();
      tmp.categories.set(categories);

      // And load the admin suggested version or the actual app
      var appDoc = Apps.findOne(FlowRouter.getParam('appId'));
      if (appDoc && appDoc.adminRequests.length && appDoc.lastUpdatedAdmin) {
        tmp.app.set(appDoc.adminRequests[0]);
        tmp.changedOriginal.set(true);
      } else if (appDoc) {
        var newVersion = Apps.findOne(FlowRouter.getParam('appId'));
        var latestVersion = newVersion.latestVersion();
        if (!newVersion.replacesApp) newVersion.replacesApp = newVersion._id;
        newVersion.versions = [latestVersion];
        Schemas.AppsBase.clean(newVersion);
        delete newVersion._id;
        tmp.app.set(newVersion);
      }
      tmp.setCategories(tmp.app.get('categories'));

      c.stop();
    }

  });

  $(window).on('resize.upload', resetScreenshotsVis);

  // TODO: delete this, debug method
  window.showApp = function() {
    console.log(tmp.app.all());
  };

});

Template.Edit.onDestroyed(function() {
  $(window).off('resize.upload');
});

Template.Edit.helpers({

  app: function() {

    return Template.instance().app.all();

  },

  message: function() {

    return Template.instance().message.get();

  },

  parentApp: function() {

    return Apps.findOne(FlowRouter.getParam('appId'));

  },

  changedOriginal: function() {

    return Template.instance().get('changedOriginal').get();

  },

  adminRequest: function() {

    var app = Apps.findOne(FlowRouter.getParam('appId'));
    return app && app.adminRequests && app.adminRequests.length && app.adminRequests[0];

  },

  fieldEdit: function(field) {

    return (field in Template.instance().editingFields.get());

  },

  newVersion: function() {

    return Template.instance().newVersion.get();

  }

});

Template.Edit.events({

  'click div[data-alt-field]': function(evt, tmp) {

    var fields = tmp.editingFields.get(),
        thisField = $(evt.currentTarget).data('alt-field');
    fields[thisField] = true;
    tmp.editingFields.set(fields);
    Tracker.afterFlush(function() {
      tmp.$('[data-field="' + thisField + '"]').focus();
    });

  },

  'change input[type="text"][data-field], change textarea[data-field], change input[type="number"][data-field]': function(evt, tmp) {

    var $el = $(evt.currentTarget);
    tmp.app.set($el.data('field'), $el.val());

  },

  'blur [data-field], keyup [data-field]': function(evt, tmp) {

    if (evt.keyCode && evt.keyCode !== 13) return false;
    var $el = $(evt.currentTarget);
    var editingFields = tmp.editingFields.get(),
        field = $el.data('field');
    delete editingFields[field];
    tmp.editingFields.set(editingFields);

  },

  'click [data-alt-field="latestVersion"]': function(evt, tmp) {

    tmp.newVersion.set(true);
    if (evt.currentTarget.nodeName === 'INPUT') {
      Tracker.afterFlush(function() {
        $('[data-version-field="number" ]').focus();
      });
    }

  },

  'change [data-action="update-version"]': function(evt, tmp) {

    var lastVersion = tmp.app.get('versions')[0];
        _.extend(lastVersion, {
          number: tmp.$('[data-version-field="number"]').val(),
          changes: tmp.$('[data-version-field="changes"]').val()
        });
    tmp.app.set('versions', [lastVersion]);

  },

  'click [data-action="toggle-private"]': function(evt, tmp) {

    tmp.app.set('public', !tmp.app.get('public'));

  },

  'click [data-action="make-free"]': function(evt, tmp) {

    tmp.app.set('price', 0);

  },

  'click [data-action="submit-app"]:not(.disabled)': function(evt, tmp) {

    if (tmp.validate()) {
      if (tmp.app.get('versions').length > 0) {
        if (!tmp.app.get('description') && !tmp.descriptionWarning) {
          $(window).scrollTo('[data-description-warning]');
          Tooltips.show('[data-description-warning]');
          tmp.descriptionWarning = true;
          Meteor.setTimeout(Tooltips.hide.bind(Tooltips), 5000);
        } else {
          Meteor.call('user/submitApp', tmp.app.all(), App.redirectOrErrorCallback('appsByMe', function() {
            window.scroll(0, 0);
            tmp.message.set({
              icon: 'green icon-approved_dark',
              text: 'SUBMITTED ON ' + new moment().format('DD MMM YY at H:mm')
            });
          }, 2000));
        }
      } else {
        $(window).scrollTo('[data-action="update-version"]');
        $('[data-action="update-version"]').data('invalid', true);
        Tooltips.setClasses(['invalid']);
        Tooltips.show(tmp.$('[data-action="update-version"]')[0], 'You need to enter a new version number', 's');
        Tooltips.hideDelay(3000, 500);
      }
    } else {
      Tracker.afterFlush(function() {
        $(window).scrollTo('[data-invalid]');
        Tooltips.setClasses(['invalid']);
        var tooltipTarget = tmp.$('[data-invalid]').next()[0] || tmp.$('[data-invalid]')[0];
        Tooltips.show(tooltipTarget, 'You need to update this field', 's');
        Tooltips.hideDelay(3000, 500);
      });
    }

  },

  'click [data-action="save-app"]:not(.disabled)': function(evt, tmp) {

    tmp.validate();
    Meteor.call('user/saveApp', tmp.app.all(), App.redirectOrErrorCallback('appsByMe', function() {
      window.scroll(0, 0);
      tmp.message.set({
        icon: 'green icon-approved_dark',
        text: 'SAVED ON ' + new moment().format('DD MMM YY at H:mm')
      });
    }, 2000));

  },

  'click [data-action="discard-edits"]': function(evt, tmp) {

    AntiModals.overlay('nukeModal', {data: {
      topMessage: 'Are you sure you want to discard your edits?',
      bottomMessage: 'This can\'t be undone.',
      actionText: 'Yes, discard',
      actionFunction: function(cb) {
        Meteor.call('user/deleteSavedApp', FlowRouter.getParam('appId'), App.redirectOrErrorCallback('appsByMe', cb));
      }
    }});

  },

  'click [data-action="delete-app"]': function(evt, tmp) {

    AntiModals.overlay('nukeModal', {data: {
      topMessage: 'Are you sure you want to nuke this app?',
      bottomMessage: 'This can\'t be undone.',
      actionText: 'Yes, nuke',
      actionFunction: function(cb) {
        Meteor.call('user/deleteApp', FlowRouter.getParam('appId'), App.redirectOrErrorCallback('appsByMe', cb));
      }
    }});

  },

});

Template.appNotesBox.helpers({

  notesAndFlags: function() {

    var flags = this.flags;
    return (this.notes || []).concat(_.values(flags || {}));

  },

  sorted: function(notes) {

    return Array.isArray(notes) && notes.sort(function(a, b) {return b.dateTime - a.dateTime;});

  }

});
