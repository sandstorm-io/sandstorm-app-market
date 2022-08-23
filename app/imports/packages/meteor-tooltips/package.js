Package.describe({
  name: 'lookback:tooltips',
  summary: 'Reactive tooltips.',
  version: '0.3.1',
  git: 'https://github.com/lookback/meteor-tooltips.git'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.3');
  api.use('coffeescript reactive-var jquery templating tracker'.split(' '), 'client');

  api.addFiles('tooltips.html tooltips.coffee'.split(' '), 'client');
  api.export('Tooltips', 'client');
});
