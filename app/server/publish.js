/**
 * Meteor.publish('items', function (param1, param2) {
 *  this.ready();
 * });
 */


Meteor.publish('genres', function (/* args */) {
  return Genres.find();
});

Meteor.publish('apps by genre', function (id) {
  return Apps.find({genres: id});
});

Meteor.publish('apps by id', function (ids) {
  return Array.isArray(ids) ?
    Apps.find({_id: {$in: ids}}) :
    Apps.find(id);
});

Meteor.publish('apps all', function() {
  return Apps.find();
});
