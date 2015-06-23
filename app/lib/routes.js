// GLOBAL SUBSCRIPTIONS

FlowRouter.subscriptions = function() {
  this.register('categories', Meteor.subscribe('categories'));
  this.register('messages', Meteor.subscribe('messages'));
  this.register('apps private', Meteor.subscribe('apps private'));
};

// ROUTES

// Pre render triggers
FlowRouter.triggers.enter([getSandstormServer, getPopulatedGenres, scrollUp]);
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
function scrollUp() {
  var scrollY = window.scrollY,
      bodyMaxTop = $('body').height() - $(window).height();
  if (scrollY > bodyMaxTop) window.scrollTo(0, bodyMaxTop);
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
    App.sandstormHost = context.queryParams.host;
    amplify.store('sandstormHost', context.queryParams.host);
    var allHosts = amplify.store('sandstormHostHistory') || [];
    allHosts = _.unique(allHosts.concat(context.queryParams.host));
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
    var author = Meteor.users.find(FlowRouter.getParam('authorId')).count();
    if (!author) FlowRouter.go('notFound', {object: 'author'});
  });
}

function getPopulatedGenres() {
  Meteor.call('genres/getPopulated', function(err, res) {
    if (err) throw new Meteor.Error(err);
    App.populatedGenres.set(res ? App.extraGenres.concat(res) : App.extraGenres);
  });
}

FlowRouter.route('/login', {
  name: 'login',
  action: function(params, queryParams) {
    FlowLayout.render('MasterLayout', {mainSection: 'Login'});
  }
});

FlowRouter.route('/not-found/:object', {
  name: 'notFound',
  action: function(params, queryParams) {
    FlowLayout.render('MasterLayout', {mainSection: 'NotFound'});
  }
});

FlowRouter.route('/app/:appId', {
  name: 'singleApp',
  subscriptions: function(params) {
    var route = this;
    this.register('apps by id',
      Meteor.subscribe('apps by id', params.appId, checkAppExists));
    this.register('user flags',
      Meteor.subscribe('user flags'));
  },
  action: function(params, queryParams) {
    FlowLayout.render('MasterLayout', {mainSection: 'SingleApp'});
  }
});

FlowRouter.route('/', {
  name: 'appMarket',
  action: function(params, queryParams) {
    FlowLayout.render('MasterLayout', {mainSection: 'Home'});
  }
});

FlowRouter.route('/author/:authorId', {
  name: 'appMarketAuthor',
  subscriptions: function(params) {
    this.register('apps by author',
      Meteor.subscribe('apps by author', params.authorId));
    this.register('user basic',
      Meteor.subscribe('user basic', params.authorId, checkAuthorExists));
  },
  action: function(params, queryParams) {
    FlowLayout.render('MasterLayout', {mainSection: 'AppsByAuthor'});
  }
});

FlowRouter.route('/genre/:genre', {
  name: 'appMarketGenre',
  action: function(params, queryParams) {
    if (params.genre !== s.capitalize(params.genre))
      FlowRouter.setParams({genre: s.capitalize(params.genre)});

    if (params.genre === 'Popular') FlowLayout.render('MasterLayout', {mainSection: 'Popular'});
    else FlowLayout.render('MasterLayout', {mainSection: 'Genre', genre: FlowRouter.getParam('genre')});
  }
});

FlowRouter.route('/search', {
  name: 'appSearch',
  subscriptions: function(params, queryParams) {
    this.register('appSearchName',
      Meteor.subscribe('app search name', queryParams && queryParams.term));
    this.register('appSearchDescription',
      Meteor.subscribe('app search description', queryParams && queryParams.term));
  },
  action: function(params, queryParams) {
    FlowLayout.render('MasterLayout', {mainSection: 'Search'});
  }
});

FlowRouter.route('/installed', {
  name: 'installedApps',
  action: function(params, queryParams) {
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
      Meteor.subscribe('apps by id', params.appId, checkAppExists));
  },
  action: function(params, queryParams) {
    FlowLayout.render('MasterLayout', {mainSection: 'Edit'});
  }
});

FlowRouter.route('/upload/:appId', {
  name: 'upload draft',
  subscriptions: function(params) {
    this.register('all categories',
      Meteor.subscribe('all categories'));
    this.register('saved apps',
      Meteor.subscribe('saved apps', checkAppExists));
  },
  action: function(params, queryParams) {
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
      Meteor.subscribe('apps by id', params.appId, true, checkAppExists));
    this.register('user flags',
      Meteor.subscribe('user flags'));
  },
  action: function(params, queryParams) {
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
    FlowLayout.render('MasterLayout', {mainSection: 'Admin'});
  }
});

FlowRouter.route('/service-configure', {
  name: 'serviceConfiguration',
  action: function() {
    FlowLayout.render('loginButtons');
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
  'admin': 'admin',
  'serviceConfiguration': 'serviceConfig'

};
