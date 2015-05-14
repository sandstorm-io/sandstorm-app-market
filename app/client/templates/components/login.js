Accounts.onLogin(function() {

  if (App.loginRedirect) FlowRouter.go(App.loginRedirect);

});
