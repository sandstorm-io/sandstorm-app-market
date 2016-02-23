// Handle "?experimental=true".
var experimental = window.location.search.indexOf('experimental=true') >= 0;
var indexDir = experimental ? 'experimental' : 'apps';
if (experimental) {
  Meteor.startup(function () {
    // Add an ugly hack to make sure "?experimental=true" gets added to all URLs.
    FlowRouter.triggers.enter([function (context, redirect) {
      // The trigger runs before the path is updated, so we need to Meteor.defer().
      Meteor.defer(function () {
        console.log("hi", window.location);
        if (window.location.search === "") {
          window.history.replaceState(window.history.state, document.title, "?experimental=true");
        }
      });
    }]);
  });
}

Api = {
  
  url: (Meteor.settings && Meteor.settings.public && Meteor.settings.public.API_URL) ||
       "https://app-index.sandstorm.io",
  
  indexOverrideUrl: Meteor.settings && Meteor.settings.public && Meteor.settings.public.INDEX_OVERRIDE_URL,
  appOverrideUrl: Meteor.settings && Meteor.settings.public && Meteor.settings.public.APP_OVERRIDE_URL,
  imageOverrideUrl: Meteor.settings && Meteor.settings.public && Meteor.settings.public.IMAGE_OVERRIDE_URL,
  packageOverrideUrl: Meteor.settings && Meteor.settings.public && Meteor.settings.public.PACKAGE_OVERRIDE_URL,
  
  getIndex: function(cb) {
    var url = this.indexOverrideUrl || [this.url, indexDir, 'index.json'].join('/');
    HTTP.get(url, function (err, result) {
      cb(err, result && result.data);
    });
  },
  
  getApp: function(appId, cb) {
    var url = this.appOverrideUrl || [this.url, indexDir, appId + '.json'].join('/');
    HTTP.get(url, function (err, result) {
      cb(err, result && result.data);
    });
  },
  
  imageUrl: function(imageId) {
    return this.imageOverrideUrl || [this.url, 'images', imageId].join('/');
  },
  
  packageUrl: function(packageId) {
    return this.packageOverrideUrl || [this.url, 'packages', packageId].join('/');  
  }
  
};

Template.registerHelper('imageUrl', function(imageId) {
  return Api.imageUrl(imageId);
});
  
Template.registerHelper('packageUrl', function(packageId) {
  return Api.packageUrl(packageId);
});
