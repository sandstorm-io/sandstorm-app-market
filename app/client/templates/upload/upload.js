// Create and declare app object outside template callbacks, then it will
// persist across route visits.

var appProto = {
      name: '',
      category: '',
      author: Meteor.userId()
    },
    app = new ReactiveDict('app');
Schemas.Apps.clean(appProto);

Template.Upload.onCreated(function() {

  var tmp = this;

  tmp.file = new ReactiveVar();
  tmp.categories = new ReactiveVar();
  tmp.seedString = new ReactiveVar(Random.id());
  tmp.imageUrl = new ReactiveVar(false);
  tmp.screenshotsVis = new ReactiveVar(3);
  tmp.suggestNewGenre = new ReactiveVar(false);

  tmp.app = app;
  tmp.app.set(appProto);

  // Need to wait for categories sub to be ready before recording
  // existing categories.
  tmp.autorun(function(c) {

    if (FlowRouter.subsReady()) {
      tmp.categories.set(Categories.find().fetch());
      c.stop();
    }

  });

});

Template.Upload.helpers({

  app: function() {

    return Template.instance().app.all();

  },

  filename: function() {

    var tmp = Template.instance(),
        file = tmp.file.get();
    return file && file.name;

  },

  imageUrl: function(image) {

    return (!image || image.substr(0, 4) === 'data' || image.substr(0, 20) === 'http://cdn.filter.to') ?
      image :
      'http://cdn.filter.to/250x250/' + image.substr(8);

  },

  categories: function() {

    return Template.instance().categories.get();

  },

  suggestNewGenre: function() {

    return Template.instance().suggestNewGenre.get();

  },

  seedString: function() {

    return Template.instance().seedString.get();

  },

  screenshotPlaceholders: function() {

    var tmp = Template.instance();

    return _.range(Math.max(tmp.screenshotsVis.get() - tmp.app.get('screenshots').length, 1));

  }

});

Template.Upload.events({

  'click [data-action="choose-file"]': function(evt, tmp) {

    tmp.$('[data-action="file-picker"][data-for="' + $(evt.currentTarget).data('name') + '"]').click();

  },

  'change [data-action="file-picker"][data-for="spk"]': function(evt) {

    Template.instance().file.set(evt.currentTarget.files[0]);

  },

  'click [data-action="select-genre"]': function(evt, tmp) {

    var categories = tmp.categories.get();

    _.each(categories, function(cat) {
      cat.selected = false;
    });
    this.selected = true;
    tmp.app.set('category', this.name);
    tmp.categories.dep.changed();

  },

  'click [data-action="suggest-genre"]': function(evt, tmp) {

    var categories = _.filter(tmp.categories.get(), function(cat) {
      return !cat.new;
    });
    tmp.categories.set(categories);
    tmp.suggestNewGenre.set(true);
    Tracker.afterFlush(function() {
      tmp.$('[data-field="new-genre-name"]').focus();
    });

  },

  'click [data-action="save-genre"], keyup [data-field="new-genre-name"]': function(evt, tmp) {

    if (evt.keyCode && evt.keyCode !== 13) return;

    var newGenreName = tmp.$('[data-field="new-genre-name"]').val(),
        categories = tmp.categories.get();

    _.each(categories, function(cat) {
      cat.selected = false;
    });

    categories.push({
      name: newGenreName,
      new: true,
      selected: true
    });
    tmp.suggestNewGenre.set(false);
    tmp.categories.set(categories);

  },

  'change [data-action="file-picker"][data-for="identicon"]': function(evt, tmp) {

    var file = evt.currentTarget.files[0];

    if (file) {
      tmp.app.set('image', App.imageUploader.url(true));

      App.imageUploader.send(file, function(err, downloadUrl) {

        if (err)
          console.error('Error uploading', err);
        else {
          console.log('Download URL is ', downloadUrl);
          tmp.app.set('image', downloadUrl);
        }
      });
    }

  },

  'change [data-action="file-picker"][data-for="screenshot"]': function(evt, tmp) {

    var file = evt.currentTarget.files[0];

    if (file) {

      App.imageUploader.send(file, function(err, downloadUrl) {

        if (err)
          console.error('Error uploading', err);
        else {
          console.log('Download URL is ', downloadUrl);
          var screenshots = tmp.app.get('screenshots');
          if (!('screenshotInd' in tmp) || tmp.screenshotInd < 0) screenshots.push(downloadUrl);
          else {
            screenshots[tmp.screenshotInd] = downloadUrl;
            delete tmp.screenshotInd;
          }
          tmp.app.set('screenshots', screenshots);
        }
      });
    }

  },

  'click [data-action="change-screenshot"]': function(evt, tmp) {

    var screenshots = tmp.app.get('screenshots');

    tmp.screenshotInd = screenshots.indexOf(this.toString());

    tmp.$('[data-action="file-picker"][data-for="screenshot"]').click();

  },

  'click [data-action="remove-screenshot"]': function(evt, tmp) {

    var screenshots = tmp.app.get('screenshots'),
        screenshotInd = screenshots.indexOf(this.toString());

    if (screenshotInd > -1) {
      screenshots.splice(screenshotInd, 1);
      tmp.app.set('screenshots', screenshots);
    }

  },

  'click [data-action="upload-spk"]': function(evt, tmp) {

    var file = tmp.file.get();

    if (file) App.spkUploader.send(file, function(err, downloadUrl) {

      if (err)
        console.error('Error uploading', err);
      else {
        console.log('Download URL is ', downloadUrl);
        tmp.app.set('spkLink', downloadUrl);
      }

    });

  },

  'change input[type="text"][data-field], change textarea[data-field]': function(evt, tmp) {

    var $el = $(evt.currentTarget);
    tmp.app.set($el.data('field'), $el.val());

  },

  'change [data-action="update-version"]': function(evt, tmp) {

    var versions = tmp.app.get('versions'),
        $el = $(evt.currentTarget),
        latest = _.last(versions);
    if (!latest || $el.val() !== latest) versions.push($el.val());
    tmp.app.set('versions', versions);

  },

  'click [data-action="regenerate-identicon"]': function(evt, tmp) {

    tmp.seedString.set(Random.id());
    tmp.app.set('image', '');

  },

  'load [data-field="icon-image"]': function(evt, tmp) {

    tmp.imageUrl.set(evt.currentTarget.src.substr(0, 4) !== 'data');
    tmp.app.set('image', evt.currentTarget.src);

  },

  'click [data-action="toggle-private"]': function(evt, tmp) {

    tmp.app.set('public', !tmp.app.get('public'));

  },

});
