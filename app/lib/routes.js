// GLOBAL SUBSCRIPTIONS

FlowRouter.subscriptions = function() {
  this.register('categories', Meteor.subscribe('categories'));
};

// ROUTES

FlowRouter.route('/:', {
  action: function() {
    FlowLayout.render("MasterLayout", {mainSection: "Home"});
  }
});

FlowRouter.route('/genres/:genre', {
  subscriptions: function(params) {
    this.register('currentGenre',
      Meteor.subscribe('apps by genre', params.genre));
  },
  action: function(params) {
    FlowLayout.render("MasterLayout", {mainSection: "Genre"});
  }
});
