var db = require('../db/database');
var User = db.User;
var Song = db.Song;
var Promise = require('bluebird');


var countUsers = function() {
  return new Promise(function(resolve, reject) {
    User.count()
    .then(function(userCount) {
      resolve(userCount);
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

var countSongs = function() {
  return new Promise(function(resolve, reject) {
    Song.count()
    .then(function(songCount) {
      resolve(songCount);
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

module.exports = {
  countUsers: countUsers,
  countSongs: countSongs
};