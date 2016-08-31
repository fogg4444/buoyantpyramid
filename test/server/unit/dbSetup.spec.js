var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var sinon = require('sinon');
var db = require('../../../server/db/database');
var testHelpers = require('../testHelpers.js');


testHelpers.rebuildDb(function() {
  db.User.findAll().then(function(res) {
    console.log('res', res);
  });
});

describe('DB setup fresh', function() {
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