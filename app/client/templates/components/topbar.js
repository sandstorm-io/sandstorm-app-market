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

    var genres = Genres.getAll(),
        template = Template.instance();

    return genres.slice(0, template.genreCount.get());

  },

  extraGenres: function() {

    var genres = Genres.getAll(),
        template = Template.instance();

    return genres.slice(template.genreCount.get());

  },

  moreOpen: function() {

    return Template.instance().moreOpen.get();

  },

  active: function() {

    var path = /\/genres\/(.*)/.exec(FlowRouter.reactiveCurrent().path);
    return path && path.length && path[1] === this.name;

  }
});

Template.Topbar.onRendered(function() {

  resizeTopbar(this);
  $(window).on('resize', _.debounce(resizeTopbar.bind(window, this), 250));

});

Template.Topbar.events({

  'click [data-action="open-more-menu"]': function(evt, tmp) {

    tmp.moreOpen.set(true);

  },

  'click [data-action="close-more-menu"]': function(evt, tmp) {

    tmp.moreOpen.set(false);

  },

});
