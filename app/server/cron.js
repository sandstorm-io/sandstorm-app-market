var retricon = Meteor.npmRequire('retricon');

SyncedCron.add({
  name: 'Generate fake apps',
  schedule: function(parser) {
    return parser.text('every 5 seconds');
  },
  job: function() {
    var categories = _.pluck(Categories.find({}, {fields: {name: 1}}).fetch(), 'name'),
        users = _.pluck(Meteor.users.find({}, {fields: {_id: 1}}).fetch(), '_id');

    if (Apps.find().count() < 200)
      return Apps.insert({
        name: faker.company.bs(),
        category: _.sample(categories),
        description: faker.lorem.paragraph(),
        image: retricon(Random.id(), 50, 0).toDataURL(),
        approved: 1,
        author: _.sample(users),
        versions: ['0.0.1']
      });
    else return 'full';
  }
});

SyncedCron.add({
  name: 'Approve/Reject fake apps',
  schedule: function(parser) {
    return parser.text('every 2 minutes');
  },
  job: function() {

    Apps.find({approved: 1}).forEach(function(app) {

      Apps.update(app._id, {$set: {approved: _.sample([0, 0, 0, 2, 3])}});

    });

  }
});

SyncedCron.add({
  name: 'Update fake apps',
  schedule: function(parser) {
    return parser.text('every 3 minutes');
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
