var adminFilters = [

  {
    icon: '.icon-star',
    text: 'New Apps to Review',
    color: 'purple',
    filter: function() {
      return {};
    }
  },

  {
    icon: 'icon-revisions',
    text: 'Revisions to Review',
    color: 'light-purple',
    filter: function() {
      return {};
    }
  },

  {
    icon: '.icon-updated',
    text: 'Updated Apps',
    color: 'blue',
    filter: function() {
      return {};
    }
  },

  {
    icon: 'icon-flagged_light',
    text: 'Flagged',
    color: 'yellow',
    filter: function() {
      return {};
    }
  },

  {
    icon: 'icon-approved_light',
    text: 'Approved',
    color: 'green',
    filter: function() {
      return {};
    }
  },

  {
    icon: 'icon-rejected_light',
    text: 'Rejected',
    color: 'black',
    filter: function() {
      return {};
    }
  }

];

Template.Admin.helpers({

  adminFilters: function() {

    return adminFilters;

  },

  count: function() {

    return 15;

  },

  active: function() {

    return 'active';

  }

});
