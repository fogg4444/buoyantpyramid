// Copy the contents of this file into a new file named config.js
// and complete commented lines
var port = 3000;

var connectionString = 'postgres://localhost:5432/jams';
var testConnectionString = 'postgres://localhost:5432/jamstest';
var JWT_SECRET = 'not_telling_you';
var mailgun = {
  api_key: 'KEY',
  domain: 'DOMAIN'
};

module.exports = {
  port: port,
  JWT_SECRET: JWT_SECRET,
  connectionString: connectionString,
  testConnectionString: testConnectionString,
  mailgun: mailgun
};
