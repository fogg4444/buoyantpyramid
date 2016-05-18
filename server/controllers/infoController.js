var Info = require('../models/infoModel');

var audioPileStatusUpdate = function(req, res) {
  var stats = {};

  Info.countUsers()
  .then(function(userCount) {
    return userCount;
  }).then(function(userCount) {
    stats.userCount = userCount;
    return Info.countSongs();
  }).then(function(songCount) {
    stats.songCount = songCount;
    res.json(stats);
  }).catch(function(err) {
    console.log('Error getting info: ', err);
  });
};

module.exports = {
  audioPileStatusUpdate: audioPileStatusUpdate
};