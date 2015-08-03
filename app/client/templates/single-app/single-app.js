var REVIEW_ROWS = 4,
    REVIEW_COLS = 3;

Template.SingleApp.onCreated(function() {

  var tmp = this;
  tmp.appId = FlowRouter.getParam('appId');
  tmp.ready = new ReactiveVar(false);

  // Load full app data
  Api.getApp(tmp.appId, function(err, app) {
    if (err) return AntiModals.overlay('errorModal', {data: {err: 'There was an error loading app data from the server'}});

    // Make sure there's a partial app object already present to extend
    tmp.autorun(function(c) {
      if (AppMarket.appInit.get()) {
        // TODO: REMOVE THIS - it only exists to ensure the random API data we get back in testing
        // corresponds to the current route when it's added to the DB. 
        // *****************
        app.appId = tmp.appId;
        console.log(app);
        // *****************
        if (Apps.find({appId: app.appId}).count()) {
          Apps.update(app.appId, {$set: app});
        } else {
          app._id = app.appId;
          Apps.insert(app);
        }
        tmp.ready.set(true);
        
        if (!app.screenshots.length) tmp.readMore.set(true);
        c.stop();
      }
    });
  });

  tmp.readMore = new ReactiveVar(false);
  tmp.flagApp = new ReactiveVar(!!FlowRouter.current().queryParams.flag);
  tmp.writeReview = new ReactiveVar(false);
  tmp.myReview = new ReactiveVar({});
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
    if (myReview) tmp.myReview.set(_.pick(myReview, ['text', 'rating']));
  });

});


Template.SingleApp.onRendered(function() {

  var tmp = this;

  if (FlowRouter.getQueryParam('rateApp')) {
    tmp.get('writeReview').set(true);
    // I cannot get this to work without a timeout, despite apparently waiting
    // for everyhting else to be ready
    $(document).ready(function() {
      Tracker.afterFlush(function() {
        Meteor.setTimeout(function() {
          var reviewEntry = $('.review-entry');
          reviewEntry.length && $(window).scrollTo(reviewEntry[0]);
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

  chipIn: function() {

    return Template.instance().chipIn.get();

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

  reviewValid: function() {

    return Template.instance().reviewValid.get();

  },

  reviews: function() {

    return Reviews.find({appId: Template.instance().appId}).fetch();

  },

  versionChanges: function() {

    var count = 0;
    return Spacebars.SafeString(_.reduceRight(this.versions, function(str, version) {
      if (count < 2 && version.changes) {
        if (count > 0) str += '<br>';
        str += '<strong>' + version.number + '</strong><br>';
        str += version.changes + '<br>';
        count += 1;
      }
      return str;
    }, ''));

  }

});

Template.SingleApp.events({ 

  'click [data-action="read-more"]': function(evt, tmp) {

    tmp.readMore.set(!tmp.readMore.get());

  },

  'click [data-action="write-review"]': function(evt, tmp) {

    if (Meteor.userId()) tmp.writeReview.set(!tmp.writeReview.get());
    else {
      var currentPath = FlowRouter.current();
      AppMarket.loginRedirect = FlowRouter.path(currentPath.route.name, currentPath.params, _.extend({}, currentPath.queryParams, {rateApp: true}));
      FlowRouter.go('login');
    }

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

    var size =  this.reviews.length > (REVIEW_ROWS * REVIEW_COLS) ?
                REVIEW_ROWS :
                Math.ceil(this.reviews.length / REVIEW_COLS);

    var res = _.groupBy(this.reviews, function(reviews, i) {
        return Math.floor(i / size);
    });
    return _.values(res);

  },

  extraReviews: function() {

    return this.reviews.length > REVIEW_ROWS * REVIEW_COLS;

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

    var myReview = tmp.get('myReview').get();
    myReview.rating = parseInt($(evt.currentTarget).data('rating'), 10);
    tmp.get('myReview').set(myReview);
    tmp.get('validateReview').call();

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
