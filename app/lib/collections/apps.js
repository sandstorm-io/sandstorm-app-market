Apps = new Mongo.Collection('apps', {transform: function(app) {

  app.latestVersion = function() {
    return _.sortBy(this.versions, function(entry) {
      return -entry.createdAt;
    })[0];
  };

  app.onGithub = function() {
    return this.codeLink && this.codeLink.indexOf('github.com') > -1;
  };

  app.spk = function() {
    var latest = this.latestVersion();
    return Spks.findOne({'meta.packageId': latest && latest.packageId});
  };

  app.getLocation = function() {
    return 'http://' + Meteor.settings.public.spkBucket + '.storage.googleapis.com/' + Spks.spkFolder + this.spkKey;
  };

  if (Meteor.isClient)
    app.install = function() {
      var _this = this;
      Meteor.call('user/installApp', _this._id, function(err) {
        if (err) console.log(err);
        else {
          var installedLocally = amplify.store('sandstormInstalledApps');
          if (!installedLocally) amplify.store('sandstormInstalledApps', [_this._id]);
          else if (installedLocally.indexOf(_this._id) === -1) {
            installedLocally.push(_this._id);
            amplify.store('sandstormInstalledApps', installedLocally);
          }
        }
      });
    };

  if (Meteor.isServer)
    app.updateInstallCountThisWeek = function() {
      var lastWeek = new moment().subtract(7, 'days').toDate(),
          recentInstalls = _.filter(this.installDates, function(date) {
            return date > lastWeek;
          });

      Apps.update(this._id, {$set: {
        installCountThisWeek: recentInstalls.length,
        installDates: recentInstalls
      }});
    };

  app.installed = function() {

    if (typeof window !== 'undefined') {
      var appIds = window.amplify.store('sandstormInstalledApps') || [];
      if (appIds.indexOf(this._id) > -1) return true;
    }
    var userId = this.userId || Meteor.userId(),
        user = Meteor.users.findOne(userId);
    if (user && this._id in user.installedApps) return true;

    return false;

  };

  // it's actually slightly difficult to know when an app's ultimate install
  // link will be available due to the unknown length of time it will take the
  // .spk to get to S3.  So, we construct the install link on demand, and then
  // cache it if it turns out to be available.
  app.makeInstallLink = function() {
    if (this.installLink) return this.installLink;
    else if (Meteor.isClient) return Meteor.call('apps/updateInstallLink', this._id);
    var latest = this.latestVersion(),
        spk = Spks.findOne({'meta.packageId': latest && latest.packageId}),
        installLink;
    if (spk && spk.copies.spkS3) {
      installLink = 'install/' + spk.meta.packageId + '?url=https://s3-' +
         Meteor.settings.public.AWSRegion + '.amazonaws.com/' +
         Meteor.settings.public.spkBucket + '/' + spk.copies.spkS3.key;
      Apps.update(this._id, {$set: {installLink: installLink}});
      return installLink;
    }
  };

  return app;
}});

Apps.approval = {
  approved: 0,
  pending: 1,
  revisionRequested: 2,
  rejected: 3
};

var converter = new Showdown.converter();

// appsBaseSchema contains the keys that are required for a valid app object,
// but NOT anything which will be autoValued or receive a default value only
// when the app is added to the DB.
var VersionSchema = new SimpleSchema({
  number: {
    type: String,
    max: 20,
  },
  version: {
    type: Number,
    optional: true
  },
  packageId: {
    type: String,
  },
  spkId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  createdAt: {
    type: Date,
    autoValue: function(doc) {
      if (!this.isSet || this.operator !== '$push') return new Date();
      // if (this.isInsert) {
      //   return new Date();
      // } else if (this.isUpsert) {
      //   return {$setOnInsert: new Date()};
      // } else {
      //   this.unset();
      // }
    },
    // optional: true
  },
  // dateTime: {
  //   type: Date
  // },
  changes: {
    type: String,
    max: 200,
    optional: true
  }
});

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
    optional: true
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
    type: [VersionSchema],
    defaultValue: [],
    minCount: 1
  },
  replacesApp: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  appId: {
    type: String,
    optional: true
  },
  filename: {
    type: String,
    defaultValue: 'package.spk'
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
    },
    optional: true
  },
  authorName: {
    type: String,
    autoValue: function() {
      if (this.isInsert) {
        var userId = this.field('author').value,
            user = Meteor.users.findOne(userId);
        return user && user.username;
      }
    }
  },
  ratingsCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  ratings: {
    type: Object,
    defaultValue: {
      broken: 0,
      didntLike: 0,
      jobDone: 0,
      amazing: 0
    },
    blackbox: true
  },
  installLink: {
    type: String,
    optional: true,
    // autoValue: function(doc) {
    //   var versions = this.field('versions');
    //   if (versions) {
    //     var latest = _.last(versions.value),
    //         spk = Spks.findOne({'meta.packageId': latest.packageId});
    //     if (spk && spk.copies.spkS3) return '/install/' + spk.meta.packageId + '?url=https://s3-' +
    //          Meteor.settings.AWSRegion + '.amazonaws.com/' +
    //          Meteor.settings.spkBucket + '/' + spk.copies.spkS3.key;
    //     // need to wait for spkS3 to populate - TODO: is there a better way of doing this?
    //   }
    // }
  },
  spkKey: {
    type: String,
    optional: true,
    autoValue: function() {
      var versions = this.field('versions');
      if (versions) {
        var latest = _.sortBy(versions.value, function(v) { return -v.version; })[0],
            spk = Spks.findOne({'meta.packageId': latest && latest.packageId});
        if (spk) {
          var key = Spks.getKey(spk._id);
          Spks.remove(spk._id);
          return key;
        }
      } else {
        this.unset();
      }
    }
  },
  approved: {
    type: Number,
    defaultValue: Apps.approval.pending,
    index: true
  },
  reviews: {
    type: Object,
    blackbox: true,
    defaultValue: {}
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
  installDates: {
    type: [Date],
    defaultValue: []
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

// Update installedThisWeek counts
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

Apps.after.update(function(userId, doc, fieldNames) {

  if (fieldNames.indexOf('reviews') > -1) {
    Apps.update(doc._id, {
      $set: _.reduce(doc.reviews, function(counts, review) {
          if ('rating' in review) {
            counts.ratingsCount += 1;
            counts.ratings[Reviews.invertedRating[review.rating]] += 1;
          }
          return counts;
        }, {
          ratingsCount: 0,
          ratings: {
            broken: 0,
            didntLike: 0,
            jobDone: 0,
            amazing: 0
          }
        })
    });
  }

  if (fieldNames.indexOf('installCount') > -1)
    this.transform().updateInstallCountThisWeek();

}, {fetchPrevious: false});
