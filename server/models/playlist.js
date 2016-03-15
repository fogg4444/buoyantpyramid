var db = require('../db/database');
var Group = db.Group;
var Playlist = db.Playlist;
var Song = db.Song;

var createPlaylist = function(req, res) {
  var groupId = req.body.groupId;
  Playlist.create({
    title: req.body.title,
    description: req.body.description,
    groupId: groupId
  },
  {include: {
    model: Group}
  }).then(function(playlist) {
    res.send(JSON.stringify(playlist));
  })
  .catch(function(err) {
    res.send(err);
  });
};

var addSong = function(req, res) {
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
    res.send(JSON.stringify(song));
  })
  .catch(function(err) {
    res.send(err);
  });
};

module.exports = {
  createPlaylist: createPlaylist,
  addSong: addSong
};
