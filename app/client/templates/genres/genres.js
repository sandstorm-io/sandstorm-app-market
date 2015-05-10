Template.Genre.helpers({

  genre: function() {

    return FlowRouter.getParam('authorId') ? 'Apps by Author' : FlowRouter.getParam('genre');

  }

});

Template.genreTable.onCreated(function() {
  this.subscribe('apps by genre', this.data.genre);
});
