var express = require('express');
var router = express.Router();
var audioProcessing = require('../helper_functions/audioProcessing.js');
var serverAuth = require('../helper_functions/serverAuth.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('---Recieves request to root route');
  res.send('Server online');
});

// Handle compression request
// add 'serverAuth' middleware in here
router.post('/compress', audioProcessing.addToQueue);

module.exports = router;