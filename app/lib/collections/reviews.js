Reviews = new Mongo.Collection('reviews');

Reviews.rating = {
  broken: 0,
  didntLike: 1,
  jobDone: 2,
  amazing: 3
};
Reviews.invertedRating = _.invert(Reviews.rating);

Schemas.Reviews = new SimpleSchema({
  appId: {
    type: String,
    index: true
  },
  username: {
    type: String,
    index: true
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 3
  },
  text: {
    type: String,
    max: 500
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      return new Date();
    },
    optional: true
  }
});

Reviews.attachSchema(Schemas.Reviews);

if (Meteor.isServer) {
  Reviews.allow({
    insert: function (userId, doc) {
      return false;
    },

    update: function (userId, doc, fieldNames, modifier) {
      return false;
    },

    remove: function (userId, doc) {
      return false;
    }
  });

  Reviews.deny({
    insert: function (userId, doc) {
      return true;
    },

    update: function (userId, doc, fieldNames, modifier) {
      return true;
    },

    remove: function (userId, doc) {
      return true;
    }
  });
}

function calculateAggregates(userId, doc) {
  var appId = doc.appId;
  
  var aggregates = {
    appId: appId,
    ratingsCount: 0,
    ratings: {
      broken: 0,
      didntLike: 0,
      jobDone: 0,
      amazing: 0
    }
  };
  
  Reviews.find({appId: appId}).forEach(function(review) {
    if ('rating' in review) {
      aggregates.ratingsCount += 1;
      aggregates.ratings[Reviews.invertedRating[review.rating]] += 1;
    }
  });
  
  AggregateReviews.upsert({appId: appId}, aggregates);
}

Reviews.after.insert(calculateAggregates);
Reviews.after.update(calculateAggregates, {fetchPrevious: false});
Reviews.after.remove(calculateAggregates);