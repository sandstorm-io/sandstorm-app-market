// Genres is designed as an interface to the Apps collection, which incorporates
// Categories, but also extends them.  It has the following methods:
//
// findIn(name, selector, options) - this will return a cursor on the Apps
//   collection.  If "name" is the name of a Category, it will simply apply
//   the selector and options to the subset of apps within that category.  If
//   "name" is the name of an extraGenre (defined below), it will apply the
//   query to the docs within Apps matching that search specification.
//
// findOneIn(name, selector, options) - as above, but returns a single document
//   from the Apps collection, or undefined.
//
// getAll - returns the names of all Categories and extraGenres.
//
// ******************
//
// extraGenres - this is simply an array of objects, each of which has a name
//   and a selector/options pair to apply to a query on the Apps collection.
//   selector and options can be an object or a function returning an object.

AppMarket.extraGenres = [

  {
    name: 'All',
    selector: {},
    options: {},
    priority: 1,
    showSummary: false
  },

  {
    name: 'Popular',
    selector: {},
    options: {
      sort: {installCount: -1}
    },
    priority: 0,
    showSummary: false  // TODO(someday): Re-enable "popular" when we have actual data?
  },

  {
    name: 'New',
    selector: {},
    options: {
      sort: {createdAt: -1}
    },
    priority: 1,
    showSummary: false
  },

  {
    name: 'New & Updated',
    selector: {},
    options: {
      sort: {createdAt: -1}
    },
    priority: 0,
    showSummary: true
  },

  {
    name: 'This Week',
    selector: {},
    options: {
      sort: {installCountThisWeek: -1}
    },
    priority: 0,
    showSummary: false
  },

  {
    name: 'Installed',
    selector: function(userId) {
      if (AppMarket.historyDep) AppMarket.historyDep.depend();
      var user = getUser.call(this, userId),
          allInstalledApps = [];
      if (typeof window !== 'undefined')
        allInstalledApps = allInstalledApps.concat(amplify.store('sandstormInstalledApps'));
      if (user)
        allInstalledApps = allInstalledApps.concat(_.keys(user.installedApps));
      return {_id: {$in: allInstalledApps}};
    },
    options: {},
    priority: 2,
    showSummary: false
  },

  {
    name: 'Updates Available',
    selector: function(userId) {
      var user = getUser.call(this, userId);
      if (!user) return null;

      return {
        _id: {
          $in: _.reduce(user.installedApps, function(idList, appDetails, appId) {
            var current = Apps.findOne(appId);
            if (current && appDetails.version.dateTime < current.latestVersion().dateTime)
              idList.push(appId);
            return idList;
          }, [])
        }
      };

    },
    priority: 0,
    showSummary: false
  },

  {
    name: 'No Updates',
    selector: function(userId) {

      var user = getUser.call(this, userId);
      if (!user) return null;

      return {
        _id: {
          $in: _.reduce(user.installedApps, function(idList, appDetails, appId) {
            var current = Apps.findOne(appId);
            if (current && appDetails.version.dateTime >= current.latestVersion().dateTime)
              idList.push(appId);
            return idList;
          }, [])
        }
      };

    },
    priority: 0,
    showSummary: false
  },

  {
    name: 'Apps By Me',
    selector: function(userId) {
      var user = getUser.call(this, userId);
      if (!user) return null;

      return {
        author: user._id
      };
    },
    priority: 0,
    showSummary: false
  },

  {
    name: 'Apps By Author',
    selector: function() {
      return {
        'author.name': this.authorName || (FlowRouter.getParam && FlowRouter.getParam('authorName'))
      };
    },
    priority: 0,
    showSummary: false
  }

];

Genres = {

  findIn: function(name, selector, options, context) {

    var thisSelector = selector || {},
        theseOptions = options || {},
        category,
        extraGenre,
        clientPopulated;

    if (Meteor.isClient) {
      clientPopulated = _.findWhere(AppMarket.populatedGenres.get(), {name: name});
      if (clientPopulated && clientPopulated.selector) extraGenre = clientPopulated;
      else category = clientPopulated;
    } else {
      category = Categories.findOne({name: name});
      extraGenre = _.findWhere(AppMarket.extraGenres, {name: name});
    }

    if (category) {
      _.extend(thisSelector, {categories: category.name});
      return Apps.find(thisSelector, options);
    }
    else if (extraGenre) {
      var params = invokeGenreFunctions(extraGenre, thisSelector, theseOptions, context);
      return Apps.find(params.selector, params.options);
    } else {
      return Apps.find(null);
    }

  },

  findOneIn: function(name, selector, options, context) {

    var thisSelector = selector || {},
        theseOptions = options || {},
        category,
        extraGenre,
        clientPopulated;

    if (Meteor.isClient) {
      clientPopulated = _.findWhere(AppMarket.populatedGenres.get(), {name: name});
      if (clientPopulated && clientPopulated.selector) extraGenre = clientPopulated;
      else category = clientPopulated;
    } else {
      category = Categories.findOne({name: name});
      extraGenre = _.findWhere(AppMarket.extraGenres, {name: name});
    }

    if (category) {
      _.extend(thisSelector, {categories: category.name});
      return Apps.findOne(thisSelector, theseOptions);
    }
    else if (extraGenre) {
      var params = invokeGenreFunctions(extraGenre, thisSelector, theseOptions, context);
      return Apps.findOne(params.selector, params.options);
    }

  },

  getAll: function(options) {

    options = options || {};

    var genres = AppMarket.extraGenres.concat(Categories.find().fetch());
    if (options.where) genres = _.where(genres, options.where);
    if (options.filter) genres = _.filter(genres, options.filter);

    if (options.iteratee) return _.sortBy(genres, options.iteratee);
    else return genres;

  },

  getOne: function(name) {

    return Categories.findOne({name: name}) ||
           _.findWhere(AppMarket.extraGenres, {name: name});

  },

  getPopulated: function(selector) {

    // All genres that we know about are populated, but sort by population.
    return _.sortBy(Categories.find().fetch(), function(cat) {
      return -Apps.find(_.extend({}, selector, {categories: cat.name})).count();
    });

  }

};

// UTILITY FUNCTIONS

function invokeGenreFunctions(extraGenre, origSelector, origOptions, context) {

  var eGenSelector = extraGenre.selector,
      eGenOptions = extraGenre.options;
  if (_.isFunction(eGenSelector)) eGenSelector = eGenSelector.apply(context);
  if (_.isFunction(eGenOptions)) eGenOptions = eGenOptions.apply(context);

  return {
    selector: _.extend({}, origSelector, eGenSelector),
    options: _.extend({}, origOptions, eGenOptions)
  };

}

function getUser(userId) {

  userId = userId || this.userId;
  if (Meteor.isClient) userId = userId || Meteor.userId();

  return Meteor.users.findOne(userId);

}
