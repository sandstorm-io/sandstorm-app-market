Template.registerHelper('apps', function(genre, skip, limit) {

  var options = {sort: {installCount: -1}};
  if (skip) options.skip = skip;
  if (limit) options.limit = limit;

  return Genres.findIn(genre, {}, options);

});

Template.registerHelper('appsCount', function(genre, skip, limit) {

  var options = {sort: {installCount: -1}};
  if (!App.isBlankKeyword(skip)) options.skip = skip;
  if (!App.isBlankKeyword(limit)) options.limit = limit;

  return Genres.findIn(genre, {}, options).count();

});

// SMALL APP ITEM TABLE

Template.appTable.helpers({

  leader: function() {

    return Genres.findOneIn(this.genre, {}, {sort: {installCount: -1}}, {reactive: !!this.reactive});

  },

  appList: function() {

    var options = {
      sort: {installCount: -1},
      skip: 0,
      reactive: !!this.reactive
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

// LARGE APP ITEM TABLE

Template.appTableLarge.helpers({

  appList: function() {

    var options = {
      sort: {installCount: -1},
      skip: 0,
      reactive: !!this.reactive
    };

    return (options.limit === 0) ? [] : Genres.findIn(this.genre, {}, options);

  }

});
