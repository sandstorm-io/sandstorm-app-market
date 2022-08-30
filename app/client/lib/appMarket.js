import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import { Blaze } from 'meteor/blaze';
import { Spacebars } from 'meteor/spacebars';
import { AntiModals } from 'meteor/anti:modals';
import _ from 'underscore';

import { AppMarket } from '/imports/lib/appMarket';
import { Apps } from '/client/collections/apps';
import { Api } from '/client/api/api';

var fetchStatus = {};

_.extend(AppMarket, {

  setPageTitlePrefix: function(prefixString) {
    if (prefixString) {
      prefixString = prefixString + " - ";
    } else {
      prefixString = "";
    }
    document.title = prefixString + "Sandstorm App Market";
  },

  appInit: new ReactiveVar(false),

  // Fetch extended info about a specific app and insert it into the app table.
  // Reactively returns whether or not the details have completed being fetched.
  ensureDetailsFetched: function (appId) {
    var status = fetchStatus[appId];

    if (!status) {
      status = new ReactiveVar(false);
      fetchStatus[appId] = status;

      Api.getApp(appId, function(err, app) {
        if (err) {
          status.set(err);
          return;
        };

        // Make sure there's a partial app object already present to extend
        Tracker.autorun(function(c) {
          if (AppMarket.appInit.get()) {
            // Merge the extended data into the original object.
            if (Apps.find(appId).count() == 0) {
              // Don't display broken partial data...
              status.set(new Error("App not in index."));
            } else {
              Apps.update(appId, {$set: app});
              status.set(true);
            }

            c.stop();
          }
        });
      });
    }

    var result = status.get();
    if (result instanceof Error) {
      throw result;
    } else {
      return result;
    }
  },

  isBlankKeyword: function(value) {

    return (!value ||
            _.isEmpty(value) ||
            (Array.isArray(value) && value.length === 0) ||
            ((value instanceof Spacebars.kw) && _.isEmpty(value.hash)));

  },

  parentTemplate: function(tmp, name) {

    var inst;

    if (tmp instanceof Blaze.TemplateInstance) tmp = tmp.view.parentView;
    if (! (tmp instanceof Blaze.View)) throw new Meteor.Error('First argument must be Template instance of View');

    while (true) {

      inst = tmp.templateInstance && tmp.templateInstance();
      if (inst instanceof Blaze.TemplateInstance && (!name || tmp.name === ('Template.' + name))) return inst;
      else if (!tmp.parentView) return null;
      else tmp = tmp.parentView;

    }

  },

  redirectOrErrorCallback: function(redirectPath, callback, delay) {
    return function(err, res) {
      var _this = this;
      if (err) {
        console.log(err);
        AntiModals.overlay('errorModal', {data: {err: err}});
      } else {
        callback && callback.call(_this);
        Meteor.setTimeout(function() {
          redirectPath && FlowRouter.go(redirectPath);
        }, delay || 0);
      }
    };
  },

  populatedGenres: new ReactiveVar([]),

  historyDep: new Tracker.Dependency(),

  installHistoryCount: function() {
    AppMarket.historyDep.depend();
    var localInstall = amplify.store('sandstormInstalledApps'),
        count = localInstall ? localInstall.length : 0,
        user = Meteor.user();
    if (user && user.installedApps) count += _.keys(user.installedApps).length;
    return count;
  },

  // this is a flag so that we know if the localStorage app list has been checked to
  // ensure that all entries are still existing apps (and to remove if they're not)
  // we only need to run once per client session
  localAppListChecked: false,

  hostDep: new Tracker.Dependency(),

  addSandstormHost: function(host) {

    if (host.slice(host.length - 1) !== '/') host = host + '/';
    if (!urlRegex.exec(host)) return null;
    AppMarket.sandstormHost = host;
    var allHosts = amplify.store('sandstormHostHistory') || [];
    allHosts = _.unique(allHosts.concat(host));
    Meteor.call('user/addSandstormHost', host);
    AppMarket.hostDep.changed();
    return amplify.store('sandstormHostHistory', allHosts);

  },

  removeSandstormHost: function(host) {

    AppMarket.sandstormHost = null;
    var allHosts = amplify.store('sandstormHostHistory') || [];
    allHosts = _.without(allHosts, host);
    Meteor.call('user/removeSandstormHost', host);
    AppMarket.hostDep.changed();
    return amplify.store('sandstormHostHistory', allHosts);

  }

});

Template.registerHelper("ensureDetailsFetched", function (appId) {
  try {
    return AppMarket.ensureDetailsFetched(appId);
  } catch (err) {
    console.log(err);
    return false;
  }
});

var urlRegex = new RegExp(
  "^" +
    // protocol identifier
    "(?:(?:https?|ftp)://)" +
    // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
      // IP address exclusion
      // private & local networks
      "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
      "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
      "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
      // IP address dotted notation octets
      // excludes loopback network 0.0.0.0
      // excludes reserved space >= 224.0.0.0
      // excludes network & broacast addresses
      // (first & last IP address of each class)
      "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
      "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
      "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
      // host name
      "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
      // domain name
      "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
      // TLD identifier
      "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
    ")" +
    // port number
    "(?::\\d{2,5})?" +
    // resource path
    "(?:/\\S*)?" +
  "$", "i"
);
