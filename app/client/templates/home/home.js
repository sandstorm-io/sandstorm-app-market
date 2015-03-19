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

    return Genres.find();

  }

});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.onCreated(function () {
  this.subscribe('genres');
});

Template.Home.rendered = function () {
};

Template.Home.destroyed = function () {
};

Template.genreTable.onCreated(function() {
  this.subscribe('apps by genre', this.data._id);
});

Template.genreTable.helpers({

  apps: function() {

    return Apps.find({genres: this._id});

  }

});
