adminFilters = {

  new: {
    icon: 'icon-star',
    text: 'New Apps to Review',
    tooltip: 'New Apps to Review',
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
    tooltip: 'Revisions to Review',
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
    tooltip: 'Updated Apps',
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
    tooltip: 'Flagged',
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
    tooltip: 'Approved',
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
    tooltip: 'Rejected',
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

  }

});

Template.adminFilters.events({

  'click [data-action="select-filter"]': function(evt, tmp) {

    tmp.get('filterInd').set(this.index);

  }

});

Template.chronology.helpers({

  chronology: function() {

    var apps = {};

    var filterObj = Template.instance().get('filterObj'),
        filter = filterObj.run();

    Apps.find(filter).forEach(function(app) {
      var sod = new moment(app.updatedAt).startOf('day'),
          sodString = sod.format('DDMMYY');
      if (sodString in apps) apps[sodString].apps.push(app);
      else apps[sodString] = {apps: [app], date: sod.toDate()};
    });

    return _.values(apps);

  }

});
