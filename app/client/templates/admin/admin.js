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
      return (app.approved === Apps.approval.pending && !('replacesApp' in app));
    },
    actions: {
      'request-revision': true,
      flagged: true,
      approved: true,
      rejected: false
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
      return app.approved === Apps.approval.revisionRequested;
    },
    actions: {
      'request-revision': true,
      flagged: true,
      approved: true,
      rejected: false
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
      return (app.approved === Apps.approval.pending && ('replacesApp' in app));
    },
    actions: {
      'request-revision': true,
      flagged: false,
      approved: true,
      rejected: false
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
    },
    actions: {
      'request-revision': true,
      flagged: false,
      approved: true,
      rejected: true
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
      return app.approved === Apps.approval.approved;
    },
    actions: {
      'request-revision': true,
      flagged: true,
      approved: false,
      rejected: false
    }
  },

  rejected: {
    icon: 'icon-rejected_light',
    text: 'Rejected',
    tooltip: 'These apps have been rejected from the App Market',
    color: 'black',
    filter: {
      approved: 3
    },
    filterFunc: function(app) {
      return app.approved === Apps.approval.rejected;
    },
    actions: {
      'request-revision': true,
      flagged: false,
      approved: true,
      rejected: false
    }
  }

};

var genreTemplates = {

  'suggestedGenres': {
    template: 'suggestedGenres',
    data: {filter: {$exists: false}}
  },

  'approved': {
    template: 'suggestedGenres',
    data: {filter: 0}
  },

  'rejected': {
    template: 'suggestedGenres',
    data: {filter: 1}
  }

};

Template.Admin.onCreated(function() {

  var tmp = this;

  tmp.filters = adminFilters;
  tmp.filterInd = new ReactiveVar('new');
  tmp.filterObj = new ReactiveVar(adminFilters[tmp.filterInd.get()]);
  tmp.searchOpen = new ReactiveVar(false);
  tmp.searchTerm = new ReactiveVar();
  tmp.genreView = new ReactiveVar(false);

  tmp.autorun(function() {
    tmp.filterObj.set(adminFilters[tmp.filterInd.get()]);
  });

  tmp.filterObj.run = function(index) {
    return index ? adminFilters[index].filter : this.get().filter;
  };

});

Template.Admin.helpers({

  genreView: function() {

    return Template.instance().get('genreView').get();

  }

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

  suggestedGenresCount: function() {

    return Categories.find({suggested: true}).count();

  },

  searchOpen: function() {

    return Template.instance().get('searchOpen').get();

  },

  genreView: function() {

    return Template.instance().get('genreView').get();

  }

});

Template.adminFilters.events({

  'click [data-action="select-filter"]': function(evt, tmp) {

    tmp.get('filterInd').set(this.index);
    tmp.get('searchTerm').set(null);
    tmp.get('searchOpen').set(false);
    tmp.get('genreView').set(false);

  },

  'click [data-action="genre-view"]': function(evt, tmp) {

    tmp.get('genreView').set('suggestedGenres');
    tmp.get('filterInd').set(null);

  },

  'click [data-action="search"]': function(evt, tmp) {

    if (tmp.get('searchOpen').get()) {
      tmp.get('searchTerm').set(tmp.$('[data-field="search-term"]').val());
    } else {
      tmp.get('searchOpen').set(true);
      Tracker.afterFlush(function() {
        tmp.$('[data-field="search-term"]').focus();
      });
    }

  },

  'keyup [data-field="search-term"]': function(evt, tmp) {

    if (evt.keyCode !== 13) return false;
    else tmp.get('searchTerm').set(tmp.$(evt.currentTarget).val());

  }

});

Template.genreSection.helpers({

  genreFilter: function(name) {

    return Template.instance().get('genreView').get() === name;

  },

  genreView: function() {

    return Template.instance().get('genreView').get();

  },

  categories: function() {

    return Categories.find();

  },

  genreTemp: function() {

    var genreView = Template.instance().get('genreView').get(),
        tempDetails = genreTemplates[genreView];

    return tempDetails || {
      template: 'genreDisplay',
      data: {
        categories: genreView
      }
    };

  }

});

Template.genreSection.events({

  'click [data-action="select-genre"]': function(evt, tmp) {

    var newGenre = $(evt.currentTarget).data('genre') || this.name;
    tmp.get('genreView').set(newGenre);

  }

});

Template.chronology.helpers({

  chronology: function() {

    var apps = {},
        tmp = Template.instance(),
        filterObj = tmp.get('filterObj'),
        filter = _.clone(filterObj.run()),
        searchTerm = tmp.get('searchTerm').get();

    if (searchTerm) _.extend(filter, {name: {$regex: new RegExp(searchTerm, 'gi')} });
    
    Apps.find(filter).forEach(function(app) {
      var sod = new moment(app.lastUpdated).startOf('day'),
          sodString = sod.format('DDMMYY');
      if (sodString in apps) apps[sodString].apps.push(app);
      else apps[sodString] = {apps: [app], date: sod.toDate()};
    });

    return _.sortBy(_.values(apps), 'date');

  }

});

Template.genreDisplay.helpers({

  appList: function() {

    return Apps.find(this);

  }

});

Template.suggestedGenres.helpers({

  genres: function() {

    var query = {suggested: true};
    if (typeof this.filter !== 'undefined') {
      query.approved = this.filter;
      delete query.suggested;
    }

    return Categories.find(query).map(function(cat) {
      return {
        _id: cat._id,
        name: cat.name,
        appList: Apps.find({categories: cat.name}),
        approved: cat.approved
      };
    });

  }

});

var saveGenre = _.debounce(function(evt, tmp) {

  var newName = s.trim(tmp.$(evt.currentTarget).text());
  console.log(newName);
  if (newName !== this.name)
    Categories.update({_id: this._id}, {$set: {name: newName}});

}, 500);

Template.suggestedGenres.events({

  'click [data-action="approve-genre"]': function() {

    Meteor.call('admin/approveGenre', this.name, function(err) {
      if (err) console.log(err);
    });

  },

  'click [data-action="reject-genre"]': function() {

    Meteor.call('admin/rejectGenre', this.name, function(err) {
      if (err) console.log(err);
    });

  },

  'blur [contenteditable]': saveGenre,

  'keyup [contenteditable]': function(evt, tmp) {

    if (evt.keyCode === 13) {
      evt.preventDefault();
      saveGenre.call(this, evt, tmp);
      tmp.$(evt.currentTarget).blur();
    }

  }

});
