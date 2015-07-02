// utility function to record the fact that social links can be gleaned from
// a user's profile data on the server side rather than needing to be pulled
// out of the OAuth DB (indicated by a -1)
// needs to be called with a template instance as context
var indicateSocialLinkInUserObject = function() {
  var socialLinks = this.get('app').get('socialLinks');
  socialLinks[this.data.service] = -1;
  this.get('app').set('socialLinks', socialLinks);
};

Template.connectButton.onCreated(function() {

  this.serviceDetails = serviceDoc[this.data.service];
  if (this.serviceDetails.login && Meteor.user() && Meteor.user().services && Meteor.user().services[this.data.service])
  indicateSocialLinkInUserObject.call(this);

});

Template.connectButton.helpers({

  serviceDetails: function() {

    var details = Template.instance().serviceDetails;
    return _.extend({}, details, {
      connected: Template.instance().get('app').get('socialLinks')[this.service]
    });

  }

});

Template.connectButton.events({

  'click [data-action="connect"]': function(evt ,tmp) {
    var _this = this;

    // Service is not a login option, so we need to do the OAuth dance
    if (_this.connect)
      _this.connect.requestCredential({reauthenticate: true}, function(key) {
        secret =OAuth._retrieveCredentialSecret(key);

        Meteor.call('apps/registerSocialData', key, secret, function(err, id) {
          var socialLinks = tmp.get('app').get('socialLinks');
          socialLinks[tmp.data.service] = id;
          tmp.get('app').set('socialLinks', socialLinks);
        });
      });

    // Service is a login option
    else if (_this.login) {
      // Are we already logged in?
      if (Meteor.user() && Meteor.user().services && Meteor.user().services[tmp.data.service]) indicateSocialLinkInUserObject.call(tmp);
      // If not, log in and then indicate data will be available
      else _this.login.call(_this, function(err, res) {
        if (!err || err.message === 'Service correctly added to the current user, no need to proceed!') indicateSocialLinkInUserObject.call(tmp);
        else {
          console.log(err);
          AntiModals.overlay('errorModal', {data: {err: err}});
        }
      });
    }
  },

  'click [data-action="disconnect"]': function(evt, tmp) {

    evt.stopPropagation();
    var socialLinks = tmp.get('app').get('socialLinks');
    delete socialLinks[tmp.data.service];
    tmp.get('app').set('socialLinks', socialLinks);

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

  },

  'facebook': {

    name: 'Facebook',
    icon: 'icon-fb',
    connect: Facebook

  },

  'twitter': {

    name: 'Twitter',
    icon: 'icon-tw',
    connect: Twitter

  }

};
