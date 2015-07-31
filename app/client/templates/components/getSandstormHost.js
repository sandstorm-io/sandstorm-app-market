var callback;

AppMarket.getSandstormHost = function(cb) {

  if (AppMarket.sandstormHost) cb(AppMarket.sandstormHost);
  else {
    callback = cb;
    AntiModals.overlay('getSandstormHostModal');
  }

};

Template.getSandstormHostModal.helpers({

  hosts: function() {

    AppMarket.hostDep.depend();
    var user = Meteor.user();

    return user ? _.union(user.sandstormHosts, amplify.store('sandstormHostHistory')) :
                  amplify.store('sandstormHostHistory');

    }

});

Template.getSandstormHostModal.events({

  'click [data-action="install"]': function(evt, tmp) {
    AppMarket.sandstormHost = this.toString();
    AntiModals.dismissAll();
    callback(this.toString());
  },

  'click [data-action="add-host"], keyup [data-field="new-host"]': function(evt, tmp) {
    if (evt.keyCode && evt.keyCode !== 13) return;

    var newHost = tmp.$('[data-field="new-host"]').val();
    tmp.$('[data-field="new-host"]').val('');
    AppMarket.addSandstormHost(newHost);
  },

  'click [data-action="remove-host"]': function(evt, tmp) {
    evt.stopImmediatePropagation();
    var thisHost = this.toString();
    AppMarket.removeSandstormHost(thisHost);
  }

});
