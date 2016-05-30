var db = require('../db/database');
var User = db.User;
var Song = db.Song;
var Promise = require('bluebird');


var countUsers = function() {
  return User.count();
};

var countSongs = function() {
  return Song.count();
};

module.exports = {
  countUsers: countUsers,
  countSongs: countSongs
};