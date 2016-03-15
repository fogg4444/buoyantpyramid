var helpers = require('./helpers.js');
var Song = require('../models/song');
var Group = require('../models/group');
var Playlist = require('../models/playlist');
var User = require('../models/user');

var routing = function (app, express) {
  // Create users
  app.post('/api/users/', User.createUser);

  // Add and retrieve songs
  app.post('/api/songs/', Song.addSong);
  app.get('/api/songs/:id', Group.fetchSongs);

  // Add and retrieve groups
  app.post('/api/groups/', Group.createGroup);
  app.post('/api/groups/users', Group.addUser);
  app.get('/api/groups/users/:id', Group.fetchUsers);


  // Add and retrieve playlists
  app.post('/api/playlists/create', Playlist.createPlaylist);
  app.post('/api/playlists/add', Playlist.addSong);
  app.get('/api/playlists/:id', Playlist.fetchSongs);

  // Handle error logging of requests that are destined for above routes
  app.use(helpers.errorLogger);
  app.use(helpers.errorHandler);
};

module.exports = routing;
