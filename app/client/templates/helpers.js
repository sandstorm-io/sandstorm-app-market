import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Spacebars } from 'meteor/spacebars';

import { Api } from '/client/api/api';
import { AppMarket } from '/imports/lib/appMarket';
import '/client/lib/appMarket';
import { Apps } from '/client/collections/apps';
import { Genres } from '/client/collections/genres';
import { AggregateReviews } from '/imports/collections/aggregateReviews';
import { Reviews } from '/imports/collections/reviews';

export const helpers = {

  // USER HELPERS
  getUsername: function(_id) {

    var user = Meteor.users.findOne(_id);

    return user && user.profile.name;

  },

  getFullname: function(_id) {

    var user = Meteor.users.findOne(_id);

    return user && user.fullname;

  },

  // APP HELPERS

  apps: function(genre, skip, limit) {

    var options = {sort: {installCount: -1}};
    if (skip) options.skip = skip;
    if (limit) options.limit = limit;

    return Genres.findIn(genre, {}, options);

  },

  appsCount: function(genre, skip, limit) {

    var options = {sort: {installCount: -1}};
    if (!AppMarket.isBlankKeyword(skip)) options.skip = skip;
    if (!AppMarket.isBlankKeyword(limit)) options.limit = limit;

    return Genres.findIn(genre, {}, options).count();

  },

  ratingsCount: function() {

    var aggregateReview = AggregateReviews.findOne({appId: this.appId});
    return aggregateReview ? aggregateReview.ratingsCount : 0;

  },

  latestVersionNumber: function(app) {

    app = app || this;
    return app && app.latestVersion && app.latestVersion() && app.latestVersion().number;

  },

  urlHost: function(url) {
    var parser = document.createElement("a");
    parser.href = url;
    return parser.hostname || parser.host
  },

  genreUrl: function(genre) {
    return FlowRouter.path('appMarketGenre', {genre: genre || this});
  },

  indexedList: function(list) {
    var i = 0;
    return list.map(function (v) {
      return {index: i++, value: v};
    });
  },

  approval: Apps.approval,

  appRatings: Reviews.rating,

  appState: function(state) {

    return this.approved === Apps.approval[state];

  },

  // ROUTER/SUB HELPERS


  subLimit: function() {

    return Template.instance().get('subLimit').get();

  },

  routerSubsReady: function(name) {

    return name ? FlowRouter.subsReady(name) : FlowRouter.subsReady();

  },

  routeRoot: function(string) {

    FlowRouter.watchPathChange();
    return FlowRouter.current().path.substr(0, string && string.length) === string ?
          'active' : '';

  },

  routeCategory: function(routeName) {

    routeName = cleanArgs(routeName);
    return FlowRouter.routeCategories[routeName || FlowRouter.getRouteName()];

  },

  inRouteCategory: function(category, routeName) {

    routeName = cleanArgs(routeName);
    return FlowRouter.routeCategories[routeName || FlowRouter.getRouteName()] === category ?
           'active' :
           '';
  },

  getPath: function(routeName, params, queryParams) {

    params = cleanArgs(params);
    queryParams = cleanArgs(queryParams);
    return FlowRouter.path(routeName, params, queryParams);

  },

  getZippedPath: function(routeName, paramKeys, paramVals, queryParamKeys, queryParamVals) {

    paramKeys = cleanArgs(paramKeys);
    paramVals = cleanArgs(paramVals);
    queryParamKeys = cleanArgs(queryParamKeys);
    queryParamVals = cleanArgs(queryParamVals);
    params = _.object([].concat(paramKeys), [].concat(paramVals));
    queryParams = _.object([].concat(queryParamKeys), [].concat(queryParamVals));
    return FlowRouter.path(routeName, params, queryParams);

  },

  getParam: function(param) {

    return FlowRouter.getParam(param);

  },

  sandstormHost: function() {

    return amplify.store('sandstormHost');

  },

  fullInstallLink: function() {

    AppMarket.hostDep.depend();

    var host = AppMarket.sandstormHost;
    if (!host) {
      if (AppMarket.hasSandstormHost()) {
        // The user arrived with no explicit host, but we have recorded this user using a specific
        // host before. So, leave the href blank as this will cause the host chooser to appear if
        // they click.
        return "";
      } else {
        // This user has no hosts that we know of. Suggest a demo on Alpha.
        host = "https://alpha.sandstorm.io/";
      }
    }

    return this.packageId ?
           [
             host,
             'install/',
             this.packageId,
             '?url=',
             Api.packageUrl(this.packageId)
           ].join('') : '';

  },

  // VALIDATION HELPERS

  validate: function(field) {

    var tmp = Template.instance(),
        validator = tmp.get('validator');

    return !!_.findWhere(validator.invalidKeys(), {name: field});

  },

  // UTILITY HELPERS

  equal: function(a, b) {

    return a === b;

  },

  notEqual: function(a, b) {

    return a !== b;

  },

  greaterThan: function(a, b) {

    return a > b;

  },

  and: function(a, b) {

    return a && b;

  },

  isNumber: function(x) {

    return _.isNumber(x);

  },

  prune: function(string, length) {

    return s.prune(string, length);

  },

  count: function(cursor) {

    return cursor.count();

  },

  countApps: function(genre) {

    return Genres.findIn(genre, {}, {}).count();

  },

  skipLimit: function(iterable, skip, limit) {

    if (typeof iterable.fetch === 'function') iterable = iterable.fetch();
    if (!Array.isArray(iterable)) return [];

    if (limit) return iterable.slice(skip, skip + limit);
    else return iterable.slice(skip);

  },

  uriEncode: function(string) {

    return encodeURIComponent(string);

  },

  dateFormat: function(date, format) {

    if (!(date instanceof Date)) return '#NAD';
    else return moment(date).format(format);

  },

  numberFormat: function(number, format) {

    if (!_.isNumber(number) || !format) return '#NAN';
    else return numeral(number).format(format);

  },

  last: function(array) {

    return _.last(array);

  },

  upperCase: function(string) {

    return string.toUpperCase && string.toUpperCase();

  },

  lowerCase: function(string) {

    return string.toLowerCase && string.toLowerCase();

  },

  stripFilename: function(path) {
    var uri = path && path.split('/').pop();
    return decodeURI(uri);
  },

  verboseNone: function(string) {

    return string || 'None';

  },

  getReactive: function(varName) {

    var thisVar = Template.instance().get(varName);

    return thisVar && thisVar.get && thisVar.get();

  },

  get: function(varName) {

    return Template.instance().get(varName);

  },

  invoke: function(action) {

    var args = Array.prototype.slice.call(arguments, 1);
    return this[action] && this[action].call(this, args);

  },

  // ADMIN HELPERS

  isAdmin: function() {

    return Roles.userIsInRole(Meteor.userId(), 'admin');

  },

  // DEBUGGING HELPERS

  logThis: function(varName) {

    console.log(varName ? this[varName] : this);

  },

  logParentData: function(depth) {

    console.log(Template.parentData(depth));

  },

  logHeirarchy: function() {

    console.log(Template.parentData(0));
    console.log(Template.parentData(1));
    console.log(Template.parentData(2));
    console.log(Template.parentData(3));

  }

};

_.forEach(helpers, function(val, key) {
  Template.registerHelper(key, val);
});

// Unspecified arguments passed to Spacebars helpers are not 'undefined', they're
// instances of Spacebars.kw, so we need a function to convert them back into
// what we'd normally expect of a JS argument.
// Plus, we parse JSON passed as a string
function cleanArgs() {

  var args = Array.prototype.slice.call(arguments, 0),
      cleanedArgs = _.map(args, function(arg) {
        if (arg instanceof Spacebars.kw) return undefined;
        else if (typeof arg === 'string')
          try {
            return JSON.parge(arg);
          } catch(e) {
            return arg;
          }
        else return arg;
      });
  return cleanedArgs.length && cleanedArgs.length === 1 ? cleanedArgs[0] : cleanedArgs;

}
