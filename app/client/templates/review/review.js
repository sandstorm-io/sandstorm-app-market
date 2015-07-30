// Create and declare app object outside template callbacks, then it will
// persist across route visits.

var appProto = function() {
      return {
        name: '',
        category: '',
        author: Meteor.userId()
      };
    },
    app = new ReactiveDict();

Template.Review.onCreated(function() {

  var tmp = this;

  tmp.file = new ReactiveVar();
  tmp.categories = new ReactiveVar();
  tmp.seedString = new ReactiveVar(Random.id());
  tmp.imageUrl = new ReactiveVar(false);
  tmp.screenshotsVis = new ReactiveVar(3);
  tmp.suggestNewGenre = new ReactiveVar(false);
  tmp.editingFields = new ReactiveVar({});
  tmp.editedFields = new ReactiveVar({});
  tmp.newVersion = new ReactiveVar(false);
  tmp.message = new ReactiveVar({});
  tmp.validator = Schemas.AppsBase.namedContext();
  tmp.flagApp = new ReactiveVar(!!FlowRouter.current().queryParams.flag);

  tmp.validate = function() {
    tmp.validator.validate(tmp.app.all());
  };

  var resetScreenshotsVis = function() {
    tmp.screenshotsVis.set(Math.max(Math.min(Math.floor($(window).width() / 400), 3), 1));
  };
  resetScreenshotsVis();

  tmp.app = app;
  var newApp = appProto();
  Schemas.AppsBase.clean(newApp);
  tmp.app.set(newApp);

  tmp.setCategories = function(categories, firstSet) {

    var allCategories = tmp.categories.get();

    _.each(categories, function(cat) {
      var thisCat = _.findWhere(allCategories, {name: cat});
      if (thisCat) {
        thisCat.selected = true;
        if (firstSet) thisCat.original = true;
      }
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

  tmp.clearApp = function() {

    var newApp = appProto(),
        oldApp = tmp.app.all();
    Schemas.AppsBase.clean(newApp);
    _.each(oldApp, function(val, key) {
      tmp.app.set(key, newApp[key]);
    });
    Meteor.call('user/deleteSavedApp', function(err) {
      if (err) console.log(err);
    });

  };

  // Autorun to regenerate identicon when required
  tmp.autorun(function() {
    tmp.app.set('image', AppMarket.blockies.create({
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

      // Save the original app for comparison
      tmp.originalApp = Apps.findOne(FlowRouter.getParam('appId'));
      // And load either a published admin's requested changes, this admin user's saved
      // version, or the currently published app (in that order of precedence).
      if (tmp.originalApp && tmp.originalApp.adminRequests[0]) {
        tmp.app.set(tmp.originalApp.adminRequests[0]);
      } else if (Meteor.user() && Meteor.user().savedApp && Meteor.user().savedApp[FlowRouter.getParam('appId')]) {
        tmp.app.set(Meteor.user().savedApp[FlowRouter.getParam('appId')]);
      } else {
        var newVersion = Apps.findOne(FlowRouter.getParam('appId')),
            lastVersion = newVersion.latestVersion();
        newVersion.replacesApp = newVersion._id;
        newVersion.versions = [lastVersion];
        Schemas.AppsBase.clean(newVersion);
        delete newVersion._id;
        tmp.app.set(newVersion);
      }
      // highlight edited fields
      var editedFields = tmp.editedFields.get();
      if (tmp.originalApp) {
        _.each(tmp.app.all(), function(val, field) {
          if (val !== tmp.originalApp[field]) editedFields[field] = true;
        });
      }
      tmp.editedFields.set(editedFields);
      tmp.setCategories(tmp.app.get('categories'), true);

      c.stop();
    }

  });

  $(window).on('resize.upload', resetScreenshotsVis);

  // TODO: delete this, debug method
  window.showApp = function() {
    console.log(tmp.app.all());
  };

});

Template.Review.onDestroyed(function() {
  $(window).off('resize.upload');
});

Template.Review.helpers({

  app: function() {

    return Template.instance().app.all();

  },

  parentApp: function() {

    return Apps.findOne(FlowRouter.getParam('appId'));

  },

  isFlagged: function() {

    var app = Apps.findOne(FlowRouter.getParam('appId'));
    return app && !_.isEmpty(app.flags);

  },

  fieldEdit: function(field) {

    return Template.instance().editingFields.get()[field];

  },

  newVersion: function() {

    return Template.instance().newVersion.get();

  },

  appNotes: function() {

    return Template.instance().get('appNotes').get();

  },

  edited: function(field) {

    return Template.instance().editedFields.get()[field];

  },

  message: function() {

    return Template.instance().message.get();

  },

  originalApp: function() {

    return Template.instance().get('originalApp');

  },

  status: function() {

    var originalApp = Apps.findOne(FlowRouter.getParam('appId'));
    return [

      {
        color: 'green',
        icon: 'icon-approved_light',
        text: 'Approved'
      },
      {
        color: '',
        icon: '',
        text: 'Pending'
      },
      {
        color: 'purple',
        icon: 'icon-revisions',
        text: 'Revision Requested'
      },
      {
        color: 'black',
        icon: 'icon-rejected_light',
        text: 'Rejected'
      },


    ][originalApp && originalApp.approved];

  },

  flagApp: function() {

    return Template.instance().flagAppMarket.get();

  },

  flagged: function() {

    return Meteor.user() && Meteor.user().flags && (this._id in Meteor.user().flags);

  },

  flagDetails: function() {

    var originalApp = Apps.findOne(FlowRouter.getParam('appId'));
    return Meteor.user() && Meteor.user().flags && Meteor.user().flags[originalApp._id];

  }


});

Template.Review.events({

  'click [data-action="submit-note"]': function(evt, tmp) {
    Meteor.call('apps/addNote', FlowRouter.getParam('appId'), tmp.$('[data-field="note-entry"]').val(), function(err) {
      tmp.$('[data-field="note-entry"]').val('');
      if (err) throw new Meteor.Error(err.message);
    });
  },

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
        editedFields = tmp.editedFields.get(),
        field = $el.data('field');
    delete editingFields[field];
    editedFields[field] = ($el.val() !== tmp.originalApp[field]);
    tmp.editingFields.set(editingFields);
    tmp.editedFields.set(editedFields);

  },

  'click [data-action="update-version"]': function(evt, tmp) {

    tmp.newVersion.set(true);
    if (evt.currentTarget.nodeName === 'INPUT') {
      Tracker.afterFlush(function() {
        $('[data-version-field="number" ]').focus();
      });
    }

  },

  'change [data-action="update-version"]': function(evt, tmp) {

    var versions = tmp.app.get('versions'),
        newVersion = {
          dateTime: new Date(),
          number: tmp.$('[data-version-field="number"]').val(),
          changes: tmp.$('[data-version-field="changes"]').val()
        };
    tmp.app.set('versions', [newVersion]);

  },

  'click [data-action="toggle-private"]': function(evt, tmp) {

    tmp.app.set('public', !tmp.app.get('public'));

  },

  'click [data-action="make-free"]': function(evt, tmp) {

    tmp.app.set('price', 0);

  },

  'click [data-action="submit-admin-requests"]:not(.disabled)': function(evt, tmp) {

    tmp.validate();
    Meteor.call('admin/submitAdminRequests', tmp.app.all(), AppMarket.redirectOrErrorCallback('admin', function() {
      window.scroll(0, 0);
      tmp.message.set({
        icon: 'green icon-approved_dark',
        text: 'SUBMITTED ON ' + new moment().format('DD MMM YY at H:mm')
      });
    }, 2000));

  },

  'click [data-action="save-admin-requests"]:not(.disabled)': function(evt, tmp) {

    tmp.validate();
    Meteor.call('user/saveApp', tmp.app.all(), AppMarket.redirectOrErrorCallback('appsByMe', function() {
      window.scroll(0, 0);
      tmp.message.set({
        icon: 'green icon-approved_dark',
        text: 'SAVED ON ' + new moment().format('DD MMM YY at H:mm')
      });
    }, 2000));

  },

  'click [data-action="discard-admin-requests"]': function(evt, tmp) {

    AntiModals.overlay('nukeModal', {data: {
      topMessage: 'Are you sure you want to delete your saved suggestions?',
      bottomMessage: 'This can\'t be undone.',
      actionText: 'Yes, nuke',
      actionFunction: function(cb) {
        Meteor.call('user/deleteSavedApp', FlowRouter.getParams('appId'), AppMarket.redirectOrErrorCallback('admin'));
      }
    }});

  },

  'click [data-action="delete-app"]': function(evt, tmp) {

    AntiModals.overlay('nukeModal', {data: {
      topMessage: 'Are you sure you want to nuke this app?',
      bottomMessage: 'This will delete the app itself, not just your version, and it can\'t be undone.',
      actionText: 'Yes, nuke',
      actionFunction: function(cb) {
        Meteor.call('user/deleteApp', FlowRouter.getParams('appId'), AppMarket.redirectOrErrorCallback('admin'));
      }
    }});

  },

  'click [data-action="scroll-top"]': function() {

    window.scrollTo(0, 0);

  },

  'click [data-action="approve"]': function() {
    Meteor.call('apps/approve', FlowRouter.getParam('appId'), function(err) {
      if (err) throw new Meteor.Error(err.message);
    });
  },
  'click [data-action="request-revision"]': function() {
    Meteor.call('apps/request-revision', FlowRouter.getParam('appId'), function(err) {
      if (err) throw new Meteor.Error(err.message);
    });
  },
  'click [data-action="flag-app"]': function(evt, tmp) {
    tmp.flagAppMarket.set(!tmp.flagAppMarket.get());
  },
  'click [data-action="reject"]': function() {
    Meteor.call('apps/reject', FlowRouter.getParam('appId'), function(err) {
      if (err) throw new Meteor.Error(err.message);
    });
  },

});

Template.descriptionEditor.onCreated(function() {

  var tmp = this;

  tmp.preview = new ReactiveVar();
  tmp.description = new ReactiveVar();
  tmp.original = new ReactiveVar();
  tmp.currentView = new ReactiveVar('description');

  tmp.converter = new Showdown.converter();

  tmp.autorun(function(c) {
    if (FlowRouter.subsReady()) {
      Tracker.afterFlush(function() {
        tmp.preview.set(tmp.data.initial || tmp.data.original);
        tmp.description.set(tmp.data.initial);
        tmp.original.set(tmp.data.original);
        c.stop();
      });
    }
  });

});

Template.descriptionEditor.helpers({

  description: function() {
    return Template.instance().get('description').get();
  },
  preview: function() {
    return Template.instance().get('preview').get();
  },
  original: function() {
    return Template.instance().get('original').get();
  },
  view: function(view) {
    return Template.instance().get('currentView').get() === view;
  },
  emptyDescriptionTooltip: function() {
    return '<h4>The description appears to be blank</h4><p>Are you sure you want to submit this' +
           ' app for review?</p>';
  }

});

Template.descriptionEditor.events({

  'click [data-view]': function(evt, tmp) {
    var $target = $(evt.currentTarget),
        view = $target.data('view');
    if (view === 'preview') tmp.preview.set(tmp.converter.makeHtml(tmp.get('app').get('description')));
    tmp.$('[data-field="' + view + '"]').css('height', tmp.$('.description-editor:not(.hidden)').css('height'));
    tmp.currentView.set(view);
    Tracker.afterFlush($.prototype.focus.bind(tmp.$('[data-field="' + view + '"]')));
  },

  'change [data-field="description"]': function(evt, tmp) {
    var app = tmp.get('app');
    app.set('description', $(evt.currentTarget).val());
  }

});
