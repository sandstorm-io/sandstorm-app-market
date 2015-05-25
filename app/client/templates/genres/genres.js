Template.Genre.helpers({

  genre: function() {

    return FlowRouter.current().params.authorId ? 'Apps by Author' : FlowRouter.reactiveCurrent().params.genre;

  },

  authorId: function() {

    return FlowRouter.current().params.authorId;

  }

});

Template.genreTable.onCreated(function() {
  this.subscribe('apps by genre', this.data.genre);
});
