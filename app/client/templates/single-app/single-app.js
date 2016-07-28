var REVIEW_COLS = 2;

Template.SingleApp.onDestroyed(function() {
  AppMarket.setPageTitlePrefix('');
});

Template.SingleApp.onCreated(function() {
  var tmp = this;
  tmp.appId = FlowRouter.getParam('appId');
  tmp.ready = new ReactiveVar(false);
  tmp.readMore = new ReactiveVar(false);
  tmp.autorun(function () {
    try {
      if (AppMarket.ensureDetailsFetched(tmp.appId)) {
        tmp.ready.set(true);
        var app = Apps.findOne(tmp.appId);
        AppMarket.setPageTitlePrefix(app.name);
        if (!app.screenshots.length) tmp.readMore.set(true);
      }
    } catch (err) {
      if (err.toString().startsWith("Error: failed [404]")) {
        BlazeLayout.render('MasterLayout', {mainSection: 'NotFound'});
        return;
      }
      console.error(err);
      // TODO: This doesn't work as there is no `errorModal` template.
      AntiModals.overlay('errorModal', {data: {err: 'There was an error loading app data from the server'}});
    }
  });

  tmp.flagApp = new ReactiveVar(!!FlowRouter.current().queryParams.flag);
  tmp.writeReview = new ReactiveVar(false);
  tmp.myReview = new ReactiveVar({});
  tmp.reviewExistsServerSide = new ReactiveVar(false);
  tmp.reviewValidator = new SimpleSchema({
    rating: {
      type: Number,
      min: 0,
      max: 3
    },
    text: {
      type: String,
      max: 500,
      optional: true
    }
  }).namedContext();
  tmp.reviewValid = new ReactiveVar(false);
  tmp.validateReview = function() {
    var review = tmp.myReview.get();
    var valid = tmp.reviewValidator.validate(review);
    tmp.reviewValid.set(valid);
    return valid;
  };

  // Load existing review of this app (if it exists)
  tmp.subscribe('reviews', tmp.appId, function() {
    var myReview = Reviews.findOne({
      userId: Meteor.userId(),
      appId: tmp.appId
    });
    if (myReview) {
      tmp.myReview.set(_.pick(myReview, ['text', 'rating']));
      tmp.reviewExistsServerSide.set(true);
    }
  });

});


Template.SingleApp.onRendered(function() {

  var tmp = this;

  if (FlowRouter.getQueryParam('rateApp') && FlowRouter.getQueryParam('ratingNumber')) {

    var myReview = tmp.get('myReview').get();
    myReview.rating = parseInt(FlowRouter.getQueryParam('ratingNumber'), 10);
    tmp.get('myReview').set(myReview);
    tmp.get('validateReview').call();
    tmp.get('writeReview').set(true);
    // I cannot get this to work without a timeout, despite apparently waiting
    // for everyhting else to be ready
    $(document).ready(function() {
      Tracker.afterFlush(function() {
        Meteor.setTimeout(function() {
          var reviewsSection = $('.reviews-section');
          reviewsSection.length && $(window).scrollTo(reviewsSection[0]);
          $('[data-field="review-text"]').focus();
        }, 50);
      });
    });
  }

});

Template.SingleApp.helpers({

  app: function() {

    return Apps.findOne(Template.instance().appId);

  },

  installed: function() {

    return false;
    // return (Meteor.user() && this._id in Meteor.user().installedApps);

  },

  hasSandstormHost: function () {
    return AppMarket.hasSandstormHost();
  },

  getDescription: function() {

    return Template.instance().readMore.get() ? this.description : s.prune(this.description, 1200);

  },

  extendedDescription: function() {

    return this.description && this.description.length > 1200;

  },

  flagApp: function() {

    return Template.instance().flagApp.get();

  },

  flagged: function() {

    Template.instance().flagApp.dep.depend();
    var flags = amplify.store('sandstormAppFlags');
    return flags && this._id in flags;

  },

  flagDetails: function() {

    var flags = amplify.store('sandstormAppFlags');
    return flags && flags[this._id];
  },

  readMore: function() {

    return Template.instance().readMore.get();

  },

  writeReview: function() {
    return Template.instance().writeReview.get();

  },

  myReview: function() {

    return Template.instance().myReview.get();

  },

  shouldShowEditReviewLink: function() {
    return (Template.instance().reviewExistsServerSide.get() &&
            !Template.instance().writeReview.get());
  },

  reviewExistsServerSide: function() {
    return Template.instance().reviewExistsServerSide.get();
  },

  reviewValid: function() {

    return Template.instance().reviewValid.get();

  },

  reviews: function() {

    return Reviews.find({appId: Template.instance().appId}).fetch();

  },

  renderedChangelog: function() {

    return this.changelog && htmlTruncate(marked(this.changelog), 200);

  },

  amazingCount: function() {
    var reviewData = AggregateReviews.findOne({appId: this.appId}) || {ratings: {}};
    return reviewData.ratings.amazing;
  },

  amazingPercent: function() {
    var reviewData = AggregateReviews.findOne({appId: this.appId}) || {ratings: {}};
    return (100 * reviewData.ratings.amazing / reviewData.ratingsCount);
  },

  goodCount: function() {
    var reviewData = AggregateReviews.findOne({appId: this.appId}) || {ratings: {}};
    return reviewData.ratings.jobDone;
  },

  goodPercent: function() {
    var reviewData = AggregateReviews.findOne({appId: this.appId}) || {ratings: {}};
    return (100 * reviewData.ratings.jobDone / reviewData.ratingsCount);
  },

  notSoGoodCount: function() {
    var reviewData = AggregateReviews.findOne({appId: this.appId}) || {ratings: {}};
    return reviewData.ratings.didntLike;
  },

  notSoGoodPercent: function() {
    var reviewData = AggregateReviews.findOne({appId: this.appId}) || {ratings: {}};
    return (100 * reviewData.ratings.didntLike / reviewData.ratingsCount);
  },

  needsFixCount: function() {
    var reviewData = AggregateReviews.findOne({appId: this.appId}) || {ratings: {}};
    return reviewData.ratings.broken;
  },

  needsFixPercent: function() {
    var reviewData = AggregateReviews.findOne({appId: this.appId}) || {ratings: {}};
    return (100 * reviewData.ratings.broken / reviewData.ratingsCount);
  },

});

