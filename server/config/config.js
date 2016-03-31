var port = process.env.JAMRECORD_PORT;

var connectionString;

if (process.env.JAMRUN === 'test') {
  connectionString = process.env.JAMRECORD_TEST_CONNECTION_STRING;
} else if (process.env.JAMRUN === 'production') {
  connectionString = process.env.JAMRECORD_PRODUCTION_CONNECTION_STRING;
} else if (process.env.JAMRUN === 'development') {
  connectionString = process.env.JAMRECORD_DEV_CONNECTION_STRING;
}

var COMPRESSION_SERVER = process.env.COMPRESSION_SERVER;

var JWT_SECRET = process.env.JAMRECORD_JWT_SECRET;
var mailgun = {
  'api_key': process.env.JAMRECORD_MAILGUN_API_KEY,
<<<<<<< 1087ef5cac1f6b92ee3ec754e546cd3253258db6
  domain: process.env.JAMRECORD_MAILGUN_DOMAIN
=======
  'domain': process.env.JAMRECORD_MAILGUN_DOMAIN
>>>>>>> (feat) normalization
};

module.exports = {
  mailgun: mailgun,
  port: port,
  JWT_SECRET: JWT_SECRET,
  connectionString: connectionString,
  COMPRESSION_SERVER: COMPRESSION_SERVER
};