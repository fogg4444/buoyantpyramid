var server = require('../server.js');
var config = {};

config.mongoURL = 'mongodb://localhost/dropnet';

// Get port from environment and store in Express.
config.port = normalizePort(process.env.PORT || '3000');

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

module.exports = config;
