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

    App.hostDep.depend();
    var user = Meteor.user();

    return user ? _.union(user.sandstormHosts, amplify.store('sandstormHostHistory')) :
                  amplify.store('sandstormHostHistory');

    }

});

Template.getSandstormHostModal.events({

  'click [data-action="install"]': function(evt, tmp) {
    App.sandstormHost = this.toString();
    AntiModals.dismissAll();
    callback(this.toString());
  },

  'click [data-action="add-host"], keyup [data-field="new-host"]': function(evt, tmp) {
    if (evt.keyCode && evt.keyCode !== 13) return;

    var newHost = tmp.$('[data-field="new-host"]').val();
    tmp.$('[data-field="new-host"]').val('');
    App.addSandstormHost(newHost);
  },

  'click [data-action="remove-host"]': function(evt, tmp) {
    evt.stopImmediatePropagation();
    var thisHost = this.toString();
    App.removeSandstormHost(thisHost);
  }

});
