var db = require('../db/database');
var Song = db.Song;
var User = db.User;
var Tag = db.Tag;

var addSong = function(req, res, next) {
};

module.exports = {
  addTag: addTag,
  deleteTag: deleteTag
};
