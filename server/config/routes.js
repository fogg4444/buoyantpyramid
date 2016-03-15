var helpers = require('./helpers.js');
var Song = require('../models/song');
var Group = require('../models/group');
var Playlist = require('../models/playlist');
var User = require('../models/user');

var routing = function (app, express) {
  // Create users
  app.post('/api/users/', User.createUser);

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
