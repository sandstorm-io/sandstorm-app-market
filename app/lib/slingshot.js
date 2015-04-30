// TODO: work out how to restrict allowed file types to .spk
Slingshot.fileRestrictions("spkUploader", {
  allowedFileTypes: null,
  maxSize: 1024 * 1024 * 1024 // 1GB
});

Slingshot.fileRestrictions("imageUploader", {
  allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
  maxSize: 10 * 1024 * 1024 // 10 MB (use null for unlimited)
});
