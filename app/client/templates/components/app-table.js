// SMALL APP ITEM TABLE

Template.appTable.helpers({

  leader: function() {

    return Genres.findOneIn(this.genre, {}, {sort: {installCount: -1}}, {reactive: !!this.reactive});

  },

  appList: function() {

    var options = {
          skip: 0,
          reactive: !!this.reactive
        },
        data = _.extend({}, Template.parentData(1), this);
    if (this.limit) options.limit = this.limit;
    if (data.sortAsc) options.sort[data.sortAsc] = 1;
    else if (data.sortDesc) options.sort[data.sortDesc] = -1;
    else options.sort = {installCount: -1};
    if (data.bigLeader) options.skip += 1;

    return (options.limit === 0) ? [] : Genres.findIn(data.genre, {}, options);

  }

});

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
