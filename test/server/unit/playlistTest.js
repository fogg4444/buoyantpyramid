var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var Sequelize = require('sequelize');
var dbModels = require('../../../server/db/database.js');
var Playlist = dbModels.Playlist;
var SongController = require('../../../server/controllers/song.js');
var GroupController = require('../../../server/controllers/group.js');
var PlaylistController = require('../../../server/controllers/playlist.js');
dbModels.db.options.logging = false;

var groupReq = {
  body: {
    name: 'Buoyant Pyramid'
  }
};

var songReq = {
  body: {
    title: 'Margaritaville',
    description: 'Wasted again',
  },
  params: {
    id: 1
  }
};

var playlistReq = {
  body: {
    name: 'Chill Vibes',
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
  dbModels.db.query('DELETE from USERS where true')
    .spread(function(results, metadata) {
      UserController.signup(dupeReq, res, console.error);
    });
};



describe('Playlist Controller', function() {

  // Connect to database before any tests
  before(function(done) {
    User.sync({ force: true })
      .then(function() {
        done();
      });
  });

  describe('create playlist', function() {
    // Clear database before each test and then seed it with example `users` so that you can run tests
    beforeEach(function(done) {
      clearDB(function() {
        done();
      });
    });
  });
});