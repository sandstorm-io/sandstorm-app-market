// TODO: should we be publishing services?

Meteor.publish(null, function(){
  return Meteor.users.find({_id: this.userId}, {fields: {
    installedApps: 1,
    reviews: 1,
    autoupdateApps: 1,
    appsByMe: 1,
    services: 1,
    roles: 1,
    sandstormHosts: 1
  }});
});

Meteor.startup(function () {

  seedCategories();

});

function seedCategories () {

  if (Categories.find().count() > 0) return;

  var cats = [
    { name: 'Social', showSummary: true },
    { name: 'Project Management', showSummary: true },
    { name: 'Publishing', showSummary: true },
    { name: 'Games', showSummary: true },
    { name: 'Email', showSummary: true },
    { name: 'Media', showSummary: true },
    { name: 'Science', showSummary: true },
    { name: 'Accounting', showSummary: true },
    { name: 'Productivity', showSummary: true },
    { name: 'Development', showSummary: true }
  ];
  _.each(cats, function (cat) {
    Categories.insert(cat);
  });
}
