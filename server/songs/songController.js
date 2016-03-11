var Song = require('./songModel.js');
var  Q = require('q');

var createSong = Q.nbind(Song.create, Song);
var findSong = Q.nbind(Song.findOne, Song);

module.exports = {
};