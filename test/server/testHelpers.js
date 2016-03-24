var dbModels = require('../../server/db/database.js');
var Song = dbModels.Song; 
var User = dbModels.User; 
var Group = dbModels.Group; 
var Playlist = dbModels.Playlist;
var PlaylistSongs = dbModels.PlaylistSongs;
var UserGroups = dbModels.UserGroups; 
dbModels.db.options.logging = false;


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


module.exports = {
  rebuildDb: rebuildDb
};