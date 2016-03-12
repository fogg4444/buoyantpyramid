var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var mongoose = require('mongoose');
var UserController = require('../../../server/users/userController.js');
var User = require('../../../server/users/userModel.js');

var dbURI = 'mongodb://localhost/testDB';

// The `clearDB` helper function, when invoked, will clear the database
var clearDB = function (done) {
  mongoose.connection.collections.users.remove(done);
};

describe('User Controller', function () {

  // Connect to database before any tests
  before(function (done) {
    if (mongoose.connection.db) {
      return done();
    }
    mongoose.connect(dbURI, done);
  });

  // Clear database before each test and then seed it with example `users` so that you can run tests
  beforeEach(function (done) {
    clearDB(function () {
      // var users = [
      //   {
      //     username: 'nick',
      //     password: 'nickspassword'
      //   },
      //   {
      //     name: 'sondra',
      //     email: 'sondraspassword'
      //   },
      //   {
      //     name: 'brian',
      //     email: 'brianspassword'
      //   },
      //   {
      //     name: 'erick',
      //     email: 'erickspassword'
      //   },
      // ];

      // // See http://mongoosejs.com/docs/models.html for details on the `create` method
      // User.create(users, done);
      done();
    });
  });
  describe ('sign in', function() {
    it('should respond to valid input with a jwt token in a json object', function (done) {
      var req = {
        body: {
          username: 'jake',
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
  });
});
