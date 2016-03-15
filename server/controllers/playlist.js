var db = require('../db/database');
var Group = db.Group;
var Playlist = db.Playlist;
var Song = db.Song;

var createPlaylist = function(req, res, next) {
  var groupId = req.body.groupId;
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
  Playlist.findAll({
    where: {id: playlistId},
    include: {model: Song},
    raw: true
  }).then(function(playlist) {
    var songs = playlist.map(function(playlist) {
      return playlist['songs.title'];
    });
    res.json(songs);
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
