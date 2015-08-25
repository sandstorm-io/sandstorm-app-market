Template.Home.onCreated(function() {

  var tmp = this;
  window.template = tmp;

});

Template.Home.onDestroyed(function() {

  $(window).off('scroll.home');

});

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

    return Genres.getAll({
      where: {showSummary: true},
      iteratee: function (cat) {
        var count = Apps.find({categories: cat.name}).count();
        // Sort descending by size. A category which has no contents is actually a
        // pseudo-category so should go on top.
        return count === 0 ? -Infinity : -count;
      }
    });

  },

  message: function() {

    var welcomeMessage = Messages.findOne('welcome');
    return welcomeMessage && welcomeMessage.message;

  }

});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.onCreated(function () {
});
