Template.connectButton.helpers({

  serviceDetails: function() {

    return _.extend(serviceDoc[this.service], {
      status: (Meteor.user() && (this.service in Meteor.user().services)) ? 'connected' : ''
    });

  }

});

Template.connectButton.events({

  'click [data-action="connect"]': function() {
    console.log('Clicked OK')
    this.login && this.login.apply(this);

  }

});

var serviceDoc = {

  'github': {

    name: 'GitHub',
    icon: 'icon-gh',
    login: Meteor.loginWithGithub

  },

  'google': {

    name: 'Google',
    icon: 'icon-go',
    login: Meteor.loginWithGoogle

  }

};
