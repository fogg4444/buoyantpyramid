var expect = require('chai').expect;
var Sequelize = require('sequelize');
var dbModels = require('../../../server/db/database.js');
var User = dbModels.User; 
// var User = require('../../../server/users/userModel.js');
dbModels.db.options.logging = false;
// wait for db to connect?
describe('User Model', function () {
  beforeEach(function (done) {
    User.sync()
      .then(function() {
        return dbModels.db.query('DELETE from USERS where true');
      })
      .spread(function(results, metadata) {
        done();
      });
  });
  it('User should be a Sequelize model', function () {
    expect(User).to.be.instanceOf(Sequelize.Model);
  });
  
  it('should have a schema', function (done) {
    User.describe().then(function(schema) {
      expect(Object.keys(schema).length).to.be.above(0);
      done();
    });
  });
});
