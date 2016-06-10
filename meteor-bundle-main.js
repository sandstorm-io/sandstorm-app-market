// Inject custom Meteor.settings, overriding the ones passed it by the bundle runner which
// are really meant for the Sandstorm front-end.
process.env.METEOR_SETTINGS = JSON.stringify({
  public: {
    API_URL: "https://app-index.sandstorm.io"
  }
});

// This file is used by Sandstorm to monkey-patch certain classes/functions in Nodejs
// Specifically, we're changing http.Server.listen to listen on fd=4 instead of the normal
// parameters. This is fine to do globally, since there's only ever one http server in meteor.
var http = require('http');
var net = require('net');

var oldListen = http.Server.prototype._oldListen = http.Server.prototype.listen;
http.Server.prototype.listen = function (port, host, cb) {
  oldListen.call(this, {fd: 4}, cb);
}

require("./main.js");
