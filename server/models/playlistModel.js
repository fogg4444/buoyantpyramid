var db = require('../db/database');
var Group = db.Group;
var Playlist = db.Playlist;
var Song = db.Song;
var PlaylistSongs = db.PlaylistSongs;
var Promise = require('bluebird');

var addSong = function(songId, playlistId) {
  return new Promise(function(resolve, reject) {
    Song.findById(songId)
    .then(function(song) {
      PlaylistSongs.count({ where: { playlistId: playlistId } })
      .then(function(count) {
        PlaylistSongs.create({
          songId: songId,
          playlistId: playlistId,
          listPosition: count
        })
        .then(function(response) {
          resolve(response); // return the playlistSongs row
        });
      })
      .catch(function(error) {
        reject(error);
      });
    })
    .catch(function(error) {
      reject(error);
    });
  });
};

var createPlaylist = function(groupId, title, description) {
  return Playlist.create({
    title: title,
    description: description,
    groupId: groupId
  }, {
    include: {
      model: Group
    }
  });
};

var deletePlaylist = function(playlistId) {
  return Playlist.findOne({ where: { id: playlistId } });
};

var getSongs = function(playlistId) {
  return new Promise(function(resolve, reject) {
    Playlist.findById(playlistId)
      .then(function(playlist) {
        if (playlist) {
          resolve(playlist.getSongs());
        } else {
          resolve([]);
        }
      });
  });
};

var updatePositions = function(playlistId, positions) {
  return new Promise(function(resolve, reject) {
    PlaylistSongs.findAll({ where: {playlistId: playlistId }})
      .then(function(playlistSongs) {
        for (var i = 0; i < playlistSongs.length; i++) {
          PlaylistSongs.update(
            { 
              listPosition: positions[i].listPosition
            },
            { where: { songId: positions[i].songId } 
            } 
          ).then(function(response) {
            resolve(response);
          })
          .catch(function(error) {
            reject(error);
          });
        }
      });
  });
};

var removeSong = function(songId, playlistId) {
  return PlaylistSongs.destroy({ where: { songId: songId, playlistId: playlistId } });
};

module.exports = {
  addSong: addSong,
  createPlaylist: createPlaylist,
  deletePlaylist: deletePlaylist,
  getSongs: getSongs,
  updatePositions: updatePositions,
  removeSong: removeSong
};
