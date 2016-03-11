var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/config')

var app = express();

// connect to mongo database named "dropnet"
mongoose.connect(config.mongoURL);

// Get port from environment and store in Express.
config.port = normalizePort(process.env.PORT || config.localPort);

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

// configure our server with all the middleware and routing
require('./config/middleware.js')(app, express);
require('./config/routes.js')(app, express);

// start listening to requests on port 8000
app.listen(config.port, function() {console.log('listening on port: ', config.port)});

// export our app for testing and flexibility, required by index.js
module.exports = app;
