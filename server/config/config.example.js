// Copy the contents of this file into a new file named config.js
// and complete commented lines
var port = 3000;

var connectionString = 'postgres://:5432/jams';
var testConnectionString = 'postgres://:5432/jamstest';
var JWT_SECRET = 'not_telling_you';
var mailgun = {
  api_key: 'KEY',
  domain: 'DOMAIN'
};
var compressionServer = process.env.COMPRESSION_SERVER || 'http://localhost:4000';

module.exports = {
  port: port,
  JWT_SECRET: JWT_SECRET,
  connectionString: connectionString,
  testConnectionString: testConnectionString,
  mailgun: mailgun,
  compressionServer: compressionServer
};
