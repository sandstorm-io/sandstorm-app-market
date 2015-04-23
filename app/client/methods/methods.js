/*****************************************************************************/
/* STUB Methods - these don't actually do anything permanent! */
/*****************************************************************************/
Meteor.methods({
  'user/toggleAutoupdate': function() {

    var user = Meteor.user();
    if (!user) return false;
    return Meteor.users.update(user._id, {
      $set: {
        autoupdateApps: !(user && user.autoupdateApps)
      }
    });

  },

  'user/uninstallApp': function(appId) {

    if (!Meteor.userId()) return false;

    var unset = {};

    unset['installedApps.' + appId] = true;
    return Meteor.users.update(Meteor.userId(), {
      $unset: unset
    });

  }
});
