Accounts.onLogin(function() {

  if (AppMarket.loginRedirect) FlowRouter.go(AppMarket.loginRedirect);

});
