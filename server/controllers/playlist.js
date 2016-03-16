var db = require('../db/database');
var Group = db.Group;
var Playlist = db.Playlist;
var Song = db.Song;

var createPlaylist = function(req, res, next) {
  var groupId = req.params.groupId;
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
  var songId = req.body.songId;
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

module.exports = {
  createPlaylist: createPlaylist,
  addSong: addSong,
  fetchSongs: fetchSongs
};
