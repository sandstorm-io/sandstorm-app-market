Meteor.method('updates', function (data) {
  if (data) {

    return {
      updates: _.reduce(data.apps, function(list, app) {
        var appObj = Apps.findOne({appId: app.id});
        if (appObj) {
          var latest = appObj.latestVersion();
          if (appObj.latestVersion().version !== app.version) list.push({
            id: app.appId,
            packageId: app.packageId,
            version: latest.version,
            url: app.makeInstallLink()
          });
        }
        return list;
      }, [])
    };

  }
}, {
  url: "api/checkupdates"
});
