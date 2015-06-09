/**
 * Meteor.publish('items', function (param1, param2) {
 *  this.ready();
 * });
 */

var appUnpublishedFields = {
  flags: 0,
  notes: 0,
  adminReqests: 0,
  installDates: 0,
  spkKey: 0
};

Meteor.publish('categories', function () {
  var allCats = _.pluck(Categories.find({approved: 0}, {fields: {name: 1}}).fetch(), 'name'),
      popCats = _.filter(allCats, function(catId) {
        return Apps.findOne({categories: catId});
      });
  return Categories.find({name: {$in: popCats}});
});

Meteor.publish('all categories', function () {
  return Categories.find({approved: 0});
});

Meteor.publish('suggested categories', function() {

  if (Roles.userIsInRole(this.userId, 'admin')) return Categories.find({suggested: true});
  else return this.stop();

});

Meteor.publish('apps by genre', function (name, limit) {
  var apps = Genres.findIn(name, {public: true, approved: Apps.approval.approved}, {fields: appUnpublishedFields, limit: limit}, this);
  return apps;
});

Meteor.publish('installed apps', function(localApps) {
  var allInstalledApps = localApps || [],
      user = Meteor.users.findOne(this.userId);
  if (user) allInstalledApps = allInstalledApps.concat(_.keys(user.installedApps));
  return Apps.find({_id: {$in: allInstalledApps}});
});

Meteor.publish('apps by id', function (ids, flags) {
  var fields = {};

  if (!Roles.userIsInRole(this.userId, 'admin') || !flags) fields.flags = 0;

  var apps = Array.isArray(ids) ?
        Apps.find({_id: {$in: ids}}, {fields: fields}) :
        Apps.find(ids, {fields: fields});

  return apps;
});

Meteor.publish('apps by me', function () {
  return Genres.findIn('Apps By Me', {}, {fields: appUnpublishedFields}, this);
});

Meteor.publish('apps all', function(skip, limit) {

  if (Roles.userIsInRole(this.userId, 'admin')) {

    var appsC = Apps.find({approved: {$lt: 4}}, {skip: skip, limit: limit}),
        userIds = _.uniq(appsC.map(function(app) { return app.author; }));
    return [
      Genres.findIn('All', {approved: {$lt: 4}}, {skip: skip, limit: limit}),
      Meteor.users.find({_id: {$in: userIds}})
    ];

  } else {

    return this.stop();

  }

});

Meteor.publish('apps by author', function(authorId) {
  return Apps.find({author: authorId, approved: Apps.approval.approved});
});

Meteor.publish('app search name', function(term) {
  return Apps.find({name: {$regex: term, $options: 'i'}, public: true, approved: 0}, {fields: appUnpublishedFields});
});

Meteor.publish('app search description', function(term) {
  return Apps.find({description: {$regex: term, $options: 'i'}, public: true, approved: 0}, {fields: appUnpublishedFields});
});

Meteor.publish('saved apps', function() {
  // return Meteor.users.find(this.userId, {fields: {savedApp: 1}});
  return Apps.find({author: this.userId, approved: Apps.approval.draft});
});

Meteor.publish('user flags', function() {
  return Meteor.users.find(this.userId, {fields: {flags: 1}});
});

Meteor.publish('user basic', function(_id) {
  if (Array.isArray(_id))
    return Meteor.users.find({_id: {$in: _id}}, {fields: {username: 1, profile: 1}});
  else
    return Meteor.users.find(_id, {fields: {username: 1, profile: 1}});
});

// Cache

Meteor.publish('users reviewed', function(appId) {

  var fields = {username: 1},
      query = {},
      reviewPath = 'reviews.' + appId,
      _this = this;

  fields[reviewPath] = 1;
  query[reviewPath] = {$exists: true};

  Meteor.users.find(query, {fields: fields}).forEach(function(user) {

    _this.added('reviews', Random.id(), {
      username: user.username,
      review: user.reviews[appId]
    });

  });

  _this.ready();

});
