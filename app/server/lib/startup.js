Meteor.publish(null, function(){
  return Meteor.users.find({_id: this.userId}, {fields: {
    installedApps: 1,
    roles: 1,
    sandstormHosts: 1
  }});
});
