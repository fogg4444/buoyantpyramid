var path = require('path');
var db = require('../db/database');
var fs = require('fs');
var Song = db.Song;
var Group = db.Group;
var request = require('request');





var addSong = function(req, res, next) {
  // console.log('Receive song data: ', req.body);

  var dateRecorded = req.body.lastModified || null;
  var dateUploaded = Date.now(); //TODO: make a db entry for this data
  var groupId = req.params.id;
  var name = req.body.name || '';
  var description = req.body.description || '';
  var size = req.body.size;
  var awsBucketAddress = req.body.address;
  var uniqueHash = req.body.uniqueHash;
  var duration = req.body.duration || 300;

  console.log('Adding song to DB...');

  Song.create({
    title: name,
    description: description,
    dateRecorded: dateRecorded, // TODO: Receive from UI?
    dateUploaded: dateUploaded, //TODO: ask erick is this in the db schema?
    groupId: groupId,
    size: size, // TODO: ask erick if this size is in db?
    address: awsBucketAddress,
    duration: duration, // TODO: Receive from UI?
    uniqueHash: uniqueHash //TODO: ask erick about this one too..
  }, {
    include: {
      model: Group
    }
  })
  .then(function(song) {
    // Make request to compression server
    requestFileCompression(song);
    console.log('Song db call after compresion....');
    res.json(song);
  })
  .catch(function(err) {
    console.log('Song Db Error!');
    // res.sendStatus(500);
    // next(err);
  });
};

var requestFileCompression = function(song) {
  console.log('Make request to compression server', song);
  
  request.post(
    'http://localhost:4000/compress',
    { json: {
        s3UniqueHash: song.uniqueHash
      }
    },
    function (error, response, body) {
      if (error) {
        console.log('Request compression error: ', error);
      } else if (!error && response.statusCode == 200) {
        console.log('Successful request to compression server: ', body);
      }
    }
  );

}

var getSongByFilename = function(req, res, next) {
  var filename = req.params.filename;
  var url = path.resolve(__dirname + '/../uploadInbox/' + filename);
  res.sendFile(url);
};

var deleteSong = function(req, res, next) {
  // Only deletes from the database. FILES ARE STILL ON S3!
  var songId = req.params.id;
  Song.findById(songId)
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
