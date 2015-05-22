Apps = new Mongo.Collection('apps', {transform: function(app) {
  app.latestVersion = function() {return _.last(this.versions);};
  return app;
}});

Apps.approval = {
  approved: 0,
  pending: 1,
  revisionRequested: 2,
  rejected: 3
};

var converter = new Showdown.converter();

// TODO Update InstallCountThisWeek daily

// appsBaseSchema contains the keys that are required for a valid app object,
// but NOT anything which will be autoValued or receive a default value only
// when the app is added to the DB.
var appsBaseSchema = {
  name: {
    type: String,
    max: 200,
    index: true
  },
  categories: {
    type: [String],
    index: true,
    defaultValue: [],
    minCount: 1
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
    type: [Object],
    blackbox: true,
    defaultValue: []
  },
  'screenshots.$.url': {
    type: String,
    regEx: SimpleSchema.RegEx.Url
  },
  'screenshots.$.comment': {
    type: String,
    optional: true
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
    // Autovalue only in place whilst payment methods are suppressed
    // defaultValue: 0,
    autoValue: function() {
      return 0;
    },
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
    type: [Object],
    defaultValue: [],
    blackbox: true,
    minCount: 1
  },
  replacesApp: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  }

};

Schemas.AppsBase = new SimpleSchema(appsBaseSchema);

// appsFullSchema adds the autoValue and defaultValue keys,
// plus any keys that the user shouldn't be allowed to set themselves
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
  note: {
    type: String,
    optional: true
  },
  notes: {
    type: [Object],
    blackbox: true,
    optional: true,
    autoValue: function(doc) {
      var note = this.field('note');
      if (note.isSet) {
        var authorObj = Meteor.users.findOne(this.userId),
            app = Apps.findOne(this.docId),
            noteObj =  {
              text: note.value,
              author: this.userId,
              authorName: authorObj ? authorObj.username : 'system',
              admin: Roles.userIsInRole(this.userId, 'admin'),
              byAuthor: this.userId === app.author,
              dateTime: new Date()
            };
        if (this.isInsert) {
          return [noteObj];
        } else {
          return {$push: noteObj};
        }
      } else {
        this.unset();
      }
    }
  },
  lastUpdated: {
    type: Date,
    autoValue: function(doc) {
      if (this.isUpdate && this.userId && !Roles.userIsInRole(this.userId, 'admin')) {
        return new Date();
      } else if (this.isFromTrustedCode) {
        return this.value;
      } else {
        this.unset();
      }
    },
    // denyInsert: true,
    optional: true
  },
  lastUpdatedAdmin: {
    type: Date,
    autoValue: function(doc) {
      if (this.isUpdate && this.userId && Roles.userIsInRole(this.userId, 'admin')) {
        return new Date();
      } else if (this.isFromTrustedCode) {
        return this.value;
      } else {
        this.unset();
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
  },
  htmlDescription: {
    type: String,
    optional: true,
    autoValue: function(doc) {
      var markdownContent = this.field("description");
      if (Meteor.isServer && markdownContent.isSet) {
        return converter.makeHtml(markdownContent.value);
      }
    }
  },
  adminRequests: {
    // due to a Simple-Schema problem, optionality doesn't seem to extend to
    // subschemas, so if we use `type: Schemas.AppsBase` and `optional: true`
    // it complains that the object has no name, etc., even thought the object
    // itself is supposed to be optional.  This way, we can declare an array
    // of max size 1, and either populate it or not.
    // see: https://github.com/aldeed/meteor-simple-schema/issues/133
    type: [Schemas.AppsBase],
    maxCount: 1,
    defaultValue: []
  }
},
{
  // For some reason, SimpleSchema does not like arrays of prototypes being extended,
  // so we need to add these keys again.
  categories: {
    type: [String],
    index: true,
    defaultValue: [],
    minCount: 1
  },
  screenshots: {
    type: [Object],
    blackbox: true,
    defaultValue: []
  },
  'screenshots.$.url': {
    type: String,
    regEx: SimpleSchema.RegEx.Url
  },
  'screenshots.$.comment': {
    type: String,
    optional: true
  },
  versions: {
    type: [Object],
    defaultValue: [],
    blackbox: true,
    minCount: 1
  },
  flags: {
    type: Object,
    blackbox: true,
    optional: true
  }
});

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

// Update installed counts
function updateInstallCount() {

  Apps.find().forEach(function(app) {

    var query = {};
    query['installedApps.' + app._id] = {$exists: true};

    Apps.update(app._id, {$set: {
      installCount: Meteor.users.find(query).count()
    }});

  });

}

function updateInstallCountThisWeek() {

  Apps.find().forEach(function(app) {

    var query = {},
        lastWeek = new moment().subtract(7, 'days').toDate();
    query['installedApps.' + app._id + '.dateTime'] = {$gte: lastWeek};

    Apps.update(app._id, {$set: {
      installCountThisWeek: Meteor.users.find(query).count()
    }});

  });

}
