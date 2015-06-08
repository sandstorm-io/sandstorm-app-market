Slingshot.GoogleCloud.directiveDefault.GoogleSecretKey = Assets.getText('SandstormAppStore.pem');

Slingshot.createDirective("imageUploader", Slingshot.GoogleCloud, {
  bucket: Meteor.settings.public.imageBucket,
  GoogleAccessId: Meteor.settings.GCSAccessId,
  // GoogleSecretKey: Meteor.settings.GCSSecretKey,
  acl: "public-read",

  authorize: function () {
    //Deny uploads if user is not logged in.
    if (!this.userId) {
      var message = "Please login before posting files";
      throw new Meteor.Error("Login Required", message);
    }

    return true;
  },

  key: function (file) {
    //Store file into a directory by the user's username.
    return file.name;
    var user = Meteor.users.findOne(this.userId);
    return 'images/' + user.username + ' ' + new moment().format("hh:mm:ss_DD-MM-YY") + ' ' + file.name;
  }
});
