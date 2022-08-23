import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { AppMarket } from '/client/lib/appMarket';


Accounts.onLogin(function() {

  if (AppMarket.loginRedirect) FlowRouter.go(AppMarket.loginRedirect);

});
