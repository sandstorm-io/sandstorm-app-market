Apps = new Mongo.Collection('apps', {transform: function(app) {
  app.latestVersion = function() {return _.last(this.versions);};
  return app;
}});

// TODO Update InstallCountThisWeek daily
// TODO Investigate RegEx for version number

var versionRegEx = /.*/; // THIS IS NOT DOING ANYTHING AT THE MOMENT

Schemas.Apps = new SimpleSchema({
  name: {
    type: String,
    max: 200,
    index: true
  },
  category: {
    type: String,
    index: true
  },
  description: {
    type: String,
    max: 1000,
    defaultValue: ''
  },
  image: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  screenshots: {
    type: [String],
    regEx: SimpleSchema.RegEx.Url,
    defaultValue: []
  },
  author: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: true
  },
  webLink: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  codeLink: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  spkLink: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  stars: {
    type: Number,
    decimal: true,
    min: 0,
    max: 5,
    defaultValue: 2.5,
    index: true
  },
  price: {
    type: Number,
    min: 0,
    defaultValue: 0,
    index: true
  },
  // Approval state
  // 0 - Approved
  // 1 - Pending
  // 2 - Revision Requested
  // 3 - Rejected
  approved: {
    type: Number,
    defaultValue: 1,
    index: true
  },
  public: {
    type: Boolean,
    defaultValue: true,
    index: true
  },
  license: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset();
      }
    }
  },
  lastUpdated: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    // denyInsert: true,
    optional: true
  },
  versions: {
    type: [String],
    regEx: versionRegEx,
    defaultValue: []
  },
  installCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  installCountThisWeek: {
    type: Number,
    min: 0,
    defaultValue: 0
  }
});

Apps.attachSchema(Schemas.Apps);

if (Meteor.isServer) {
  Apps.allow({
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

  Apps.deny({
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
