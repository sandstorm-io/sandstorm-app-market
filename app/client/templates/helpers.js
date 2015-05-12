var helpers = {

  // USER HELPERS
  getUsername: function(_id) {

    var user = Meteor.users.findOne(_id);

    return user && user.username;

  },

  getFullname: function(_id) {

    var user = Meteor.users.findOne(_id);

    return user && user.fullname;

  },

  // APP HELPERS

  appRating: function(stars) {

    stars = stars || 0;
    return _.reduce(_.range(5), function(html, ind) {
      if (stars >= ind + 0.5) html += '<i class="icon-star dark" data-index="' + ind + '"></i>';
      else html += '<i class="icon-star light" data-index="' + ind + '"></i>';
      return html;
    }, '');

  },

  getLatestVersion: function() {

    var version = this.latestVersion();
    return version && version.name;

  },

  codeFormat: function(url) {

    // TODO: Need more options here
    if (!url) return 'No link';
    else if (url.search('github.com') > -1) return '<a href="' + url + '">On Github</a>';
    else return '<a href="' + url + '">' + url + '</a>';

  },

  // ROUTER/SUB HELPERS

  routerSubsReady: function(name) {

    return name ? FlowRouter.subsReady(name) : FlowRouter.subsReady();

  },

  routeRoot: function(string) {

    return FlowRouter.reactiveCurrent().path.substr(0, string && string.length) === string ?
          'active' : '';

  },

  getPath: function(routeName, params, queryParams) {

    return FlowRouter.path(routeName, params, queryParams);

  },

  // UTILITY HELPERS

  equal: function(a, b) {

    return a === b;

  },

  prune: function(string, length) {

    return s.prune(string, length);

  },

  count: function(cursor) {

    return cursor.count();

  },

  countApps: function(genre) {

    return Genres.findIn(genre, {}, {}).count();

  },

  skipLimit: function(iterable, skip, limit) {

    if (typeof iterable.fetch === 'function') iterable = iterable.fetch();
    if (!Array.isArray(iterable)) return [];

    if (limit) return iterable.slice(skip, skip + limit);
    else return iterable.slice(skip);

  },

  uriEncode: function(string) {

    return encodeURIComponent(string);

  },

  dateFormat: function(date, format) {

    if (!(date instanceof Date)) return '#NAD';
    else return moment(date).format(format);

  },

  last: function(array) {

    return _.last(array);

  },

  upperCase: function(string) {

    return string.toUpperCase && string.toUpperCase();

  },

  lowerCase: function(string) {

    return string.toLowerCase && string.toLowerCase();

  },

  stripFilename: function(path) {
    var uri = path && path.split('/').pop();
    return decodeURI(uri)
  },

  verboseNone: function(string) {

    return string || 'None';

  },

  // IMAGE HELPERS

  imageUrl: function(image) {

    return (!image || image.substr(0, 4) === 'data' || image.substr(0, 20) === 'http://cdn.filter.to') ?
      image :
      'http://cdn.filter.to/250x250/' + image.substr(8);

  },

  screenshotImageUrl: function(image) {

    return (!image || image.substr(0, 4) === 'data' || image.substr(0, 20) === 'http://cdn.filter.to') ?
      image :
      'http://cdn.filter.to/800x450/' + image.substr(8);

  },

  // ADMIN HELPERS

  isAdmin: function() {

    return Roles.userIsInRole(Meteor.userId(), 'admin');

  },

  // DEBUGGING HELPERS

  logThis: function() {

    console.log(this);

  },

  logParentData: function(depth) {

    console.log(Template.parentData(depth));

  }

};

_.forEach(helpers, function(val, key) {
  Template.registerHelper(key, val);
});
