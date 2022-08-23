import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { AntiModals } from 'meteor/anti:modals';

import { Api } from '/client/api/api';
import { AppMarket } from '/imports/lib/appMarket';
// the module below dowsn't export any symbol, it just needs to
// extend AppMarket
import '/client/lib/appMarket';

var callback;

AppMarket.hasSandstormHost = function() {
  var user = Meteor.user();
  var hostCount = (amplify.store('sandstormHostHistory') || []).length +
                  ((user && user.sandstormHosts) || []).length;
  return hostCount > 0;
};

AppMarket.getSandstormHost = function(app, cb) {

  if (AppMarket.sandstormHost) cb(AppMarket.sandstormHost);
  else {
    callback = cb;
    AntiModals.overlay('getSandstormHostModal', {data: app});
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

  },

  appTitle: function() {
    return this.name;
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
