function resizeTopbar(template) {

  template.$('.genres').css('visibility', 'hidden');
  template.genreCount.set(Genres.getAll().length);

  var availableWidth = template.$('.genre-holder').width() - 1,
      minCount = $(window).width() > 720 ? 1 : 0;

  Tracker.afterFlush(function() {
    template.autorun(function(comp) {

      var currentCount = template.genreCount.get();

      if (template.$('.genres').width() > availableWidth && currentCount > minCount)
        Tracker.afterFlush(function() {
          template.genreCount.set(currentCount - 1);
        });
      else {
        template.$('.genres').css('visibility', 'visible');
        comp.stop();
      }

    });
  });

}

Template.Topbar.onCreated(function() {

  this.genreCount = new ReactiveVar(100);
  this.moreOpen = new ReactiveVar(false);

});

Template.Topbar.helpers({
  genres: function() {

    var genres = _.where(App.populatedGenres.get(), {showSummary: true}),
        template = Template.instance();

    return genres.slice(0, template.genreCount.get());

  },

  extraGenres: function() {

    var genres = _.where(App.populatedGenres.get(), {showSummary: true}),
        template = Template.instance();

    return genres.slice(template.genreCount.get());

  },

  moreOpen: function() {

    return Template.instance().moreOpen.get();

  },

  active: function() {

    FlowRouter.watchPathChange();
    return FlowRouter.getParam('genre') === this.name;

  }
});

Template.Topbar.onRendered(function() {

  var template = this;
  Meteor.defer(resizeTopbar.bind(null, template));
  $(window).on('resize.topbar', _.debounce(resizeTopbar.bind(null, template), 250));
  template.autorun(function(c) {
    if (FlowRouter.subsReady('categories')) {
      Tracker.afterFlush(resizeTopbar.bind(null, template));
      c.stop();
    }
  });

});

Template.Topbar.events({

  'click [data-action="open-more-menu"]': function(evt, tmp) {

    tmp.moreOpen.set(true);

  },

  'click [data-action="close-more-menu"]': function(evt, tmp) {

    tmp.moreOpen.set(false);

  },

  'click [data-action="search-apps"], keyup [data-field="search-term"]': function(evt, tmp) {

    if (evt.keyCode && evt.keyCode !== 13) return false;

    var term = tmp.$('[data-field="search-term"]').val();

    if (term) FlowRouter.go('/appMarket/search?term=' + term);

  }

});

Template.Topbar.onDestroyed(function() {
  $(window).off('resize.topbar');
});
