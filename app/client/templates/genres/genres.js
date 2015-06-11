Template.Genre.onCreated(function() {

  var tmp = this;

  tmp.subLimit = new ReactiveVar(App.defaultAppLimit.get());
  tmp.subReady = new ReactiveVar(false);

  tmp.addApps = function() {
    tmp.subLimit.set(tmp.subLimit.get() + (2 * App.lineCapacity.get()));
  };

  // Reactively run the app subscription so that it will be stopped and restarted
  // whenever the genre or limit is changed.
  tmp.autorun(function() {
    var genre = s.capitalize(FlowRouter.reactiveCurrent().params.genre);
    tmp.subscribe('apps by genre', genre, tmp.subLimit.get(), {
      onReady: function() {
        tmp.subReady.set(true);
        if (genre && !Genres.findOneIn(genre)) FlowRouter.go('notFound', {object: 'genre'});
      }
    });
  });

  // However, we need to prevent rendering until subs are ready the first time
  // we render a new genre, but NOT when the sub is stopped due to a change in
  // limit, so we need a separate autorun to track that...
  tmp.autorun(function() {
    FlowRouter.reactiveCurrent();
    tmp.subLimit.set(App.defaultAppLimit.get());
    tmp.subReady.set(false);
  });

  $(window).on('scroll.genre', _.debounce(function() {
    var $loadMore = tmp.$('.load-more');
    if ($loadMore.length && $loadMore.visible(true)) tmp.addApps();
  }, 500));

});

Template.Genre.onDestroyed(function() {

  $(window).off('scroll.genre');

});

Template.Genre.helpers({

  genre: function() {

    return FlowRouter.current().params.authorId ? 'Apps By Author' : FlowRouter.reactiveCurrent().params.genre;

  },

  author: function() {

    var authorId = FlowRouter.current().params.authorId;
    return Meteor.users.findOne(authorId);

  }

});

Template.AppsByAuthor.onCreated(function() {

  var tmp = this;

  tmp.subLimit = new ReactiveVar(App.defaultAppLimit.get());
  tmp.subReady = new ReactiveVar(false);

  tmp.addApps = function() {
    tmp.subLimit.set(tmp.subLimit.get() + (2 * App.lineCapacity.get()));
  };

  // Reactively run the app subscription so that it will be stopped and restarted
  // whenever the genre or limit is changed.
  tmp.autorun(function() {
    var genre = s.capitalize(FlowRouter.reactiveCurrent().params.genre);
    tmp.subscribe('apps by genre', genre, tmp.subLimit.get(), {
      onReady: function() {
        tmp.subReady.set(true);
        if (genre && !Genres.findOneIn(genre)) FlowRouter.go('notFound', {object: 'genre'});
      }
    });
  });

  // However, we need to prevent rendering until subs are ready the first time
  // we render a new genre, but NOT when the sub is stopped due to a change in
  // limit, so we need a separate autorun to track that...
  tmp.autorun(function() {
    FlowRouter.reactiveCurrent();
    tmp.subLimit.set(App.defaultAppLimit.get());
    tmp.subReady.set(false);
  });

  $(window).on('scroll.genre', _.debounce(function() {
    var $loadMore = tmp.$('.load-more');
    if ($loadMore.length && $loadMore.visible(true)) tmp.addApps();
  }, 500));

});

Template.AppsByAuthor.onDestroyed(function() {

  $(window).off('scroll.genre');

});

Template.AppsByAuthor.helpers({

  genre: function() {

    return FlowRouter.current().params.authorId ? 'Apps By Author' : FlowRouter.reactiveCurrent().params.genre;

  },

  author: function() {

    var authorId = FlowRouter.current().params.authorId;
    return Meteor.users.findOne(authorId);

  }

});

Template.genreTable.onCreated(function() {
  this.subscribe('apps by genre', this.data.genre, App.lineCapacity.get());
});
