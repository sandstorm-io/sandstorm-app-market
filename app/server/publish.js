Meteor.publish('messages', function() {
  return Messages.find();
});

Meteor.publish('user flags', function() {
  return Meteor.users.find(this.userId, {fields: {flags: 1}});
});
