Template.Genre.helpers({

  genre: function() {

    return Genres.getOne(FlowRouter.getParam('genre'));

  }

});


Template.registerHelper('apps', function(genre, skip, limit) {

  var options = {sort: {installCount: -1}};
  if (skip) options.skip = skip;
  if (limit) options.limit = limit;

  return Genres.findIn(genre, {}, options);

});
