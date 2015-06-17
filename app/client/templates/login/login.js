Template.Login.onCreated(function() {

  this.createAccount = new ReactiveVar(false);
  this.error = new ReactiveVar('');

});

Template.Login.helpers({

  createAccount: function() {

    return Template.instance().createAccount.get();

  },

  error: function() {

    return Template.instance().error.get();

  }

});

Template.Login.events({

  'click [data-action="create-account"]': function(evt, tmp) {
    Accounts.createUser(getCredentials(tmp), setError.bind(tmp));
  },
  'click [data-action="login-with-email"]': function(evt, tmp) {
    var credentials = getCredentials(tmp);
    Meteor.loginWithPassword(_.pick(credentials, 'email'), credentials.password, setError.bind(tmp));
  },
  'click [data-action="login-with-github"]': function(evt, tmp) {
    Meteor.loginWithGithub(setError.bind(tmp));
  },
  'click [data-action="login-with-google"]': function(evt, tmp) {
    Meteor.loginWithGoogle(setError.bind(tmp));
  },
  'click [data-action="toggle-create-account"]': function(evt, tmp) {
    tmp.createAccount.set(!tmp.createAccount.get());
    tmp.error.set('');
  },
  'click [data-action="logout"]': function(evt, tmp) {
    Meteor.logout(function() {
      tmp.error.set('');
    });
  }

});

function setError(err) {

  if (err) {
    console.log(err);
    this.error.set(err.reason);
  } else if (FlowRouter.getQueryParam('return')) {
    FlowRouter.go(FlowRouter.getQueryParam('return'));
  } else {
    this.error.set('');
  }

}

function getCredentials(tmp) {

  return {
    email: tmp.$('[type="email"]').val(),
    password: tmp.$('[type="password"]').val()
  };

}
