if (Meteor.settings.AWSAccessKeyId) {

  Slingshot.createDirective("spkUploader", Slingshot.S3Storage, {
    bucket: Meteor.settings.public.spkBucket,

    region: Meteor.settings.public.AWSRegion,

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
      var user = Meteor.users.findOne(this.userId);
      return  file.name + '_' + user.username + '_' + new moment().format("hh-mm-ss_DD-MM-YY");
    }
  });

  Slingshot.createDirective("imageUploader", Slingshot.S3Storage, {
    bucket: Meteor.settings.public.imageBucket,

    region: Meteor.settings.public.AWSRegion,

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
      var user = Meteor.users.findOne(this.userId);
      return user.username + ' ' + new moment().format("hh:mm:ss_DD-MM-YY") + ' ' + file.name;
    }
  });

}
