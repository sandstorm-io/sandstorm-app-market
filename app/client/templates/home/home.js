import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { AppMarket } from "/client/lib/appMarket";
import { Apps } from '/client/collections/apps';
import { Genres } from '/client/collections/genres';
import { Messages } from '/imports/collections/messages';

Template.Home.onCreated(function() {

  var tmp = this;
  window.template = tmp;
  this.tableFinishedRenderingReactiveVar = new ReactiveVar(false);

});

Template.Home.onDestroyed(function() {

  $(window).off('scroll.home');

});

Template.Home.events({

  'click .close-button': function(evt, tmp) {

    tmp.$('.welcome-message').addClass('collapsed');

  },

  'click a.trigger-ga-event': function(evt, tmp) {
    var url = evt && evt.target && evt.target.href;

    // In the case that the ctrl key is held down, then we don't really need to navigate. This is a
    // hack. To avoid navigating, we return true.
    var returnValue = !! evt.ctrlKey;

    var followTheLinkProbably = function() {
      if (returnValue) {
        return returnValue;
      }
      document.location = url;
    };
    var gaClickUrl = url + "#from-app-market";
    var doGaPing = window.ga && window.ga.create;
    if (doGaPing) {
      ga("send", "event", "outbound", "click", gaClickUrl, {"hitCallback": followTheLinkProbably});
    }
    else {
      return followTheLinkProbably();
    }
    return returnValue;
  }
});

/*****************************************************************************/
/* Home: Helpers */
/*****************************************************************************/
Template.Home.helpers({
  tableFinishedRenderingReactiveVar: function() {
    return Template.instance().tableFinishedRenderingReactiveVar;
  },

  tableFinishedRendering: function() {
    return Template.instance().tableFinishedRenderingReactiveVar.get();
  },

  stillWaitingOnApps: function() {
    return Apps.find({}).count() == 0;
  },

  genres: function() {
    return Genres.getAll({
      where: {showSummary: true},
      iteratee: function (cat) {
        var count = Apps.find({categories: cat.name}).count();
        // Sort descending by size. A category which has no contents is actually a
        // pseudo-category so should go on top.
        return count === 0 ? -Infinity : -count;
      }
    });
  },

  message: function() {
    var welcomeMessage = Messages.findOne('welcome');
    return welcomeMessage && welcomeMessage.message;
  }

});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.onCreated(function () {
});
