Template.appItem.helpers({

  free: function(price) {

    return price === 0;

  },

  installed: function(app) {

    var user = Meteor.user();
    app = app || this;

    if (!user) return;
    else if (user.installedApps[app._id] !== undefined) return true;

  },

  appRating: function(stars) {

    stars = stars || 0;
    return _.reduce(_.range(5), function(html, ind) {
      if (stars >= ind + 0.5) html += '<i class="icon-star dark"></i>';
      else html += '<i class="icon-star light"></i>';
      return html;
    }, '');

  },

  myRating: function(app) {

    var user = Meteor.user();
    app = app || this;

    if (!user) return;
    else return user.appRatings[this._id];

  },

  installDetails: function(app) {

    var user = Meteor.user();
    app = app || this;

    if (!user) return;
    else return user.installedApps[this._id];

  }

});

Template.appItem.events({

  'click [data-action="uninstall-app-modal"]': function() {

    AntiModals.overlay('uninstallApp', {data: this});

  },

  'click [data-action="install-app"]': function() {

    Meteor.call('user/installApp', this._id, function(err) {
      if (err) console.log(err);
    });

  }

});
