import { Meteor } from 'meteor/meteor';

import { Apps } from '/client/collections/apps';
import { Reviews } from '/imports/collections/reviews';
/*****************************************************************************/
/* STUB Methods - these don't actually do anything permanent! */
/*****************************************************************************/
Meteor.methods({

  'user/review-app': function(review) {

    if (!Meteor.userId()) return false;

    if (review.rating) {
      check(review.rating, Match.Integer);
      check(review.rating, Match.Where(function(rating) {return (0 <= rating) && (3 >= rating);}));
    }
    check(review.text, String);
    check(review.text, Match.Where(function(text) {return text.length > 0;}));

    if (!Apps.findOne(review.appId)) throw new Meteor.Error('no matching app', 'Cannot submit a review for an app which is not in the database');
    review.userId = Meteor.userId();

    if (Reviews.findOne(_.pick(review, ['appId', 'userId'])))
      Reviews.update(_.pick(review, ['appId', 'userId']), {$set: review});
    else Reviews.insert(review);

  }

});
