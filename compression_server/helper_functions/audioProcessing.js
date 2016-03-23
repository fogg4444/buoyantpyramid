var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var queue = require('queue');
var request = require('request');

var ffmpeg = require('fluent-ffmpeg');

var downloadQueue = queue();
// downloadQueue.timeout = 100000;
downloadQueue.concurrency = 5;
// TODO: what if something timesout?
// downloadQueue.on('timeout', function(next, job) {
//   console.log('job timed out:', job.toString().replace(/\n/g, ''));
//   next();
// });
downloadQueue.on('success', function(result, job) {
  console.log('--- 3.5 --- Success finished processing:');
});
downloadQueue.on('end', function(data) {
  console.log('--- 4 --- Queue completed! Queue status: ', downloadQueue.running);
});



var primaryServerStatusUpdate = function() {
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
};

var addToQueue = function(req, res, next) {
  
  var s3UniqueHash = req.body.s3UniqueHash;
  var awsStaticUrl = 'https://s3-us-west-1.amazonaws.com/jamrecordtest/audio/';
  var directFileUrl = awsStaticUrl + s3UniqueHash;
  var downloadDestination = path.join( __dirname + '/../temp_audio/hi_res_inbox/' + s3UniqueHash);
  

  downloadQueue.push(function(cb) {

    download(directFileUrl, downloadDestination, function(err) {
      console.log('--- 5 --- Begin downloading S3 source', s3UniqueHash);
      if (err) {
        console.log('--- 6 --- Error: file did not download!');
        res.send(500); //TODO: pick the right error for this!
      } else {
        console.log('--- 6 --- File download success ', s3UniqueHash);
        // next();
        // add file to transcoding
        compress(downloadDestination, s3UniqueHash);
      }
    });
    cb();
  });

  console.log('--- 1 --- Adds ' + s3UniqueHash + ' to the queue');

  console.log('--- 2 --- Check on length of queue at this time: ', downloadQueue.length);
  console.log('--- 2.5 --- Check on running status: ', downloadQueue.running);
  if (downloadQueue.running === false) {
    console.log('--- 3 --- Auto start queue!');
    startQueue();
  } else {
    console.log('--- 3 --- Dont start queue right now');
  }
};

var startQueue = function() {
  downloadQueue.start(function(err) {
    if (err) {
      console.log('--- 4 --- DownloadQueueError');
    } else {
      console.log('--- 4 --- DownloadQueue confirms starting');
    }
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

var compress = function(fileLocation, s3UniqueHash) {
  console.log('--- 7 --- Get ready to read and compress the file!', fileLocation);

  var fileName = s3UniqueHash.split('.')[0];

  var ffmpegCommand = ffmpeg(fileLocation)
    .audioCodec('libmp3lame')
    .audioBitrate(256)
    .audioQuality(0)
    .audioChannels(2)
    .on('progress', function(progress) {
      console.log('--- 8 --- Processing: ' + progress.percent + '% done');
    })
    .on('end', function() {
      console.log('--- 8 --- Finished processing');
    })
    .on('error', function(err, stdout, stderr) {
      console.log('--- 8 --- Cannot process audio: ' + err.message);
    })
    .save( path.join(__dirname + '/../temp_audio/low_res_outbox/' +  fileName + '.mp3'));
};

module.exports = {
  startQueue: startQueue,
  addToQueue: addToQueue,
}