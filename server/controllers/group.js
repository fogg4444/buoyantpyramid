var path = require('path');
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
  Group.findOne({where: {id: groupId}})
  .then(function(group) {
    group.getSongs()
    .then(function (songs) {
      res.json(songs);   
    });
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
  Group.findOne({where: {id: groupId}})
  .then(function(group) {
    group.getUsers()
    .then(function (users) {
      res.json(users);
    });
  })
  .catch(function(err) {
    next(err);
  });
};

var fetchPlaylists = function(req, res, next) {
  var groupId = req.params.id;
  Group.findOne({where: {id: groupId}})
  .then(function(group) {
    group.getPlaylists()
    .then(function (playlists) {
      res.json(playlists);
    });
  })
  .catch(function(err) {
    next(err);
  });
};

var updateGroupInfo = function(req, res, next) {

  Group.update(req.body, {
    where: {
      id: req.body.id
    },
    returning: true
  })
  .then(function(result) {
    res.json(result[1][0]);
  })
  .catch(function(error) {
    next(error);
  });
};

var getBanner = function(req, res, next) {
  var groupId = parseInt(req.params.id);
  Group.findById(groupId)
  .then(function(group) {
    if (group) {
      var url = path.resolve(__dirname + '/../uploadInbox/' + group.bannerUrl);
      res.sendFile(url);
    } else {
      res.status(404).send('group doesn\'t exist');
    }
  })
  .catch(function(error) {
    next(error);
  });
};

module.exports = {
  createGroup: createGroup,
  fetchSongs: fetchSongs,
  fetchPlaylists: fetchPlaylists,
  addUser: addUser,
  fetchUsers: fetchUsers,
  updateGroupInfo: updateGroupInfo,
  getBanner: getBanner
};
