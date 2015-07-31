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