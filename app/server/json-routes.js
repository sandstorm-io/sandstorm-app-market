var http = Npm.require('http');

JsonRoutes.add('post', '/api/checkupdates', function(req, res, next) {

  var data = request.body,
      results;

  if (data && data.apps) {

    results = {
      updates: _.reduce(data.apps, function(list, app) {
        var appObj = Apps.findOne({appId: app.id});
        if (appObj) {
          var latest = appObj.latestVersion(),
              spk = Spks.findOne(latest.spkId);
          if (latest.version !== app.version) list.push({
            id: appObj.appId,
            packageId: latest.packageId,
            version: latest.version,
            url: appObj.location
          });
        }
        return list;
      }, [])
    };

    JsonRoutes.sendResults(res, 200, results);

  } else {

    JsonRoutes.sendResults(res, 400, 'request body in wrong format');

  }

});
