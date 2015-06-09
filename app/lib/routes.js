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
// Utility function to redirect (either to App Market home or a given route)
// if the device is not a desktop
function redirectOnSmallDevice(route) {
  if (!Meteor.Device.isDesktop()) FlowRouter.go(route || 'appMarket');
}

// We have to do this in each route at present, as Flow Router doesn't
// pass query params to middleware (yet)
function getSandstormServer(queryParams) {
  if (queryParams.host) amplify.store('sandstormHost', queryParams.host);
}

// Utility function to redirect on bad appId
function redirectOnBadAppId() {
  var appId = FlowRouter.current().params.appId;
  if (!Apps.find(appId).count()) FlowRouter.go('appMarket');
}

function getPopulatedGenres() {
  Meteor.call('genres/getPopulated', function(err, res) {
    if (err) throw new Meteor.Error(err);
    else App.populatedGenres.set(res);
  });
}

FlowRouter.route('/login', {
  name: 'login',
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    FlowLayout.render('MasterLayout', {mainSection: 'Login'});
  }
});

FlowRouter.route('/app/:appId', {
  name: 'singleApp',
  subscriptions: function(params) {
    var route = this;
    this.register('apps by id',
      Meteor.subscribe('apps by id', params.appId, redirectOnBadAppId));
    this.register('user flags',
      Meteor.subscribe('user flags'));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    FlowLayout.render('MasterLayout', {mainSection: 'SingleApp'});
  }
});

FlowRouter.route('/', {
  name: 'appMarket',
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    FlowLayout.render('MasterLayout', {mainSection: 'Home'});
  }
});

FlowRouter.route('/author/:authorId', {
  name: 'appMarketAuthor',
  subscriptions: function(params) {
    this.register('apps by author',
      Meteor.subscribe('apps by author', params.authorId));
    this.register('user basic',
      Meteor.subscribe('user basic', params.authorId));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    FlowLayout.render('MasterLayout', {mainSection: 'Genre'});
  }
});

FlowRouter.route('/genre/:genre', {
  name: 'appMarketGenre',
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    if (params.genre !== s.capitalize(params.genre))
      FlowRouter.setParams({genre: s.capitalize(params.genre)});

    if (params.genre === 'Popular') FlowLayout.render('MasterLayout', {mainSection: 'Popular'});
    else FlowLayout.render('MasterLayout', {mainSection: 'Genre', genre: FlowRouter.current().params.genre});
  }
});

FlowRouter.route('/search', {
  name: 'appSearch',
  subscriptions: function(params, queryParams) {
    this.register('appSearchName',
      Meteor.subscribe('app search name', queryParams.term));
    this.register('appSearchDescription',
      Meteor.subscribe('app search description', queryParams.term));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    FlowLayout.render('MasterLayout', {mainSection: 'Search'});
  }
});

FlowRouter.route('/installed', {
  name: 'installedApps',
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    var user = Meteor.users.findOne(Meteor.userId());
    FlowRouter.current().firstVisit = (typeof(user && user.autoupdateApps) === 'undefined');
    FlowLayout.render('MasterLayout', {mainSection: 'InstalledApps'});
  }
});

FlowRouter.route('/apps-by-me', {
  name: 'appsByMe',
  foo: 'bar',
  subscriptions: function() {
    this.register('appsByMe',
      Meteor.subscribe('apps by me'));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    FlowLayout.render('MasterLayout', {mainSection: 'AppsByMe'});
  }
});

FlowRouter.route('/edit/:appId', {
  name: 'edit',
  subscriptions: function(params) {
    this.register('all categories',
      Meteor.subscribe('all categories'));
    this.register('saved apps',
      Meteor.subscribe('saved apps'));
    this.register('this app',
      Meteor.subscribe('apps by id', params.appId, redirectOnBadAppId));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    FlowLayout.render('MasterLayout', {mainSection: 'Edit'});
  }
});

FlowRouter.route('/upload/:appId', {
  name: 'upload draft',
  subscriptions: function(params) {
    this.register('all categories',
      Meteor.subscribe('all categories'));
    this.register('saved apps',
      Meteor.subscribe('saved apps', redirectOnBadAppId));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    FlowLayout.render('MasterLayout', {mainSection: 'Upload'});
  }
});

FlowRouter.route('/upload', {
  name: 'upload',
  subscriptions: function(params) {
    this.register('all categories',
      Meteor.subscribe('all categories'));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    FlowLayout.render('MasterLayout', {mainSection: 'Upload'});
  }
});

FlowRouter.route('/review/:appId', {
  name: 'review',
  subscriptions: function(params) {
    this.register('all categories',
      Meteor.subscribe('all categories'));
    this.register('saved apps',
      Meteor.subscribe('saved apps'));
    this.register('this app',
      Meteor.subscribe('apps by id', params.appId, true, redirectOnBadAppId));
    this.register('user flags',
      Meteor.subscribe('user flags'));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    if (!Roles.userIsInRole(Meteor.userId(), 'admin')) FlowRouter.go('appMarket');
    redirectOnSmallDevice();
    FlowLayout.render('MasterLayout', {mainSection: 'Review'});
  }
});

FlowRouter.route('/admin', {
  name: 'admin',
  subscriptions: function() {
    this.register('apps all',
      Meteor.subscribe('apps all'));
    this.register('all categories',
      Meteor.subscribe('all categories'));
    this.register('suggested categories',
      Meteor.subscribe('suggested categories'));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    getPopulatedGenres();
    if (!Roles.userIsInRole(Meteor.userId(), 'admin')) FlowRouter.go('appMarket');
    redirectOnSmallDevice();
    FlowLayout.render('MasterLayout', {mainSection: 'Admin'});
  }
});

FlowRouter.route('/service-configure', {
  name: 'serviceConfiguration',
  action: function() {
    FlowLayout.render('loginButtons');
  }
});

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
  'admin': 'admin',
  'serviceConfiguration': 'serviceConfig'

};
