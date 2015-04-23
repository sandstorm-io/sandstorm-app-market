Accounts.onCreateUser(function(options, user) {
  if (options.profile) user.profile = options.profile;
  if (!user.username) {
    if (user.services &&user.services.google) user.username = user.services.google.email;
    else if (user.emails) user.username = user.emails[0].address;
  }
  return user;
});
