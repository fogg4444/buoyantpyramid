var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var Sequelize = require('sequelize');
var dbModels = require('../../../server/db/database.js');
var PlaylistSchema = dbModels.Playlist;
var Group = dbModels.Group;
var SongController = require('../../../server/controllers/songController.js');
var GroupController = require('../../../server/controllers/groupController.js');
var PlaylistController = require('../../../server/controllers/playlistController.js');
var helpers = require('../testHelpers');

// Define api request bodies
var songReq = {
  body: {
    name: 'Margaritaville',
    description: 'Wasted again',
    uniqueHash: 'asdfbbrkdjgf.wav',
    address: ' https://jamrecordtest.s3.amazonaws.com/audio/88408bec-a2b3-464a-9108-a3284da79f65.mp3',
    size: 9238148
  },
  params: {
    id: 1
  },
};


var addSongReq = {
  params: {
    sid: 1,
    pid: 1
  }
};

var playlistReq = {
  body: {
    title: 'Chill Vibes',
    description: 'Indie Electronic',
    groupId: 1
  }
};

// The `clearDB` helper function, when invoked, will clear the database
var clearDB = function(done) {
  var res = {
    json: function(jsonresponse) {
      // console.log('playlist response: ' + JSON.stringify(jsonresponse));
      done();
    }
  };
  helpers.rebuildDb(function() {
    Group.create({name: 'Buoyant Pyramid'})
    .then(function() {
      SongController.addSong(songReq, {json: function() {}}, console.error);
    })
    .then(function() {
      PlaylistController.createPlaylist(playlistReq, res, console.error);
    });
  });
};

describe('Playlist Controller', function() {

  describe('create playlist', function() {
    // Clear database before each test and then seed it with example `users` so that you can run tests
    beforeEach(function(done) {
      clearDB(done);
    });

    it('should call res.json to return a json object', function (done) {
      var res = {};

      res.json = function(jsonresponse) {
        expect(jsonresponse).to.have.property('title');
        done();
      };

      res.send = function(err) {
        console.error(err);
      };
      PlaylistController.createPlaylist(playlistReq, res, console.error);
    });
  });
  describe('songs and playlists', function() {
    it('should add a song to a playlist', function (done) {
      var res = {};

      res.json = function(jsonresponse) {
        expect(jsonresponse.songId).to.equal(addSongReq.params.sid);
        expect(jsonresponse.playlistId).to.equal(addSongReq.params.pid);
        done();
      };

      res.send = function(err) {
        console.error(err);
      };
      PlaylistController.addSong(addSongReq, res, console.error);
    });

    it('should fetch songs from a playlist', function (done) {
      before(function(done) {
        dbModels.Playlist.addSong(addSongReq.params.sid, addSongReq.params.sid)
        .then(function () {
          done();
        }).catch(console.error);
      });

      var res = {};

      res.json = function(jsonresponse) {

        expect(jsonresponse[0].title).to.eql('Margaritaville');
        done();
      };

      res.send = function(err) {
        console.error(err);
      };
      PlaylistController.getSongs({params: {id: 1}}, res, console.error);
    });
  });
});
