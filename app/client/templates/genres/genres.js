Template.Genre.onCreated(function() {

  var tmp = this;

  $(window).on('scroll.genre', _.debounce(function() {
    var $loadMore = tmp.$('.load-more');
    if ($loadMore.length && $loadMore.visible(true)) tmp.addApps();
  }, 500));

});

Template.Genre.onDestroyed(function() {

  $(window).off('scroll.genre');

});

Template.Genre.onCreated(() => {
  AppMarket.setPageTitlePrefix(FlowRouter.getParam('genre'));
});

Template.Genre.onDestroyed(() => {
  AppMarket.setPageTitlePrefix("");
});

Template.Genre.helpers({

  genre: function() {

    FlowRouter.watchPathChange();
    AppMarket.setPageTitlePrefix(FlowRouter.getParam('genre'));
    return FlowRouter.getParam('authorName') ? 'Apps By Author' : FlowRouter.getParam('genre');

  }

});

Template.AppsByAuthor.onCreated(function() {

  var tmp = this;

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
