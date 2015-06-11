var callback;

App.getSandstormHost = function(cb) {

  if (App.sandstormHost) cb(App.sandstormHost);
  else {
    callback = cb;
    AntiModals.overlay('getSandstormHostModal');
  }

};

Template.getSandstormHostModal.helpers({

  hosts: function() {

    var user = Meteor.user();

    return user ? _.union(user.sandstormHosts, amplify.store('sandstormHostHistory')) :
                  amplify.store('sandstormHostHistory');

    }

});

Template.getSandstormHostModal.events({

  'click [data-action="install"]': function(evt, tmp) {
    callback(this.toString());
  },

  'click [data-action="install-new"]': function(evt, tmp) {
    var newHost = tmp.$('[data-field="new-host"]').val();
    if (!newHost) return false;
    if (newHost.slice(0, 7) !== 'http://') newHost = 'http://' + newHost;
    if (newHost.slice(newHost.length - 1) !== '/') newHost = newHost + '/';
    callback(newHost);
  }

});
