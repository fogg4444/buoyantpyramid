var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var queue = require('queue');
var downloadQueue = queue();

downloadQueue.timeout = 100000;

downloadQueue.on('timeout', function(next, job) {
  console.log('job timed out:', job.toString().replace(/\n/g, ''));
  next();
});

downloadQueue.on('success', function(result, job) {
  console.log('job finished processing:', job.toString().replace(/\n/g, ''));
});


var startQueue = function(req, res, next) {
  downloadQueue.start(function(err) {
    console.log('all done downloading');
    // next()
    if (err) {
      console.log('Download queue fail!');
    } else {
      next();
    }
  });
}

var addToQueue = function(req, res, next) {
  var s3UniqueHash = req.body.s3UniqueHash;
  var awsStaticUrl = 'https://s3-us-west-1.amazonaws.com/jamrecordtest/audio/';
  var directFileUrl = awsStaticUrl + s3UniqueHash;
  var downloadDestination = path.join( __dirname + '/../temp_audio/' + s3UniqueHash);
  
  console.log('Adds ' + s3UniqueHash + ' to the queue');
  downloadQueue.push(function(cb) {

    download(directFileUrl, downloadDestination, function(err) {
      console.log('Begin downloading S3 source', s3UniqueHash);
      if (err) {
        console.log('Error: file did not download!');
        res.send(500); //TODO: pick the right error for this!
      } else {
        console.log('File download success ', s3UniqueHash);
        // next();
      }
    });
    cb();
  });
};

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

module.exports = {
  startQueue: startQueue,
  addToQueue: addToQueue,
}