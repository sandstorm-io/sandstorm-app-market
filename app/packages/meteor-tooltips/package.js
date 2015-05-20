Package.describe({
  name: 'lookback:tooltips',
  summary: 'Reactive tooltips.',
  version: '0.3.1',
  git: 'https://github.com/lookback/meteor-tooltips.git'
});

Package.on_use(function(api) {
  api.versionsFrom('METEOR@0.9.3');
  api.use('coffeescript reactive-var jquery templating tracker'.split(' '), 'client');

  api.add_files('tooltips.html tooltips.coffee'.split(' '), 'client');
  api.export('Tooltips', 'client');
});
