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

var extraGenres = [

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
    showSummary: true
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
      sort: {lastUpdated: -1}
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
      var user = getUser.call(this, userId);
      return user && {_id: {$in: _.keys(user.installedApps)}};
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
    name: 'Apps by Author',
    selector: function() {
      return {
        author: this.authorId || FlowRouter.getParam('authorId')
      };
    },
    priority: 0,
    showSummary: false
  }

];

Genres = {

  findIn: function(name, selector, options, context) {

    selector = selector || {};
    options = options || {};

    var category = Categories.findOne({name: name}),
        extraGenre = _.findWhere(extraGenres, {name: name});

    if (category) {
      _.extend(selector, {categories: category.name});
      return Apps.find(selector, options);
    }
    else if (extraGenre) {
      var params = invokeGenreFunctions(extraGenre, selector, options, context);
      return Apps.find(params.selector, params.options);
    } else {
      return Apps.find(null);
    }

  },

  findOneIn: function(name, selector, options, context) {

    selector = selector || {};
    options = options || {};

    var category = Categories.findOne({name: name}),
        extraGenre = _.findWhere(extraGenres, {name: name});

    if (category) {
      _.extend(selector, {categories: category.name});
      return Apps.findOne(selector, options);
    }
    else if (extraGenre) {
      var params = invokeGenreFunctions(extraGenre, selector, options, context);
      return Apps.findOne(params.selector, params.options);
    }

  },

  getAll: function(options) {

    options = options || {};

    var genres  = extraGenres.concat(Categories.find().fetch());
    if (options.where) genres = _.where(genres, options.where);
    if (options.filter) genres = _.filter(genres, options.filter);

    if (options.iteratee) return _.sortBy(genres, options.iteratee);
    else return genres;

  },

  getOne: function(name) {

    return Categories.findOne({name: name}) ||
           _.findWhere(extraGenres, {name: name});

  },

  getPopulated: function(selector, options, context) {

    return _.filter(this.getAll(options), function(genre) {
      return !!Genres.findOneIn(genre.name, selector, options, context);
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
    selector: _.extend(origSelector, eGenSelector),
    options: _.extend(origOptions, eGenOptions)
  };

}

function getUser(userId) {

  return Meteor.users.findOne(
        userId ||
        this.userId ||
        (Meteor.userId && Meteor.userId())
      );

}
