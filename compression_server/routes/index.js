var express = require('express');
var router = express.Router();
var helpers = require('../helper_functions/audioProcessing.js');

/* GET home page. */
router.get('/', helpers.startQueue, function(req, res, next) {
  console.log('Recieves request to root route');
  res.send('Done downloading');
});

// Handle compression request
router.post('/compress', helpers.addToQueue, function(req, res, next) {

  // console.log('Request body data: ', req.body);

  res.send('Compress Success!');
});



module.exports = router;
