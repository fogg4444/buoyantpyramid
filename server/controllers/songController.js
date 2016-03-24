var path = require('path');
var fs = require('fs');
var SongModel = require('../models/songModel');

var addSong = function(req, res, next) {
  var song = {};
  song.title = req.body.name || '';
  song.description = req.body.description || '';
  song.dateRecorded = req.body.lastModified || null;
  song.dateUploaded = Date.now(); //TODO: make a db entry for this data
  song.groupId = req.params.id;
  song.size = req.body.size;
  song.address = req.body.address;
  song.uniqueHash = req.body.uniqueHash;
  song.duration = req.body.duration || 300;

  SongModel.addSong(song)
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
  // Only deletes from the database. FILES ARE STILL ON S3!
  var songId = req.params.id;

  SongModel.getSong(songId)
  .then(function(song) {
    song.destroy()
    .then(function() {
      res.json(song);
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
