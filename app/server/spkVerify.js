// The build process copies all files in /private as read-only, so we need
// to make the spk binary executable again on startup
// Also need to make a temp directory for spks

Meteor.startup(function() {

  var spawn = Npm.require('child_process').spawn;

  var chmod = spawn('chmod', ['755', './assets/app/spkbin']);
  chmod.on('exit', function(code) {
    console.log('Resetting spk binary executable completed with code ' + code);
  });
  var mkdir = spawn('mkdir', ['-p', 'tempSpk']);
  mkdir.on('exit', function(code) {
    console.log('Attempt to add temp .spk directory (if necessary) completed with code ' + code);
  });

});

Meteor.methods({

  'admin/spkVerify': function(filename) {

    var spawn = Npm.require('child_process').spawn,
        Future = Npm.require('fibers/future');

    var command = spawn('./assets/app/spkbin', ['verify', '-d', filename]),
        output = '',
        err,
        fut = new Future();

    command.stdout.on('data',  function (data) {
      console.log('stdout: ' + data);
      output += data;
    });

    command.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
      err = new Meteor.Error(data.toString());
    });

    command.on('exit', function (code) {
      var json;
      if (err) fut.throw(err);
      else if (code) fut.throw('Spkbin exited with unexpected code ' + code);
      else {
        try {
          json = JSON.parse(output);
          fut.return(json);
        }
        catch (e) {
          fut.throw('Cannot decode JSON: ' + output);
        }
      }
    });

    return fut.wait();

  },

  'admin/wget': function(path, filename) {

    var spawn = Npm.require('child_process').spawn,
        Future = Npm.require('fibers/future'),
        updateRegex = /^\d+K[ \.]*(\d+)\%\s+(\d+)K\s+(\d+)s$/;

    var command = spawn('wget', [path, '-O', (filename || 'tempFile')]),
        fut = new Future();

    command.stderr.on('data', function (data) {
      var current = updateRegex.exec(data.toString('utf8'));
      if (current && current.length > 3) process.stdout.write(current[3] + ' seconds to completion');
    });

    command.on('exit', function (code) {
      if (code) fut.throw('wget exited with unexpected code ' + code);
      else fut.return(filename || 'tempFile');
    });

    return fut.wait();

  },

  'admin/removeFile': function(filename) {

    var spawn = Npm.require('child_process').spawn,
        Future = Npm.require('fibers/future');

    var command = spawn('rm', ['-f', filename]),
        fut = new Future();

    command.stderr.on('data', function (data) {
      process.stdout.write(data.toString('utf8'));
    });

    command.on('exit', function (code) {
      if (code) fut.throw('rm exited with unexpected code ' + code);
      else fut.return(true);
    });

    return fut.wait();

  },

  'admin/getSpkDetails': function(url) {

    var randName = 'tempSpk/' + Random.id(),
        filename = Meteor.call('admin/wget', url, randName),
        details = Meteor.call('admin/spkVerify', randName);

    Meteor.call('admin/removeFile', randName);
    return details;

  },

  'admin/runCommand': function(com, args) {

    var spawn = Npm.require('child_process').spawn,
        Future = Npm.require('fibers/future');

    var command = spawn(com, args),
        output = '',
        err,
        fut = new Future();

    command.stdout.on('data',  function (data) {
      console.log('stdout: ' + data);
      output += data;
    });

    command.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
      err = new Meteor.Error(data.toString());
    });

    command.on('exit', function (code) {
      if (err) fut.throw(err);
      else if (code) fut.throw(com + ' exited with unexpected code ' + code);
      else fut.return(output);
    });

    return fut.wait();

  }

});
