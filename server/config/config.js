var port = process.env.JAMRECORD_PORT;

if (process.env.JAMRUN === 'test') {
  var connectionString = process.env.JAMRECORD_TEST_CONNECTION_STRING;
} else if(process.env.JAMRUN === 'production') {
  var connectionString = process.env.JAMRECORD_PRODUCTION_CONNECTION_STRING;
} else if(process.env.JAMRUN === 'development') {
  var connectionString = process.env.JAMRECORD_DEV_CONNECTION_STRING;
}

var COMPRESSION_SERVER = process.env.COMPRESSION_SERVER;

var JWT_SECRET = process.env.JAMRECORD_JWT_SECRET;
var mailgun = {
  api_key: process.env.JAMRECORD_MAILGUN_API_KEY,
  domain: process.env.JAMRECORD_MAILGUN_DOMAIN
};

module.exports = {
  mailgun: mailgun,
  port: port,
  JWT_SECRET: JWT_SECRET,
  connectionString: connectionString,
  COMPRESSION_SERVER: COMPRESSION_SERVER
};