Template.Search.helpers({

  appList: function() {

    var term = FlowRouter.getQueryParam('term');
    return term && Apps.find({$or: [
      {name: {$regex: term, $options: 'i'}},
      {description: {$regex: term, $options: 'i'}}
    ]}).fetch();

  }

});
