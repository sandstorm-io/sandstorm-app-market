import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { AppMarket } from "/imports/lib/appMarket";
import "/client/lib/appMarket";
import { Genres } from '/client/collections/genres';

Template.Popular.onCreated(function() {

  var tmp = this;
  window.template = tmp;

  tmp.genreCount = new ReactiveVar(5);

  $(window).on('scroll.popular', _.debounce(function() {
    if (tmp.$('.load-more').visible(true)) tmp.genreCount.set(tmp.genreCount.get() + 3);
  }, 500));

});

Template.Popular.onDestroyed(function() {

  $(window).off('scroll.popular');

});

Template.Popular.helpers({

  genres: function() {

    return Genres.getAll({
      filter: function(genre) {
        return genre.showSummary === true && genre.name !== 'Popular';
      }
    }).slice(0, Template.instance().genreCount.get());

  },

});
