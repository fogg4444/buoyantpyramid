var path = require('path');
var UserModel = require('../models/userModel');
var Group = require('../models/groupModel');

var addUser = function(req, res, next) {
  // roles:
  //  admin, member, pending
  var groupId = req.params.id;
  var userId = req.body.userId;
  var role = req.body.role;

  Group.addUser(groupId, userId, role)
  .then(function(user) {
    res.json(user);
  })
  .catch(function (error) {
    next(error);
  });
};

var createGroup = function(req, res, next) {
  var name = req.body.name;

  Group.createGroup(name)
  .then(function(group) {
    res.json(group);
  })
  .catch(function (error) {
    next(err);
  });
};

var getBanner = function(req, res, next) {
  var groupId = parseInt(req.params.id);

  Group.getGroup(groupId)
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

var getUsers = function(req, res, next) {
  // roles:
  //  admin, member, pending
  var groupId = req.params.id;

  Group.getGroup(groupId)
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

var getPlaylists = function(req, res, next) {
  var groupId = req.params.id;

  Group.getGroup(groupId)
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

var getSongs = function(req, res, next) {
  var groupId = req.params.id;

  Group.getGroup({id: groupId})
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

// Redirects to either send email invite or add user function
var sendInvite = function(req, res, next) {
  var email = req.body.email;
  var groupId = req.params.id;

  Group.getGroup(groupId)
  .then(function (group) {
    UserModel.getUser({email: email})
    .then(function (user) {
      if (user) {
        Group.addUser(group, user.id, 'pending')
        .then(function(user) {
          res.json(user);
        });
      } else {
        Group.sendEmailInvite(group, email)
        .then(function(value) {
          res.json(value);
        });
      }
    });
  })
  .catch(function (error) {
    next(error);
  });
};

var updateGroupInfo = function(req, res, next) {
  var groupId = req.body.id;
  var fields = req.body;

  Group.updateInfo(groupId, fields)
  .then(function(result) {
    res.json(result[1][0]);
  })
  .catch(function(error) {
    next(error);
  });
};

module.exports = {
  addUser: addUser,
  createGroup: createGroup,
  getBanner: getBanner,
  getUsers: getUsers,
  getPlaylists: getPlaylists,
  getSongs: getSongs,
  sendInvite: sendInvite,
  updateGroupInfo: updateGroupInfo
};
