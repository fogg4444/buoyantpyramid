var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var queue = require('queue');
var request = require('request');
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg');
ffmpeg.setFfprobePath('/usr/local/bin/ffprobe');

var exec = require('child_process').exec;

var serverConfig = require('../config/server.config.js');
var awsConfig = require('../config/aws.config.js');
var exec = require('child_process').exec;
var Promise = require('bluebird');

var AWS = require('aws-sdk');
AWS.config.update({
  'accessKeyId': awsConfig.accessKeyId,
  'secretAccessKey': awsConfig.secretAccessKey,
  'region': awsConfig.region
});
var s3 = new AWS.S3();


var downloadQueue = queue();
// downloadQueue.timeout = 100000;
downloadQueue.concurrency = 5;
// TODO: what if something timesout?
// downloadQueue.on('timeout', function(next, job) {
//   // console.log('job timed out:', job.toString().replace(/\n/g, ''));
//   next();
// });
downloadQueue.on('success', function(result, job) {
  // console.log('---  --- Success finished processing:');
});
downloadQueue.on('end', function(data) {
  // console.log('---  --- Queue completed! Queue status: ', downloadQueue.running);
});


var addToQueue = function(req, res, next) {

  // console.log('--- 1 --- Begin addToQueue: ', req.body);
  
  var s3UniqueHash = req.body.s3UniqueHash;
  var awsStaticUrl = 'https://s3-us-west-1.amazonaws.com/jamrecordtest/audio/';
  var directFileUrl = awsStaticUrl + s3UniqueHash;
  var downloadDestination = path.join( __dirname + '/../temp_audio/hi_res_inbox/' + s3UniqueHash);
  var songID = req.body.songID;
  console.log('--- 1.2 --- Song ID present on input: ', songID);

  var originalFilePath, wavPath, amplitudeDataPath, lowResFileName, lowResFilePath, originalFormat, normalizeBoostData, normalizedFilePath;
  downloadQueue.push(function(cb) {

    //download(directFileUrl, downloadDestination, function(err) {
    s3download(s3UniqueHash, downloadDestination, function(err) {
      console.log('--- 1 --- Begin downloading S3 source', s3UniqueHash);
      if (err) {
        // console.log('--- 6 --- Error: file did not download!');
        res.send(500); //TODO: pick the right error for this!
      } else {
        // console.log('--- 6 --- File download success ', s3UniqueHash);
        getFileMetadata(downloadDestination)
        .then(function(filetype) {
          console.log('--- 1.5 --- Return metadata from ffprobe: ', filetype);
          // originalFormat = metadata.format.format_name;
          originalFilePath = downloadDestination;
          if (filetype === 'wav') {
            return downloadDestination;
          } else {
            return convertToWav(downloadDestination, s3UniqueHash, songID);
          }
        })
        .then(function(wp) {
          wavPath = wp;
          console.log('--- 2 --- Generate wavform array: ', wavPath);
          return generateWaveformArray(wavPath);
        })
        .then(function(adp) {
          console.log('--- 3 --- Get normalize boost data');
          amplitudeDataPath = adp;
          return getNormalizeBoostData(originalFilePath);
        })
        .then(function(nbd) {
          console.log('--- 3 --- Start normalize');
          normalizeBoostData = nbd;
          // normalize original file
          return normalize(originalFilePath, normalizeBoostData);
        })
        .then(function (nfp) {
          console.log('--- 4 --- Compress to MP3');
          normalizedFilePath = nfp;
          return compress(normalizedFilePath, s3UniqueHash, songID, amplitudeDataPath, normalizeBoostData);
        })
        .then(function(lowResInfo) {
          console.log('--- 5 --- Upload low res: ', lowResInfo);
          lowResFileName = lowResInfo.lowResFileName;
          lowResFilePath = lowResInfo.lowResFilePath;
          return uploadLowRes( lowResInfo.lowResFilePath, lowResInfo.lowResFileName, songID, amplitudeDataPath);
        })
        .then(function(amplitudeData) {
          console.log('--- 6 --- Send metadat to primary server!');
          return sendProcessedMetadata(lowResFileName, songID, amplitudeData);
        })
        .then(function(res) {
          console.log('--- 7 --- Delete all temp files DONE');
          deleteFile(originalFilePath);
          if (wavPath) {
            deleteFile(wavPath);
          }
          deleteFile(amplitudeDataPath);
          deleteFile(lowResFilePath);
          deleteFile(normalizedFilePath);

          console.log('--- 8 FINAL Promise success ---');
          cb();
        });
      }
    });

  });

  // console.log('--- 1.5 --- Adds ' + s3UniqueHash + ' to the queue');
  // console.log('--- 2 --- Check on length of queue at this time: ', downloadQueue.length);
  // console.log('--- 2.5 --- Check on running status: ', downloadQueue.running);
  if (downloadQueue.running === false) {
    // console.log('--- 3 --- Auto start queue!');
    startQueue();
  } else {
    // console.log('--- 3 --- Dont start queue right now');
  }
};

