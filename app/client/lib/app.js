var helpers = {

  getUsername: function(_id) {

    var user = Meteor.users.findOne(_id);

    return user && user.username;

  },

  equal: function(a, b) {

    return a === b;

  },

  prune: function(string, length) {

    return s.prune(string, length);

  },

  routerSubsReady: function(name) {

    return name ? FlowRouter.subsReady(name) : FlowRouter.subsReady();

  },

  count: function(cursor) {

    return cursor.count();

  }

};

_.forEach(helpers, function(val, key) {
  Template.registerHelper(key, val);
});
