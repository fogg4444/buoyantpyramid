var dbModels = require('../../server/db/database.js');
var Song = dbModels.Song; 
var User = dbModels.User; 
var Group = dbModels.Group; 
var Playlist = dbModels.Playlist;
var PlaylistSongs = dbModels.PlaylistSongs;
var UserGroups = dbModels.UserGroups; 


dbModels.db.options.logging = console.log;

// rebuild test database
var rebuildDb = function (done) {
  User.sync({force: true})
  .then(function() {
    return UserGroups.sync({force: true});
  })
  .then(function() {
    return PlaylistSongs.sync({force: true});
  })
  .then(function() {
    return Group.sync({force: true});
  })
  .then(function() {
    return Playlist.sync({force: true});
  })
  .then(function() {
    return Song.sync({force: true});
  })
  .then(function() {
    done();
  });
};


// Define api request bodies
var songReq = {
  body: {
    name: 'Margaritaville',
    description: 'Wasted again',
    uniqueHash: 'asdfbbrkdjgf.wav',
    address: ' https://jamrecordtest.s3.amazonaws.com/audio/88408bec-a2b3-464a-9108-a3284da79f65.mp3',
    size: 9238148
  },
  params: {
    id: 1
  },
};

var groupReq = {
  body: {
    name: 'Safety Talk'
  }
};

var addSongReq = {
  params: {
    sid: 1,
    pid: 1
  }
};

var playlistReq = {
  body: {
    title: 'Chill Vibes',
    description: 'Indie Electronic',
    groupId: 1
  }
};




module.exports = {
  rebuildDb: rebuildDb,
  songReq: songReq,
  groupReq: groupReq, 
  addSongReq: addSongReq,
  playlistReq: playlistReq
};