SyncedCron.add({
  name: 'Generate fake apps',
  schedule: function(parser) {
    return parser.text('every 2 minutes');
  },
  job: function() {
    var categories = _.pluck(Categories.find({}, {fields: {name: 1}}).fetch(), 'name'),
        users = _.pluck(Meteor.users.find({}, {fields: {_id: 1}}).fetch(), '_id');

    return Apps.insert({
      name: faker.company.bs(),
      category: _.sample(categories),
      description: faker.lorem.paragraph(),
      image: faker.image.image(),
      author: _.sample(users),
      versions: ['0.0.1']
    });
  }
});

SyncedCron.add({
  name: 'Update fake apps',
  schedule: function(parser) {
    return parser.text('every 30 seconds');
  },
  job: function() {

    _.each(Meteor.server.sessions, function(session) {

      var user = Meteor.users.findOne(session.userId);
      if (!user || _.isEmpty(user.installedApps)) return false;

      var app = Apps.findOne(_.sample(_.keys(user.installedApps)));

      if (!app) return false;

      Apps.update(app._id, {$push: {
        versions: newVersion(_.last(app.versions))
      }});

      console.log(Apps.findOne(app._id));

    });
  }
});

SyncedCron.start();

function newVersion(version) {

  var nums = version.split('.'),
      lIn = Math.floor(Math.random() * nums.length);

  nums[lIn] = parseInt(nums[lIn], 10) + 1;

  return nums.join('.');

}
