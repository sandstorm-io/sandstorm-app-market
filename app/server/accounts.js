// TODO: access full username from Github/Google

Accounts.onCreateUser(function(options, user) {
  console.log(options, user);

  if (options.profile) user.profile = options.profile;
  if (!user.username) {
    if (user.services && user.services.google) user.username = options.profile.name;
    else if (user.services && user.services.github) user.username = user.services.github.username;
    else if (user.emails) user.username = user.emails[0].address;
  }
  user.fullname = user.username;
  return user;
});
