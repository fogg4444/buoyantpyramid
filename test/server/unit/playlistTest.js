var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var Sequelize = require('sequelize');
var dbModels = require('../../../server/db/database.js');
var Playlist = dbModels.Playlist;
var Group = dbModels.Group;
var SongController = require('../../../server/controllers/song.js');
var GroupController = require('../../../server/controllers/groupController.js');
var PlaylistController = require('../../../server/controllers/playlist.js');
dbModels.db.options.logging = false;

// Define api request bodies
var songReq = {
  body: {
    title: 'Margaritaville',
    description: 'Wasted again',
  },
  params: {
    id: 1
  },
  filename: 'buffet.mp3'
};


var addSongReq = {
  body: {
    songId: 1,
    playlistId: 1
  }
};

var playlistReq = {
  body: {
    title: 'Chill Vibes',
    description: 'Indie Electronic',
  },
  params: {
    groupId: 1
  }
};

// The `clearDB` helper function, when invoked, will clear the database
var clearDB = function(done) {
  var res = {
    json: function() {
      done();
    }
  };
  // dbModels.db.query('DELETE from PLAYLISTS where true')
  //   .spread(function(results, metadata) {
  //     done();
  //   });

  // done();
};

describe('Playlist Controller', function() {
  // Connect to database before any tests
  before(function(done) {
    var res = {};

    res.json = function(jsonresponse) {
      done();
    };

    Playlist.sync({ force: true })
      .then(function() {
        Group.create({name: 'Buoyant Pyramid'});
      })
      .then(function() {
        SongController.addSong(songReq, {json: function() {}}, console.error);
      })
      .then(function() {
        PlaylistController.createPlaylist(playlistReq, res, console.error);
      });
  });

  describe('create playlist', function() {
    // Clear database before each test and then seed it with example `users` so that you can run tests
    beforeEach(function(done) {
      clearDB(function() {
        done();
      });
      done();
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
      // var spy = res.json = sinon.stub();
      PlaylistController.createPlaylist(playlistReq, res, console.error);
    });

    it('should add a song to a playlist', function (done) {
      var res = {};

      res.json = function(jsonresponse) {
        expect(jsonresponse[0]).to.eql(1);
        done();
      };

      res.send = function(err) {
        console.error(err);
      };
      // var spy = res.json = sinon.stub();
      PlaylistController.addSong(addSongReq, res, console.error);
    });

    it('should fetch songs from a playlist', function (done) {
      var res = {};

      res.json = function(jsonresponse) {
        // var songs = JSON.parse(jsonresponse);
        expect(jsonresponse[0].title).to.eql('Margaritaville');
        done();
      };

      res.send = function(err) {
        console.error(err);
      };
      // var spy = res.json = sinon.stub();
      PlaylistController.fetchSongs({params: {id: 1}}, res, console.error);
    });
  });
});
