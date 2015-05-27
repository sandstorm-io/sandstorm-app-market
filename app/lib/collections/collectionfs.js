// FS.debug = true;

var spkS3 = new FS.Store.S3('spkS3', {
  region: Meteor.settings.public.AWSRegion, //optional in most cases
  accessKeyId: Meteor.isServer && Meteor.settings.AWSAccessKeyId, //required if environment variables are not set
  secretAccessKey: Meteor.isServer && Meteor.settings.AWSSecretAccessKey, //required if environment variables are not set
  bucket: Meteor.settings.public.spkBucket, //required
  ACL: 'public-read', //optional, default is 'private', but you can allow public or secure access routed through your app URL
});


Spks = new FS.Collection('spks', {
  stores: [
    new FS.Store.FileSystem('spkFS', {path: 'uploads/spks'}),
    spkS3
    ],
  filter: {
    maxSize: 500 * 1024 * 1024, // in bytes
    allow: {
      extensions: ['spk']
    },
    onInvalid: function (message) {
      console.log(message);
    }
  }
});

Spks.allow({
  insert: function(userId, doc) {
    return true;
  },
  update: function(userId, doc, fieldNames, modifier) {
    return true;
  },
  remove: function(userId, doc) {
    return true;
  },
  download:function(){
    return true;
  }
});

if (Meteor.isServer) {

  Meteor.publish('spks', function(fileId) {
    return Spks.find(fileId);
  });

  Spks.find().observeChanges({
    changed: function(id, fields) {
      if (fields.copies && fields.copies.spkFS) {
        try {
          var packageMeta = App.spkVerify('uploads/spks/' + fields.copies.spkFS.key);
          Spks.update(id, {$set: {meta: packageMeta}});
        } catch(e) {
          console.log(e);
          Spks.update(id, {$set: {error: 'BAD_SPK'}});
        }
      }
    }
  });

}
