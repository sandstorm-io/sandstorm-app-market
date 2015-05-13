var adminFilters = [

  {
    icon: 'icon-star',
    text: 'New Apps to Review',
    tooltip: 'New Apps to Review',
    color: 'purple',
    filter: function() {
      return {
        approved: 1,
        replacesApp: {$exists: false}
      };
    }
  },

  {
    icon: 'icon-revisions',
    text: 'Revisions to Review',
    tooltip: 'Revisions to Review',
    color: 'light-purple',
    filter: function() {
      return {
        approved: 2
      };
    }
  },

  {
    icon: 'icon-updated',
    text: 'Updated Apps',
    tooltip: 'Updated Apps',
    color: 'blue',
    filter: function() {
      return {
        approved: 1,
        replacesApp: {$exists: false}
      };
    }
  },

  {
    icon: 'icon-flagged_light',
    text: 'Flagged',
    tooltip: 'Flagged',
    color: 'yellow',
    filter: function() {
      return { flags: {$exists: true} };
    }
  },

  {
    icon: 'icon-approved_light',
    text: 'Approved',
    tooltip: 'Approved',
    color: 'green',
    filter: function() {
      return {
        approved: 0
      };
    }
  },

  {
    icon: 'icon-rejected_light',
    text: 'Rejected',
    tooltip: 'Rejected',
    color: 'black',
    filter: function() {
      return {
        approved: 3
      };
    }
  }

];

Template.Admin.onCreated(function() {

  var tmp = this;

  tmp.filter = new ReactiveVar(0);
  tmp.filter.run = function(index) {
    return adminFilters[_.isNumber(index) ? index : this.get()].filter.call(tmp);
  };

});

Template.adminFilters.helpers({

  adminFilters: function() {

    return _.map(adminFilters, function(filter, ind) {filter.index = ind; return filter;});

  },

  count: function() {

    var filterObj = Template.instance().get('filter'),
        filter = filterObj.run(this.index);

    return Apps.find(filter).count();

  },

  active: function() {

    return this.index === Template.instance().get('filter').get() ? 'active' : '';

  }

});

Template.adminFilters.events({

  'click [data-action="select-filter"]': function(evt, tmp) {

    tmp.get('filter').set(this.index);

  }

});

Template.chronology.helpers({

  chronology: function() {

    var apps = {};

    var filterObj = Template.instance().get('filter'),
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
