adminFilters = {

  new: {
    icon: 'icon-star',
    text: 'New Apps to Review',
    tooltip: '',
    color: 'purple',
    filter: {
      approved: 1,
      replacesApp: {$exists: false}
    },
    filterFunc: function(app) {
      return (app.approved === 1 && !('replacesApp' in app));
    }
  },

  'request-revision': {
    icon: 'icon-revisions',
    text: 'Revisions to Review',
    tooltip: 'These authors have made revisions in response to Admin requests',
    color: 'light-purple',
    filter: {
      approved: 2
    },
    filterFunc: function(app) {
      return app.approved === 2;
    }
  },

  updated: {
    icon: 'icon-updated',
    text: 'Updated Apps',
    tooltip: 'These apps have a new release, live in the marketplace - check them out some time!',
    color: 'blue',
    filter: {
      approved: 1,
      replacesApp: {$exists: true}
    },
    filterFunc: function(app) {
      return (app.approved === 1 && ('replacesApp' in app));
    }
  },

  flagged: {
    icon: 'icon-flagged_light',
    text: 'Flagged',
    tooltip: 'A User has flagged these apps for your attention',
    color: 'yellow',
    filter: {
      flags: {$exists: true}
    },
    filterFunc: function(app) {
      return ('flags' in app);
    }
  },

  approved: {
    icon: 'icon-approved_light',
    text: 'Approved',
    tooltip: 'These apps are live on the App Market',
    color: 'green',
    filter: {
      approved: 0
    },
    filterFunc: function(app) {
      return app.approved === 0;
    }  },

  rejected: {
    icon: 'icon-rejected_light',
    text: 'Rejected',
    tooltip: 'These apps have been rejected from the App Market',
    color: 'black',
    filter: {
      approved: 3
    },
    filterFunc: function(app) {
      return app.approved === 3;
    }
  }

};

Template.Admin.onCreated(function() {

  var tmp = this;

  tmp.filters = adminFilters;
  tmp.filterInd = new ReactiveVar('new');
  tmp.filterObj = new ReactiveVar(adminFilters[tmp.filterInd.get()]);
  tmp.searchOpen = new ReactiveVar(false);
  tmp.searchTerm = new ReactiveVar();

  tmp.autorun(function() {
    tmp.filterObj.set(adminFilters[tmp.filterInd.get()]);
  });

  tmp.filterObj.run = function(index) {
    return index ? adminFilters[index].filter : this.get().filter;
  };

});

Template.adminFilters.helpers({

  adminFilters: function() {

    return _.map(adminFilters, function(filter, ind) {filter.index = ind; return filter;});

  },

  count: function() {

    var filterObj = Template.instance().get('filterObj'),
        filter = filterObj.run(this.index);

    return Apps.find(filter).count();

  },

  active: function() {

    return this.index === Template.instance().get('filterInd').get() ? 'active' : '';

  },

  liveFilter: function() {

    return Template.instance().get('filterObj').get();

  },

  searchOpen: function() {

    return Template.instance().get('searchOpen').get();

  }

});

Template.adminFilters.events({

  'click [data-action="select-filter"]': function(evt, tmp) {

    tmp.get('filterInd').set(this.index);
    tmp.get('searchTerm').set(null);
    tmp.get('searchOpen').set(false);

  },

  'click [data-action="search"]': function(evt, tmp) {

    tmp.get('searchOpen').set(true);
    Tracker.afterFlush(function() {
      tmp.$('[data-field="search-term"]').focus();
    });

  },

  'keyup [data-field="search-term"]': function(evt, tmp) {

    if (evt.keyCode !== 13) return false;
    else {
      tmp.get('searchTerm').set($(evt.currentTarget).val());
    }

  }

});

Template.chronology.helpers({

  chronology: function() {

    var apps = {},
        tmp = Template.instance(),
        filterObj = tmp.get('filterObj'),
        filter = filterObj.run(),
        searchTerm = tmp.get('searchTerm').get();

    if (searchTerm) _.extend(filter, {name: {$regex: searchTerm} });

    Apps.find(filter).forEach(function(app) {
      var sod = new moment(app.updatedAt).startOf('day'),
          sodString = sod.format('DDMMYY');
      if (sodString in apps) apps[sodString].apps.push(app);
      else apps[sodString] = {apps: [app], date: sod.toDate()};
    });

    return _.values(apps);

  }

});
