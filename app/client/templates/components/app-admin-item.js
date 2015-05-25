function logErr(err, res) {
  if (err) console.log(err);
}

Template.appAdminItem.onCreated(function() {

  this.filters = this.get('filters');

});

Template.appAdminItem.helpers({

  showButton: function(action) {

    var filterObj = Template.instance().get('filterObj').get();
    return (filterObj && filterObj.actions[action]) ? '' : 'hidden';

  },

  isFlagged: function() {

    return !_.isEmpty(this.flags);

  }

});

Template.appAdminItem.events({

  'keyup [data-field="admin-notes"]': function(evt, tmp) {
    if (evt.keyCode === 13)
      if (!evt.shiftKey) {
        var note = tmp.$('[data-field="admin-notes"]').val();
        if (!s.isBlank(note)) Meteor.call('apps/addNote', this._id, note, logErr);
        tmp.$('[data-field="admin-notes"]').val('');
      }
  },
  'click [data-action="approve"]': function(evt, tmp) {
    var note = tmp.$('[data-field="admin-notes"]').val();
    if (!s.isBlank(note)) Meteor.call('apps/addNote', this._id, note, logErr);
    Meteor.call('apps/approve', this._id, logErr);
    tmp.$('[data-field="admin-notes"]').val('');
  },
  'click [data-action="request-revision"]': function(evt, tmp) {
    var note = tmp.$('[data-field="admin-notes"]').val();
    if (!s.isBlank(note)) Meteor.call('apps/addNote', this._id, note, logErr);
    Meteor.call('apps/request-revision', this._id, logErr);
    tmp.$('[data-field="admin-notes"]').val('');
  },
  'click [data-action="flag"]': function(evt, tmp) {
    var note = tmp.$('[data-field="admin-notes"]').val();
    if (!s.isBlank(note)) Meteor.call('apps/addNote', this._id, note, logErr);
    Meteor.call('apps/flag', this._id, logErr);
    tmp.$('[data-field="admin-notes"]').val('');
  },
  'click [data-action="reject"]': function(evt, tmp) {
    var note = tmp.$('[data-field="admin-notes"]').val();
    if (!s.isBlank(note)) Meteor.call('apps/addNote', this._id, note, logErr);
    Meteor.call('apps/reject', this._id, logErr);
    tmp.$('[data-field="admin-notes"]').val('');
  }

});
