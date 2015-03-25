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

var extraGenres = [

  {
    name: 'All',
    selector: {},
    options: {}
  },

  {
    name: 'Popular',
    selector: {},
    options: {
      sort: {installCount: -1}
    }
  },

  {
    name: 'New',
    selector: {},
    options: {
      sort: {createdAt: -1}
    }
  }

];

Genres = {

  findIn: function(name, selector, options) {

    selector = selector || {};
    options = options || {};

    var category = Categories.findOne({name: name}),
        extraGenre = _.findWhere(extraGenres, {name: name});

    if (category) {
      _.extend(selector, {category: category.name});
      return Apps.find(selector, options);
    }
    else if (extraGenre) {
      _.extend(selector, extraGenre.selector);
      _.extend(options, extraGenre.options);
      return Apps.find(selector, options);
    } else {
      return Apps.find(null);
    }

  },

  findOneIn: function(name, selector, options) {

    selector = selector || {};
    options = options || {};

    var category = Categories.findOne({name: name}),
        extraGenre = _.findWhere(extraGenres, {name: name});

    if (category) {
      _.extend(selector, {category: category.name});
      return Apps.findOne(selector, options);
    }
    else if (extraGenre) {
      _.extend(selector, extraGenre.selector);
      _.extend(options, extraGenre.options);
      return Apps.findOne(selector, options);
    }

  },

  getAll: function(iteratee) {

    var genres  = extraGenres.concat(Categories.find().fetch());

    if (iteratee) return _.sortBy(genres, iteratee);
    else return genres;

  },

  getOne: function(name) {

    return Categories.findOne({name: name}) ||
           _.findWhere(extraGenres, {name: name});

  }

};
