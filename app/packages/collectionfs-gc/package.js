Package.describe({
  name: 'richsilv:cfs-gcs',
  version: '0.1.0',
  summary: "Google Cloud storage adapter for CollectionFS",
  git: "https://github.com/tableflip/TODO"
});

Npm.depends({
  'gcloud': "0.14.0",
  // 'temp': '0.7.0', // used by the s3.indirect.streaming.js
  // 'through2': '0.4.1', // used by the s3.upload.stream.js
  // 'backoff': '2.3.0', // used by the s3.upload.stream.js
  // 'bl': '0.7.0' // used by the s3.upload.stream.js
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use(['cfs:base-package@0.0.30', 'cfs:storage-adapter@0.2.1']);
  api.addFiles([
    'gcs.server.js',
    // 's3.indirect.streaming.js',
    // 's3.upload.stream.js',
    'gcs.upload.stream2.js',
    ], 'server');
  api.addFiles('gcs.client.js', 'client');
});

Package.onTest(function(api) {
  api.use(['cfs:standard-packages', 'cfs:s3', 'test-helpers', 'tinytest'], 'server');
  api.addFiles('tests/server-tests.js', 'server');
  api.addFiles('tests/client-tests.js', 'client');
});
