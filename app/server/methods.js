/*****************************************************************************/
/* Server Only Methods */
/*****************************************************************************/
var Future = Npm.require('fibers/future');

Meteor.methods({

  'user/reviewApp': function(appId, review) {

    this.unblock();
    if (!this.userId) return false;

    review.userId = this.userId;

    if (!Apps.findOne(review.appId)) throw new Meteor.Error('no matching app', 'Cannot submit a review for an app which is not in the database');

    if (Reviews.findOne(_.pick(review, ['appId', 'userId'])))
      Reviews.update(_.pick(review, ['appId', 'userId']), {$set: review});
    else Reviews.insert(review);

  },

  'user/discardReview': function(appId) {

    this.unblock();
    if (!this.userId) return false;

    return Reviews.remove({appId: appId, userId: this.userId});

  },

  'user/addSandstormHost': function(host) {

    this.unblock();
    return Meteor.users.update(this.userId, {$addToSet: {sandstormHosts: host}});

  },

  'user/removeSandstormHost': function(host) {

    this.unblock();
    return Meteor.users.update(this.userId, {$pull: {sandstormHosts: host}});

  }

});
