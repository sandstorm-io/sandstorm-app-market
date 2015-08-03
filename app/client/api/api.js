Api = {
  
  url: Meteor.settings && Meteor.settings.public && Meteor.settings.public.API_URL,
  
  indexOverrideUrl: Meteor.settings && Meteor.settings.public && Meteor.settings.public.INDEX_OVERRIDE_URL,
  appOverrideUrl: Meteor.settings && Meteor.settings.public && Meteor.settings.public.APP_OVERRIDE_URL,
  imageOverrideUrl: Meteor.settings && Meteor.settings.public && Meteor.settings.public.IMAGE_OVERRIDE_URL,
  packageOverrideUrl: Meteor.settings && Meteor.settings.public && Meteor.settings.public.PACKAGE_OVERRIDE_URL,
  
  getIndex: function(cb) {
    $.ajax({
      method: 'GET',
      url: this.indexOverrideUrl || [this.url, 'apps', 'index'].join('/'),
      cache: false,
      dataType: 'json',
      success: function(data) {
        return cb(null, data);
      },
      error: function(err) {
        return cb(err, null);
      }
    });
  },
  
  getApp: function(appId, cb) {
    $.ajax({
      method: 'GET',
      url: this.appOverrideUrl || [this.url, 'apps', appId].join('/'),
      cache: false,
      dataType: 'json',
      success: function(data) {
        return cb(null, data);
      },
      error: function(err) {
        return cb(err, null);
      }
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