var CommentModel = require('../models/commentModel');

var addComment = function (req, res, next) {
  var time = req.body.time;
  var note = req.body.note;
  var userId = req.body.userId;
  var songId = req.params.id;

  CommentModel.addComment(userId, songId, time, note)
  .then(function(comment) {
    res.json(comment);
  })
  .catch(function(err) {
    next(err);
  });
};

var deleteComment = function (req, res, next) {
  var commentId = req.params.id;

  CommentModel.deleteComment(commentId)
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
