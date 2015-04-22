Template.InstalledApps.onCreated(function() {
  this.subscribe('apps by genre', 'Installed');
});

Template.updateSelector.helpers({

  automatic: function() {

    return Session.get('automatic'); // TODO: change this;

  }

});
