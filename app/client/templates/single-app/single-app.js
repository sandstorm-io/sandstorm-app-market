var reviewRows = 4,
    reviewCols = 3;

Template.SingleApp.onCreated(function() {

  var tmp = this;

  tmp.chipIn = new ReactiveVar(false);
  tmp.readMore = new ReactiveVar(false);
  tmp.flagApp = new ReactiveVar(!!FlowRouter.current().queryParams.flag);
  tmp.writeReview = new ReactiveVar(false);
  tmp.myReview = new ReactiveVar({
    appId: FlowRouter.getParam('appId'),
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
      if (user && user.reviews && appId in user.reviews) {
        tmp.myReview.set(user.reviews[appId]);
      }
      c.stop();
    }
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

    return Apps.findOne(FlowRouter.getParam('appId'));

  },

  installed: function() {

    return false;
    // return (Meteor.user() && this._id in Meteor.user().installedApps);

  },

  chipIn: function() {

    return Template.instance().chipIn.get();

  },

  getDescription: function() {

    return Template.instance().readMore.get() ? this.htmlDescription : s.prune(this.htmlDescription, 1200);

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

    return _.values(this.reviews);

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

  'click [data-action="install-app"]': function() {

    this.install();

  },

  'click [data-action="chip-in"]': function(evt, tmp) {

    tmp.chipIn.set(!tmp.chipIn.get());

  },

  'click [data-action="confirm-chip"]': function(evt, tmp) {

    var amount = parseFloat(tmp.$('[data-field="chip-amount"]').val(), 10);
    Meteor.call('user/chipIn', FlowRouter.getParam('appId'), amount, function(err) {
      if (err) console.log(err);
      tmp.chipIn.set(false);
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

  'input [data-field="review-text"]': function(evt, tmp) {

    var review = tmp.myReview.get();
    review.text = $(evt.currentTarget).val();
    tmp.myReview.set(review);
    tmp.validateReview();

  },

  'click [data-action="discard-review"]': function(evt, tmp) {

    tmp.myReview.set({
      appId: FlowRouter.getParam('appId'),
      text: ''
    });
    tmp.writeReview.set(false);

  },

  'click [data-action="submit-review"]': function(evt, tmp) {

    if (tmp.reviewValid.get()) {
      Meteor.call('user/reviewApp', FlowRouter.getParam('appId'), tmp.myReview.get(), function(err) {
        if (err) console.log(err);
        tmp.writeReview.set(false);
      });
    }

  },

  'click [data-action="flag-app"]': function(evt, tmp) {

    if (Meteor.userId()) tmp.get('flagApp').set(!tmp.get('flagApp').get());
    else {
      App.loginRedirect = FlowRouter.current().path;
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

  this.$(".owl-carousel").owlCarousel({
    items: Meteor.Device.isPhone() ? 1 : 2,
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

Template.flagBox.events({

    'click [data-action="flag-app"]': function(evt, tmp) {

      if (Meteor.userId()) tmp.get('flagApp').set(!tmp.get('flagApp').get());
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

      Meteor.call('user/flagApp', FlowRouter.getParam('appId'), flag, function(err) {
        if (err) console.log(err);
        tmp.get('flagApp').set(false);
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
