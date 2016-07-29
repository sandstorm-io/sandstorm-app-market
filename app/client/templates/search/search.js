var createEmptyLunrIndex = function() {
  var index = lunr(function() {
    this.field('text');
    this.ref('_id');
  });
  return index;
};

Template.Search.helpers({
  searchQuery: function() {
    return FlowRouter.getQueryParam('term');
  },
  stillWaitingOnApps: function() {
    return Apps.find({}).count() == 0;
  },
  appList: function() {
    // For now, we do no caching.
    var index, documentsToIndex, searchResults;
    var term = FlowRouter.getQueryParam('term');
    var results = [];
    if (! term) {
      return;
    }
    index = createEmptyLunrIndex();
    documentsToIndex = _.map(Apps.find({}).fetch(), function(thing) {
      return {_id: thing._id,
              text: ((thing.name || "") + " " +
                     (thing.shortDescription || "") + " " +
                     (thing.description || ""))}
    });
    _.each(documentsToIndex, function(doc) { index.add(doc); });
    searchResults = index.search(term);
    var resultAppIds = _.map(searchResults, function(result) { return result.ref; });
    return Apps.find({_id: {$in: resultAppIds}},
                     {sort: {name: -1}}).fetch();
  }
});
