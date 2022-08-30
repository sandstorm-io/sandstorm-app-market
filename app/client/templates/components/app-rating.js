import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { AggregateReviews } from '/imports/collections/aggregateReviews';
import { AppMarket } from '/imports/lib/appMarket';
import '/client/lib/appMarket';

Template.appRating.helpers({

  aggregateReview: function() {
    return AggregateReviews.findOne({appId: this.app.appId}) || {ratings: {}};
  },

  percentage: function() {

    var denom = this.ratingsCount;

    return denom ? {
      positive: (this.ratings.jobDone + this.ratings.amazing) * 100 / denom,
    } : {};
  }

});

Template.miniRating.helpers({
  aggregateReview: function() {
    return AggregateReviews.findOne({appId: this.app.appId}) || {ratings: {}};
  },

  percentage: function() {
    var denom = this.ratingsCount;
    return denom ? {
      broken: this.ratings.broken * 100 / denom,
      didntLike: this.ratings.didntLike * 100 / denom,
      jobDone: this.ratings.jobDone * 100 / denom,
      amazing: this.ratings.amazing * 100 / denom
    } : {};
  }
});

Template.appRating.events({

  'click [data-action="rate-app"]': function(evt, tmp) {

    // Sometimes the appRating template is rendered within a HTML A HREF link, such as within the
    // category page. This allows us to handle the click instead of navigating the browser.
    evt.preventDefault();
    var app = Template.parentData(1);

    if (!Meteor.userId()) {
      AppMarket.loginRedirect = '/app/' + app._id + '?rateApp=true';
      return FlowRouter.go('login');
    }

    if (FlowRouter.current().route.name !== 'singleApp') {
      FlowRouter.go('singleApp', {appId: app._id}, {rateApp: true});
    }
    else {
      tmp.get('writeReview').set(true);
      // I cannot get this to work without a timeout, despite apparently waiting
      // for everyhting else to be ready
      $(document).ready(function() {
        Tracker.afterFlush(function() {
          Meteor.setTimeout(function() {
            var reviewEntry = $('.review-entry');
            reviewEntry.length && $(window).scrollTo(reviewEntry[0]);
          }, 50);
        });
      });
    }

  }

});
