Template.Popular.helpers({

  genres: function() {

    return Genres.getAll({where: {showSummary: true}});

  },

});
