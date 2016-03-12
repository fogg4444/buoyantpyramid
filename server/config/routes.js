var groupController = require('../groups/groupController.js');
var helpers = require('./helpers.js');
var playlistController = require('../playlists/playlistController.js');
var songController = require('../songs/songController.js');
var userController = require('../users/userController.js');

var routing = function (app, express) {
  app.post('/api/users/signin', userController.signin);
  app.post('/api/users/signup', userController.signup);
  app.get('/api/users/signedin', userController.checkAuth);

  // Handle error logging of requests that are destined for above routes
  app.use(helpers.errorLogger);
  app.use(helpers.errorHandler);
}

module.exports = routing;
