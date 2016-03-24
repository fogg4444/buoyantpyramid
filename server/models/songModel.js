var db = require('../db/database');
var Song = db.Song;
var request = require('request');
var Promise = require('bluebird');
var awsConfig = require('../config/aws.json');

var addSong = function (songData) {
  return Song.create(songData);
};

var addCompressedLink = function(songID, compressedID) {
  console.log('--- --- Add compressed link Song.find() update DB', songID, compressedID);
  return new Promise(function(resolve, reject) {
    Song.find({where: {id: songID}})
    .then(function(song) {
      if (song) {
        song.updateAttributes({
          'compressedAddress': 'https://' + awsConfig.bucket + '.s3.amazonaws.com/audio/' + compressedID
        })
        resolve();
      }
    })
    .catch(function(err) {
      reject(err);
    });  
  });
};

var getSong = function(songId) {
  // TODO: what is this comment? Seems like this is not a delete function...
  // Only deletes from the database. FILES ARE STILL ON S3!
  return Song.findById(songId);
};

// TODO: why is this a promise?
var requestFileCompression = function(song) {
  // console.log('--- 2 --- Request file compression Promise');
  return new Promise(function (resolve, reject) {
    request.post(
      'http://localhost:4000/compress',
      { json: {
          songID: song.id,
          s3UniqueHash: song.uniqueHash
        }
      },
      function (error, response, body) {
        if (error) {
          // console.log('--- 2.5 --- Request compression error: ', error);
          reject(error);
        } else if (!error && response.statusCode == 200) {
          // console.log(' --- 2.6 --- Successful request to compression server: ', body);
          resolve(true);
        }
      }
    );
  });
};

module.exports = {
  addCompressedLink: addCompressedLink,
  addSong: addSong,
  getSong: getSong,
  requestFileCompression: requestFileCompression
};