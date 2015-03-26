/*****************************************************************************/
/* Home: Event Handlers */
/*****************************************************************************/
Template.Home.events({
});

/*****************************************************************************/
/* Home: Helpers */
/*****************************************************************************/
Template.Home.helpers({

  genres: function() {

    return _.pluck(Genres.getAll(), 'name');

  },

  message: function() {

    return "This is a sample welcome message";

  }

});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.onCreated(function () {
  this.subscribe('categories');
});

Template.genreTable.onCreated(function() {
  this.subscribe('apps by genre', this.data);
});

Template.genreTable.helpers({

  apps: function() {

    return Genres.findIn(this.toString(), {}, {limit: 5});

  }

});
