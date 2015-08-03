var callback;

AppMarket.getSandstormHost = function(packageId, cb) {

  if (AppMarket.sandstormHost) cb(AppMarket.sandstormHost);
  else {
    callback = cb;
    AntiModals.overlay('getSandstormHostModal', {data: {packageId: packageId}});
  }

};

Template.getSandstormHostModal.helpers({

  hosts: function() {

    AppMarket.hostDep.depend();
    var user = Meteor.user();

    return user ? _.compact(_.union(user.sandstormHosts, amplify.store('sandstormHostHistory'))) :
                  amplify.store('sandstormHostHistory');

  },
  
  installUrl: function() {

    var packageId = Template.parentData(1).packageId;
    
    return [
      this,
      'install/',
      packageId,
      '?url=',
      Api.packageUrl(packageId)
    ].join('');
    
  }

});

Template.getSandstormHostModal.events({

  'click [data-action="install"]': function(evt, tmp) {
    AppMarket.sandstormHost = this.toString();
    AppMarket.hostDep.changed();
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
    evt.preventDefault();
    var thisHost = this.toString();
    AppMarket.removeSandstormHost(thisHost);
  }

});