Template.SingleApp.events({

  'click [data-action="read-more"]': function(evt, tmp) {

    tmp.readMore.set(!tmp.readMore.get());

  },

  'click [data-action="read-more"]': function(evt, tmp) {

    tmp.readMore.set(!tmp.readMore.get());

  },

  'input [data-field="review-text"]': function(evt, tmp) {

    var review = tmp.myReview.get();
    review.text = $(evt.currentTarget).val();
    tmp.myReview.set(review);
    tmp.validateReview();

  },

  'click [data-action="discard-review"]': function(evt, tmp) {

    tmp.myReview.set({});
    Meteor.call('user/discardReview', tmp.appId, AppMarket.redirectOrErrorCallback(null, function() {
      tmp.writeReview.set(false);
    }));

  },

  'click [data-action="cancel-review"]': function(evt, tmp) {
    // Delete no local data, but set `writeReview` to false.
    tmp.writeReview.set(false);
  },

  'click [data-action="submit-review"]': function(evt, tmp) {

    if (tmp.reviewValid.get()) {
      Meteor.call('user/reviewApp', tmp.appId, tmp.myReview.get(), AppMarket.redirectOrErrorCallback(null, function() {
        tmp.writeReview.set(false);
      }));
    }

  },

  'mouseover [data-action="review-tooltip"]': function(evt, tmp) {

    if (!tmp.reviewValid.get()) {
      Tooltips.setClasses(['invalid']);
      Tooltips.show(tmp.$('.my-rating-box')[0], 'You need to choose a rating', 's');
      Tooltips.hideDelay(3000, 500);
    }

  },

  'click [data-action="edit-review"]': function(evt, tmp) {
    tmp.writeReview.set(true);
    tmp.get('validateReview').call();
  },

  'click [data-action="flag-app"]': function(evt, tmp) {

    if (Meteor.userId()) tmp.get('flagApp').set(!tmp.get('flagApp').get());
    else {
      AppMarket.loginRedirect = FlowRouter.current().path;
      FlowRouter.go('login');
    }

  },

});

Template.flagBox.onRendered(function() {

  if (this.data && this.data.cat) {
    if (!this.$('input[type="radio"][data-category="' + this.data.cat + '"]').length) {
      this.$('input[type="radio"][data-category="other"]').prop("checked", true);
      this.$('[data-field="flag-other"]').val(this.data.cat);
    }
    else this.$('input[type="radio"][data-category="' + this.data.cat + '"]').prop("checked", true);
  }

});

Template.flagBox.events({

  'click [data-action="flag-app"]': function(evt, tmp) {

    if (Meteor.userId()) tmp.get('flagApp').set(!tmp.get('flagApp').get());

  }

});

Template.carousel.onRendered(function() {

  var tmp = this;

  tmp.$(".owl-carousel").owlCarousel({
    items: Meteor.Device.isPhone() ? 1 : 2,
    loop: true,
    mouseDrag: false,
    nav: false,
    navRewind: false,
    navText: ['&#x27;next&#x27;','&#x27;prev&#x27;'],
    dots: false,
    onInitialized: function() {
      tmp.$('[data-action="image-lightbox"]').each(function() {
        var $el = $(this);
        Meteor.defer(function() {
          $el.magnificPopup({
            items: {
              src: $el.data('src')
            },
            type: 'image',
            disableOn: 400,
            zoom: {
              enabled: true,
              duration: 300,
              easing: 'ease-in-out',
              opener: function() {
                return $el;
              }
            }
          });
        });
      });
    }
  });

});

Template.carousel.helpers({

  extraScreenshots: function() {
    return this.images && this.images.length - (Meteor.Device.isPhone() ? 1 : 2) > 0;
  }

});

