Template.InstalledApps.onCreated(function() {
  this.subscribe('apps by genre', 'Installed');
});

Template.updateSelector.helpers({

  automatic: function() {

    return Session.get('automatic'); // TODO: change this;

  }

});

Template.updateSelector.events({

  'click .button': function() {

    Session.set('automatic', !Session.get('automatic')); // TODO: change this;

  }

});
