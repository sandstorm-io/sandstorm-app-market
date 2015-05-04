var reviewRows = 4,
    reviewCols = 3;

Template.onCreated(function() {

  var tmp = this;

  tmp.readMore = new ReactiveVar(false);
  tmp.flagApp = new ReactiveVar(false);
  tmp.writeReview = new ReactiveVar(false);
  tmp.myReview = new ReactiveVar({
    stars: 0,
    text: ''
  });
  tmp.reviewValid = new ReactiveVar(false);
  tmp.validateReview = function() {
    tmp.reviewValid.set(tmp.myReview.get().text && tmp.myReview.get().stars);
  };

  // Load existing review of this app (if it exists)
  tmp.autorun(function(c) {
    if (FlowRouter.subsReady()) {
      var appId = FlowRouter.getParam('appId'),
          user = Meteor.user();
      if (user.appReviews && appId in user.appReviews) {
        tmp.myReview.set({
          stars: user.appReviews[appId].stars,
          text: user.appReviews[appId].text
        });
      }
      c.stop();
    }
  });

});

Template.SingleApp.helpers({

  app: function() {

    return Apps.findOne(FlowRouter.getParam('appId'));

  },

  getDescription: function() {

    return Template.instance().readMore.get() ? this.description : s.prune(this.description, 1200);

  },

  flagApp: function() {

    return Template.instance().flagApp.get();

  },

  flagged: function() {

    return Meteor.user() && Meteor.user().flags && (this._id in Meteor.user().flags);

  },

  flagDetails: function() {

    return Meteor.user() && Meteor.user().flags[this._id];

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

    // return _.map(_.range(7), function() {
    //   return {
    //     username: "ABCDEF GHIJKL",
    //     review: {
      //     stars: _.sample([1, 2, 3, 4, 5]),
      //     createdAt: new Date(new Date() - (Math.random() * 1000 * 60 * 60 * 24 * 60)),
      //     review: "Donec quis magna erat. Sed consectetur porttitor ligula aliquet viverra. Pellentesque malesuada dolor et mi fermentum, ac molestie ipsum lobortis. Morbi et mauris sit amet ipsum dictum convallis. Vestibulum diam metus, ultrices nec nisl eget, pharetra ullamcorper turpis. Fusce id vulputate libero. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Quisque diam erat, rutrum gravida eros nec, pharetra volutpat ante. Integer fermentum augue quis elementum laoreet. Etiam sodales tellus fermentum, auctor erat at, tincidunt urna. Interdum et malesuada fames ac ante ipsum primis in faucibus."
    //     }
    //   };
    // });

  }

});

Template.SingleApp.events({

  'click [data-action="install"]': function(evt, tmp) {



  },

  'click [data-action="chip-in"]': function(evt, tmp) {



  },

  'click [data-action="flag-app"]': function(evt, tmp) {

    tmp.flagApp.set(!tmp.flagApp.get());

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

    tmp.writeReview.set(!tmp.writeReview.get());

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
