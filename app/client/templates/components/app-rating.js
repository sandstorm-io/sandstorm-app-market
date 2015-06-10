Template.appRating.helpers({

  percentage: function() {

    var denom = this.ratings.broken + this.ratings.didntLike +
                this.ratings.jobDone + this.ratings.amazing;

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

    if (FlowRouter.current().route.name !== 'singleApp') {
      var app = Template.parentData(1);
      FlowRouter.go('singleApp', {appId: app._id}, {rateApp: true});
    }
    else {
      tmp.get('writeReview').set(true);
      // I cannot get this to work without a timeout, despite apparently waiting
      // for everyhting else to be ready
      $(document).ready(function() {
        Tracker.afterFlush(function() {
          Meteor.setTimeout(function() {
            $(window).scrollTo($('.review-entry')[0]);
          }, 50);
        });
      });
    }

  }

});
