Template.Menu.events({

  'click .menu-link.active': function(evt, tmp) {

    tmp.$('.menu-container').toggleClass('open');

  },

  'click .menu-link:not(.active)': function(evt, tmp) {

    tmp.$('.menu-container').removeClass('open');

    // TODO: redirect to appropriate page

  },

  'click [data-action="login-modal"]': function() {

    AntiModals.overlay('loginModal');

  }

});
