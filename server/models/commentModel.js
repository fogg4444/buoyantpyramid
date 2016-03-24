var db = require('../db/database');
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

var getComment = function (commentId) {
  return Comment.findById(commentId);
};

module.exports = {
  addComment: addComment,
  getComment: getComment
};
