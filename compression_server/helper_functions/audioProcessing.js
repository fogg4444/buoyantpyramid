var downloadS3Source = function(req, res, next) {
  console.log('Begin downloading S3 source');
  next();
};

module.exports = {
  downloadS3Source: downloadS3Source,
}