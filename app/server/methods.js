/*****************************************************************************/
/* Server Only Methods */
/*****************************************************************************/
var Future = Npm.require('fibers/future');

Meteor.methods({

  'user/reviewApp': function(appId, review) {

    this.unblock();
    if (!this.userId) return false;
    
    check(appId, String);
    check(review, {
      text: Match.Optional(String),
      rating: Match.Integer
    });
    check(review.rating, Match.Where(function(rating) {
      return (0 <= rating) && (3 >= rating);
    }));

    review.appId = appId;
    review.userId = this.userId;
    review.username = Meteor.users.findOne(this.userId).profile.name;

    if (Reviews.findOne(_.pick(review, ['appId', 'userId'])))
      Reviews.update(_.pick(review, ['appId', 'userId']), {$set: review});
    else Reviews.insert(review);

  },

  'user/discardReview': function(appId) {

    this.unblock();
    if (!this.userId) return false;

    check(appId, String);

    return Reviews.remove({appId: appId, userId: this.userId});

  },

  'user/addSandstormHost': function(host) {

    this.unblock();

    check(host, String);

    return Meteor.users.update(this.userId, {$addToSet: {sandstormHosts: host}});

  },

  'user/removeSandstormHost': function(host) {

    this.unblock();

    check(host, String);

    return Meteor.users.update(this.userId, {$pull: {sandstormHosts: host}});

  }

});
