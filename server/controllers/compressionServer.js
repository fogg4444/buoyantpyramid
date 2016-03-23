var request = require('request');
var crypto = require('crypto');
var config = require('../config/config.js');


// TODO: this can probably go in a factory
var requestFileCompression = function(song) {
  console.log('Make request to compression server');
  
  request.post(
    config.compressionServer + '/compress',
    { json: {
        s3UniqueHash: song.uniqueHash
      }
    },
    function (error, response, body) {
      // socket messages trigger to unique downstream user here
      if (error) {
        console.log('Request compression error: ', error);
      } else if (!error && response.statusCode == 200) {
        console.log('Successful request to compression server: ', body);
      }
    }
  );
}

module.exports = {
  requestFileCompression: requestFileCompression
}