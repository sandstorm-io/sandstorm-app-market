Package.describe({
  name: 'html-truncate',
  version: '0.0.1',
  summary: 'HTML Truncate, packaged for Meteor',
  documentation: 'README.md'
});

Npm.depends({
  'html-truncate':'1.2.1'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use(['cosmos:browserify@0.2.0'], 'client');
  api.addFiles(['html-truncate.browserify.js'], 'client');
  api.export('htmlTruncate', 'client');
});
