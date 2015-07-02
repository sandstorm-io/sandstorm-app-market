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

  'user/review-app': function(review) {

    if (!Meteor.userId()) return false;

    if (review.rating) {
      check(review.rating, Match.Integer);
      check(review.rating, Match.Where(function(rating) {return (0 <= rating) && (3 >= rating);}));
    }
    check(review.text, String);
    check(review.text, Match.Where(function(text) {return text.length > 0;}));

    if (!Apps.findOne(review.appId)) throw new Meteor.Error('no matching app', 'Cannot submit a review for an app which is not in the database');
    review.userId = Meteor.userId();
    
    if (Reviews.findOne(_.pick(review, ['appId', 'userId'])))
      Reviews.update(_.pick(review, ['appId', 'userId']), {$set: review});
    else Reviews.insert(review);

  },
  
  'user/saveApp': function(app) {

    $('[data-action="save-app"]').addClass('disabled');
    $('[data-action="save-admin-requests"]').addClass('disabled');
     
  },
  
  'user/submitApp': function(app) {

    $('[data-action="submit-app"]').addClass('disabled');
     
  },
  
  'admin/submitAdminRequests': function(app) {

    $('[data-action="submit-admin-requests"]').addClass('disabled');
     
  }  

});
