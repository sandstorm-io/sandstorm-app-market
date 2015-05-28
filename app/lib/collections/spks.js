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

Spks.error = {
  'BAD_SPK': function() {
    return 'Upload failed - ' + this.original.name + ' does not appear to be a valid .spk';
  },
  'DUPLICATE_SPK': function() {
    return 'That .spk corresponds to a version which has already been uploaded to the App Store';
  },
  'NON_LATEST_VERSION': function() {
    return 'That .spk corresponds to version ' + this.meta.version + ', and a more recent version already ' +
           'exists in the App Store';
  }
};

if (Meteor.isServer) {

  Meteor.publish('spks', function(fileId) {
    return Spks.find({$or: [{_id: fileId}, {'meta.appId': fileId}]});
  });

  Spks.find().observeChanges({
    changed: function(id, fields) {
      if (fields.copies && fields.copies.spkFS) {
        if (Spks.findOne(id).meta) return;
        try {
          var packageMeta = App.spkVerify('uploads/spks/' + fields.copies.spkFS.key),
              existing = Apps.findOne({'versions.packageId': packageMeta.packageId}),
              latest = Spks.findOne({'meta.appId': packageMeta.appId}, {sort: {'meta.version': -1}});
          if (existing) Spks.update(id, {$set: {error: 'DUPLICATE_SPK'}});
          if (latest && latest.meta.version > packageMeta.version) Spks.update(id, {$set: {error: 'NON_LATEST_VERSION'}});
          Spks.update(id, {$set: {meta: packageMeta}});
        } catch(e) {
          console.log(e);
          Spks.update(id, {$set: {error: 'BAD_SPK'}});
        }
      }
    }
  });

}
