Meteor.methods({

  'user/saveApp': function(app) {
    this.unblock();
    if (!this.userId) return false;
    if (this.userId !== app.author) throw new Meteor.Error('wrong author', 'Can only save app by logged-in user');

    app.approved = Apps.approval.draft;

    var thisApp = Apps.findOne(app._id),
        replaceApp = Apps.findOne(app.replacesApp);

    if (!replaceApp) {

      // this is a fresh app (possibly from draft)
      if (!thisApp) uploadSaveDraft(app);
      else uploadSaveDraftFromDraft(app);

    } else {

      // this is to eventually replace an existing app
      if (replaceApp.approved === Apps.approval.approved) editSaveDraftFromApproved(app);
      else if (replaceApp.approved === Apps.approval.draft) editSaveDraftFromDraft(app);
      else editSaveDraftFromPending(app);

    }

  },

  'user/submitApp': function(app) {
    this.unblock();
    if (!this.userId) return false;
    if (this.userId !== app.author) throw new Meteor.Error('wrong author', 'Can only submit app by logged-in user');

    app.approved = Apps.approval.pending;

    var thisApp = Apps.findOne(app._id),
        replaceApp = Apps.findOne(app.replacesApp),
        fileObj = Spks.findOne(app.versions[0].spkId);

    if (!app.replacesApp) {

      // this is a fresh app (possibly from draft)
      if (!fileObj) throw new Meteor.Error('Bad .spk id in version data');

      // Here we need to make sure the app metadata is still as per the spk in case
      // a user has manually overwritten it before submitting.
      app.appId = fileObj.meta.appId;
      _.extend(app.versions[0], {
        version: fileObj.meta.version,
        packageId: fileObj.meta.packageId,
      });


      if (!thisApp) uploadSubmit(app);
      else uploadSubmitFromDraft(app);

    } else {

      // this is to replace an existing app
      var latestVersion = replaceApp.latestVersion();
      if (!replaceApp) throw new Meteor.Error('The app this is supposed to replace doesn\'t exist!');
      if (!latestVersion) throw new Meteor.Error('This app doesn\'t have a published version to replace!');

      // Confirm veracity of .spk, but only if there's a new packageId
      if (latestVersion.packageId !== app.versions[0].packageId) {
        if (!fileObj && latestVersion && latestVersion.packageId !== app.versions[0].packageId)
          throw new Meteor.Error('Bad .spk id in latest version data');
        if (!currentApp || fileObj.meta.appId !== currentApp.appId)
          throw new Meteor.Error('New .spk appId does not match existing appId');

        // copy over latest version data
        app.appId = fileObj.meta.appId;
        _.extend(app.versions[0], {
          version: fileObj.meta.version,
          packageId: fileObj.meta.packageId,
        });
      } else {
        // otherwise simply ensure that the most recent (internal) version number is correct
        app.appId = latestVersion.appId;
        _.extend(app.versions[0], {
          version: latestVersion.version
        });
      }

      if (this.userId !== replaceApp.author) throw new Meteor.Error('wrong author', 'Can only submit a replacement for an app by logged-in user');

      if (replaceApp.approved === Apps.approval.approved) editSubmitFromApproved(app);
      else if (replaceApp.approved === Apps.approval.draft) editSubmitFromDraft(app);
      else editSubmitFromPending(app);

    }

    // add new genres to collection
    _.each(app.categories, function(cat) {
      if (!Categories.findOne({name: cat})) Categories.insert({
        name: cat,
        suggested: true
      });
    });

  },

  'user/deleteSavedApp': function(appId) {

    var app = Apps.findOne(appId);

    this.unblock();
    if (!this.userId) return false;
    if (!app || this.userId !== app.author) throw new Meteor.Error('wrong author', 'Can only delete app by logged-in user');

    if (app && app.approved === Apps.approval.draft) Apps.remove(appId);
    return true;

  },

  'user/deleteApp': function(appId) {

    var app = Apps.findOne(appId);

    this.unblock();
    if (!this.userId) return false;
    if (!app || this.userId !== app.author) throw new Meteor.Error('wrong author', 'Can only delete app by logged-in user');

    return Apps.remove(appId);
    // TODO: should we inform installed users that this app is no longer available?

  }

});

function uploadSaveDraft(app) {
  return Apps.insert(app, {validate: false});
}

function uploadSubmit(app) {
  return Apps.insert(app);
}

function uploadSaveDraftFromDraft(app) {
  return Apps.update(app._id, {$set: app}, {validate: false});
}

function uploadSubmitFromDraft(app) {
  return Apps.update(app._id, {$set: app});
}

function editSaveDraftFromApproved(app) {
  return Apps.insert(app, {validate: false});
}

function editSubmitFromApproved(app) {
  // much better to try the insert first in case there's a validation error
  // and then delete any other drafts
  console.log(app);
  var ret = Apps.insert(app);
  Apps.remove({replacesApp: app.replacesApp, approved: Apps.approval.draft});
  return ret;
}

function editSaveDraftFromPending(app) {
  return Apps.insert(app, {validate: false});
}

function editSubmitFromPending(app) {
  var replaceId = app.replacesApp;
  delete app.replacesApp;
  delete app._id;
  var ret = Apps.update(replaceId, {$set: app});
  Apps.remove({replacesApp: replaceId, approved: Apps.approval.draft});
  return ret;
}

function editSaveDraftFromDraft(app) {
  return Apps.update(app._id, {$set: app}, {validate: false});
}

function editSubmitFromDraft(app) {
  var replaceId = app.replacesApp,
      currentDraft = Apps.findOne(replaceId);
  var ret = Apps.update(app._id, {$set: app});
  Apps.remove({replacesApp: currentDraft.replacesApp, approved: Apps.approval.draft});
  return ret;
}
