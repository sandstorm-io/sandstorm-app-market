Template.Genre.helpers({

  genre: function() {

    return FlowRouter.current().params.authorId ? 'Apps By Author' : FlowRouter.reactiveCurrent().params.genre;

  },

  author: function() {

    var authorId = FlowRouter.current().params.authorId;
    return Meteor.users.findOne(authorId);

  }

});

Template.genreTable.onCreated(function() {
  this.subscribe('apps by genre', this.data.genre, App.lineCapacity.get());
});
