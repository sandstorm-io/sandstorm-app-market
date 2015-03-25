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

Template.Home.rendered = function () {
};

Template.Home.destroyed = function () {
};

Template.genreTable.onCreated(function() {
  this.subscribe('apps by genre', this.data);
});

Template.genreTable.helpers({

  apps: function() {

    return Genres.findIn(this.toString(), {}, {limit: 5});

  }

});
