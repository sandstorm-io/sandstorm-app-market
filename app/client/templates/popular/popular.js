Template.Popular.helpers({

  genres: function() {

    return Genres.getAll({
      filter: function(genre) {
        return genre.showSummary === true && genre.name !== 'Popular';
      }
    });

  },

});

Template.popularThisWeekTable.onCreated(function() {

  this.subscribe('apps by genre', 'This Week', App.lineCapacity.get());

});
