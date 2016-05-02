var path = require('path');
var fs = require('fs');
var SongModel = require('../models/songModel');
var awsConfig = require('../config/aws.config.js');
var Promise = require('bluebird');

var AWS = require('aws-sdk');
AWS.config.update({
  'accessKeyId': awsConfig.accessKeyId,
  'secretAccessKey': awsConfig.secretAccessKey,
  'region': awsConfig.region
});
var s3 = new AWS.S3();
var bucketAddress = s3.endpoint.protocol + '//' + awsConfig.bucket + '.' + s3.endpoint.hostname + s3.endpoint.pathname;

// var addCompressedLink = function (req, res, next) {
//   console.log('add compressed link');
  
//   var songID = req.body.songID;
//   var compressedID = req.body.compressedID;
//   var amplitudeData = req.body.amplitudeData;

//   SongModel.addCompressedLink(songID, compressedID, amplitudeData)
//   .then(function(data) {
//     console.log('Did it!');
//     res.sendStatus(200);
//   })
//   .catch(function(err) {
//     console.log('Fail!');
//     res.sendStatus(500);
//     // TODO: figure out the correct code here!
//   });

// };

var addSong = function (req, res, next) {
  
  console.log('-----------------------------------------------------------------------');
  console.log('Add Song to DB');
  console.log('-----------------------------------------------------------------------');

  var dbSongEntry = {};
  dbSongEntry.title = req.body.name || '';
  dbSongEntry.description = req.body.description || '';
  dbSongEntry.dateRecorded = req.body.lastModified || null;
  dbSongEntry.dateUploaded = Date.now(); //TODO: make a db entry for this data
  dbSongEntry.groupId = req.params.id;
  dbSongEntry.size = req.body.size;
  dbSongEntry.address = req.body.address;
  dbSongEntry.uniqueHash = req.body.uniqueHash;
  dbSongEntry.duration = req.body.duration || 300;

  // initialize dbsong
  var dbSong;

  SongModel.addSong(dbSongEntry)
  .then(function(songDbReturn) {
    dbSong = songDbReturn;
    return SongModel.requestFileCompression(songDbReturn);
  })
  .then(function(zencoderBodyResponse) {
    var compressedID = zencoderBodyResponse.outputs[0].url;
    var songID = dbSong.id;
    var dummyAmplitudeData = {
      'max': [.5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5],
      'duration': 10
    };
    SongModel.addCompressedLink(songID, compressedID, dummyAmplitudeData);
  })
  .catch(function(err) {
    next(err);
  });
};

var s3delete = function (song) {
  // delete both original and compressed files from aws
  song.address = song.address || 'dummy';
  song.compressedAddress = song.compressedAddress || 'dummy';
  

  var source = song.address.replace(bucketAddress, '');
  var mini = song.compressedAddress.replace(bucketAddress, '');
  
  console.log(' ------------ Songs to delete: ---------- ');
  console.log('source: ', source);
  console.log('mini: ', mini);
  console.log('song:', song);

  var params = {
    Bucket: awsConfig.bucket, /* required */
    Delete: { /* required */
      Objects: [ /* required */
        {
          Key: source, /* required */
        },
        {
          Key: mini, /* required */
        }
      ],
    },
  };
  return new Promise(function (resolve, reject) {
    
    console.log('--- --- Delete Songs: ', params);

    s3.deleteObjects(params, function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

var deleteSong = function (req, res, next) {
  var songId = req.params.id;

  SongModel.getSong(songId)
  .then(function(song) {
    s3delete(song)
    .then(function(s3response) {
      console.log('s3 delete response is ' + JSON.stringify(s3response));
      song.destroy()
      .then(function() {
        res.json(song);
      });
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).json('error deleting song from aws: ' + err);
    });
  })
  .catch(function(err) {
    next(err);
  });
};

var getComments = function (req, res, next) {
  var songId = req.params.id;
  SongModel.getComments(songId)
  .then(function (comments) {
    res.json(comments);
  })
  .catch(function (error) {
    res.status(500).json('error retreiving comments');
  });
};

var getSong = function (req, res, next) {
  var songId = req.params.id;
  SongModel.getSong(songId)
  .then(function (song) {
    res.json(song);
  })
  .catch(function (error) {
    res.status(500).json('error retreiving song');
  });
};

var updateSong = function (req, res, next) {
  SongModel.updateSong(req.body)
  .then(function (array) {
    if (array[0] > 0) {
      res.json(array[1][0]);
    } else {
      res.status(404).json('no songs updated');
    }
  })
  .catch(function (error) {
    res.status(500).json('error retreiving song');
  });
};

module.exports = {
  // addCompressedLink: addCompressedLink,
  addSong: addSong,
  deleteSong: deleteSong,
  getComments: getComments,
  getSong: getSong,
  updateSong: updateSong
};
