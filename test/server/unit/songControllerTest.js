var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var Sequelize = require('sequelize');
var dbModels = require('../../../server/db/database.js');
var Song = dbModels.Song; 
var GroupController = require('../../../server/models/group.js');
var SongController = require('../../../server/models/song.js');
dbModels.db.options.logging = false;

// The `clearDB` helper function, when invoked, will clear the database
var clearDB = function (done) {
  dbModels.db.query('DELETE from SONGS where true')
    .spread(function(results, metadata) {
      done();
    });
};


var songReq = {
  body: {
    title: 'Margaritaville',
    description: 'Wasted again',
    groupId: '1'
  }
};

var groupReq = {
  body: {
    name: 'Safety Talk'
  }
};

describe('Song Controller', function () {

  // Connect to database before any tests
  before(function (done) {
    var res = {};
    res.json = function(jsonresponse) {
      console.log(JSON.stringify(jsonresponse));
      songReq.body.groupId = jsonresponse.id;
      done();
    };

    Song.sync({force: true})
      .then(function() {
        GroupController.createGroup(groupReq, res);
        // done();
      });
  });

  describe ('add song', function() {
  // Clear database before each test and then seed it with example `users` so that you can run tests
    beforeEach(function (done) {
      clearDB(function () {
        done();
      });
    });
    it('should call res.json to return a json object', function (done) {

      var res = {};

      // make my own damn spy
      res.json = function(jsonresponse) {
        expect(jsonresponse).to.have.property('title');
        done();
      };

      res.send = function(err) {
        console.error(err);
      };
      // var spy = res.json = sinon.stub();
      SongController.addSong(songReq, res);
    });


    it('should create a new song in the database', function (done) {
      var res = {};
      res.send = function(err) {
        console.error(err);
      };
      res.json = function(jsonresponse) {
        dbModels.db.query('SELECT * FROM songs WHERE title = :title ', { replacements: {title: songReq.body.title}, type: Sequelize.QueryTypes.SELECT})
        .then( function(songs) {
          expect(songs[0].title).to.equal(songReq.body.title);
          done();
        });
      };
      SongController.addSong(songReq, res, function() {});
    });
  });
});