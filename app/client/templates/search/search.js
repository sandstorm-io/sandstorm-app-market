Template.Search.helpers({
  searchQuery: function() {
    return FlowRouter.getQueryParam('term');
  },
  appList: function() {

    var term = FlowRouter.getQueryParam('term');
    return term && Apps.find({$or: [
      {name: {$regex: term, $options: 'i'}},
      {shortDescription: {$regex: term, $options: 'i'}},
      {description: {$regex: term, $options: 'i'}}
    ]}, {sort: {name: -1}}).fetch();

  }

});
