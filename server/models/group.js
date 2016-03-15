var db = require('../db/database');
var Group = db.Group;
var Song = db.Song;
var User = db.User;

var createGroup = function(req, res) {
  Group.create({
    name: req.body.name
    // TODO: Add banner
  }).then(function(group) {
    res.send(JSON.stringify(group));
  })
  .catch(function(err) {
    res.send(err);
  });
};

var fetchSongs = function(req, res) {
  Group.findAll({
    where: {
      id: req.params.id
    },
    include: {model: Song},
    raw: true})
  .then(function(group) {
    var songs = group.map(function(song) {
      return song['songs.title'];
    });
    res.send(JSON.stringify(songs));
  })
  .catch(function(err) {
    res.send(err);
  });
};

var addUser = function(req, res) {
  // roles:
  //  admin, member, pending
  var role = req.body.role;
  var groupId = req.body.groupId;
  var userId = req.body.userId;
  Group.findOne({where: {id: groupId}})
  .then(function(group) {
    User.findOne({id: userId})
    .then(function(user) {
      group.addUser(user, {role: role});
      res.send(JSON.stringify(user));
    });
  })
  .catch(function(err) {
    res.send(err);
  });
};


module.exports = {
  createGroup: createGroup,
  fetchSongs: fetchSongs,
  addUser: addUser
};
