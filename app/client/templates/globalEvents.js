Template.MasterLayout.events({

  'click [data-action="install-app"]': function(evt, tmp) {

    if (!$(evt.currentTarget).attr('href')) {
      evt.preventDefault();
      AppMarket.getSandstormHost(this.packageId, function() {
        Tracker.afterFlush(function() {
          tmp.$('[data-action="install-app"]').click();
        });
      });
    }

  }
  
});
