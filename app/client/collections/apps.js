import { Meteor } from 'meteor/mongo';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema'

import { AppMarket } from '/imports/lib/appMarket';
import { Schemas } from '/imports/collections/schema/schema';

export var Apps = new Mongo.Collection(null, {transform: function(app) {

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
    AppMarket.getSandstormHost(this, function(host) {
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
    return (this.author && this.author.googleId) ?
             'https://plus.google.com/' + this.author.googleId : null;
  };
  app.facebookLink = function() {
    return (this.author && this.author.facebookLink) ?
             this.author.facebookLink : null;
  };
  app.twitterLink = function() {
    return (this.author && this.author.twitterUsername) ?
             'https://twitter.com/' + this.author.twitterUsername : null;
  };
  app.githubLink = function() {
    return (this.author && this.author.githubUsername) ?
             'https://github.com/' + this.author.githubUsername : null;
  };

  return app;
}});

// appsBaseSchema contains the keys that are required for a valid app object,
// but NOT anything which will be autoValued or receive a default value only
// when the app is added to the DB.
const VersionSchema = new SimpleSchema({
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

const appsBaseSchema = {
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
  moderatorPreference: {
    type: Number,
    optional: true
  },
  categories: {
    type: Array,
    index: true,
    defaultValue: [],
    minCount: 1
  },
  'categories.$': {
    type: String
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
  changelog: {
    type: String,
    defaultValue: '',
    optional: true
  },
  imageId: {
    type: String
  },
  screenshots: {
    type: Array,
    optional: true
  },
  'screenshots.$': {
    type: Object
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
  author: {
    type: Object
  },
  'author.name': {
    type: String,
    optional: true
  },
  'author.githubUsername': {
    type: String,
    optional: true
  },
  'author.twitterUsername': {
    type: String,
    optional: true
  },
  'author.facebookLink': {
    type: String,
    optional: true
  },
  'author.googleId': {
    type: String,
    optional: true
  },
  'upstreamAuthor': {
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
  ratings: {
    type: Object
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
