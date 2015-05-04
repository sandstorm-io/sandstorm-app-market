Template.onCreated(function() {

  this.readMore = new ReactiveVar(false);
  this.flagApp = new ReactiveVar(false);

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
