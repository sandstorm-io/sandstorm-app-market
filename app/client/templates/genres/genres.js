Template.Genre.onCreated(function() {

  var tmp = this;

  tmp.subLimit = new ReactiveVar(AppMarket.defaultAppLimit.get());

  tmp.addApps = function() {
    tmp.subLimit.set(tmp.subLimit.get() + (2 * AppMarket.lineCapacity.get()));
  };

  // However, we need to prevent rendering until subs are ready the first time
  // we render a new genre, but NOT when the sub is stopped due to a change in
  // limit, so we need a separate autorun to track that...
  tmp.autorun(function() {
    FlowRouter.watchPathChange();
    tmp.subLimit.set(AppMarket.defaultAppLimit.get());
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

    FlowRouter.watchPathChange();
    return FlowRouter.getParam('authorName') ? 'Apps By Author' : FlowRouter.getParam('genre');

  }

});

Template.AppsByAuthor.onCreated(function() {

  var tmp = this;

  tmp.subLimit = new ReactiveVar(AppMarket.defaultAppLimit.get());

  tmp.addApps = function() {
    tmp.subLimit.set(tmp.subLimit.get() + (2 * AppMarket.lineCapacity.get()));
  };

  // However, we need to prevent rendering until subs are ready the first time
  // we render a new genre, but NOT when the sub is stopped due to a change in
  // limit, so we need a separate autorun to track that...
  tmp.autorun(function() {
    FlowRouter.watchPathChange();
    tmp.subLimit.set(AppMarket.defaultAppLimit.get());
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

    FlowRouter.watchPathChange();
    return FlowRouter.getParam('authorName') ? 'Apps By Author' : FlowRouter.getParam('genre');

  },

  authorName: function() {

    return FlowRouter.getParam('authorName');

  }

});
