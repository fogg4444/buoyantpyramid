var db = require('../db/database');
var Group = db.Group;
var Playlist = db.Playlist;
var Song = db.Song;

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
  var songId = req.params.id;
  var playlistId = req.body.playlistId;
  Song.update(
    {
      playlistId: playlistId
    },
    {
      where: {id: songId}
    },
  {include: {
    model: Playlist}
  }).then(function(song) {
    res.json(song);
  })
  .catch(function(err) {
    next(err);
  });
};

var fetchSongs = function(req, res, next) {
  var playlistId = req.params.id;
  Playlist.findOne({where: {id: playlistId}})
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
  var songId = req.params.sid;
  var playlistId = req.params.pid;
  Playlist.findOne({where: {id: playlistId}})
  .then(function(playlist) {
    playlist.findSong({where: {id: songId}})
    .then(function(song) {
      song.destroy();
      res.send(song);
    })
    .catch(function(err) {
      next(err);
    });
  })
  .catch(function(err) {
    next(err);
  });
};

var deletePlaylist = function(req, res, next) {
  var playlistId = req.params.id;
  console.log("In delete playlist!", playlistId);
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
