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
  tmp.submitted = new ReactiveVar();
  tmp.validator = Schemas.AppsBase.namedContext();
  tmp.flagApp = new ReactiveVar(!!FlowRouter.current().queryParams.flag);

  tmp.validate = function() {
    tmp.validator.validate(tmp.app.all());
  };

  var resetScreenshotsVis = function() {
    tmp.screenshotsVis.set(Math.min(Math.ceil(($(window).width() - 300) / 600), 3));
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

      // Save the original app for comparison
      tmp.originalApp = Apps.findOne(FlowRouter.current().params.appId);
      // And load either a published admin's requested changes, this admin user's saved
      // version, or the currently published app (in that order of precedence).
      if (tmp.originalApp && tmp.originalApp.adminRequests[0]) {
        tmp.app.set(tmp.originalApp.adminRequests[0]);
      } else if (Meteor.user() && Meteor.user().savedApp && Meteor.user().savedApp[FlowRouter.current().params.appId]) {
        tmp.app.set(Meteor.user().savedApp[FlowRouter.current().params.appId]);
      } else {
        var newVersion = Apps.findOne(FlowRouter.current().params.appId),
            lastVersionNumber = newVersion.latestVersion();
        newVersion.replacesApp = newVersion._id;
        newVersion.versions = [];
        Schemas.AppsBase.clean(newVersion);
        newVersion.lastVersionNumber = lastVersionNumber;
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

  var resetScreenshotsVis = function() {
    tmp.screenshotsVis.set(Math.min(Math.ceil(($(window).width() - 300) / 600), 3));
  };

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

    return Apps.findOne(FlowRouter.current().params.appId);

  },

  isFlagged: function() {

    var app = Apps.findOne(FlowRouter.current().params.appId);
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

  submitted: function() {

    return Template.instance().submitted.get();

  },

  originalApp: function() {

    return Template.instance().get('originalApp');

  },

  status: function() {

    var originalApp = Apps.findOne(FlowRouter.current().params.appId);
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

    return Template.instance().flagApp.get();

  },

  flagged: function() {

    return Meteor.user() && Meteor.user().flags && (this._id in Meteor.user().flags);

  },

  flagDetails: function() {

    var originalApp = Apps.findOne(FlowRouter.current().params.appId);
    return Meteor.user() && Meteor.user().flags && Meteor.user().flags[originalApp._id];

  }


});

Template.Review.events({

  'click [data-action="submit-note"]': function(evt, tmp) {
    Meteor.call('apps/addNote', FlowRouter.current().params.appId, tmp.$('[data-field="note-entry"]').val(), function(err) {
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

  'click [data-action="submit-admin-requests"]': function(evt, tmp) {

    tmp.validate();
    Meteor.call('admin/submitAdminRequests', tmp.app.all(), function(err, res) {
      if (err) console.log(err);
      else if (res) {
        window.scrollTo(0, 0);
        tmp.submitted.set(new Date());
      }
    });

  },

  'click [data-action="save-admin-requests"]': function(evt, tmp) {

    tmp.validate();
    Meteor.call('user/saveApp', tmp.app.all(), function(err) {
      if (err) console.log(err);
      else {
        window.scrollTo(0, 0);
        tmp.app.set(Meteor.user().savedApp[FlowRouter.current().params.appId]);
      }
    });

  },

  'click [data-action="discard-admin-requests"]': function(evt, tmp) {

    AntiModals.overlay('nukeModal', {data: {
      topMessage: 'Are you sure you want to delete your saved suggestions?',
      bottomMessage: 'This can\'t be undone.',
      actionText: 'Yes, nuke',
      actionFunction: function(cb) {
        Meteor.call('user/deleteSavedApp', tmp.app.get('replacesApp'), function(err, res) {
          if (err) {
            console.log(err);
          }
          else {
            tmp.clearApp();
            var newVersion = Apps.findOne(FlowRouter.current().params.appId);
            newVersion.replacesApp = newVersion._id;
            newVersion.versions = [];
            Schemas.AppsBase.clean(newVersion);
            tmp.app.set(newVersion);
            tmp.setCategories(tmp.app.get('categories'));
            cb();
          }
        });
      }
    }});

  },

  'click [data-action="delete-app"]': function(evt, tmp) {

    AntiModals.overlay('nukeModal', {data: {
      topMessage: 'Are you sure you want to nuke this app?',
      bottomMessage: 'This will delete the app itself, not just your version, and it can\'t be undone.',
      actionText: 'Yes, nuke',
      actionFunction: function(cb) {
        Meteor.call('user/deleteApp', tmp.app.get('replacesApp'), function(err, res) {
          if (err) console.log(err);
          else {
            tmp.clearApp();
            cb();
          }
        });
      }
    }});

  },

  'click [data-action="scroll-top"]': function() {

    window.scrollTo(0, 0);

  },

  'click [data-action="approve"]': function() {
    Meteor.call('apps/approve', FlowRouter.current().params.appId, function(err) {
      if (err) throw new Meteor.Error(err.message);
    });
  },
  'click [data-action="request-revision"]': function() {
    Meteor.call('apps/request-revision', FlowRouter.current().params.appId, function(err) {
      if (err) throw new Meteor.Error(err.message);
    });
  },
  'click [data-action="flag"]': function(evt, tmp) {
    tmp.flagApp.set(!tmp.flagApp.get());
    // Meteor.call('apps/flag', FlowRouter.current().params.appId, function(err) {
    //   if (err) throw new Meteor.Error(err.message);
    // });
  },
  'click [data-action="reject"]': function() {
    Meteor.call('apps/reject', FlowRouter.current().params.appId, function(err) {
      if (err) throw new Meteor.Error(err.message);
    });
  },

});

Template.descriptionEditor.onCreated(function() {

  var tmp = this;

  tmp.original = new ReactiveVar();
  tmp.current = new ReactiveVar();
  tmp.viewOriginal = new ReactiveVar(false);

  tmp.converter = new Showdown.converter();

  tmp.autorun(function(c) {
    if (FlowRouter.subsReady()) {
      Tracker.afterFlush(function() {
        tmp.original.set(tmp.data.original || tmp.data.initial);
        tmp.current.set(tmp.data.initial);
        c.stop();
      });
    }
  });

});

Template.descriptionEditor.helpers({

  current: function() {
    return Template.instance().get('current').get();
  },
  original: function() {
    return Template.instance().get('original').get();
  },
  viewOriginal: function() {
    return Template.instance().get('viewOriginal').get();
  },
  emptyDescriptionTooltip: function() {
    return '<h4>The description appears to be blank</h4><p>Are you sure you want to submit this' +
           ' app for review?</p>';
  }

});

Template.descriptionEditor.events({

  'click [data-action="edit-markdown"]': function(evt, tmp) {
    $('[data-field="description"]').css('height', $('[data-field="original"]').css('height'));
    tmp.viewOriginal.set(false);
    Tracker.afterFlush($.prototype.focus.bind(tmp.$('[data-field="description"]')));
  },

  'click [data-action="view-original"]': function(evt, tmp) {
    $('[data-field="original"]').css('height', $('[data-field="description"]').css('height'));
    tmp.original.set(tmp.converter.makeHtml(tmp.get('app').get('description')));
    tmp.viewOriginal.set(true);
  },

  'change [data-field="description"]': function(evt, tmp) {
    var app = tmp.get('app');
    app.set('description', $(evt.currentTarget).val());
  }

});
