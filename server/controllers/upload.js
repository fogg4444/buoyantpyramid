var Busboy = require('busboy');

var path = require('path');
var os = require('os');
var fs = require('fs');
var AWS = require('aws-sdk');



var s3 = new AWS.S3();

// console.log(AWS);
// console.log(s3)

var getUrlVars = function(input) {
  var vars = {};
  var parts = input.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
  function(m,key,value) {
    vars[key] = value;
  });
  return vars;
};

var getS3Data = function(req, res) {
  console.log('Get s3 data');
  var uniqueFilename = req.body.uniqueFilename;
  console.log(uniqueFilename, req.body);

  // SIGNED URL GENERATION:


  var s3_params = {
    Bucket: 'jamrecord',
    Key: uniqueFilename,
    ContentType: 'multipart/form-data',
    Expires: 10000
  };

  s3.getSignedUrl('putObject', s3_params, function(err, customUrl){
    if (err) {
      console.log('S3 signing error: ', err);
      res.status(500).send(err);

      return;
    }
    console.log('Response from aws', customUrl);
    res.send(customUrl);
  });
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