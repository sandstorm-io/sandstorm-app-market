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

Template.Upload.onCreated(function() {

  var tmp = this;

  tmp.file = new ReactiveVar();
  tmp.categories = new ReactiveVar();
  tmp.seedString = new ReactiveVar(Random.id());
  tmp.imageUrl = new ReactiveVar(false);
  tmp.screenshotsVis = new ReactiveVar(3);
  tmp.suggestNewGenre = new ReactiveVar(false);

  var resetScreenshotsVis = function() {
    tmp.screenshotsVis.set(Math.min(Math.ceil(($(window).width() - 300) / 600), 3));
  };
  resetScreenshotsVis();

  tmp.app = app;
  var newApp = appProto();
  Schemas.AppsBase.clean(newApp);
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
    Meteor.call('user/delete-saved-app', function(err) {
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

      // And load the saved app, if present
      if (Meteor.user() && Meteor.user().savedApp && Meteor.user().savedApp.new) {
        tmp.app.set(Meteor.user().savedApp.new);
        tmp.setCategories(tmp.app.get('categories'));
      }

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

Template.Upload.onDestroyed(function() {
  $(window).off('resize.upload');
});

Template.Upload.helpers({

  app: function() {

    return Template.instance().app.all();

  }

});

Template.Upload.events({

  'change input[type="text"][data-field], change textarea[data-field], change input[type="number"][data-field]': function(evt, tmp) {

    var $el = $(evt.currentTarget);
    tmp.app.set($el.data('field'), $el.val());

  },

  'change [data-action="update-version"]': function(evt, tmp) {

    var versions = tmp.app.get('versions'),
        $el = $(evt.currentTarget);
    tmp.app.set('versions', [{
      dateTime: new Date(),
      number: $el.val()
    }]);

  },

  'click [data-action="toggle-private"]': function(evt, tmp) {

    tmp.app.set('public', !tmp.app.get('public'));

  },

  'click [data-action="make-free"]': function(evt, tmp) {

    tmp.app.set('price', 0);

  },

  'click [data-action="submit-app"]': function(evt, tmp) {

    Meteor.call('user/submit-app', tmp.app.all(), function(err, res) {
      if (err) console.log(err);
      else if (res) FlowRouter.go('appsByMe');
    });

  },

  'click [data-action="save-app"]': function(evt, tmp) {

    Meteor.call('user/save-app', tmp.app.all(), function(err) {
      if (err) console.log(err);
    });

  },

  'click [data-action="delete-app"]': function(evt, tmp) {

    AntiModals.overlay('nukeModal', {data: {
      topMessage: 'Are you sure you want to nuke this app?',
      bottomMessage: 'This can\'t be undone.',
      actionText: 'Yes, nuke',
      actionFunction: function(cb) {
        tmp.clearApp();
        cb();
      }
    }});

  },

});

Template.fileBox.onCreated(function() {

  this.uploaded = new ReactiveVar();

});

Template.fileBox.helpers({

  filename: function() {

    var file = Template.instance().get('file').get();
    return file && file.name;

  },

  uploaderStatus: function() {

    return App.spkUploader.status();

  },

  progress: function () {

    return Math.round(App.spkUploader.progress() * 100);

  },

  uploaded: function() {

    return Template.instance().uploaded.get();

  }

});

Template.fileBox.events({

  'click [data-action="choose-file"]': function(evt, tmp) {

    tmp.$('[data-action="file-picker"][data-for="spk"]').click();
    evt.stopPropagation();

  },

  'change [data-action="file-picker"][data-for="spk"]': function(evt, tmp) {

    tmp.get('file').set(evt.currentTarget.files[0]);

  },

  'click [data-action="upload-spk"]': function(evt, tmp) {

    var file = tmp.get('file').get();

    if (file) App.spkUploader.send(file, function(err, downloadUrl) {

      if (err)
        console.error('Error uploading', err);
      else {
        tmp.get('app').set('spkLink', encodeURI(downloadUrl));
        tmp.get('uploaded').set(file.name);
      }

    });

    else tmp.$('[data-action="file-picker"][data-for="spk"]').click();

  }

});

Template.genreGrid.helpers({

  categories: function() {

    return Template.instance().get('categories').get();

  },

  suggestNewGenre: function() {

    return Template.instance().get('suggestNewGenre').get();

  }

});

Template.genreGrid.events({

  'click [data-action="select-genre"]': function(evt, tmp) {

    tmp.get('toggleCategory').call(tmp, this);

  },

  'click [data-action="suggest-genre"]': function(evt, tmp) {

    var categories = tmp.get('categories').get();
    categories.push({
      name: '',
      showSummary: true,
      new: true,
      editing: true
    });
    tmp.get('categories').set(categories);
    Tracker.afterFlush(function() {
      tmp.$('[data-field="new-genre-name"]').focus();
    });

  },

  'click [data-action="save-genre"], keyup [data-field="new-genre-name"], blur [data-field="new-genre-name"]': function(evt, tmp) {

    if (evt.keyCode && evt.keyCode !== 13) {

      this.name = s.titleize(tmp.$('[data-field="new-genre-name"]').val());

    } else {

      var categories = tmp.get('categories').get();

      delete this.editing;
      this.selected = true;
      tmp.get('app').set('categories', tmp.get('app').get('categories').concat(this.name));
      categories = _.reject(categories, function(cat) { return !cat.name; });

      tmp.get('categories').set(categories);

    }

  },

});

Template.iconPicker.helpers({

  seedString: function() {

    return Template.instance().get('seedString').get();

  }

});

Template.iconPicker.events({

  'click [data-action="choose-file"]': function(evt, tmp) {

    tmp.$('[data-action="file-picker"][data-for="' + $(evt.currentTarget).data('name') + '"]').click();
    evt.stopPropagation();

  },

  'change [data-action="file-picker"][data-for="identicon"]': function(evt, tmp) {

    var file = evt.currentTarget.files[0];

    if (file) {
      tmp.get('app').set('image', App.imageUploader.url(true));

      App.imageUploader.send(file, function(err, downloadUrl) {

        if (err)
          console.error('Error uploading', err);
        else {
          tmp.get('app').set('image', encodeURI(downloadUrl));
        }
      });
    }

  },

  'click [data-action="regenerate-identicon"]': function(evt, tmp) {

    tmp.get('seedString').set(Random.id());
    tmp.get('app').set('image', '');

  }

});

Template.screenshotPicker.helpers({

  screenshotPlaceholders: function() {

    var tmp = Template.instance();

    return _.range(Math.max(tmp.get('screenshotsVis').get() - tmp.get('app').get('screenshots').length, 1));

  }

});

Template.screenshotPicker.events({

  'click [data-action="choose-file"]': function(evt, tmp) {

    tmp.$('[data-action="file-picker"][data-for="' + $(evt.currentTarget).data('name') + '"]').click();
    evt.stopPropagation();

  },

  'change [data-action="file-picker"][data-for="screenshot"]': function(evt, tmp) {

    var file = evt.currentTarget.files[0];

    if (file) {

      App.imageUploader.send(file, function(err, downloadUrl) {

        if (err)
          console.error('Error uploading', err);
        else {
          var screenshots = tmp.get('app').get('screenshots');
          downloadUrl = encodeURI(downloadUrl);
          if (!('screenshotInd' in tmp) || tmp.screenshotInd < 0) screenshots.push({url: downloadUrl});
          else {
            screenshots[tmp.screenshotInd] = {url: downloadUrl};
            delete tmp.screenshotInd;
          }
          tmp.get('app').set('screenshots', screenshots);
        }
      });
    }

  },

  'click [data-action="change-screenshot"]': function(evt, tmp) {

    var screenshots = tmp.get('app').get('screenshots'),
        thisUrl = this.url;

    _.each(screenshots, function(screenshot, ind) {
      if (screenshot.url === thisUrl) tmp.screenshotInd = ind;
    });

    tmp.$('[data-action="file-picker"][data-for="screenshot"]').click();

  },

  'click [data-action="remove-screenshot"]': function(evt, tmp) {

    var screenshots = tmp.get('app').get('screenshots'),
        thisUrl = this.url,
        screenshotInd = -1;

    _.each(screenshots, function(screenshot, ind) {
      if (screenshot.url === thisUrl) screenshotInd = ind;
    });


    if (screenshotInd > -1) {
      screenshots.splice(screenshotInd, 1);
      console.log(screenshots);
      tmp.get('app').set('screenshots', screenshots);
    }

  },

  'click [data-action="open-comment-box"]': function(evt, tmp) {

    var screenshots = tmp.get('app').get('screenshots'),
        thisUrl = this.url,
        screenshotInd = -1;

    _.each(screenshots, function(screenshot, ind) {
      if (screenshot.url === thisUrl) screenshotInd = ind;
    });

    screenshots[screenshotInd].comment = 'Suggest feedback?';
    tmp.get('app').set('screenshots', screenshots);

  },

  'change [data-field="comment-box"]': function(evt, tmp) {

    var screenshots = tmp.get('app').get('screenshots'),
        thisUrl = this.url,
        screenshotInd = -1;

    _.each(screenshots, function(screenshot, ind) {
      if (screenshot.url === thisUrl) screenshotInd = ind;
    });

    screenshots[screenshotInd].comment = $(evt.currentTarget).val();
    tmp.get('app').set('screenshots', screenshots);

  }

});

Template.nukeModal.events({

  'click [data-action="close-modal"]': function() {

    AntiModals.dismissAll();

  },

  'click [data-action="perform-action"]': function() {

    this.actionFunction && this.actionFunction.call(this, function() {
      AntiModals.dismissAll();
    });

  }

});
