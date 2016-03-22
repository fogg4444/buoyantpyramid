var express = require('express');
var router = express.Router();
var helpers = require('../helper_functions/audioProcessing.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('Recieves request to root route');
  res.send('Server chillin');
});

// Handle compression request
router.post('/compress', helpers.downloadS3Source, function(req, res, next) {

  // console.log('Request body data: ', req.body);

  res.send('Compress Success!');
});



module.exports = router;