var getFileMetadata = function (path) {
  return new Promise(function(resolve, reject) {
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(path)[1];   // "txt"
    resolve(ext);
    // ffmpeg.ffprobe(path, function(err, metadata) {
    //   if (err) {

    //     reject(err);
    //   } else {
    //     // console.log('FORMAT', metadata);
    //     resolve(metadata);
    //   }
    // });
  });
};


var startQueue = function() {
  downloadQueue.start(function(err) {
    if (err) {
      // console.log('--- 4 --- DownloadQueueError');
    } else {
      // console.log('--- 4 --- DownloadQueue confirms starting');
    }
  });
};

var s3download = function(filename, dest, cb) {
  console.log('in s3download');
  var params = {Bucket: process.env.AWS_JAMRECORD_BUCKET, Key: 'audio/'+ filename};
 
  s3.getObject(params).
  on('httpData', function(chunk) {
    file.write(chunk);
  }).
  on('httpDone', function() {
   console.log('callback');
   file.end();
   cb();
  }).
  send();




 var file = require('fs').createWriteStream(dest);
  s3.getObject(params, function (err, data) {
      console.log('download done!')
      cb();
    }
  ).createReadStream().pipe(file)
  .on('httpDone', function() {
    console.log('s3 download ended?');
 //   cb();
  });
};

var download = function(url, dest, cb) {
  // var totalDownloaded = 0;
  var totalDownloaded = 0;
  var fileSize = 0;
  request
    .get(url, function(err, res) {
      if (err) {
        // console.log('--- --- S3 Download failed');
      } else {
        // console.log('--- --- S3 Download success');
        //cb();
      }
    })
    .on('response', function(res) {
      fileSize = res.headers['content-length'];
      console.log('--- --- Download response from AWS!', res.statusCode, fileSize);
    })
    .on('data', function(data) {
      totalDownloaded += data.length;
      percentDownloaded =  (totalDownloaded / fileSize);
      console.log('data', data);
      console.log('totalDownloaded', totalDownloaded, 'fileSize', fileSize, 'percentDownloaded', percentDownloaded);
      if (percentDownloaded >= 1.0) {
        cb();
      }
      // // console.log('S3 download progress:', percentDownloaded);
    })
    .on('end', function() {
 //     cb();
    })
    .pipe(fs.createWriteStream(dest));
};

var deleteFile = function(filePath) {
  // console.log('--- --- Attept delete');
  fs.unlink(filePath, function(err) {
    if (err) {
      // console.log('--- --- Delete errror!');
    } else {
      // console.log('--- --- Successfully deleted');
    }
  });
};

var convertToWav = function(hiResFilePath, s3UniqueHash, songID) {
  return new Promise(function(resolve, reject) {
    console.log('--- --- Prepare to convert to wav');

    var fileName = s3UniqueHash.split('.')[0];
    var tempWavFilename = fileName + '.wav';
    var tempWavPath = path.join(__dirname + '/../temp_audio/wav_temp/' + tempWavFilename);

    var ffmpegCommand = 'ffmpeg -i ' + hiResFilePath + ' ' + tempWavPath;
    exec(ffmpegCommand, function(err, stdout, stderr) {
      if (err) {
        console.log('--- TEST DOCKER ++++++++++++++++++++ --- ffmpeg convert to wave fails!', err);
        reject(err);
      } else {
        console.log('--- stdout --- ffmpeg Convert to wave finished: ', stdout);
        console.log('--- stderr --- ', stderr);
        resolve(tempWavPath);
      }
    });

    // Fluent ffmpeg is really not working with my docker image!

    // var anythingToWav = ffmpeg(hiResFilePath)
    //   .setFfmpegPath('/usr/local/bin/ffmpeg') // TODO: take this out
    //   // .audioCodec('libmp3lame')
    //   // .audioBitrate(256)
    //   // .audioQuality(0)
    //   // .audioChannels(2)
    //   .on('progress', function(progress) {
    //     // console.log('--- 6.6 --- Processing: ' + progress.percent + '% done');
    //   })
    //   .on('error', function(err, stdout, stderr) {
    //     console.log('--- --- Cannot converToWav: ', err.message);
    //     reject(err);
    //   })
    //   .on('end', function() {
    //     console.log('--- --- Finished convertToWav');
    //     // deleteFile(hiResFilePath);
    //     // generateWaveformArray(tempWavPath, s3UniqueHash, songID);
    //     resolve(tempWavPath);

    //     // uploadLowRes( lowResFilePath, tempWavFilename, songID );
    //   })
    //   .save( tempWavPath );

  // on end compress(downloadDestination, s3UniqueHash, songID)
  });
};

