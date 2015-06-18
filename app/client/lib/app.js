_.extend(App, {

  lineCapacity: new ReactiveVar(5),

  isBlankKeyword: function(value) {

    return (!value ||
            _.isEmpty(value) ||
            (Array.isArray(value) && value.length === 0) ||
            ((value instanceof Spacebars.kw) && _.isEmpty(value.hash)));

  },

  defaultAppLimit: new ReactiveVar(18),

  spkUploader: new Slingshot.Upload('spkUploader'),

  imageUploader: new Slingshot.Upload('imageUploader'),

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

  redirectOrErrorCallback: function(redirectPath, callback) {
    return function(err, res) {
      if (err) {
        console.log(err);
        AntiModals.overlay('errorModal', {data: {err: err}});
      } else {
        callback && callback.call(this);
        redirectPath && FlowRouter.go(redirectPath);
      }
    };
  },

  populatedGenres: new ReactiveVar([]),

  historyDep: new Tracker.Dependency(),

  installHistoryCount: function() {
    App.historyDep.depend();
    var localInstall = amplify.store('sandstormInstalledApps'),
        count = localInstall ? localInstall.length : 0;
    if (Meteor.user()) count += _.keys(Meteor.user().installedApps).length;
    if (!App.localAppListChecked) Meteor.call('apps/checkIds', amplify.store('sandstormInstalledApps'), function(err, res) {
      if (err) console.log(err);
      else {
        amplify.store('sandstormInstalledApps', res);
        App.localAppListChecked = true;
        App.historyDep.changed();
      }
    });
    return count;
  },

  // this is a flag so that we know if the localStorage app list has been checked to
  // ensure that all entries are still existing apps (and to remove if they're not)
  // we only need to run once per client session
  localAppListChecked: false,

  hostDep: new Tracker.Dependency(),

  addSandstormHost: function(host) {

    if (host.slice(0, 7) !== 'http://') host = 'http://' + host;
    if (host.slice(host.length - 1) !== '/') host = host + '/';
    App.sandstormHost = host;
    var allHosts = amplify.store('sandstormHostHistory') || [];
    allHosts = _.unique(allHosts.concat(host));
    Meteor.call('user/addSandstormHost', host);
    App.hostDep.changed();
    return amplify.store('sandstormHostHistory', allHosts);

  },

  removeSandstormHost: function(host) {

    console.log(host);
    App.sandstormHost = null;
    var allHosts = amplify.store('sandstormHostHistory') || [];
    allHosts = _.without(allHosts, host);
    Meteor.call('user/removeSandstormHost', host);
    App.hostDep.changed();
    return amplify.store('sandstormHostHistory', allHosts);

  }

});
