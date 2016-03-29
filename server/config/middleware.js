var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var morgan = require('morgan');
var path = require('path');

var middleware = function (app, express) {
  // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
  app.use(methodOverride('X-HTTP-Method-Override')); 
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname + '/../../client')));
};

module.exports = middleware;