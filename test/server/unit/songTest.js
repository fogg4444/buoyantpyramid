var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var Promise = require('bluebird');
var Sequelize = require('sequelize');
var dbModels = require('../../../server/db/database.js');
var helpers = require('../testHelpers');
var Song = dbModels.Song; 
var Group = dbModels.Group; 
var GroupController = require('../../../server/controllers/groupController.js');
var SongModel = require('../../../server/models/songModel.js');
var SongController = require('../../../server/controllers/songController.js');

// The `clearDB` helper function, when invoked, will clear the database
var clearDB = function (done) {
  dbModels.db.query('DELETE from SONGS where true')
    .spread(function(results, metadata) {
      done();
    });
};


var songReq = helpers.songReq;
var groupReq = helpers.groupReq;

var compressStub;

describe('Song Controller', function () {

  // Connect to database before any tests
  before(function (done) {
    var res = {};
    res.json = function(jsonresponse) {
      songReq.params.groupId = jsonresponse.id;
      done();
    };
    helpers.rebuildDb(function() {
      GroupController.createGroup(groupReq, res);
    });

    compressStub = sinon.stub(SongModel, 'requestFileCompression', function() {
      return new Promise(function(resolve, reject) {
        resolve(true);
      });
    });
  });

  after(function (done) {
    compressStub.restore();
    done();
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
      res.json = function(jsonresponse) {
        console.log('jsonresponse is ' + JSON.stringify(jsonresponse));
        expect(jsonresponse).to.have.property('title');
        done();
      };

      res.send = function(err) {
        console.error(err);
      };
      SongController.addSong(songReq, res, console.error);
    });


    it('should create a new song in the database', function (done) {
      var res = {};
      res.send = function(err) {
        console.error(err);
      };
      res.json = function(jsonresponse) {
        dbModels.db.query('SELECT * FROM songs WHERE title = :title ', { replacements: {title: songReq.body.name}, type: Sequelize.QueryTypes.SELECT})
        .then( function(songs) {
          expect(songs[0].title).to.equal(songReq.body.name);
          done();
        });
      };
      SongController.addSong(songReq, res, function() {});
    });
  });
});