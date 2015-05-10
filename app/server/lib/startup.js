// TODO: should we be publishing services?

Meteor.publish(null, function(){
  return Meteor.users.find({_id: this.userId}, {fields: {
    installedApps: 1,
    appReviews: 1,
    autoupdateApps: 1,
    appsByMe: 1,
    services: 1
  }});
});
