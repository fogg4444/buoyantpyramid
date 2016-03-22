var db = require('../db/database');
var Group = db.Group;
var Playlist = db.Playlist;
var Song = db.Song;
var PlaylistSongs = db.PlaylistSongs;

var createPlaylist = function(req, res, next) {
  var groupId = req.body.groupId;
  var title = req.body.title;
  var description = req.body.description;

  Playlist.create({
    title: req.body.title,
    description: req.body.description,
    groupId: groupId
  },
  {include: {
    model: Group}
  }).then(function(playlist) {
    res.json(playlist);
  })
  .catch(function(err) {
    next(err);
  });
};

var addSong = function(req, res, next) {
  var songId = req.params.sid;
  var playlistId = req.params.pid;

  Song.findOne({where: {id: songId}})
  .then(function(song) {
    Playlist.findOne({where: {id: playlistId}})
    .then(function(playlist) {
      playlist.addSong(song);
      res.json(song);
    });
  })
  .catch(function(err) {
    next(err);
  });
};

var fetchSongs = function(req, res, next) {
  var playlistId = req.params.id;

  Playlist.findById(playlistId)
  .then(function(playlist) {
    playlist.getSongs()
    .then(function(songs) {
      res.json(songs);
    });
  })
  .catch(function(err) {
    next(err);
  });

};

var removeSong = function(req, res, next) {
  var playlistId = req.params.pid;
  var songId = req.params.sid;

  PlaylistSongs.destroy({ where: {songId: songId, playlistId: playlistId}})
  .then(function(resp) {
    res.json(resp);
  })
  .catch(function(err) {
    next(err);
  });

};


var deletePlaylist = function(req, res, next) {
  var playlistId = req.params.id;
  Playlist.findOne({where: {id: playlistId}})
  .then(function(playlist) {
    playlist.destroy();
    res.json(playlist);
  })
  .catch(function(err) {
    next(err);
  });
};

module.exports = {
  createPlaylist: createPlaylist,
  addSong: addSong,
  fetchSongs: fetchSongs,
  removeSong: removeSong,
  deletePlaylist: deletePlaylist
};
