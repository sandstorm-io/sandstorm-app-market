// FS.debug = true;

Spks = new FS.Collection('spks', {
  stores: [new FS.Store.FileSystem('spks', {path: 'uploads'})],
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

}
