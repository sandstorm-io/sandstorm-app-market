Apps = new Mongo.Collection(null, {transform: function(app) {

  app.latestVersion = function() {
    return _.sortBy(this.versions, function(entry) {
      return -entry.createdAt;
    })[0];
  };

  app.onGithub = function() {
    return this.codeLink && this.codeLink.indexOf('github.com') > -1;
  };

  app.getLocation = function() {
    return this.spkLink;
  };

  app.install = function() {
    var _this = this;
    AppMarket.getSandstormHost(this.packageId, function(host) {
      Meteor.call('user/installApp', _this._id, host, function(err) {
        if (err) console.log(err);
        else {
          var packageId = _this.latestVersion() && _this.latestVersion().packageId;
          window.open(host + 'install/' + packageId + '?url=' + Meteor.absoluteUrl() + 'package/' + packageId, "_blank");
          var installedLocally = amplify.store('sandstormInstalledApps');
          if (!installedLocally) amplify.store('sandstormInstalledApps', [_this._id]);
          else if (installedLocally.indexOf(_this._id) === -1) {
            installedLocally.push(_this._id);
            amplify.store('sandstormInstalledApps', installedLocally);
            AppMarket.historyDep.changed();
          }
        }
      });
    });
  };

  app.installed = function() {

    if (typeof window !== 'undefined') {
      var appIds = window.amplify.store('sandstormInstalledApps') || [];
      if (appIds.indexOf(this._id) > -1) return true;
    }
    var userId = this.userId || Meteor.userId(),
        user = Meteor.users.findOne(userId);
    if (user && user.installedApps && this._id in user.installedApps) return true;

    return false;

  };

  app.googlePlusLink = function() {
    return (this.socialLinks && this.socialLinks.google && this.socialLinks.google.id) ?
             'https://plus.google.com/' + this.socialLinks.google.id : null;
  };
  app.facebookLink = function() {
    return (this.socialLinks && this.socialLinks.facebook && this.socialLinks.facebook.link) ?
             this.socialLinks.facebook.link : null;
  };
  app.twitterLink = function() {
    return (this.socialLinks && this.socialLinks.twitter && this.socialLinks.twitter.screenName) ?
             'https://twitter.com/' + this.socialLinks.twitter.screenName : null;
  };
  app.githubLink = function() {
    return (this.socialLinks && this.socialLinks.github && this.socialLinks.github.username) ?
             'https://github.com/' + this.socialLinks.github.username : null;
  };

  return app;
}});

// appsBaseSchema contains the keys that are required for a valid app object,
// but NOT anything which will be autoValued or receive a default value only
// when the app is added to the DB.
var VersionSchema = new SimpleSchema({
  number: {
    type: String,
    max: 20
  },
  packageId: {
    type: String
  },
  changes: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date
  }
});

var appsBaseSchema = {
  appId: {
    type: String
  },
  name: {
    type: String,
    index: true
  },
  createdAt: {
    type: Date,
    optional: true
  },
  categories: {
    type: [String],
    index: true,
    defaultValue: [],
    minCount: 1
  },
  description: {
    type: String,
    defaultValue: '',
    optional: true
  },
  shortDescription: {
    type: String,
    defaultValue: '',
    optional: true
  },
  imageId: {
    type: String
  },
  screenshots: {
    type: [Object],
    optional: true
  },
  'screenshots.$.imageId': {
    type: String,
  },
  'screenshots.$.width': {
    type: Number,
  },
  'screenshots.$.height': {
    type: Number,
  },
  'author.name': {
    type: String
  },
  'githubUsername': {
    type: String,
    optional: true
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
  packageId: {
    type: String,
  },
  license: {
    type: String,
    optional: true
  },
  // versions: {
  //   type: [VersionSchema],
  //   defaultValue: [],
  //   minCount: 1
  // },
  version: {
    type: String
  },
  installCount: {
    type: Number,
    min: 0,
    optional: true,
    defaultValue: 0
  },
  installCountThisWeek: {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  
  // added on insertion
  ratingsCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  'ratings.broken': {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  'ratings.didntLike': {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  'ratings.jobDone': {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  'ratings.amazing': {
    type: Number,
    min: 0,
    defaultValue: 0
  }

};

Schemas.AppsBase = new SimpleSchema(appsBaseSchema);

Apps.attachSchema(Schemas.AppsBase);

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