var db = require('../db/database');
var Song = db.Song;
var User = db.User;
var Comment = db.Comment;

var addComment = function (req, res, next) {
	var time = req.body.time;
  var note = req.body.note;
  var userId = req.body.userId;
  var songId = req.params.id;

  Comment.create({
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
  .then(function(comment) {
    res.json(comment);
  })
  .catch(function(err) {
    next(err);
  });
};

var deleteComment = function (req, res, next) {
  var commentId = req.params.id;
  comment.findOne({where: {id: commentId}})
  .then(function(comment) {
    comment.destroy();
    res.json(comment);
  })
  .catch(function(err) {
    next(err);
  });
};

module.exports = {
  addComment: addComment,
  deleteComment: deleteComment
};