Template.carousel.events({

  'click [data-action="carousel-prev"]:not(.disabled)': function (evt, tmp) {

    tmp.$('.owl-carousel').trigger('prev.owl.carousel');

  },

  'click [data-action="carousel-next"]:not(.disabled)': function (evt, tmp) {

    tmp.$('.owl-carousel').trigger('next.owl.carousel');

  },

  'click [data-action="image-lightbox"]': function(evt, tmp) {

    tmp.$(evt.currentTarget).magnificPopup({
        items: {
          src: tmp.$(evt.currentTarget).data('src')
        },
        type: 'image',
        disableOn: 400,
        zoom: {
          enabled: true,
          duration: 300,
          easing: 'ease-in-out',
          opener: function() {
            return tmp.$(evt.currentTarget);
          }
        }
    });

  }

});

Template.reviewFrame.onRendered(function() {

  var tmp = this;

  tmp.autorun(function() {
    if (Template.currentData()) Tracker.afterFlush(function() {
      tmp.$(".owl-carousel").owlCarousel({
        items: REVIEW_COLS,
        loop: true,
        mouseDrag: false,
        nav: false,
        navRewind: false,
        dots: false
      });
    });

  });

});

Template.reviewFrame.helpers({
  reviewGroups: function() {

    if (!this.reviews) return [];

    var size = Math.ceil(this.reviews.length / REVIEW_COLS);

    var res = _.groupBy(this.reviews, function(reviews, i) {
        return Math.floor(i / size);
    });
    return _.values(res);

  }
});

Template.reviewFrame.events({

  'click [data-action="reviews-prev"]': function (evt, tmp) {

    tmp.$('.owl-carousel').trigger('prev.owl.carousel');

  },

  'click [data-action="reviews-next"]': function (evt, tmp) {

    tmp.$('.owl-carousel').trigger('next.owl.carousel');

  }

});

Template.flagBox.events({

    'click [data-action="flag-app"]': function(evt, tmp) {

      if (Meteor.userId()) tmp.get('flagApp').set(!tmp.get('flagApp').get());
      else {
        AppMarket.loginRedirect = FlowRouter.current().path;
        FlowRouter.go('login');
      }

    },

    'click [data-action="submit-flag-app"]': function(evt, tmp) {

      var cat = tmp.$('input[name="flag-reason"]:checked').data('category'),
          additional = tmp.$('[data-field="additional-info"]').text(),
          flag;

      if (!cat) return;
      else if (cat === 'other') cat = tmp.$('[data-field="flag-other"]').val() || cat;

      flag = {
        cat: cat,
        additional: additional
      };
      var localFlags = amplify.store('sandstormAppFlags') || {};
      localFlags[tmp.get('appId')] = flag;

      $.ajax({
        method: 'POST',
        url: Meteor.settings && Meteor.settings.public && Meteor.settings.public.FLAG,
        data: flag,
        success: function() {
          amplify.store('sandstormAppFlags', localFlags);
          return tmp.get('flagApp').set(false);
        },
        error: function() {
          return AntiModals.overlay('errorModal', {data: {err: 'Could not post flag. Please check your internet connection.'}});
        }
      });

    }

});

Template.myRatingBox.onCreated(function() {

  this.buttonState = new ReactiveVar(0);
  var myReview = this.get('myReview').get();
  if (_.isNumber(myReview.rating))
    this.buttonState.set(myReview.rating > 1 ? 1 : -1);

});

Template.myRatingBox.helpers({
  buttonState: function() { return Template.instance().buttonState.get(); }
});

Template.myRatingBox.events({

  'click [data-rating]': function(evt, tmp) {
    var ratingNumber = parseInt($(evt.currentTarget).data('rating'), 10);

    // If the user is logged in, we can save this into memory.
    if (Meteor.userId()) {
      // In general, we want to store the new rating as well as set writeReview to true.
      var myReview = tmp.get('myReview').get();
      myReview.rating = ratingNumber;
      tmp.get('myReview').set(myReview);
      tmp.get('validateReview').call();
      tmp.get('writeReview').set(true);
    } else {
      // Otherwise, redirect to login.
      var currentPath = FlowRouter.current();
      AppMarket.loginRedirect = FlowRouter.path(currentPath.route.name, currentPath.params, _.extend({}, currentPath.queryParams, {rateApp: true, ratingNumber: ratingNumber}));
      FlowRouter.go('login');
    }
  },

  'click [data-button-state]': function(evt, tmp) {

    tmp.buttonState.set(parseInt($(evt.currentTarget).data('button-state'), 10));

  },

  'click [data-action="bug-modal"]': function(evt, tmp) {

    var app = Template.parentData();
    if (app.onGithub()) {
      AntiModals.overlay('messageModal', {data: {
        header: 'Oh Snap!',
        message: 'Would you like to <a href="' + app.codeLink + '/issues/new">file a bug report</a> to ' +
                 'let the author know it\'s broken? '
      }});
    }

  }

});
