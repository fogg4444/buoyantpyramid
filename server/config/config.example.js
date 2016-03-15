// Copy the contents of this file into a new file named config.js
// and complete commented lines
var port = 3000;

var connectionString = 'postgres://localhost:5432/jams';
var testConnectionString = 'postgres://localhost:5432/jamstest';

module.exports = {
  port: port,
  connectionString: connectionString,
  testConnectionString: testConnectionString
};
