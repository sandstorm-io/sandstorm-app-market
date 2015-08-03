Template.appRating.helpers({

  aggregateReview: function() {
    return AggregateReviews.findOne({appId: this.app.appId}) || {ratings: {}};
  },

  percentage: function() {
    
    var denom = this.ratingsCount;

    return denom ? {
      broken: this.ratings.broken * 100 / denom,
      didntLike: this.ratings.didntLike * 100 / denom,
      jobDone: this.ratings.jobDone * 100 / denom,
      amazing: this.ratings.amazing * 100 / denom,
      positive: (this.ratings.jobDone + this.ratings.amazing) * 100 / denom
    } : {};
  }

});

Template.appRating.events({

  'click [data-action="rate-app"]': function(evt, tmp) {

    evt.stopImmediatePropagation();
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
