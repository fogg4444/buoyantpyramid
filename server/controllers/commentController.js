var Comment = require('../models/commentModel');

var addComment = function (req, res, next) {
  var time = req.body.time;
  var note = req.body.note;
  var userId = req.body.userId;
  var songId = req.params.id;

  Comment.addComment(userId, songId, time, note)
  .then(function(comment) {
    res.json(comment);
  })
  .catch(function(err) {
    next(err);
  });
};

var deleteComment = function (req, res, next) {
  var commentId = req.params.id;

  Comment.getComment(commentId)
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
