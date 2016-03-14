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

var Group = config.db.define('group', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  bannerUrl: {
    type: Sequelize.STRING,
    defaultValue: 'http://imgur.com/gallery/QI8f5gx' // Update
  }
});

var Song = config.db.define('song', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  dateRecorded: {
    type: Sequelize.DATE,
    allowNull: false
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'http://imgur.com/gallery/QI8f5gx' // Update
  },
  imageUrl: {
    type: Sequelize.STRING,
    defaultValue: 'http://imgur.com/gallery/QI8f5gx' // Update
  }
});

User.sync()
  .then(Group.sync())
  .then(Song.sync())

module.exports = {
  User: User,
  Group: Group
};