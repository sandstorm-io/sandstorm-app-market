Categories = new Mongo.Collection('categories');

Schemas.Categories = new SimpleSchema({
  name: {
    type: String,
    label: "Category Name",
    max: 200,
    index: true
  },
  priority: {
    type: Number,
    label: "Category Priority in Aggregated Views",
    index: true,
    defaultValue: 1
  },
  showSummary: {
    type: Boolean,
    label: "Show Category in Aggregted Views",
    index: true,
    defaultValue: true
  },
  suggested: {
    type: Boolean,
    label: "Suggested by a User but not yet approved",
    index: true,
    optional: true
  },
  approved: {
    type: Number,
    min: 0,
    max: 1,
    label: "A suggested genre which has been approved (0) or rejected (1)",
    index: true,
    optional: true
  },
  populated: {
    type: Boolean,
    label: "One of more apps exist in this category",
    defaultValue: false,
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
