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
      options.skip = Math.max(options.skip, 1);
    }
    if (this.singleLine) {
      options.limit = App.lineCapacity.get();
      if (this.bigLeader) options.limit -= 3;
      options.limit = Math.max(options.limit, 0);
    }

    return (options.limit === 0) ? [] : Genres.findIn(this.genre, {}, options);

  }

});

Template.appTable.onRendered(function() {

  recalcLineCapacity(this);
  $(window).on('resize.appTable', _.debounce(recalcLineCapacity.bind(window, this), 250));

});

function recalcLineCapacity() {

  var rem = parseFloat(getComputedStyle(document.documentElement).fontSize),
      tableWidth = $('.app-table').width(),
      appItemWidth = 21.3; // THIS IS DEPENDENT ON THE SCSS VARIABLES $app-container-width

  if (!rem || !tableWidth) return;
  App.lineCapacity.set(Math.floor(tableWidth / (rem * appItemWidth)));

}

Template.appTable.onDestroyed(function() {
  $(window).off('resize.appTable');
});
