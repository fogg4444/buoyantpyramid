var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var queue = require('queue');
var request = require('request');

var ffmpeg = require('fluent-ffmpeg');

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
  var downloadDestination = path.join( __dirname + '/../temp_audio/hi_res_inbox/' + s3UniqueHash);
  
  downloadQueue.push(function(cb) {

    download(directFileUrl, downloadDestination, function(err) {
      console.log('Begin downloading S3 source', s3UniqueHash);
      if (err) {
        console.log('Error: file did not download!');
        res.send(500); //TODO: pick the right error for this!
      } else {
        console.log('File download success ', s3UniqueHash);
        // next();
        // add file to transcoding
        compress(downloadDestination, s3UniqueHash);
      }
    });
    cb();
  });

  console.log('Adds ' + s3UniqueHash + ' to the queue');

  // notify main server of add to queue
  // request.post('http://localhost:5000/api/trancodingStatus',
  //   {json: {'testData': 'test post data added to queue!'}},
  //   function(err, res, body) {
  //     console.log('Compress server tell express');
  //     if (!err && res.statusCode == 200) {
  //       console.log('Status update success', body);
  //     } else {
  //       console.log('Status update error:', body);
  //     }
  //   }
  // );



  // res.sendStatus(200);

  // 
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

var compress = function(fileLocation, s3UniqueHash) {
  console.log('Get ready to read and compress the file!', fileLocation);

  var fileName = s3UniqueHash.split('.')[0];

  var ffmpegCommand = ffmpeg(fileLocation)
    .audioCodec('libmp3lame')
    .audioBitrate(256)
    .audioQuality(0)
    .audioChannels(2)
    .on('progress', function(progress) {
      console.log('Processing: ' + progress.percent + '% done');
    })
    .on('end', function() {
      console.log('Finished processing');
    })
    .on('error', function(err, stdout, stderr) {
      console.log('Cannot process audio: ' + err.message);
    })
    .save( path.join(__dirname + '/../temp_audio/low_res_outbox/' +  fileName + '.mp3'));
};

module.exports = {
  startQueue: startQueue,
  addToQueue: addToQueue,
}