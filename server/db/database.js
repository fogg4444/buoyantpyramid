var config = require('../config/config.js'); 
var Sequelize = require('sequelize');

var User = config.db.define('user', {
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {isEmail: {msg: 'Invalid email'}}
  },
  displayName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  salt: Sequelize.STRING,
  avatarURL: {
    type: Sequelize.STRING,
    defaultValue: "" // Complete
  }
});

User.sync();

module.exports = {
  User: User
};