import { Meteor } from 'meteor/meteor';

import { Messages } from '/imports/collections/messages';
import { Reviews } from '/imports/collections/reviews';
import { AggregateReviews } from '/imports/collections/aggregateReviews';

Meteor.publish('messages', function() {
  return Messages.find();
});

Meteor.publish('user flags', function() {
  return Meteor.users.find(this.userId, {fields: {flags: 1}});
});

Meteor.publish('reviews', function(appId) {
  check(appId, String);
  return Reviews.find({appId: appId});
});

Meteor.publish(null, function() {
  return AggregateReviews.find();
});
