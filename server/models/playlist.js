var db = require('../db/database');
var Group = db.Group;
var Playlist = db.Playlist;
var Song = db.Song;

var createPlaylist = function(req, res) {
  var groupId = req.body.groupId;
  Playlist.create({
    title: req.body.title,
    description: req.body.description,
    groupId: groupId
  },
  {include: {
    model: Group}
  }).then(function(playlist) {
    res.send(JSON.stringify(playlist));
  })
  .catch(function(err) {
    res.send(err);
  });
};

module.exports = {
  createPlaylist: createPlaylist
  // addSong: addSong
};
