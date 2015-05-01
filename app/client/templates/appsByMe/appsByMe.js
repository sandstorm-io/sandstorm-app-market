var searchTermLocal = '';

Template.appsByMe_standard.onCreated(function() {

  this.searchTerm = new ReactiveVar('');

});

Template.appsByMe_standard.helpers({

  searchTerm: function() {

    return Template.instance().searchTerm.get();

  }

});

Template.appsByMe_standard.events({

  'keyup [data-field="search-by"]': function(evt) {

    searchTermLocal = $(evt.currentTarget).val();

  },

  'click [data-action="apply-search"]': function() {

    Template.instance().searchTerm.set(searchTermLocal);

  }

});
