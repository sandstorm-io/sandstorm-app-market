Template.Upload.onCreated(function() {

  var tmp = this;

  tmp.file = new ReactiveVar();
  tmp.categories = new ReactiveVar();
  tmp.seedString = new ReactiveVar(Random.id());

  window.app = new ReactiveDict('app');
  window.app.set({
    name: '',
    category: '',
    author: Meteor.userId()
  });

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

  filename: function() {

    var tmp = Template.instance(),
        file = tmp.file.get();
    return file && file.name;

  },

  categories: function() {

    return Template.instance().categories.get();

  },

  seedString: function() {

    return Template.instance().seedString.get();

  }

});

Template.Upload.events({

  'click [data-action="choose-file"]': function(evt, tmp) {

    tmp.$('[data-action="file-picker"]').click();

  },

  'change [data-action="file-picker"]': function(evt) {

    Template.instance().file.set(evt.currentTarget.files[0]);

  },

  'click [data-action="upload"]': function() {

    var tmp = Template.instance(),
        file = tmp.file.get();

    if (file) App.uploader.send(file, function(err, downloadUrl) {

      if (err)
        console.error('Error uploading', err);
      else
        console.log('Download URL is ', downloadUrl);

    });

  },

  'click [data-action="select-genre"]': function(evt, tmp) {

    var categories = tmp.categories.get();

    _.each(categories, function(cat) {
      cat.selected = false;
    });
    this.selected = true;
    tmp.categories.dep.changed();

  },

  'click [data-action="regenerate-identicon"]': function(evt, tmp) {

    tmp.seedString.set(Random.id());

  }

});
