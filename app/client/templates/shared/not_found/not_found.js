Template.NotFound.onCreated(function() {
  $(window).on('popstate.notFound', function(evt, data) {
    evt.stopImmediatePropagation();
    if (FlowRouter.history) Meteor.defer(function() {
      FlowRouter.go(FlowRouter.history.pop());
    });
  });
});

Template.NotFound.onDestroyed(function() {
  $(window).off('popstate.notFound');
});

Template.NotFound.helpers({

  object: function() {
    return FlowRouter.getParam('object');
  }

});
