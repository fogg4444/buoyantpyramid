var db = require('../db/database');
var Song = db.Song;
var Group = db.Group;

var addSong = function(req, res, next) {
  var groupId = req.params.id;
  Song.create({
    title: req.body.title,
    description: req.body.description,
    dateRecorded: Date.now(), // TODO: Receive from UI?
    duration: 100, // TODO: Receive from UI?
    // TODO: Add address and imageURL
    groupId: groupId
  },
  {include: {
    model: Group}
  }).then(function(song) {
    res.json(song);
  })
  .catch(function(err) {
    next(err);
  });
};

module.exports = {
  addSong: addSong
};
