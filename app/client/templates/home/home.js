Template.Home.onCreated(function() {

  var tmp = this;
  window.template = tmp;

  tmp.genreCount = new ReactiveVar(5);

  $(window).on('scroll.home', _.debounce(function() {
    if (tmp.$('.load-more').visible(true)) tmp.genreCount.set(tmp.genreCount.get() + 3);
  }, 500));

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

    return Genres.getAll({where: {showSummary: true}}).slice(0, Template.instance().genreCount.get());

  },

  message: function() {

    var welcomeMessage = Messages.findOne('welcome');
    return welcomeMessage && welcomeMesssage.message;

  }

});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.onCreated(function () {
});
