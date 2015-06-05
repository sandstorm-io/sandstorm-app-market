Template.Popular.onCreated(function() {

  var tmp = this;
  window.template = tmp;

  tmp.genreCount = new ReactiveVar(5);

  $(window).on('scroll.popular', _.debounce(function() {
    if (tmp.$('.load-more').visible(true)) tmp.genreCount.set(tmp.genreCount.get() + 3);
  }, 500));

});

Template.Popular.onDestroyed(function() {

  $(window).off('scroll.popular');

});

Template.Popular.helpers({

  genres: function() {

    return Genres.getAll({
      filter: function(genre) {
        return genre.showSummary === true && genre.name !== 'Popular';
      }
    }).slice(0, Template.instance().genreCount.get());

  },

});

Template.popularThisWeekTable.onCreated(function() {

  this.subscribe('apps by genre', 'This Week', App.lineCapacity.get());

});
