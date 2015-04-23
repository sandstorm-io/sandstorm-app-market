Template.registerHelper('apps', function(genre, skip, limit) {

  var options = {sort: {installCount: -1}};
  if (skip) options.skip = skip;
  if (limit) options.limit = limit;

  return Genres.findIn(genre, {}, options);

});

Template.appTable.helpers({

  leader: function() {

    return Genres.findOneIn(this.genre, {}, {sort: {installCount: -1}});

  },

  appList: function() {

    var options = {
      sort: {installCount: -1},
      skip: 0
    };
    if (this.bigLeader) options.skip += 1;
    if (this.skipLines) {
      options.skip += (App.lineCapacity.get() * this.skipLines);
      if (this.afterBigLeader) options.skip -= 2;
    }
    if (this.singleLine) {
      options.limit = App.lineCapacity.get();
      if (this.bigLeader) options.limit -= 3;
    }

    return Genres.findIn(this.genre, {}, options);

  }

});

Template.appTable.onRendered(function() {

  recalcLineCapacity(this);
  $(window).on('resize.appTable', _.debounce(recalcLineCapacity.bind(window, this), 250));

});

function recalcLineCapacity() {

  App.lineCapacity.set(5);

}

Template.appTable.onDestroyed(function() {
  $(window).off('resize.appTable');
});
