Meteor.startup(function() {
  
  $.ajax({
    method: 'GET',
    url: Meteor.settings && Meteor.settings.public && Meteor.settings.public.API,
    cache: false,
    dataType: 'json',
    success: function(data) {
      var categories = [],
          genres;
      _.forEach(data, function(app) {
        Apps.insert(app);
        categories = _.uniq(categories.concat(app.categories));
      });
      _.each(categories, function(cat) {
        Categories.insert({
          name: cat,
          populated: true,
          showSummary: true,
          approved: 0
        });
      });
      AppMarket.populatedGenres.set(AppMarket.extraGenres.concat(Genres.getPopulated()));
    },
    error: function(err, desc) {
      return AntiModals.overlay('errorModal', {data: {err: 'There was an error loading app data from the server'}});  
    }
  });
  
});