var path = require('path');
var db = require('../db/database');
var fs = require('fs');
var Song = db.Song;
var Group = db.Group;


var addSong = function(req, res, next) {
  var dateRecorded = req.body.dateRecorded || Date.now();
  var groupId = req.params.id;
  var title = req.body.title;
  var description = req.body.description;

  Song.create({
    title: title || req.filename,
    description: description || '',
    dateRecorded: dateRecorded || Date.now(), // TODO: Receive from UI?
    duration: 100, // TODO: Receive from UI?
    address: req.filename,
    groupId: groupId
  }, {
    include: {
      model: Group
    }
  })
  .then(function(song) {
    res.json(song);
  })
  .catch(function(err) {
    next(err);
  });
};

var getSongByFilename = function(req, res, next) {
  var filename = req.params.filename;
  var url = path.resolve(__dirname + '/../uploadInbox/' + filename);
  res.sendFile(url);
};

var deleteSong = function(req, res, next) {
  var songId = req.params.id;
  Song.findById(songId)
  .then(function(song) {
    var url = path.resolve(__dirname + '/../uploadInbox/' + song.address);
    fs.unlink(url, function(err, status) {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        song.destroy()
        .then(function() {
          res.json(song);
        });
      }
    });
  })
  .catch(function(err) {
    next(err);
  });
};

module.exports = {
  addSong: addSong,
  getSongByFilename: getSongByFilename,
  deleteSong: deleteSong
};
