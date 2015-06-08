/*****************************************************************************/
/* Server Only Methods */
/*****************************************************************************/
var Future = Npm.require('fibers/future');

Meteor.methods({
  'user/toggleAutoupdate': function() {

    this.unblock();
    if (!this.userId) return false;

    var user = Meteor.users.findOne(this.userId);
    return Meteor.users.update(this.userId, {
      $set: {
        autoupdateApps: !(user && user.autoupdateApps)
      }
    });

  },

  'user/uninstallApp': function(appId) {

    this.unblock();

    var unset = {};

    unset['installedApps.' + appId] = true;
    return Meteor.users.update(this.userId, {
      $unset: unset
    });

  },

  'user/installApp': function(appId) {

    this.unblock();
    var app = Apps.findOne(appId);
    if (!app) return false;

    var set = {};

    set['installedApps.' + appId] = {
      version: _.last(app.versions),
      dateTime: new Date()
    };
    Apps.update(appId, {$inc: {installCount: 1}, $push: {installDates: new Date()}});
    return Meteor.users.update(this.userId, {
      $set: set
    });

  },

  'user/updateApp': function(appId) {

    // TODO: actually update the app!
    this.unblock();
    if (!this.userId) return false;
    var app = Apps.findOne(appId);
    if (!app) return false;

    var set = {},
        userId = this.userId;

    set['installedApps.' + appId] = {
      version: app.latestVersion(),
      dateTime: new Date()
    };
    // The update is recorded only after an interval as livedata will automatically
    // inform the client, which will result in the UI updating.  We need to give
    // the "app updated" animation time to play before this happens.
    Meteor.setTimeout(function() {
      Meteor.users.update(userId, {
        $set: set
      });
    }, 3000);
    return true;

  },

  'user/updateAllApps': function() {

    // TODO: actually update the apps!
    this.unblock();
    if (!this.userId) return false;

    Genres.findIn('Updates Available', {}, {}, this).forEach(function(app) {

      Meteor.call('user/updateApp', app._id);

    });

    return true;

  },

  'user/saveApp': function(app) {

    this.unblock();
    if (!this.userId) return false;

    // add TimeStamp
    app.lastEdit = new Date();
    app.approved = 4;
    if (app.replacesApp && Apps.findOne({replacesApp: app.replacesApp, approved: Apps.approval.draft}))
      return Apps.update({replacesApp: app.replacesApp, approved: Apps.approval.draft}, app);
    else return Apps.insert(app, {validate: false});

  },

  'user/deleteSavedApp': function(appId) {

    this.unblock();
    if (!this.userId) return false;

    var unset = {},
      unsetString = 'savedApp.' + (appId || 'new');
    unset[unsetString] = true;
    return Meteor.users.update(this.userId, {$unset: unset});

  },

  'user/submitApp': function(app) {

    var fut = new Future();

    this.unblock();
    if (!this.userId) return false;
    if (this.userId !== app.author) throw new Meteor.Error('wrong author', 'Can only submit app by logged-in user');

    _.each(app.categories, function(cat) {
      if (!Categories.findOne({name: cat})) Categories.insert({
        name: cat,
        suggested: true
      });
    });

    // Here we need to make sure the app metadata is still as per the spk in case
    // a user has manually overwritten it before submitting.
    var fileObj = Spks.findOne(app.versions[0].spkId);

    if (!fileObj) throw new Meteor.Error('Bad .spk id in latest version data');

    app.appId = fileObj.meta.appId;
    _.extend(app.versions[0], {
      version: fileObj.meta.version,
      packageId: fileObj.meta.packageId,
      // dateTime: new Date()
    });

    // Then insert the new app
    Apps.insert(app, function(err, res) {
      console.log(err, res);
      if (err) console.log(err.code);
      if (err) fut.throw(new Meteor.Error(err.name, err.message, {code: err.code}));
      else fut.return(res);
    });

    return fut.wait();

  },

  'user/submitUpdate': function(app) {

    var fut = new Future();

    this.unblock();
    if (!this.userId) return false;
    if (this.userId !== app.author) throw new Meteor.Error('wrong author', 'Can only submit app by logged-in user');

    check(app.versions.length, Match.Where(function(l) {return l > 0;}));

    _.each(app.categories, function(cat) {
      if (!Categories.findOne({name: cat})) Categories.insert({
        name: cat,
        suggested: true
      });
    });

    // Here we need to make sure the app metadata is still as per the spk in case
    // a user has manually overwritten it before submitting.
    var fileObj = Spks.findOne(app.versions[0].spkId),
        currentApp = Apps.findOne(app.replacesApp),
        latestVersion = currentApp && currentApp.latestVersion();

    // Confirm veracity of .spk, but only if there's a new packageId
    if (latestVersion.packageId !== app.versions[0].packageId) {
      if (!fileObj && latestVersion && latestVersion.packageId !== app.versions[0].packageId)
        throw new Meteor.Error('Bad .spk id in latest version data');
      if (!currentApp || fileObj.meta.appId !== currentApp.appId) throw new Meteor.Error('New .spk appId does not match existing appId');

      app.appId = fileObj.meta.appId;
      _.extend(app.versions[0], {
        version: fileObj.meta.version,
        packageId: fileObj.meta.packageId,
      });
    } else {
      app.appId = latestVersion.appId;
      _.extend(app.versions[0], {
        version: latestVersion.version
      });
    }

    Apps.insert(app, function(err, res) {
      if (err) throw new Meteor.Error(err.message);
      else fut.return(res);
    });

    return fut.wait();

  },

  'user/deleteApp': function(appId) {

    var fut = new Future(),
        app = Apps.findOne(appId);

    this.unblock();
    if (!this.userId) return false;
    if (!app || this.userId !== app.author) throw new Meteor.Error('wrong author', 'Can only delete app by logged-in user');

    return Apps.remove(appId);
    // TODO: should we inform installed users that this app is no longer available?

  },

  'user/chipIn': function(appId, amount) {

    this.unblock();

    check(amount, Number);
    check(amount, Match.Where(function(amount) {return (0 < amount) && (40 >= amount);}));

    var user = Meteor.users.findOne(this.userId),
        app = Apps.findOne(appId);

    if (!user) throw new Meteor.Error('no authenticated user', 'Cannot chip in if user is not authenticated');
    if (!Apps.findOne(appId)) throw new Meteor.Error('no matching app', 'Cannot chip in for an app which is not in the database');

    // TODO: Actually make a payment
    console.log('User ' + user.username + ' wants to chip in ' + amount + ' for the app ' + app.name);

    return true;

  },

  'user/flagApp': function(appId, flag) {

    this.unblock();
    if (!this.userId) return false;

    if (!Apps.findOne(appId)) throw new Meteor.Error('no matching app', 'Cannot submit a review for an app which is not in the database');

    var userFlag = {},
        appFlag = {};

    flag.dateTime = new Date();
    flag.userId = this.userId;
    flag.authorName = Meteor.users.findOne(this.userId).username;

    appFlag['flags.' + this.userId] = flag;
    userFlag['flags.' + appId] = flag;

    Apps.update(appId, {$set: appFlag});
    Meteor.users.update(this.userId, {$set: userFlag});

    return true;

  },

  'user/reviewApp': function(appId, review) {

    this.unblock();
    if (!this.userId) return false;

    if (review.rating) {
      check(review.rating, Match.Integer);
      check(review.rating, Match.Where(function(rating) {return (0 <= rating) && (3 >= rating);}));
    }
    check(review.text, String);
    check(review.text, Match.Where(function(text) {return text.length > 0;}));

    if (!Apps.findOne(review.appId)) throw new Meteor.Error('no matching app', 'Cannot submit a review for an app which is not in the database');

    review.userId = this.userId;

    if (Reviews.findOne(_.pick(review, ['appId', 'userId'])))
      Reviews.update(_.pick(review, ['appId', 'userId']), {$set: review});
    else Reviews.insert(review);

  },

  'apps/togglePrivate': function(appId) {

    this.unblock();
    var app = Apps.findOne(appId);
    if (!app || app.author !== this.userId) return false;

    Apps.update(appId, {$set: {public: !app.public}});

    return true;

  },

  'apps/approve': function(appId) {

    if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
    var app = Apps.findOne(appId);
    if (!app) throw new Meteor.Error('No app matching id ' + appId);
    // If there's an existing approved version, REPLACE that and remove the update
    var replacesApp = Apps.findOne(app.replacesApp);
    if (replacesApp) {
      var newVersion = app.versions[0];
      Schemas.AppsBase.clean(app);
      delete app.versions;
      delete app.replacesApp;
      app.approved = 0;
      Apps.update(replacesApp, {$set: app, $push: {versions: newVersion}});
      Apps.remove(appId);
    } else {
      // NOTE: admin requests object is removed here, as it is assumed that any
      // requested amendments have been made satisfactorily for the app to have
      // been approved.
      return Apps.update(appId, {$set: {approved: 0, adminRequests: []}});
    }

  },

  'apps/requestRevision': function(appId) {

    if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
    var app = Apps.findOne(appId);
    if (!app) throw new Meteor.Error('No app matching id ' + appId);
    return Apps.update(appId, {$set: {approved: 2}});

  },

  // TODO: this is probably unnecessary
  'apps/flag': function(appId) {

    if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
    var app = Apps.findOne(appId);
    if (!app) throw new Meteor.Error('No app matching id ' + appId);

  },

  'apps/reject': function(appId) {

    if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
    var app = Apps.findOne(appId);
    if (!app) throw new Meteor.Error('No app matching id ' + appId);
    return Apps.update(appId, {$set: {approved: 3}});

  },

  'apps/addNote': function(appId, note) {

    check(note, String);
    var app = Apps.findOne(appId);
    if (!app) throw new Meteor.Error('No app with id ' + appId);
    if (!(Roles.userIsInRole(this.userId, 'admin') || app.author === this.userId))
      throw new Meteor.Error('Notes can only be written by app author or admin user');

    return Apps.update(appId, {$set: {note: note}});

  },

  'genres/getPopulated': function() {
    this.unblock();
    return App.populatedGenres;
  },

  'admin/submitAdminRequests': function(app) {

    this.unblock();
    if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Only an admin user can save an app that isn\'t theirs');

    return Apps.update(app.replacesApp, {$set: {adminRequests: [app], approved: 2}});

  },

  'admin/saveEdits': function(appId) {

    this.unblock();
    if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Only an admin user can save an app that isn\'t theirs');

    var set = {},
      setString = 'savedApp.' + (app.replacesApp || 'new');
    set[setString] = app;
    return Meteor.users.update(this.userId, {$set: set});

  },

  'admin/removeAllApps': function() {

    if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
    Apps.remove({});

  },

  'admin/seedApps': function(n) {

    if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
    check(n, Number);
    check(n, Match.Where(function(x) { return x < 500; }));

    while (Apps.find().count() < n)
      App.fakeApp();

  },

  'admin/approveGenre': function(genre) {

    if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
    var cat = Categories.findOne({name: genre});

    if (!cat) throw new Meteor.Error('No genre with the name ' + genre + ' has been suggested');
    return Categories.update({name: genre}, {$set: {
      approved: 0
    }});

  },

  'admin/rejectGenre': function(genre) {

    if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
    var cat = Categories.findOne({name: genre});

    if (!cat) throw new Meteor.Error('No genre with the name ' + genre + ' has been suggested');
    return Categories.update({name: genre}, {$set: {
      approved: 1
    }});

  },

  'admin/createFakeUsers': function(n) {

    if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
    _.each(_.range(n), function() {
      Accounts.createUser({
        email: faker.internet.email(),
        password: faker.internet.password()
      });
    });
    return true;

  },

  'admin/createFakeReviews': function(appId, n) {

    if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
    var query = {},
        _this = this;

    query['reviews.' + appId] = {$exists: false};
    var users = Meteor.users.find(query, {fields: {_id: 1}}).fetch().slice(0, n);

    _.each(users, function(user) {
      Reviews.insert({
        appId: appId,
        userId: user._id,
        rating: _.sample(_.range(0, 4)),
        text: faker.lorem.paragraph()
      });
    });

  }

});
