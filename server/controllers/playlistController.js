var db = require('../db/database');
var Playlist = require('../models/playlistModel');

var addSong = function (req, res, next) {
  var songId = req.params.sid;
  var playlistId = req.params.pid;

  Playlist.addSong(songId, playlistId)
  .then(function (song) {
    res.json(song);
  })
  .catch(function (error) {
    next(error);
  });
};

var createPlaylist = function (req, res, next) {
  var groupId = req.body.groupId;
  var title = req.body.title;
  var description = req.body.description;

  Playlist.createPlaylist(groupId, title, description)
  .then(function (playlist) {
    res.json(playlist);
  })
  .catch(function (error) {
    next(error);
  });
};

var deletePlaylist = function(req, res, next) {
  var playlistId = req.params.id;

  Playlist.deletePlaylist(playlistId)
  .then(function(playlist) {
    playlist.destroy();
    res.json(playlist);
  })
  .catch(function (error) {
    next(error);
  });
};

var getSongs = function (req, res, next) {
  var playlistId = req.params.id;

  Playlist.getSongs(playlistId)
  .then(function (songs) {
    res.json(songs);
  })
  .catch(function (error) {
    next(error);
  });

};

var removeSong = function(req, res, next) {
  var playlistId = req.params.pid;
  var songId = req.params.sid;

  Playlist.removeSong(songId, playlistId)
  .then(function(resp) {
    res.json(resp);
  })
  .catch(function (error) {
    next(error);
  });
};

module.exports = {
  addSong: addSong,
  createPlaylist: createPlaylist,
  deletePlaylist: deletePlaylist,
  getSongs: getSongs,
  removeSong: removeSong
};
