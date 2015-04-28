Template.InstalledApps.onCreated(function() {
  this.subscribe('apps by genre', 'Installed');
});

Template.updateSelector.helpers({

  automatic: function() {

    var user = Meteor.user();
    return user && user.autoupdateApps;

  }

});

Template.updateSelector.events({

  'click .button': function() {

    Meteor.call('user/toggleAutoupdate', function(err) {
      if (err) console.log(err);
    });

  }

});

Template.uninstallApp.events({

  'click [data-action="close-modal"]': function() {

    AntiModals.dismissAll();

  },

  'click [data-action="uninstall-app"]': function() {

    AntiModals.dismissAll();
    Meteor.call('user/uninstallApp', this._id, function(err) {
      if (err) console.log(err);
    });

  }

});
