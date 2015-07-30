Accounts.onCreateUser(function(options, user) {
  if (options.profile) user.profile = options.profile;
  if (!user.username) {
    if (user.services && user.services.google) user.username = options.profile.name;
    else if (user.services && user.services.github) user.username = options.profile.name;
    else if (user.emails) user.username = user.emails[0].address;
  }
  return user;
});