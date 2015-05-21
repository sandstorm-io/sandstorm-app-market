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
      skip: 0,
      reactive: !!this.reactive
    };
    if (this.sortAsc) options.sort[this.sortAsc] = 1;
    else if (this.sortDesc) options.sort[this.sortDesc] = -1;
    else options.sort = {installCount: -1};
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
  var lineCapacity = Math.floor(tableWidth / (rem * appItemWidth));
  if (Meteor.Device.isPhone()) lineCapacity = Math.max(lineCapacity, 2);
  App.lineCapacity.set(lineCapacity);

}

Template.appTable.onDestroyed(function() {
  $(window).off('resize.appTable');
});

// LARGE APP ITEM TABLE

Template.appTableLarge.onCreated(function() {

  this.searchTerm = new ReactiveVar('');

});

Template.appTableLarge.helpers({

  appList: function() {

    var options = {
          sort: [ 'createdAt' ],
          skip: 0,
          reactive: !!this.reactive
        },
        query = {};

    if (this.sortAsc) options.sort.unshift([this.sortAsc, 'asc']);
    if (this.sortDesc) options.sort.unshift([this.sortDesc, 'desc']);
    if (this.searchTerm) query = {name: {$regex: new RegExp(this.searchTerm, 'gi')}};

    return (options.limit === 0) ? [] : Genres.findIn(this.genre, query, options);

  }

});

Template.appTableLarge.events({

  'keyup input': function(evt) {

    this.searchTerm.set($(evt.currentTarget).val());

  }

});
