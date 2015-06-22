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
    { name: 'Social', showSummary: true, approved: 0 },
    { name: 'Project Management', showSummary: true, approved: 0 },
    { name: 'Publishing', showSummary: true, approved: 0 },
    { name: 'Games', showSummary: true, approved: 0 },
    { name: 'Email', showSummary: true, approved: 0 },
    { name: 'Media', showSummary: true, approved: 0 },
    { name: 'Science', showSummary: true, approved: 0 },
    { name: 'Accounting', showSummary: true, approved: 0 },
    { name: 'Productivity', showSummary: true, approved: 0 },
    { name: 'Development', showSummary: true, approved: 0 }
  ];
  _.each(cats, function (cat) {
    Categories.insert(cat);
  });
}
