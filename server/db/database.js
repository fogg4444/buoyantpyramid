var config = require('../config/config.js'); 
var pg = require('pg');
var Sequelize = require('sequelize');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


var connectionString = (process.env.NODE_ENV === 'test') ? config.testConnectionString : config.connectionString;
var sqldebug = process.env.SQL_DEBUG || false;
var db = new Sequelize(connectionString, {logging: sqldebug});

// Define table schemas
var User = db.define('user', {
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
  avatarURL: {
    type: Sequelize.STRING,
    defaultValue: '' // Change to random default on signup
  },
  currentGroupId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, {
  classMethods: {
    hashPassword: function(password) {
      var hashAsync = Promise.promisify(bcrypt.hash);
      return hashAsync(password, null, null).bind(this);
    } 
  },
  instanceMethods: {
    comparePassword: function(attemptedPassword) {
      var compareAsync = Promise.promisify(bcrypt.compare);
      return compareAsync(attemptedPassword, this.password);
    } 
  },
  hooks: {
    beforeCreate: function(user, options) {
      return this.hashPassword(user.password)
        .then(function(hash) {
          user.password = hash;
        });
    },
  }
});

var Group = db.define('group', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  bannerUrl: {
    type: Sequelize.STRING,
    defaultValue: 'http://i.imgur.com/QI8f5gx.jpg' // Update
  }
});

var Song = db.define('song', {
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
    allowNull: true
  },
  dateUploaded: {
    type: Sequelize.DATE,
    allowNull: true
  },
  size: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  uniqueHash : {
    type: Sequelize.STRING,
    allowNull: false
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'http://i.imgur.com/QI8f5gx.jpg' // Update
  },
  imageUrl: {
    type: Sequelize.STRING,
    defaultValue: 'http://i.imgur.com/QI8f5gx.jpg' // Update
  }
});

var Playlist = db.define('playlist', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
  }
});

var Comment = db.define('comment', {
  time: {
    type: Sequelize.INTEGER
  },
  note: {
    type: Sequelize.STRING
  }
});

// Define join tables
var UserGroups = db.define('userGroups', {
  role: {
    type: Sequelize.STRING,
  }}, 
  {timestamps: false}
);

var PlaylistSongs = db.define('playlistSongs', {
  listPosition: {
    type: Sequelize.INTEGER,
  }}
);

// Define associations
Group.belongsToMany(User, {through: 'userGroups'});
User.belongsToMany(Group, {through: 'userGroups'});

Group.hasMany(Song);
Song.belongsTo(Group);

Group.hasMany(Playlist);
Playlist.belongsTo(Group);

Playlist.belongsToMany(Song, {through: 'playlistSongs'});
Song.belongsToMany(Playlist, {through: 'playlistSongs'});

User.hasMany(Comment);
Comment.belongsTo(User);

Song.hasMany(Comment);
Comment.belongsTo(Song);


var logSync = false; //(process.env.NODE_ENV === 'test') ? false : console.log;

// Sync models to define postgres tables and capture associations
User.sync()
  .then(function() {
    return Group.sync();
  })
  .then(function() {
    return Playlist.sync();
  })
  .then(function() {
    return Song.sync();
  })
  .then(function() {
    return UserGroups.sync();
  })
  .then(function() {
    return PlaylistSongs.sync();
  })
  .then(function() {
    return Comment.sync();
  });

module.exports = {
  db: db,
  User: User,
  Group: Group,
  UserGroups: UserGroups,
  Song: Song,
  Playlist: Playlist,
  PlaylistSongs: PlaylistSongs,
  Comment: Comment
};

// Command to drop all tables in postgres
// drop table users cascade; drop table groups cascade; drop table users; drop table groups; drop table "userGroups"; drop table playlists; drop table songs cascade; drop table "playlistSongs";
