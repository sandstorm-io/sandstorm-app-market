var Writable = Npm.require('stream').Writable,
    Future = Npm.require('fibers/future');

// This is based on the code from
// https://github.com/nathanpeck/s3-upload-stream/blob/master/lib/s3-upload-stream.js
// But much is rewritten and adapted to cfs

gcloud.storage.prototype.createReadStream = function(params, options) {
  // Simple wrapper
  var fut = new Future(),
      bucket = this.bucket(params.Bucket),
      query = {
        prefix: params.Key,
        maxResults: 1
      };
  this.getFiles(query, function(err, files) {
    if (err) fut.throw(err);
    else if (files && files.length && files[0]) fut.return(files[0].createReadStream());
    else fut.return(null);
  });
  return fut.wait();
};

gcloud.storage.prototype.createWriteStream = function(params, options) {
  // Simple wrapper
  var bucket = this.bucket(params.Bucket),
      file = bucket.file(params.Key);
      
  return file.createWriteStream();
};

//   var self = this;
//
//   //Create the writeable stream interface.
//   var writeStream = Writable({
//     highWaterMark: 4194304 // 4 MB
//   });
//
//   var partNumber = 1;
//   var parts = [];
//   var receivedSize = 0;
//   var uploadedSize = 0;
//   var currentChunk = Buffer(0);
//   var maxChunkSize = 5242880;
//   var multipartUploadID = null;
//   var waitingCallback;
//   var fileKey = params && (params.fileKey || params.Key);
//
//   // Clean up for GCS sdk
//   delete params.fileKey;
//
//   // This small function stops the write stream until we have connected with
//   // the GCS server
//   var runWhenReady = function(callback) {
//     // If we dont have a upload id we are not ready
//     if (multipartUploadID === null) {
//       // We set the waiting callback
//       waitingCallback = callback;
//     } else {
//       // No problem - just continue
//       callback();
//     }
//   };
//
//   //Handler to receive data and upload it to S3.
//   writeStream._write = function (chunk, enc, next) {
//     currentChunk = Buffer.concat([currentChunk, chunk]);
//
//     // If the current chunk buffer is getting to large, or the stream piped in
//     // has ended then flush the chunk buffer downstream to S3 via the multipart
//     // upload API.
//     if(currentChunk.length > maxChunkSize) {
//       // Make sure we only run when the s3 upload is ready
//       runWhenReady(function() { flushChunk(next, false); });
//     } else {
//       // We dont have to contact s3 for this
//       runWhenReady(next);
//     }
//   };
//
//   // Overwrite the end method so that we can hijack it to flush the last part
//   // and then complete the multipart upload
//   var _originalEnd = writeStream.end;
//   writeStream.end = function (chunk, encoding, callback) {
//     // Call the super
//     _originalEnd.call(this, chunk, encoding, function () {
//       // Make sure we only run when the s3 upload is ready
//       runWhenReady(function() { flushChunk(callback, true); });
//     });
//   };
//
//   writeStream.on('error', function () {
//     if (multipartUploadID) {
//       if (FS.debug) {
//         console.log('SA S3 - ERROR!!');
//       }
//       self.abortMultipartUpload({
//         Bucket: params.Bucket,
//         Key: params.Key,
//         UploadId: multipartUploadID
//       }, function (err) {
//         if(err) {
//           console.error('SA GCS - Could not abort multipart upload', err)
//         }
//       });
//     }
//   });
//
//   var flushChunk = function (callback, lastChunk) {
//     if (multipartUploadID === null) {
//       throw new Error('Internal error multipartUploadID is null');
//     }
//     // Get the chunk data
//     var uploadingChunk = Buffer(currentChunk.length);
//     currentChunk.copy(uploadingChunk);
//
//
//     // Store the current part number and then increase the counter
//     var localChunkNumber = partNumber++;
//
//     // We add the size of data
//     receivedSize += uploadingChunk.length;
//
//     // Upload the part
//     self.uploadPart({
//       Body: uploadingChunk,
//       Bucket: params.Bucket,
//       Key: params.Key,
//       UploadId: multipartUploadID,
//       PartNumber: localChunkNumber
//     }, function (err, result) {
//       // Call the next data
//       if(typeof callback === 'function') {
//         callback();
//       }
//
//       if(err) {
//         writeStream.emit('error', err);
//       } else {
//         // Increase the upload size
//         uploadedSize += uploadingChunk.length;
//         parts[localChunkNumber-1] = {
//           ETag: result.ETag,
//           PartNumber: localChunkNumber
//         };
//
//         // XXX: event for debugging
//         writeStream.emit('chunk', {
//           ETag: result.ETag,
//           PartNumber: localChunkNumber,
//           receivedSize: receivedSize,
//           uploadedSize: uploadedSize
//         });
//
//         // The incoming stream has finished giving us all data and we have
//         // finished uploading all that data to S3. So tell S3 to assemble those
//         // parts we uploaded into the final product.
//         if(writeStream._writableState.ended === true &&
//                 uploadedSize === receivedSize && lastChunk) {
//           // Complete the upload
//           self.completeMultipartUpload({
//             Bucket: params.Bucket,
//             Key: params.Key,
//             UploadId: multipartUploadID,
//             MultipartUpload: {
//               Parts: parts
//             }
//           }, function (err, result) {
//             if(err) {
//               writeStream.emit('error', err);
//             } else {
//               // Emit the cfs end event for uploads
//               if (FS.debug) {
//                 console.log('SA GCS - DONE!!');
//               }
//               writeStream.emit('stored', {
//                 fileKey: fileKey,
//                 size: uploadedSize,
//                 storedAt: new Date()
//               });
//             }
//
//           });
//         }
//       }
//     });
//
//     // Reset the current buffer
//     currentChunk = Buffer(0);
//   };
//
//   //Use the S3 client to initialize a multipart upload to S3.
//   self.createMultipartUpload( params, function (err, data) {
//     if(err) {
//       // Emit the error
//       writeStream.emit('error', err);
//     } else {
//       // Set the upload id
//       multipartUploadID = data.UploadId;
//
//       // Call waiting callback
//       if (typeof waitingCallback === 'function') {
//         // We call the waiting callback if any now since we established a
//         // connection to the s3
//         waitingCallback();
//       }
//
//     }
//   });
//
//   // We return the write stream
//   return writeStream;
// };
