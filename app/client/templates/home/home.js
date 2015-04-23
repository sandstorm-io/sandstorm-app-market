/*****************************************************************************/
/* Home: Event Handlers */
/*****************************************************************************/
Template.Home.events({

  'click .close-button': function(evt, tmp) {

    tmp.$('.welcome-message').addClass('collapsed');

  }

});

/*****************************************************************************/
/* Home: Helpers */
/*****************************************************************************/
Template.Home.helpers({

  genres: function() {

    return Genres.getAll({where: {showSummary: true}});

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
