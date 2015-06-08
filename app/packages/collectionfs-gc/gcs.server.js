gcloud = Npm.require('gcloud');

/**
 * @public
 * @constructor
 * @param {String} name - The store name
 * @param {Object} options
 * @param {String} options.region - Bucket region
 * @param {String} options.bucket - Bucket name
 * @param {String} [options.projectId] - Google Cloud Project ID; required
 * @param {String} [options.keyFilename] - Path to Google Cloud JSON key file; required

 * @param {String} [options.ACL='private'] - ACL for objects when putting
 * @param {String} [options.folder='/'] - Which folder (key prefix) in the bucket to use
 * @param {Function} [options.beforeSave] - Function to run before saving a file from the server. The context of the function will be the `FS.File` instance we're saving. The function may alter its properties.
 * @param {Number} [options.maxTries=5] - Max times to attempt saving a file
 * @returns {FS.StorageAdapter} An instance of FS.StorageAdapter.
 *
 * Creates a GCS store instance on the server. Inherits from FS.StorageAdapter
 * type.
 */
FS.Store.GCS = function(name, options) {
  var self = this;
  if (!(self instanceof FS.Store.GCS))
    throw new Error('FS.Store.GCS missing keyword "new"');

  options = options || {};

  // Determine which folder (key prefix) in the bucket to use
  var folder = options.folder;
  if (typeof folder === "string" && folder.length) {
    if (folder.slice(0, 1) === "/") {
      folder = folder.slice(1);
    }
    if (folder.slice(-1) !== "/") {
      folder += "/";
    }
  } else {
    folder = "";
  }

  var bucket = options.bucket;
  if (!bucket)
    throw new Error('FS.Store.GCS you must specify the "bucket" option');

  var defaultAcl = options.ACL || 'private';

  var serviceParams = FS.Utility.extend({
    Bucket: bucket,
    region: null, //required
    projectId: null, //required
    keyFilename: null, //required
    ACL: defaultAcl
  }, options);

  // Whitelist serviceParams, else aws-sdk throws an error
  // XXX: I've commented this at the moment... It stopped things from working
  // we have to check up on this
  // serviceParams = _.pick(serviceParams, validS3ServiceParamKeys);

  // Create GCS service
  var GCS = new gcloud.storage({
        keyFilename: serviceParams.keyFilename,
        projectId: serviceParams.projectId
      }),
      gcsBucket = GCS.bucket(serviceParams.Bucket);

  return new FS.StorageAdapter(name, options, {
    typeName: 'storage.gcs',
    fileKey: function(fileObj) {
      // Lookup the copy
      var info = fileObj && fileObj._getInfo(name);
      // If the store and key is found return the key
      if (info && info.key) return info.key;

      var filename = fileObj.name();
      var filenameInStore = fileObj.name({store: name});

      // If no store key found we resolve / generate a key
      return fileObj.collectionName + '/' + fileObj._id + '-' + (filenameInStore || filename);
    },
    createReadStream: function(fileKey, options) {

      return GCS.createReadStream({
        Bucket: bucket,
        Key: folder + fileKey
      });

    },
    // Comment to documentation: Set options.ContentLength otherwise the
    // indirect stream will be used creating extra overhead on the filesystem.
    // An easy way if the data is not transformed is to set the
    // options.ContentLength = fileObj.size ...
    createWriteStream: function(fileKey, options) {
      options = options || {};

      if (options.contentType) {
        options.ContentType = options.contentType;
      }

      // We dont support array of aliases
      delete options.aliases;
      // We dont support contentType
      delete options.contentType;

      // Set options
      options = FS.Utility.extend({
        Bucket: bucket,
        Key: folder + fileKey,
        fileKey: fileKey,
        ACL: defaultAcl
      }, options);

      return GCS.createWriteStream(options);
    },
    remove: function(fileKey, callback) {

      gcsBucket.file(folder + fileKey).delete(function(error) {
        callback(error, !error);
      });
    },
    watch: function() {
      throw new Error("GCS storage adapter does not support the sync option");
    }
  });
};
