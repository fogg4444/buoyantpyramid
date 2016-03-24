var db = require('../db/database');
var Song = db.Song;
var User = db.User;
var Comment = db.Comment;

var addComment = function (userId, songId, time, note) {
  return Comment.create({
    time: time,
    note: note,
    userId: userId,
    songId: songId
  }, {
    include: {
      model: Song,
      model: User
    }
  });
};

var deleteComment = function (commentId) {
  return Comment.findById(commentId);
};



module.exports = {

};