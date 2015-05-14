var reviewRows = 4,
    reviewCols = 3;

Template.SingleApp.onCreated(function() {

  var tmp = this;

  tmp.chipIn = new ReactiveVar(false);
  tmp.readMore = new ReactiveVar(false);
  tmp.flagApp = new ReactiveVar(false);
  tmp.writeReview = new ReactiveVar(false);
  tmp.myReview = new ReactiveVar({
    stars: 0,
    text: ''
  });
  tmp.reviewValid = new ReactiveVar(false);
  tmp.validateReview = function() {
    tmp.reviewValid.set(!!tmp.myReview.get().text);
  };

  // Load existing review of this app (if it exists)
  tmp.autorun(function(c) {
    if (FlowRouter.subsReady()) {
      var appId = FlowRouter.getParam('appId'),
          user = Meteor.user(),
          app = Apps.findOne(appId);
      if (!app || !app.screenshots.length) tmp.readMore.set(true);
      if (user && user.appReviews && appId in user.appReviews) {
        tmp.myReview.set({
          stars: user.appReviews[appId].stars,
          text: user.appReviews[appId].text
        });
      }
      c.stop();
    }
  });

});

Template.SingleApp.onRendered(function() {

  var tmp = this;

  this.autorun(function(c) {
    if (FlowRouter.subsReady()) {
      Tracker.afterFlush(function() {
        tmp.$('.slider').noUiSlider({
          orientation: 'horizontal',
          range: {
            min: 0,
            max: 40
          },
          start: 0
        });
        $('.slider').Link('lower').to($('[data-field="chip-amount"]'));
      });
      c.stop();
    }
  });

});

Template.SingleApp.helpers({

  app: function() {

    return Apps.findOne(FlowRouter.getParam('appId'));

  },

  installed: function() {

    return (Meteor.user() && this._id in Meteor.user().installedApps);

  },

  chipIn: function() {

    return Template.instance().chipIn.get();

  },

  getDescription: function() {

    return Template.instance().readMore.get() ? this.description : s.prune(this.description, 1200);

  },

  extendedDescription: function() {

    return this.description.length > 1200;

  },

  flagApp: function() {

    return Template.instance().flagApp.get();

  },

  flagged: function() {

    return Meteor.user() && Meteor.user().flags && (this._id in Meteor.user().flags);

  },

  flagDetails: function() {

    return Meteor.user() && Meteor.user().flags && Meteor.user().flags[this._id];

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

    return Reviews.find().fetch();

  }

});

Template.SingleApp.events({

  'click [data-action="install-app"]': function() {

    Meteor.call('user/installApp', this._id, function(err) {
      if (err) console.log(err);
    });

  },

  'click [data-action="chip-in"]': function(evt, tmp) {

    tmp.chipIn.set(!tmp.chipIn.get());

  },

  'click [data-action="confirm-chip"]': function(evt, tmp) {

    var amount = parseFloat(tmp.$('[data-field="chip-amount"]').val(), 10);
    Meteor.call('user/chip-in', FlowRouter.getParam('appId'), amount, function(err) {
      if (err) console.log(err);
      tmp.chipIn.set(false);
    });

  },

  'click [data-action="flag-app"]': function(evt, tmp) {

    if (Meteor.userId()) tmp.flagApp.set(!tmp.flagApp.get());
    else {
      App.loginRedirect = FlowRouter.current().path;
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

    Meteor.call('user/flag-app', FlowRouter.getParam('appId'), flag, function(err) {
      if (err) console.log(err);
      tmp.flagApp.set(false);
    });

  },

  'click [data-action="read-more"]': function(evt, tmp) {

    tmp.readMore.set(!tmp.readMore.get());

  },

  'click [data-action="write-review"]': function(evt, tmp) {

    if (Meteor.userId()) tmp.writeReview.set(!tmp.writeReview.get());
    else {
      App.loginRedirect = FlowRouter.current().path;
      FlowRouter.go('login');
    }

  },

  'click [data-action="rate-app"] [data-index]': function(evt, tmp) {

    var review = tmp.myReview.get();
    review.stars = parseInt($(evt.currentTarget).data('index')) + 1;
    tmp.myReview.set(review);
    tmp.validateReview();

  },

  'input [data-field="review-text"]': function(evt, tmp) {

    var review = tmp.myReview.get();
    review.text = $(evt.currentTarget).val();
    tmp.myReview.set(review);
    tmp.validateReview();

  },

  'click [data-action="discard-review"]': function(evt, tmp) {

    tmp.myReview.set({
      stars: 0,
      text: ''
    });
    tmp.writeReview.set(false);

  },

  'click [data-action="submit-review"]': function(evt, tmp) {

    if (tmp.reviewValid.get()) {
      Meteor.call('user/review-app', FlowRouter.getParam('appId'), tmp.myReview.get(), function(err) {
        if (err) console.log(err);
        tmp.writeReview.set(false);
      });
    }

  }

});

Template.flagBox.onRendered(function() {

  if (this.data.cat) {
    if (!this.$('input[type="radio"][data-category="' + this.data.cat + '"]').length) {
      this.$('input[type="radio"][data-category="other"]').prop("checked", true);
      this.$('[data-field="flag-other"]').val(this.data.cat);
    }
    else this.$('input[type="radio"][data-category="' + this.data.cat + '"]').prop("checked", true);
  }

});

Template.carousel.onRendered(function() {

  this.$(".owl-carousel").owlCarousel({
    items: 2,
    loop: true,
    mouseDrag: false,
    nav: false,
    navRewind: false,
    navText: ['&#x27;next&#x27;','&#x27;prev&#x27;'],
    dots: false
  });

});

Template.carousel.events({

  'click [data-action="carousel-prev"]': function (evt, tmp) {

    tmp.$('.owl-carousel').trigger('prev.owl.carousel');

  },

  'click [data-action="carousel-next"]': function (evt, tmp) {

    tmp.$('.owl-carousel').trigger('next.owl.carousel');

  }

});

Template.reviewFrame.onRendered(function() {

  this.$(".owl-carousel").owlCarousel({
    items: reviewCols,
    loop: true,
    mouseDrag: false,
    nav: false,
    navRewind: false,
    dots: false
  });

});

Template.reviewFrame.helpers({

  reviewGroups: function() {

    if (!this.reviews) return [];

    var size =  this.reviews.length > (reviewRows * reviewCols) ?
                reviewRows :
                Math.ceil(this.reviews.length / reviewCols);

    var res = _.groupBy(this.reviews, function(reviews, i) {
        return Math.floor(i / size);
    });
    return _.values(res);

  },

  extraReviews: function() {

    return this.reviews.length > reviewRows * reviewCols;

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
