var db = require('../db/database');
var Song = db.Song;
var request = require('request');
var Promise = require('bluebird');

var addSong = function (songData) {
  return Song.create(songData);
};

var addCompressedLink = function(songID, compressedID) {
  Song.find({where: {id: songID}})
    .then(function(song) {
      if (song) {
        song.updateAttributes({
          'compressedAddress': compressedID
        })
      }
    });  
};

var getSong = function(songId) {
  // Only deletes from the database. FILES ARE STILL ON S3!
  return Song.findById(songId);
};

var requestFileCompression = function(song) {
  return new Promise(function (resolve, reject) {
    request.post(
      'http://localhost:4000/compress',
      { json: {
          s3UniqueHash: song.uniqueHash
        }
      },
      function (error, response, body) {
        if (error) {
          console.log('Request compression error: ', error);
          reject(error);
        } else if (!error && response.statusCode == 200) {
          console.log('Successful request to compression server: ', body);
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