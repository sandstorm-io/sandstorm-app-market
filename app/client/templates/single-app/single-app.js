Template.onCreated(function() {

  this.readMore = new ReactiveVar(false);

});

Template.SingleApp.helpers({

  app: function() {

    return Apps.findOne(FlowRouter.getParam('appId'));

  },

  getDescription: function() {

    return s.prune(this.description, 500);

  }

});

Template.SingleApp.events({

  'click [data-action="install"]': function(evt, tmp) {



  },

  'click [data-action="chip-in"]': function(evt, tmp) {



  },

  'click [data-action="read-more"]': function(evt, tmp) {

    tmp.readMore.set(!tmp.readMore.get());

  },

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
