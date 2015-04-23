// GLOBAL SUBSCRIPTIONS

FlowRouter.subscriptions = function() {
  this.register('categories', Meteor.subscribe('categories'));
};

// ROUTES

// Reroute root URI to app market
FlowRouter.route('/', {
  action: function() {
    FlowRouter.go('/appMarket');
  }
});

FlowRouter.route('/appMarket', {
  action: function() {
    FlowLayout.render('MasterLayout', {mainSection: 'Home'});
  }
});

FlowRouter.route('/appMarket/genres/:genre', {
  subscriptions: function(params) {
    this.register('currentGenre',
      Meteor.subscribe('apps by genre', s.capitalize(params.genre)));
  },
  action: function(params) {
    if (params.genre !== s.capitalize(params.genre))
      FlowRouter.setParams({genre: s.capitalize(params.genre)});

    if (params.genre === 'Popular') FlowLayout.render('MasterLayout', {mainSection: 'Popular'});
    else FlowLayout.render('MasterLayout', {mainSection: 'Genre'});
  }
});

FlowRouter.route('/installedApps', {
  subscriptions: function() {
    this.register('installedApps',
      Meteor.subscribe('installed apps'));
  },
  action: function() {
    FlowLayout.render('MasterLayout', {mainSection: 'InstalledApps'});
  }
});

FlowRouter.route('/serviceConfigure', {
  action: function() {
    FlowLayout.render('loginButtons');
  }
});
