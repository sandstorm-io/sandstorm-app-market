import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';

import { AppMarket } from '/imports/lib/appMarket';
import '/client/lib/appMarket';

Template.MasterLayout.events({

  'click [data-action="install-app"]': function(evt, tmp) {

    if (!$(evt.currentTarget).attr('href')) {
      evt.preventDefault();
      AppMarket.getSandstormHost(this, function() {
        Tracker.afterFlush(function() {
          tmp.$('[data-action="install-app"]').click();
        });
      });
    }

  }

});
