// GLOBAL SUBSCRIPTIONS

FlowRouter.subscriptions = function() {
  this.register('messages', Meteor.subscribe('messages'));
};

// ROUTES

// Pre render triggers
FlowRouter.triggers.enter([getSandstormServer]);
FlowRouter.triggers.enter([onlyAdmin.bind(this, 'login')], {
  only: ['review', 'admin']
});
FlowRouter.triggers.enter([redirectOnSmallDevice.bind(this, null)], {
  only: ['review', 'admin']
});

FlowRouter.triggers.exit([hideTooltips, history]);

function hideTooltips() {
  Tooltips && Tooltips.hide();
}
function history(context) {
  if (context.route.name !== 'notFound') {
    if (FlowRouter.history) FlowRouter.history.push(context.path);
    else FlowRouter.history = [context.path];
    FlowRouter.history = FlowRouter.history.splice(FlowRouter.history.length - 2, 2);
  }
}

// Utility function to redirect (either to App Market home or a given route)
// if there is no logged in user
function onlyLoggedIn(route) {
  if (!Meteor.userId()) FlowRouter.go(route || 'appMarket');
}
// Utility function to redirect (either to App Market home or a given route)
// if the user is not an admin
function onlyAdmin(route) {
  if (!Roles.userIsInRole(Meteor.userId(), 'admin')) FlowRouter.go(route || 'appMarket');
}
// Utility function to redirect (either to App Market home or a given route)
// if the device is not a desktop
function redirectOnSmallDevice(route) {
  if (!Meteor.Device.isDesktop()) FlowRouter.go(route || 'appMarket');
}

// We have to do this in each route at present, as Flow Router doesn't
// pass query params to middleware (yet)
function getSandstormServer(context) {
  if (context.queryParams.host) {
    var host = context.queryParams.host;
    if (host.slice(-1) != '/') host = host + '/';
    AppMarket.sandstormHost = host;
    amplify.store('sandstormHost', host);
    var allHosts = amplify.store('sandstormHostHistory') || [];
    allHosts = _.unique(allHosts.concat(host));
    amplify.store('sandstormHostHistory', allHosts);
  }
}

// Subscription callback which checks it the supplied app exists when the
// sub is ready, and redirects to a not found page if it isn't
function checkAppExists() {
  Meteor.defer(function() {
    var app = Apps.find(FlowRouter.getParam('appId')).count();
    if (!app) FlowRouter.go('notFound', {object: 'app'});
  });
}
function checkAuthorExists() {
  Meteor.defer(function() {
    var authorApps = Apps.find({authorName: FlowRouter.getParam('authorName')}).count();
    if (!author) FlowRouter.go('notFound', {object: 'author'});
  });
}

FlowRouter.route('/login', {
  name: 'login',
  action: function(params, queryParams) {
    BlazeLayout.render('MasterLayout', {mainSection: 'Login'});
  }
});

FlowRouter.route('/not-found/:object', {
  name: 'notFound',
  action: function(params, queryParams) {
    BlazeLayout.render('MasterLayout', {mainSection: 'NotFound'});
  }
});

FlowRouter.route('/app/:appId', {
  name: 'singleApp',
  action: function(params, queryParams) {
    BlazeLayout.render('MasterLayout', {mainSection: 'SingleApp'});
  }
});

FlowRouter.route('/', {
  name: 'appMarket',
  action: function(params, queryParams) {
    BlazeLayout.render('MasterLayout', {mainSection: 'Home'});
  }
});

FlowRouter.route('/author/:authorName', {
  name: 'appMarketAuthor',
  action: function(params, queryParams) {
    BlazeLayout.render('MasterLayout', {mainSection: 'AppsByAuthor'});
  }
});

FlowRouter.route('/genre/:genre', {
  name: 'appMarketGenre',
  action: function(params, queryParams) {
    if (params.genre !== s.capitalize(params.genre))
      FlowRouter.setParams({genre: s.capitalize(params.genre)});

    if (params.genre === 'Popular') BlazeLayout.render('MasterLayout', {mainSection: 'Popular'});
    else BlazeLayout.render('MasterLayout', {mainSection: 'Genre', genre: FlowRouter.getParam('genre')});
  }
});

FlowRouter.route('/search', {
  name: 'appSearch',
  action: function(params, queryParams) {
    BlazeLayout.render('MasterLayout', {mainSection: 'Search'});
  }
});

FlowRouter.route('/installed', {
  name: 'installedApps',
  action: function(params, queryParams) {
    var user = Meteor.users.findOne(Meteor.userId());
    FlowRouter.current().firstVisit = (typeof(user && user.autoupdateApps) === 'undefined');
    BlazeLayout.render('MasterLayout', {mainSection: 'InstalledApps'});
  }
});

FlowRouter.route('/apps-by-me', {
  name: 'appsByMe',
  foo: 'bar',
  action: function(params, queryParams) {
    BlazeLayout.render('MasterLayout', {mainSection: 'AppsByMe'});
  }
});

FlowRouter.route('/upload', {
  name: 'upload',
  action: function(params, queryParams) {
    BlazeLayout.render('MasterLayout', {mainSection: 'Upload'});
  }
});

FlowRouter.notFound = {
  action: function() {
    Meteor.defer(function() {FlowRouter.go('notFound', {object: 'page'});});
  }
};

FlowRouter.routeCategories = {

  'login': 'login',
  'singleApp': 'appMarket',
  'appMarket': 'appMarket',
  'appMarketAuthor': 'appMarket',
  'appMarketGenre': 'appMarket',
  'appSearch': 'appMarket',
  'installedApps': 'installedApps',
  'appsByMe': 'appsByMe',
  'edit': 'upload',
  'upload': 'upload',
  'review': 'admin',
  'admin': 'admin'

};
