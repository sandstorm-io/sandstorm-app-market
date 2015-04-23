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

Meteor.publish('apps by genre', function (name) {
  var apps = Genres.findIn(name, {}, {}, {userId: this.userId});
  return [
    apps,
    Meteor.users.find({_id: {$in: _.uniq(apps.map(function(app) {
      return app.author;
    }))}})
  ];
});

Meteor.publish('apps by id', function (ids) {
  return Array.isArray(ids) ?
    Apps.find({_id: {$in: ids}}) :
    Apps.find(ids);
});

Meteor.publish('apps all', function() {
  return Apps.find();
});
