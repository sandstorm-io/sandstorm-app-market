Accounts.onCreateUser(function(options, user) {
  if (options.profile) user.profile = options.profile;

  if (!user.profile) user.profile = {};

  if (!user.profile.name) {
    if (user.services && user.services.github) {
      user.profile.name = user.services.github.username;
    } else if (user.services && user.services.google) {
      if (user.services.google.name) {
        user.profile.name = user.services.google.name;
      } else {
        user.profile.name = user.services.google.email.split("@")[0];
      }
    } else if (user.username) {
      user.profile.name = user.username;
    } else {
      user.profile.name = "Unknown Name"
    }
  }

  return user;
});

// Meteor permits users to modify their own profile by default, for some reason.
Meteor.users.deny({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; },
  fetch: []
});
