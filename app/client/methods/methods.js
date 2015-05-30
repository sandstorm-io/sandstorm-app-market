/*****************************************************************************/
/* STUB Methods - these don't actually do anything permanent! */
/*****************************************************************************/
Meteor.methods({
  'user/toggleAutoupdate': function() {

    var user = Meteor.users.findOne(Meteor.userId());
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

  },

  'apps/togglePrivate': function(appId) {

    var app = Apps.findOne(appId);
    if (!app || app.author !== Meteor.userId()) return false;

    Apps.update(appId, {$set: {public: !app.public}});

    return true;

  },

  'user/reviewApp': function(appId, review) {

    if (!Meteor.userId()) return false;

    check(review.stars, Match.Where(function(stars) {return (0 < stars) && (5 >= stars);}));
    check(review.stars, Match.Integer);
    check(review.text, String);
    check(review.text, Match.Where(function(text) {return text.length > 0;}));

    if (!Apps.findOne(appId)) throw new Meteor.Error('no matching app', 'Cannot submit a review for an app which is not in the database');

    Reviews.insert({
      username: Meteor.user().username,
      review: review
    });

  },

});
