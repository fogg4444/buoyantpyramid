var Info = require('../models/infoModel');

var audioPileStatusUpdate = function(req, res) {
  var status = 'AudioPile Stats || ';

  Info.countUsers().then(function(userCount) {
    return userCount;
  }).then(function(userCount) {
    status = status + 'Users:' + userCount;
    return Info.countSongs();
  }).then(function(countSongs) {
    status = status + '  Songs:' + countSongs;
    res.json(status);
  }).catch(function(err) {
    console.log('Error getting info: ', err);
  });
};

module.exports = {
  audioPileStatusUpdate: audioPileStatusUpdate
};