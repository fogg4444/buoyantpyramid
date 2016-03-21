'use strict';
var Busboy = require('busboy');
var path = require('path');
var os = require('os');
var fs = require('fs');
var AWS = require('aws-sdk');
var crypto = require('crypto');
var config = require('../config/aws.json');

var getExpiryTime = function () {
    var _date = new Date();
    return '' + (_date.getFullYear()) + '-' + (_date.getMonth() + 1) + '-' +
        (_date.getDate() + 1) + 'T' + (_date.getHours() + 3) + ':' + '00:00.000Z';
};

var createS3Policy = function (contentType, callback) {
  var date = new Date();
  var s3Policy = {
    'expiration': getExpiryTime(),
    'conditions': [
      ['starts-with', '$key', 's3UploadExample/'],
      {'bucket': config.bucket},
      {'acl': 'public-read'},
      ['starts-with', '$Content-Type', contentType],
      {'success_action_status' : '201'}
    ]
  };

  // stringify and encode the policy
  var stringPolicy = JSON.stringify(s3Policy);
  var base64Policy = new Buffer(stringPolicy, 'utf-8').toString('base64');

  // sign the base64 encoded policy
  var signature = crypto
    .createHmac('sha1', config.secretAccessKey)
    .update(new Buffer(base64Policy, 'utf-8'))
    .digest('base64');

  // build the results object
  var s3Credentials = {
    s3Policy: base64Policy,
    s3Signature: signature,
    AWSAccessKeyId: config.accessKeyId,
    bucketName: config.bucket,
    region: config.region
  };

  callback(s3Credentials);
};

var getS3Policy = function (req, res) {
  createS3Policy(req.body.fileType, function (creds, err) {
    if (!err) {
      console.log('No error creating s3 policy: ', creds)
      return res.status(200).send(creds);
    } else {
      console.log('Error creating s3 policy');
      return res.status(500).send(err);
    }
  });
};

var catchUpload = function (req, res, next) {
  var busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    var saveTo = path.join(__dirname + '/../uploadInbox/' + filename);
    file.pipe(fs.createWriteStream(saveTo));

    // console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    
    // file.on('data', function(data) {
    //   console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    // });
    
    file.on('end', function () {
      console.log('File [' + fieldname + '] Finished');
      req.filename = filename;
      next();
    });
  });
  
  // busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
  //   console.log('Field [' + fieldname + ']: value: ' + inspect(val));
  // });

  busboy.on('finish', function () {
    console.log('Done parsing form!');
    res.writeHead(303, { Connection: 'close', Location: '/' });
    res.end();
  });
  req.pipe(busboy);
};

module.exports = {
  catchUpload: catchUpload,
  getS3Data: getS3Policy
};