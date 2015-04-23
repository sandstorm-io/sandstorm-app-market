var helpers = {

  //USER HELPERS
  getUsername: function(_id) {

    var user = Meteor.users.findOne(_id);

    return user && user.username;

  },

  //ROUTER/SUB HELPERS

  routerSubsReady: function(name) {

    return name ? FlowRouter.subsReady(name) : FlowRouter.subsReady();

  },

  routeRoot: function(string) {

    return FlowRouter.reactiveCurrent().path.substr(0, string && string.length) === string ?
          'active' : '';

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

  briefDate: function(date) {

    if (!(date instanceof Date)) return '#NAD';
    else return moment(date).format('MMM DD');

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
