var express = require('express');
var config = require('./config/config');
var database = require('./db/database');
var http = require('http');
var app = express();
var path = require('path');

// var server = http.createServer(app);
// var io = require('socket.io').listen(server);  //pass a http.Server instance
// server.listen(8080); //listen on port 80


var normalizePort = function(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// Get port from environment and store in Express.
config.port = normalizePort(process.env.PORT || config.port);
config.port = process.env.NODE_ENV === 'test' ? 9000 : config.port;

// configure our server with all the middleware and routing
require('./config/middleware.js')(app, express);
require('./config/routes.js')(app, express);

// io.on('connection', function (socket) {
//   socket.emit('news', { hello: 'world' });
//   // socket.on('my other event', function (data) {
//   //   console.log(data);
//   // });
// });

// start listening to requests on port 8000
app.listen(config.port, function() { console.log('listening on port: ', config.port); });

// export our app for testing and flexibility, required by index.js
module.exports = app;