var Playlist = require('./playlistModel.js');
var  Q = require('q');

var createPlaylist = Q.nbind(Playlist.create, Playlist);
var findPlaylist = Q.nbind(Playlist.findOne, Playlist);

module.exports = {
};