Template.Genre.helpers({

  genre: function() {

    return Genres.getOne(FlowRouter.getParam('genre'));

  }

});


Template.registerHelper('apps', function(skip, limit) {

  var options = {sort: {installCount: -1}};
  if (skip) options.skip = skip;
  if (limit) options.limit = limit;

  return (limit === 1) ?
      Genres.findOneIn(this.name, {}, options) :
      Genres.findIn(this.name, {}, options);

});
