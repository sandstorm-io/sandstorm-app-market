import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { AppMarket } from "/client/lib/appMarket";
import { Apps } from '/client/collections/apps';

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
    // For now, we do no caching. Doing caching in a reactive-smart way is seemingly difficult, so
    // wait until someone really requests it.
    var index, documentsToIndex, searchResults;
    var term = FlowRouter.getQueryParam('term');
    var results = [];
    if (! term) {
      return;
    }
    index = createEmptyLunrIndex();
    // Ensure each app is currently fully fetched. This allows us to search descriptions.
    _.each(Apps.find({}).fetch(), function(app) {
      AppMarket.ensureDetailsFetched(app._id);
    });
    // Index them.
    documentsToIndex = _.map(Apps.find({}).fetch(), function(thing) {
      return {_id: thing._id,
              text: ((thing.name || "") + " " +
                     (thing.shortDescription || "") + " " +
                     (thing.description || ""))}
    });
    _.each(documentsToIndex, function(doc) { index.add(doc); });
    // Search them.
    searchResults = index.search(term);
    var resultAppIds = _.map(searchResults, function(result) { return result.ref; });
    return Apps.find({_id: {$in: resultAppIds}},
                     {sort: {name: -1}}).fetch();
  }
});
