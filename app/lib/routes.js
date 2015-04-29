// GLOBAL SUBSCRIPTIONS

FlowRouter.subscriptions = function() {
  this.register('categories', Meteor.subscribe('categories'));
};

// ROUTES

// Utility function to redirect (either to App Market home or a given route)
// if there is no logged in user
function onlyLoggedIn(route) {
  if (!Meteor.userId()) FlowRouter.go(route || 'appMarket');
}

// Reroute root URI to app market
FlowRouter.route('/', {
  action: function() {
    FlowRouter.go('appMarket');
  }
});

FlowRouter.route('/login', {
  name: 'login',
  action: function() {
    FlowLayout.render('MasterLayout', {mainSection: 'Login'});
  }
});

FlowRouter.route('/appMarket', {
  name: 'appMarket',
  action: function() {
    FlowLayout.render('MasterLayout', {mainSection: 'Home'});
  }
});

FlowRouter.route('/appMarket/genres/:genre', {
  name: 'appMarketGenre',
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
  name: 'installedApps',
  subscriptions: function() {
    this.register('installedApps',
      Meteor.subscribe('installed apps'));
  },
  action: function() {
    onlyLoggedIn();
    var user = Meteor.users.findOne(Meteor.userId());
    FlowRouter.current().firstVisit = (typeof(user && user.autoupdateApps) === 'undefined');
    FlowLayout.render('MasterLayout', {mainSection: 'InstalledApps'});
  }
});

FlowRouter.route('/appsByMe', {
  name: 'appsByMe',
  subscriptions: function() {
    this.register('appsByMe',
      Meteor.subscribe('apps by me'));
  },
  action: function() {
    FlowLayout.render('MasterLayout', {mainSection: 'AppsByMe'});
  }
});

FlowRouter.route('/upload', {
  name: 'upload',
  action: function() {
    FlowLayout.render('MasterLayout', {mainSection: 'Upload'});
  }
});

FlowRouter.route('/serviceConfigure', {
  name: 'serviceConfiguration',
  action: function() {
    FlowLayout.render('loginButtons');
  }
});
