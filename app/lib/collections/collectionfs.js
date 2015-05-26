// FS.debug = true;

Spks = new FS.Collection('spks', {
  stores: [new FS.Store.FileSystem('spks', {path: 'uploads/spks'})],
  filter: {
    maxSize: 500 * 1024 * 1024, // in bytes
    allow: {
      extensions: ['spk']
    },
    onInvalid: function (message) {
      console.log(message);
    }
  },
  uploaded: function() {
    console.log(this, arguments);
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

  Spks.find().observe({
    changed: function(doc) {
      if (doc.copies && doc.copies.spks) {
        try {
          var packageMeta = App.spkVerify('uploads/spks/' + doc.copies.spks.key);
          Spks.update(doc._id, {$set: {meta: packageMeta}});
        } catch(e) {
          Spks.update(doc._id, {$set: {error: 'BAD_SPK'}});
        }
      }
    }
  });

}
