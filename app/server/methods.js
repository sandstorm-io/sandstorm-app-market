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

    var set = {},
        userId = this.userId;

    set['installedApps.' + appId] = {
      version: app.latestVersion(),
      dateTime: new Date()
    };
    // The update is recorded only after an interval as livedata will automatically
    // inform the client, which will result in the UI updating.  We need to give
    // the "app updated" animation time to play before this happens.
    Meteor.setTimeout(function() {
      Meteor.users.update(userId, {
        $set: set
      });
    }, 3000);
    return true;

  },

  'user/updateAllApps': function() {

    // TODO: actually update the apps!
    this.unblock();
    if (!this.userId) return false;

    Genres.findIn('Updates Available', {}, {}, this).forEach(function(app) {

      Meteor.call('user/updateApp', app._id);

    });

    return true;

  },

  'user/save-app': function(app) {

    this.unblock();
    if (!this.userId) return false;

    check(app, Schemas.AppsBase);
    Meteor.users.update(this.userId, {$set: {savedApp: app}});

  },

  'user/delete-saved-app': function() {

    this.unblock();
    if (!this.userId) return false;

    Meteor.users.update(this.userId, {$unset: {savedApp: 1}});

  },

  'user/submit-app': function(app) {

    this.unblock();
    if (!this.userId) return false;
    if (!this.userId !== app.author) throw new Meteor.Error('wrong author', 'Can only submit app by logged-in user');

    Apps.insert(app);

  },

  'apps/togglePrivate': function(appId) {

    this.unblock();
    var app = Apps.findOne(appId);
    if (!app || app.author !== this.userId) return false;

    Apps.update(appId, {$set: {public: !app.public}});

    return true;

  }

});