var generateWaveformArray = function(wavTempPath, s3UniqueHash, songID) {
  return new Promise(function(resolve, reject) {
    // console.log('--- 6.8 --- Generate waveformArray from temp wav');

    var cmd = 'wav2json ' + wavTempPath + ' -s 200 -p 3 --channels=max -n';
    var wavJsonDataPath = wavTempPath + '.json';

    exec(cmd, function(error, stdout, stderr) {
      // command output is in stdout
      console.log('--- generate waveform array ---', error, stdout, stderr);
      if (error) {
        // console.log('--- 6.9 ---', error);
        reject(error);
      } else {
        // console.log('--- --- else everything else no resoleve ');
        // console.log('--- stderr ---', stderr);
        // console.log('--- stdout ---', stdout);
        resolve(wavJsonDataPath);
      }
      // compress(wavTempPath, s3UniqueHash, songID, wavJsonDataPath);
    });
  });
};

var getNormalizeBoostData = function(hiResFilePath) {
  return new Promise(function(resolve, reject) {

    var getMaxFromString = function(string) {
      // recieve giant string from ffmpeg, parse out max_volume: data
      var maxVolumePosition = string.indexOf('max_volume:');
      var maxVolumeString = string.slice(maxVolumePosition + 13, maxVolumePosition + 13 + 4).trim();
      var maxVolumeFloat = parseFloat( maxVolumeString );
      return maxVolumeFloat;
    };

    var dbToBoost = 0;

    var ffmpegVolumeDetect = 'ffmpeg -i ' + hiResFilePath + ' -af volumedetect -f null /dev/null';
    exec(ffmpegVolumeDetect, function(err, stdout, stderr) {
      if (err) {
        // console.error('--- 7.4 --- ', err);
        reject(err);
      }
      dbToBoost = getMaxFromString(stderr);
      // console.log('--- 7.4 --- DB to boost', dbToBoost);
      
      resolve(dbToBoost);
    });
  });
};

var normalize = function(hiResFilePath, normalizeBoostData) {
  return new Promise(function(resolve, reject) {

    if (normalizeBoostData === 0) {
      console.log('--- --- Normalized reads a zero and returns without normalizing');
      resolve( hiResFilePath );
    }

    var volumeToBoost = 'volume=' + normalizeBoostData;
    // console.log('--- volume to boost ---', volumeToBoost);

    var normalizedPath = hiResFilePath + '.normalized.wav';

    var normalize = ffmpeg(hiResFilePath)
      .audioFilters(volumeToBoost)
      .on('end', function() {
        // console.log('--- 7 --- Normalize has occurred!');
        resolve(normalizedPath);
      })
      .on('progress', function(progress) {
        // console.log('--- Normalize progress --- ' + progress.percent + '% done');
      })
      .on('error', function(err, stdout, stderr) {
        // console.log('--- 7 --- Cannot normalize audio: ' + err.message);
        reject(err);
      })
      .save(normalizedPath);
  });
};

