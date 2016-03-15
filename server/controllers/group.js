var db = require('../db/database');
var Group = db.Group;
var Song = db.Song;
var User = db.User;

var createGroup = function(req, res, next) {
  Group.create({
    name: req.body.name
    // TODO: Add banner
  }).then(function(group) {
    res.json(group);
  })
  .catch(function(err) {
    next(err);
  });
};

var fetchSongs = function(req, res, next) {
  var groupId = req.params.id;
  Group.findAll({
    where: {
      id: groupId
    },
    include: {model: Song},
    raw: true})
  .then(function(group) {
    var songs = group.map(function(song) {
      return song['songs.title'];
    });
    res.json(songs);
  })
  .catch(function(err) {
    next(err);
  });
};

var addUser = function(req, res, next) {
  // roles:
  //  admin, member, pending
  var role = req.body.role;
  var groupId = req.params.id;
  var userId = req.body.userId;
  Group.findOne({where: {id: groupId}})
  .then(function(group) {
    User.findOne({where: {id: userId}})
    .then(function(user) {
      group.addUser(user, {role: role});
      res.json(user);
    });
  })
  .catch(function(err) {
    next(err);
  });
};

var fetchUsers = function(req, res, next) {
  // roles:
  //  admin, member, pending
  var groupId = req.params.id;
  Group.findAll({where: {id: groupId},
    include: {model: User},
    raw: true})
  .then(function(group) {
    var users = group.map(function(group) {
      return group['users.displayName'];
    });
    res.json(users);
  })
  .catch(function(err) {
    next(err);
  });
};

module.exports = {
  createGroup: createGroup,
  fetchSongs: fetchSongs,
  addUser: addUser,
  fetchUsers: fetchUsers
};
