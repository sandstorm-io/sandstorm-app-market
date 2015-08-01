Meteor.startup(function() {
  
  var renderer = new marked.Renderer();
  
  // overwrite image renderer to return an empty string
  renderer.image = function (href, title, text) {
    return '';
  };
  
  // "gfm" accepts Github-flavor markdown
  // "sanitize" escapes html within the markdown
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    sanitize: true
  });
  
  Api.getIndex(function(err, data) {
    if (err) return AntiModals.overlay('errorModal', {data: {err: 'There was an error loading app data from the server'}});  
    
    var categories = [],
        genres;
    _.forEach(data.apps, function(app) {
      app._id = app.appId;
      Apps.insert(app);
      categories = _.uniq(categories.concat(app.categories));
    });
    AppMarket.appInit.set(true);
    _.each(categories, function(cat) {
      Categories.insert({
        name: cat,
        populated: true,
        showSummary: true,
        approved: 0
      });
    });
    AppMarket.populatedGenres.set(AppMarket.extraGenres.concat(Genres.getPopulated()));
  });

});