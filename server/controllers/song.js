var db = require('../db/database');
var Song = db.Song;
var Group = db.Group;

var addSong = function(req, res, next) {
  var dateRecorded = req.body.dateRecorded || Date.now();
  var groupId = req.params.id;
  var title = req.body.title;
  var description = req.body.description;

  Song.create({
    title: title,
    description: description,
    dateRecorded: dateRecorded, // TODO: Receive from UI?
    duration: 100, // TODO: Receive from UI?
    // TODO: Add address and imageURL
    groupId: groupId
  }, {
    include: {
      model: Group
    }
  })
  .then(function(song) {
    res.json(song);
  })
  .catch(function(err) {
    next(err);
  });
};

module.exports = {
  addSong: addSong
};
