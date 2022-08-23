import faker from 'faker-js/faker'

Meteor.startup(function() {

  Meteor.methods({

    'devMethods/removeAllApps': function() {

      if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
      Apps.remove({});

    },

    'devMethods/seedApps': function(n) {

      if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
      check(n, Number);
      check(n, Match.Where(function(x) { return x < 500; }));

      while (Apps.find().count() < n)
        AppMarket.fakeApp();

    },

    'devMethods/createFakeUsers': function(n) {

      if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
      _.each(_.range(n), function() {
        Accounts.createUser({
          email: faker.internet.email(),
          password: faker.internet.password()
        });
      });
      return true;

    },

    'devMethods/createFakeReviews': function(appId, n) {

      if (!Roles.userIsInRole(this.userId, 'admin')) throw new Meteor.Error('Can only be executed by admin user');
      var query = {},
          _this = this;

      query['reviews.' + appId] = {$exists: false};
      var users = Meteor.users.find(query, {fields: {_id: 1, "profile.name": 1}}).fetch().slice(0, n);

      _.each(users, function(user) {
        Reviews.insert({
          appId: appId,
          userId: user._id,
          username: user.profile.name,
          rating: _.sample(_.range(0, 4)),
          text: faker.lorem.paragraph()
        });
      });

    }

  });

});