var compress = function(hiResFilePath, s3UniqueHash, songID, wavJsonDataPath, normalizeBoostData) {
  return new Promise(function(resolve, reject) {
    // console.log('--- 7 --- Get ready to read and compress the file!', normalizeBoostData);

    var fileName = s3UniqueHash.split('.')[0];
    var lowResFileName = fileName + '.mp3';
    var lowResFilePath = path.join(__dirname + '/../temp_audio/low_res_outbox/' + lowResFileName);


    var mp3Compress = ffmpeg(hiResFilePath)
      .audioCodec('libmp3lame')
      .audioBitrate(256)
      .audioQuality(0)
      .audioChannels(2)
      // .audioFilters('volume=' + getNormalizeBoostData)

      // .audioFilters(
      //   {
      //     filter: 'acompressor',
      //     options: {
      //       // level_in
      //         // Set input gain. Default is 1. Range is between 0.015625 and 64.
      //       // threshold
      //         // If a signal of second stream rises above this level it will affect the gain reduction of the first stream. By default it is 0.125. Range is between 0.00097563 and 1.
      //       ratio: 24,
      //         // Set a ratio by which the signal is reduced. 1:2 means that if the level rose 4dB above the threshold, it will be only 2dB above after the reduction. Default is 2. Range is between 1 and 20.
      //       // attack
      //         // Amount of milliseconds the signal has to rise above the threshold before gain reduction starts. Default is 20. Range is between 0.01 and 2000.
      //       // release
      //         // Amount of milliseconds the signal has to fall below the threshold before reduction is decreased again. Default is 250. Range is between 0.01 and 9000.
      //       // makeup
      //         // Set the amount by how much signal will be amplified after processing. Default is 2. Range is from 1 and 64.
      //       // knee
      //         // Curve the sharp knee around the threshold to enter gain reduction more softly. Default is 2.82843. Range is between 1 and 8.
      //       // link
      //         // Choose if the average level between all channels of input stream or the louder(maximum) channel of input stream affects the reduction. Default is average.
      //       // detection
      //         // Should the exact signal be taken in case of peak or an RMS one in case of rms. Default is rms which is mostly smoother.
      //       // mix
      //         // How much to use compressed signal in output. Default is 1. Range is between 0 and 1.
      //     }
      //   }
      // )

      .on('progress', function(progress) {
        // console.log('--- 8 --- Processing: ' + progress.percent + '% done');
      })
      .on('error', function(err, stdout, stderr) {
        // console.log('--- 8 --- Cannot process audio: ' + err.message);
        reject(err);
      })
      .on('end', function() {
        // console.log('--- 8 --- Finished processing');
        // deleteFile(hiResFilePath);
        resolve({lowResFilePath: lowResFilePath, lowResFileName: lowResFileName});
        // uploadLowRes( lowResFilePath, lowResFileName, songID, wavJsonDataPath);
      })
      .save( lowResFilePath );
  });
};

var uploadLowRes = function(filePath, fileName, songID, wavJsonDataPath) {
  // console.log('--- 9 --- Upload LowRes to S3', wavJsonDataPath);

  return new Promise(function(resolve, reject) {
    var amplitudeData = fs.readFileSync(wavJsonDataPath, 'utf8');

    // Optional server side waveform procession / normalization
    
    // amplitudeData = JSON.parse(amplitudeData);
    // var intAmplitudeArray = amplitudeData.max.map(function(element) {
    //   // console.log('Element:', element);
    //   element = Math.floor( element * 100 );
    //   return element
    // });
    // amplitudeData.max = intAmplitudeArray;
   
    // console.log('--- 9 --- Upload LowRes to S3');

    var putParams = {
      Key: 'audio/' + fileName,
      Bucket: awsConfig.bucket,
      Body: fs.createReadStream(filePath),
      ACL: 'public-read'
    };

    s3.putObject(putParams, function(err, data) {
      if (err) {
        // console.log('--- 10 --- S3 upload: ', err);
        reject(err);
      } else {
        // console.log('--- 10.5 --- Successfully uploaded data to ', awsConfig.bucket);
        // console.log('--- 10.6 --- Delete this mp3: ', filePath);
        // deleteFile(filePath);
        // deleteFile(wavJsonDataPath);
        resolve(amplitudeData);
      }
    });
  });
};

var sendProcessedMetadata = function(fileName, songID, amplitudeData) {
  return new Promise( function( resolve, reject ) {

    // console.log('--- 11 --- Send request to primary server to save compressed Ref into DB');

    // var dateRecorded = 23432342343;
    // var dateUploaded = 23432343234;
    // var groupId = 1;
    // var name = 'Test name';
    // var description = '';
    // var size = 234556;
    // var awsBucketAddress = fileName;
    // var uniqueHash = '234';
    // var duration = 123455;

    var primaryServerRoute = serverConfig.primaryServer + '/api/addCompressedLink/secret';
    // console.log('--- 11.3 --- Attempt DB call to: ', primaryServerRoute);
    // console.log('--- 11.4 --- SongID: ', songID);
    // console.log('--- 11.5 --- compressedID: ', fileName);

    // console.log('--- 11.5 --- primaryServerRoute: ', primaryServerRoute, songID, fileName);
    request.post(
      primaryServerRoute,
      {
        json: {
          songID: songID,
          compressedID: fileName,
          amplitudeData: amplitudeData
        }
      },
      function(err, res, body) {
        if (!err && res.statusCode === 200) {
          // console.log('--- 11.6 --- Success putting comprssed link to Primary DB: ');
          resolve(res);
        } else {
          // console.log('--- 11.6 --- Error putting comprssed link to Primary DB: ', err);
          reject(err);
        }
      }
    );
  });
};

module.exports = {
  addToQueue: addToQueue
};

