var approvalStateMatrix = [
  {
    messageClass: 'approved',
    iconClass: 'fa fa-check',
    message: 'APPROVED',
    fullMessage: 'APPROVED'
  },
  {
    messageClass: 'pending',
    iconClass: 'fa fa-clock-o',
    message: 'PENDING APPROVAL',
    fullMessage: 'PENDING APPROVAL'
  },
  {
    messageClass: 'revise',
    iconClass: 'fa fa-exclamation-triangle',
    message: 'PLEASE REVISE',
    fullMessage: 'This app requires your revision before it can be approved. <a href="">Edit</a> to view the Admin\'s comments'
  },
  {
    messageClass: 'rejected',
    iconClass: 'fa fa-times',
    message: 'REJECTED',
    fullMessage: 'This app has been rejected. <a href="">Edit</a> to view the Admin\'s comments'
  }
];

Template.appItemFullWidth.helpers({

  getLatestVersion: function() {

    return this.latestVersion();

  },

  approvalState: function() {

    return approvalStateMatrix[this.approved];

  }

});

Template.appItemFullWidth.events({

  'click [data-action="toggle-private"]': function() {

    Meteor.call('apps/togglePrivate', this._id, console.log.bind(console));

  }

});
