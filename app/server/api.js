Meteor.method('updates', function (data) {
  if (data) {

    var idList = _.reduce(data.apps, function(list, app) {
      var appObj = Apps.findOne(app.id);
      if (appObj && appObj.latestVersion().number !== app.version) list.push(app.id);
      return list;
    }, []);

    return Apps.find({_id: {$in: idList}}).fetch();
  }
}, {
  url: "api/checkupdates"
});
