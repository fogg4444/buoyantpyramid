var Busboy = require('busboy');

var path = require('path');
var os = require('os');
var fs = require('fs');
var AWS = require('aws-sdk');

var s3 = new AWS.S3();
AWS.config.update({accessKeyId: 'AKIAIIIRPCLLGTLJGNZQ', secretAccessKey: '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'});

// console.log(AWS);
// console.log(s3)


var getS3Data = function(req, res) {
  console.log('Get s3 data', req);

  // SIGNED URL GENERATION:
  // var s3_params = {
  //   Bucket: 'jamrecord',
  //   Key: 'file_name',
  //   ContentType: 'multipart/form-data',
  //   Expires: 10000
  // };

  // s3.getSignedUrl('putObject', s3_params, function(err, data){
  //   if (err) {
  //     console.log('S3 signing error: ', err);
  //     return;
  //   }
  //   console.log('Response from amazon', data);
  // });
};





var catchUpload = function(req, res, next) {
  var busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    
    var saveTo = path.join(__dirname + '/../uploadInbox/' + filename);
    // console.log(saveTo);

    file.pipe(fs.createWriteStream(saveTo));

    // console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    
    // file.on('data', function(data) {
    //   console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    // });
    
    file.on('end', function() {
      console.log('File [' + fieldname + '] Finished');
      req.filename = filename;
      next();
    });
  });
  
  // busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
  //   console.log('Field [' + fieldname + ']: value: ' + inspect(val));
  // });

  busboy.on('finish', function() {
    console.log('Done Uploading Files!');
    // res.writeHead(303, { Connection: 'close', Location: '/' });
    res.end();
  });
  req.pipe(busboy);

  // console.log('Catch upload: ================================', busboy);
};

module.exports = {
  catchUpload: catchUpload,
  getS3Data: getS3Data
};