Template.appItem.helpers({

  free: function(price) {

    return price === 0;

  },

  appInstalled: function() {

    var app = this.app ? this.app : this;
    
    return app.installed() ? {
      cssClass: 'installed',
      buttonText: 'RE-INSTALL'
    } : {
      buttonText: 'INSTALL'
    };

  },

  myRating: function(app) {

    var user = Meteor.user();
    app = app || this;

    if (!user) return;
    else return user.reviews && user.reviews[app._id] && user.reviews[app._id].rating;

  },

  installDetails: function(app) {

    var user = Meteor.users.findOne(Meteor.userId(), {fields: {installedApps: 1}});
    app = app || this;

    if (!user) return;
    else return user.installedApps[this._id];

  }

});

Template.appItem.events({

  'click [data-action="uninstall-app-modal"]': function(evt) {

    evt.stopPropagation();
    AntiModals.overlay('uninstallApp', {data: this});

  },
  
  'click [data-link="single-app"]': function(evt) {

    // We need to check if they've actually clicked on a link before redirecting
    if (!evt.target.href && !evt.target.parentElement.href) FlowRouter.go('singleApp', {appId: this.app._id});

  }

});

Template.appItemFullWidth.helpers({

  free: function(price) {

    return price === 0;

  }

});

Template.appItemTiny.helpers({

  soleCategory: function() {

    return this.app.categories.length === 1;

  }

});

Template.appItemTiny.events({

  'click [data-action="admin-review"]': function() {

    FlowRouter.go('review', {appId: this.app._id});

  }

});
