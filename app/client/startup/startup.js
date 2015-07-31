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
      genres = _.map(categories, function(cat) {
        return {
          name: cat,
          priority: 0,
          showSummary: true,
          selector: {
            genre: cat
          },
          options: {}
        };
      });
      AppMarket.populatedGenres.set(genres.concat(AppMarket.extraGenres));
    },
    error: function(err, desc) {
      return AntiModals.overlay('errorModal', {data: {err: 'There was an error loading app data from the server'}});  
    }
  });
  
});