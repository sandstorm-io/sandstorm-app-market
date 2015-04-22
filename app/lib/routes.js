// GLOBAL SUBSCRIPTIONS

FlowRouter.subscriptions = function() {
  this.register('categories', Meteor.subscribe('categories'));
};

// ROUTES

FlowRouter.route('/', {
  action: function() {
    FlowLayout.render("MasterLayout", {mainSection: "Home"});
  }
});

FlowRouter.route('/genres/:genre', {
  subscriptions: function(params) {
    this.register('currentGenre',
      Meteor.subscribe('apps by genre', s.capitalize(params.genre)));
  },
  action: function(params) {
    if (params.genre !== s.capitalize(params.genre))
      FlowRouter.setParams({genre: s.capitalize(params.genre)});

    if (params.genre === 'Popular') FlowLayout.render("MasterLayout", {mainSection: "Popular"});
    else FlowLayout.render("MasterLayout", {mainSection: "Genre"});
  }
});
