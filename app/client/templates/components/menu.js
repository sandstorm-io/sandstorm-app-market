import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { AntiModals }from 'meteor/anti:modals';

import { AppMarket } from '/imports/lib/appMarket';
import '/client/lib/appMarket';

Template.Menu.helpers({

  installHistoryCount: function() {
    return AppMarket.installHistoryCount();
  }

});

Template.Menu.events({

  'click .menu-link.active': function(evt, tmp) {

    tmp.$('.menu-container').toggleClass('open');
    if (Meteor.Device.isPhone()) evt.preventDefault();

  },

  'click .menu-link:not(.active)': function(evt, tmp) {

    tmp.$('.menu-container').removeClass('open');

  },

  // LEGACY EVENT HANDLER TO LAUNCH LOGIN MODAL, LEFT IN CASE OF REUSE
  'click [data-action="login-modal"]': function() {

    var loginServicesCount = _.filter(getLoginServices(), function(service) {
        return service.name !== 'password';
      }).length;
    if (loginServicesCount === ServiceConfiguration.configurations.find().count())
      AntiModals.overlay('loginModal');
    else FlowRouter.go('/serviceConfigure');

  }

});

// These come straight from the accounts-ui-unstyled package, but are not exposed.
// Used to determine if any login services still need to be configured, which
// necessitates a new page rather than a modal.

function getLoginServices() {

  // First look for OAuth services.
  var services = Package['accounts-oauth'] ? Accounts.oauth.serviceNames() : [];

  // Be equally kind to all login services. This also preserves
  // backwards-compatibility. (But maybe order should be
  // configurable?)
  services.sort();

  // Add password, if it's there; it must come last.
  if (hasPasswordService())
    services.push('password');

  return _.map(services, function(name) {
    return {name: name};
  });
}

function hasPasswordService() {
  return !!Package['accounts-password'];
}
