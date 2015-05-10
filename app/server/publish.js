/**
 * Meteor.publish('items', function (param1, param2) {
 *  this.ready();
 * });
 */


Meteor.publish('categories', function () {
  var allCats = _.pluck(Categories.find({}, {fields: {name: 1}}).fetch(), 'name'),
      popCats = _.filter(allCats, function(catId) {
        return Apps.findOne({category: catId});
      });
  return Categories.find({name: {$in: popCats}});
});

Meteor.publish('all categories', function () {
  return Categories.find({});
});

Meteor.publish('apps by genre', function (name) {
  var apps = Genres.findIn(name, {public: true, approved: 0}, {fields: {flags: 0}}, this);
  return [
    apps,
    Meteor.users.find({_id: {$in: _.uniq(apps.map(function(app) {
      return app.author;
    }))}})
  ];
});

Meteor.publish('apps by id', function (ids) {
  return Array.isArray(ids) ?
    Apps.find({_id: {$in: ids}}, {fields: {flags: 0}}) :
    Apps.find(ids, {fields: {flags: 0}});
});

Meteor.publish('apps by me', function () {
  return Genres.findIn('Apps By Me', {}, {fields: {flags: 0}}, this);
});

Meteor.publish('apps all', function() {
  return Apps.find();
});

Meteor.publish('apps by author', function(authorId) {
  return Apps.find({author: authorId});
});

Meteor.publish('app search name', function(term) {
  return Apps.find({name: {$regex: term, $options: 'i'}, public: true, approved: 0}, {fields: {flags: 0}});
});

Meteor.publish('app search description', function(term) {
  return Apps.find({description: {$regex: term, $options: 'i'}, public: true, approved: 0}, {fields: {flags: 0}});
});

Meteor.publish('saved app', function() {
  return Meteor.users.find(this.userId, {fields: {savedApp: 1}});
});

Meteor.publish('user flags', function() {
  return Meteor.users.find(this.userId, {fields: {flags: 1}});
});

// Cache

Meteor.publish('users reviewed', function(appId) {

  var fields = {username: 1},
      query = {},
      reviewPath = 'appReviews.' + appId,
      _this = this;

  fields[reviewPath] = 1;
  query[reviewPath] = {$exists: true};

  Meteor.users.find(query, {fields: fields}).forEach(function(user) {

    _this.added('reviews', Random.id(), {
      username: user.username,
      review: user.appReviews[appId]
    });

  });

  _this.ready();

});
