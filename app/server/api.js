Meteor.method('updates', function (data) {
  if (data) {

    return {
      updates: _.reduce(data.apps, function(list, app) {
        var appObj = Apps.findOne({appId: app.id});
        if (appObj) {
          var latest = appObj.latestVersion(),
              spk = Spks.findOne(latest.spkId);
          if (latest.version !== app.version) list.push({
            id: appObj.appId,
            packageId: latest.packageId,
            version: latest.version,
            url: S3Url(spk)
          });
        }
        return list;
      }, [])
    };

  }
}, {
  url: "api/checkupdates"
});

function S3Url(file) {

  var urlHost = 'https://s3-' + spkS3.region + '.amazonaws.com';
  var urlPath = path.join('/', spkS3.bucket, file.copies.spkS3.key);
  return urlHost + urlPath;

}
