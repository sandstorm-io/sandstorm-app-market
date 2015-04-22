Template.Popular.helpers({

  all: function() {

    return Genres.getOne('All');

  },

  genres: function() {

    return _.pluck(Genres.getAll(), 'name');

  },

});
