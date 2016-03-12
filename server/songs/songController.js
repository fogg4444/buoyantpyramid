var Song = require('./songModel.js');
var User = require('../users/userModel.js');
var Q = require('q');
var mongoose = require('mongoose');

var createSong = Q.nbind(Song.create, Song);
var findSong = Q.nbind(Song.findOne, Song);

module.exports = {
};