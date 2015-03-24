/**
 * Meteor.publish('items', function (param1, param2) {
 *  this.ready();
 * });
 */


Meteor.publish('categories', function () {
  return Categories.find();
});

Meteor.publish('apps by genre', function (name) {
  return Genres.findIn(name);
});

Meteor.publish('apps by id', function (ids) {
  return Array.isArray(ids) ?
    Apps.find({_id: {$in: ids}}) :
    Apps.find(ids);
});

Meteor.publish('apps all', function() {
  return Apps.find();
});
