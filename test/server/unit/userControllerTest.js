var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var Sequelize = require('sequelize');
var dbModels = require('../../../server/db/database.js');
var User = dbModels.User; 
var UserController = require('../../../server/models/user.js');
dbModels.db.options.logging = false;

// The `clearDB` helper function, when invoked, will clear the database
var clearDB = function (done) {
  User.sync()
      .then(function() {
        return dbModels.db.query('DELETE from USERS where true');
      })
      .spread(function(results, metadata) {
        done();
      });
};

describe('User Controller', function () {

  // Connect to database before any tests
  // before(function (done) {
  // });

  describe ('create user', function() {
  // Clear database before each test and then seed it with example `users` so that you can run tests
    beforeEach(function (done) {
      clearDB(function () {
        done();
      });
    });
    it('should call res.json to return a json object', function (done) {
      var req = {
        body: {
          email: 'jake@ooo.com',
          displayName: 'Jake',
          password: 'thedog'
        }
      };

      var res = {};

      // make my own damn spy
      res.json = function(jsonresponse) {
        expect(jsonresponse).to.have.property('email');
        done();
      };
      // var spy = res.json = sinon.stub();
      UserController.createUser(req, res);
    });


    it('should create a new user in the database', function (done) {
      var req = {
        body: {
          email: 'jake@ooo.com',
          displayName: 'Jake',
          password: 'thedog'
        }
      };

      var res = {};

      res.json = function(jsonresponse) {
        dbModels.db.query('SELECT * FROM users WHERE email = :email ', { replacements: {email: 'jake@ooo.com'}, type: Sequelize.QueryTypes.SELECT})
        .then( function(users) {
          expect(users[0].email).to.equal('jake@ooo.com');
          done();
        });
      };
      UserController.createUser(req, res, function() {});
    });

  });
  xdescribe ('sign up', function() {
    it('should respond to valid input with a jwt token in a json object', function (done) {
      var req = {
        body: {
          username: 'jake@ooo.com',
          password: 'thedog'
        }
      };

      var res = {};

      // make my own damn spy
      res.json = function(jsonresponse) {
        expect(jsonresponse).to.have.property('token');
        done();
      };
      // var spy = res.json = sinon.stub();
      UserController.signup(req, res, function() {});
    });

    it('should create a new user in the database', function (done) {
      var req = {
        body: {
          username: 'jake@ooo.com',
          password: 'thedog'
        }
      };

      var res = {};

      res.json = function(jsonresponse) {
        mongoose.connection.collections.users.findOne({username: 'jake@ooo.com'}, function(err, user) {
          expect(user.username).to.equal('jake@ooo.com');
          done();
        });
      };
      UserController.signup(req, res, function() {});
    });

    it('should not allow duplicate email addresses', function (done) {
      var req = {
        body: {
          username: 'jake@ooo.com',
          password: 'thedog'
        }
      };

      var res = {};

      // after one sign up, try to sign up with same email
      res.json = function(jsonresponse) {
        UserController.signup(req, res, function(err) {
          expect(err).to.be.instanceof(Error);
          done();
        });  
      };
      // var spy = res.json = sinon.stub();
      UserController.signup(req, res, function() {});
    });
  });
});