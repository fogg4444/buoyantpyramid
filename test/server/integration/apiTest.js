var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var Sequelize = require('sequelize');
var dbModels = require('../../../server/db/database.js');
var User = dbModels.User;
var UserController = require('../../../server/controllers/user.js');

dbModels.db.options.logging = false;

var dbUser, jwtToken;

// Initialize db with one user before every test
var clearDB = function(done) {
  var req = {
    body: {
      email: 'finn@ooo.com',
      displayName: 'Finn',
      password: 'thehoomun'
    }
  };

  var res = {
    json: function(response) {
      dbUser = response.user;
      jwtToken = response.token;
      done();
    }
  };
  dbModels.db.query('DELETE from USERS where true')
  .spread(function(results, metadata) {
    UserController.signup(req, res, console.error);
  });
};


describe('API', function() {
  beforeEach(function(done) {
    clearDB(done);
  });

  xdescribe('profile', function() {
    it('should be able to fetch own profile', function(done) {
    });
    
    it('should throw a 401 with no jwt in header', function(done) {
    });

    it('should throw a 401 with a nonsense token', function(done) {

    });

    it('should be able to update own profile', function(done) {
    });
  });
});
