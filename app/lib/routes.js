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
// Reroute root URI to app market
FlowRouter.route('/', {
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    FlowRouter.go('appMarket');
  }
});

FlowRouter.route('/login', {
  name: 'login',
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    FlowLayout.render('MasterLayout', {mainSection: 'Login'});
  }
});

FlowRouter.route('/appMarket/app/:appId', {
  name: 'singleApp',
  subscriptions: function(params) {
    var route = this;
    this.register('apps by id',
      Meteor.subscribe('apps by id', params.appId, function() {
        thisApp = Apps.findOne(params.appId);
        thisApp && route.register('author',
          Meteor.subscribe('user basic', thisApp.author));
      })
    );
    this.register('user flags',
      Meteor.subscribe('user flags'));
    this.register('users reviewed',
      Meteor.subscribe('users reviewed', params.appId));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    FlowLayout.render('MasterLayout', {mainSection: 'SingleApp'});
  }
});

FlowRouter.route('/appMarket', {
  name: 'appMarket',
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    FlowLayout.render('MasterLayout', {mainSection: 'Home'});
  }
});

FlowRouter.route('/appMarket/author/:authorId', {
  name: 'appMarketAuthor',
  subscriptions: function(params) {
    this.register('authorGenre',
      Meteor.subscribe('apps by author', params.authorId));
      Meteor.subscribe('user basic');
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    FlowLayout.render('MasterLayout', {mainSection: 'Genre'});
  }
});

FlowRouter.route('/appMarket/genres/:genre', {
  name: 'appMarketGenre',
  subscriptions: function(params) {
    this.register('currentGenre',
      Meteor.subscribe('apps by genre', s.capitalize(params.genre)));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    if (params.genre !== s.capitalize(params.genre))
      FlowRouter.setParams({genre: s.capitalize(params.genre)});

    if (params.genre === 'Popular') FlowLayout.render('MasterLayout', {mainSection: 'Popular'});
    else FlowLayout.render('MasterLayout', {mainSection: 'Genre', genre: FlowRouter.current().params.genre});
  }
});

FlowRouter.route('/appMarket/search', {
  name: 'appSearch',
  subscriptions: function(params, queryParams) {
    this.register('appSearchName',
      Meteor.subscribe('app search name', queryParams.term));
    this.register('appSearchDescription',
      Meteor.subscribe('app search description', queryParams.term));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    FlowLayout.render('MasterLayout', {mainSection: 'Search'});
  }
});

FlowRouter.route('/installedApps', {
  name: 'installedApps',
  subscriptions: function() {
    this.register('installedApps',
      Meteor.subscribe('installed apps'));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    onlyLoggedIn();
    var user = Meteor.users.findOne(Meteor.userId());
    FlowRouter.current().firstVisit = (typeof(user && user.autoupdateApps) === 'undefined');
    FlowLayout.render('MasterLayout', {mainSection: 'InstalledApps'});
  }
});

FlowRouter.route('/appsByMe', {
  name: 'appsByMe',
  foo: 'bar',
  subscriptions: function() {
    this.register('appsByMe',
      Meteor.subscribe('apps by me'));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    FlowLayout.render('MasterLayout', {mainSection: 'AppsByMe'});
  }
});

FlowRouter.route('/upload/edit/:appId', {
  name: 'edit',
  subscriptions: function(params) {
    this.register('all categories',
      Meteor.subscribe('all categories'));
    this.register('saved apps',
      Meteor.subscribe('saved apps'));
    this.register('this app',
      Meteor.subscribe('apps by id', params.appId));
    this.register('this app',
      Meteor.subscribe('apps by id', params.appId));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    FlowLayout.render('MasterLayout', {mainSection: 'Edit'});
  }
});

FlowRouter.route('/upload', {
  name: 'upload',
  subscriptions: function() {
    this.register('all categories',
      Meteor.subscribe('all categories'));
    this.register('saved apps',
      Meteor.subscribe('saved apps'));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
    FlowLayout.render('MasterLayout', {mainSection: 'Upload'});
  }
});

FlowRouter.route('/admin/review/:appId', {
  name: 'admin-review',
  subscriptions: function(params) {
    this.register('all categories',
      Meteor.subscribe('all categories'));
    this.register('saved apps',
      Meteor.subscribe('saved apps'));
    this.register('this app',
      Meteor.subscribe('apps by id', params.appId, true));
    this.register('user flags',
      Meteor.subscribe('user flags'));
  },
  action: function(params, queryParams) {
    getSandstormServer(queryParams);
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
    if (!Roles.userIsInRole(Meteor.userId(), 'admin')) FlowRouter.go('appMarket');
    redirectOnSmallDevice();
    FlowLayout.render('MasterLayout', {mainSection: 'Admin'});
  }
});

FlowRouter.route('/serviceConfigure', {
  name: 'serviceConfiguration',
  action: function() {
    FlowLayout.render('loginButtons');
  }
});
