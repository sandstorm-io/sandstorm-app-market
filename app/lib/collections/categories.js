Categories = new Mongo.Collection('categories');

Schemas.Categories = new SimpleSchema({
  name: {
    type: String,
    label: "Category Name",
    max: 200,
    index: true
  }
});

if (Meteor.isServer) {
  Categories.allow({
    insert: function (userId, doc) {
      return false;
    },

    update: function (userId, doc, fieldNames, modifier) {
      return false;
    },

    remove: function (userId, doc) {
      return false;
    }
  });

  Categories.deny({
    insert: function (userId, doc) {
      return true;
    },

    update: function (userId, doc, fieldNames, modifier) {
      return true;
    },

    remove: function (userId, doc) {
      return true;
    }
  });
}

Categories.attachSchema(Schemas.Categories);
