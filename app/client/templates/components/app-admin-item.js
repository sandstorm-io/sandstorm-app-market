Template.appAdminItem.events({

  'click [data-action="approve"]': function(evt, tmp) {
    Meteor.call('apps/approve', this._id, function(err, res) {
      if (err) console.log(err);
    });
  },
  'click [data-action="request-revision"]': function(evt, tmp) {
    Meteor.call('apps/request-revision', this._id, function(err, res) {
      if (err) console.log(err);
    });
  },
  'click [data-action="flag"]': function(evt, tmp) {
    Meteor.call('apps/flag', this._id, function(err, res) {
      if (err) console.log(err);
    });
  },
  'click [data-action="reject"]': function(evt, tmp) {
    Meteor.call('apps/reject', this._id, function(err, res) {
      if (err) console.log(err);
    });
  }

});
