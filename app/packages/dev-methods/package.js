Package.describe({
  name: 'dev-methods',
  version: '1.0.0',
  summary: 'Methods whih should only be available in development',
  debugOnly: true
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles('dev-methods.js', 'server');
});