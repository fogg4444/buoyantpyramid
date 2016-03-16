var helpers = require('./helpers.js');
var Song = require('../controllers/song');
var Group = require('../controllers/group');
var Playlist = require('../controllers/playlist');
var User = require('../controllers/user');

var routing = function (app, express) {

  // Create users
  // 
  app.post('/api/users/signup', User.signup);
  app.post('/api/users/login', User.login);
  app.put('/api/users/profile', User.updateProfile);
  app.get('/api/users/profile', User.getProfile);
  app.get('/api/users/:id', User.getUser);

  // Add and retrieve groups
  app.post('/api/groups/', Group.createGroup);
  app.post('/api/groups/:id/users/', Group.addUser);
  app.get('/api/groups/:id/users/', Group.fetchUsers);

  // Add and retrieve songs
  app.post('/api/groups/:id/songs/', Song.addSong);
  app.get('/api/groups/:id/songs/', Group.fetchSongs);

  // Add and retrieve playlists
  app.post('/api/playlists/', Playlist.createPlaylist);
  app.put('/api/playlists/:id/add/', Playlist.addSong);
  // app.put('/api/playlists/:id/remove', Playlist.removeSong);
  app.get('/api/playlists/:id/', Playlist.fetchSongs);
  // app.delete('/api/playlists/:id', Playlist.delete);

  // Handle error logging of requests that are destined for above routes
  app.use(helpers.errorLogger);
  app.use(helpers.errorHandler);
};

module.exports = routing;
