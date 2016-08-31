var config = require('../../../server/config/config');
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var sinon = require('sinon');
var db = require('../../../server/db/database');
var testHelpers = require('../testHelpers.js');

var UserModel = require('../../../server/models/userModel');

describe('Clear the test datbase and make sure it worked!', function() {
  before(function(done) {
    // double check that you are not reseting the production database! This may not work on the server, remove second conditional if that is the case
    if (process.env.JAMRUN === 'test' && config.connectionString === 'postgres://localhost:5432/jamstest') {
      testHelpers.rebuildDb(function() {
        done();
      });
    }
  });

  it('there should be no Users', function() {
    db.User.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
    });
  });
  it('there should be no Groups', function() {
    db.Group.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
    });
  });
  it('there should be no Songs', function() {
    db.Song.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
    });
  });
  it('there should be no Playlists', function() {
    db.Playlist.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
    });
  });
  it('there should be no Comments', function() {
    db.Comment.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
    });
  });
  it('there should be no UserGroups', function() {
    db.UserGroups.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
    });
  });
  it('there should be no PlaylistSongs', function() {
    db.PlaylistSongs.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
    });
  });
});

describe('Adding Users', function() {
  it('should add one user', function() {

    console.log('Add one user');

    UserModel.createUser('test@gmail.com', 'testUser1', 'testpassword')
    .then(function(res) {
      console.log('res: ', res.dataValues)
    })

    expect(true).to.equal(false);

  });
});

