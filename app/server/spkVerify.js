// The build process copies all files in /private as read-only, so we need
// to make the spk binary executable again on startup

Meteor.startup(function() {

  var spawn = Npm.require('child_process').spawn;

  var chmod = spawn('chmod', ['755', './assets/app/spkbin']);
  chmod.on('exit', function(code) {
    console.log('Resetting spk binary executable completed with code ' + code);
  });

});

App.spkVerify = function(filename) {

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

};
