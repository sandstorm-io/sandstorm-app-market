// SyncedCron.add({
//   name: 'Generate fake apps',
//   schedule: function(parser) {
//     return parser.text('every 15 seconds');
//   },
//   job: function() {
//     var categories = _.pluck(Categories.find({}, {fields: {name: 1}}).fetch(), 'name'),
//         users = _.pluck(Meteor.users.find({}, {fields: {_id: 1}}).fetch(), '_id');
//
//     return Apps.insert({
//       name: faker.company.bs(),
//       category: _.sample(categories),
//       description: faker.lorem.paragraph(),
//       image: faker.image.image(),
//       author: _.sample(users),
//       versions: ['0.0.1']
//     });
//   }
// });

SyncedCron.add({
  name: 'Update fake apps',
  schedule: function(parser) {
    return parser.text('every 3 seconds');
  },
  job: function() {
    var app = _.sample(Apps.find().fetch());

    if (!app) return false;

    return Apps.update(app._id, {$push: {
      versions: newVersion(_.last(app.versions))
    }});
  }
});

SyncedCron.start();

function newVersion(version) {

  var nums = version.split('.'),
      lIn = nums.length - 1;

  nums[lIn] = parseInt(nums[lIn], 10) + 1;

  return nums.join('.');

}
