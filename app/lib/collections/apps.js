Apps = new Mongo.Collection('apps', {transform: function(app) {
  app.latestVersion = function() {return _.last(this.versions);};
  return app;
}});

// TODO Update InstallCountThisWeek daily
// TODO Investigate RegEx for version number and image

var versionRegEx = /.*/; // THIS IS NOT DOING ANYTHING AT THE MOMENT

// appsBaseSchema contains the keys that are required for a valid app object,
// but NOT anything which will be autoValued or receive a default value only
// when the app is added to the DB.
var appsBaseSchema = {
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
    max: 5000,
    defaultValue: ''
  },
  image: {
    type: String,
    // regEx: SimpleSchema.RegEx.Url,
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
  },
  price: {
    type: Number,
    min: 0,
    defaultValue: 0,
    decimal: true,
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
  versions: {
    type: [String],
    regEx: versionRegEx,
    defaultValue: []
  }

};
// appsFullSchema adds the autoValue and defaultValue keys
var appsFullSchema = _.extend({}, appsBaseSchema, {
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
  stars: {
    type: Number,
    decimal: true,
    min: 0,
    max: 5,
    defaultValue: 2.5,
    index: true
  },
  ratingsCount: {
    type: Number,
    min: 0,
    defaultValue: 0
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
},
{
  // For some reason, SimpleSchema does not like arrays of prototypes being extended,
  // so we need to add these keys again.
  screenshots: {
    type: [String],
    regEx: SimpleSchema.RegEx.Url,
    defaultValue: []
  },
  versions: {
    type: [String],
    regEx: versionRegEx,
    defaultValue: []
  },
  flags: {
    type: Object,
    blackbox: true,
    optional: true
  }
});


Schemas.AppsBase = new SimpleSchema(appsBaseSchema);
Schemas.AppsFull = new SimpleSchema(appsFullSchema);

Apps.attachSchema(Schemas.AppsFull);

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
