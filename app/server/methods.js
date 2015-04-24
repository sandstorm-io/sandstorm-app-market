/*****************************************************************************/
/* Server Only Methods */
/*****************************************************************************/
Meteor.methods({
  'user/toggleAutoupdate': function() {

    this.unblock();
    if (!this.userId) return false;

    var user = Meteor.users.findOne(this.userId);
    return Meteor.users.update(this.userId, {
      $set: {
        autoupdateApps: !(user && user.autoupdateApps)
      }
    });

  },

  'user/uninstallApp': function(appId) {

    this.unblock();
    if (!this.userId) return false;

    var unset = {};

    unset['installedApps.' + appId] = true;
    return Meteor.users.update(this.userId, {
      $unset: unset
    });

  },

  'user/installApp': function(appId) {

    // TODO: actually install the app!
    this.unblock();
    if (!this.userId) return false;
    var app = Apps.findOne(appId);
    if (!app) return false;

    var set = {};

    set['installedApps.' + appId] = {
      version: _.last(app.versions),
      dateTime: new Date()
    };
    return Meteor.users.update(this.userId, {
      $set: set
    });

  },

  'user/updateApp': function(appId) {

    // TODO: actually update the app!
    this.unblock();
    if (!this.userId) return false;
    var app = Apps.findOne(appId);
    if (!app) return false;

    var set = {};

    set['installedApps.' + appId] = {
      version: _.last(app.versions),
      dateTime: new Date()
    };
    return Meteor.users.update(this.userId, {
      $set: set
    });

  },

  'user/updateAllApps': function() {

    // TODO: actually update the apps!
    this.unblock();
    if (!this.userId) return false;

    Genres.findAll('Updates Available', {}, {}, this).forEach(function(app) {

      Meteor.call('user/updateApp', app._id);

    });

    return true;

  }

});
