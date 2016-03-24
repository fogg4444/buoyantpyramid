var db = require('../db/database');
var Group = db.Group;
var Playlist = db.Playlist;
var Song = db.Song;
var PlaylistSongs = db.PlaylistSongs;

var addSong = function (songId, playlistId) {
  return new Promise(function (resolve, reject) {
    Song.findById(songId)
    .then(function (song) {
      Playlist.findById(playlistId)
      .then(function (playlist) {
        playlist.addSong(song);
        resolve(song);
      });
    })
    .catch(function (error) {
      reject(error);
    });
  });
};

var createPlaylist = function (groupId, title, description) {
  return Playlist.create({
    title: title,
    description: description,
    groupId: groupId
  },
  {include: {
    model: Group}
  });
};

var deletePlaylist = function (playlistId) {
  return Playlist.findOne({where: {id: playlistId}});
};

var getSongs = function (playlistId) {
  return new Promise(function (resolve, reject) {
    Playlist.findById(playlistId)
    .then(function(playlist) {
      resolve(playlist.getSongs());
    });
  });
};

var removeSong = function (songId, playlistId) {
  return PlaylistSongs.destroy({ where: {songId: songId, playlistId: playlistId}});
};

module.exports = {
  addSong: addSong,
  createPlaylist: createPlaylist,
  deletePlaylist: deletePlaylist,
  getSongs: getSongs,
  removeSong: removeSong
};
