var db = require('../db/database');
var Song = db.Song;
var User = db.User;
var Tag = db.Tag;

var addSong = function (req, res, next) {
	var time = req.body.time;
  var note = req.body.note;
  var userId = req.body.userId;
  var songId = req.params.id;

  Tag.create({
    time: time,
    note: note,
    userId: userId,
    songId: songId
  }, {
    include: {
      model: Song,
      model: User
    }
  })
  .then(function(song) {
    res.json(song);
  })
  .catch(function(err) {
    next(err);
  });
};

var deleteSong = function (req, res, next) {
};

module.exports = {
  addTag: addTag,
  deleteTag: deleteTag
};
