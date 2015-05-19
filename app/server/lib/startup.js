// TODO: should we be publishing services?

Meteor.publish(null, function(){
  return Meteor.users.find({_id: this.userId}, {fields: {
    installedApps: 1,
    appReviews: 1,
    autoupdateApps: 1,
    appsByMe: 1,
    services: 1,
    roles: 1
  }});
});

Meteor.startup(function () {

  seedCategories()
  seedUser()
   
});

function seedCategories () {

  if (Categories.find().count() > 0) return

  var cats = [ 
    { name: 'Social', showSummary: true },
    { name: 'Project Management', showSummary: true },
    { name: 'Publishing', showSummary: true },
    { name: 'Games', showSummary: true },
    { name: 'Email', showSummary: true },
    { name: 'Media', showSummary: true },
    { name: 'Science', showSummary: true },
    { name: 'Accounting', showSummary: true },
    { name: 'Productivity', showSummary: true } ]
  _.each(cats, function (cat) {
    Categories.insert(cat)
  })
};

function seedUser () {

  if (Meteor.users.find().count() > 0) return 

  var user = {
    username: 'tableflip',
    fullname: 'tableflip admin',
    email: 'richard@tableflip.io'
  }

  Meteor.users.insert(user)
};
