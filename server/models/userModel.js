var db = require('../db/database');
var Group = db.Group;
var Song = db.Song;
var User = db.User;

var compileUserData = function(user) {
  return Group.findById(user.currentGroupId, {include: [{model: Song}]})
  .then(function(currentGroup) {
    // Possibly revise
    user = JSON.parse(JSON.stringify(user));
    delete user.password;
    user.currentGroup = currentGroup;
    return user;
  });
};

var createUser = function (email, displayName, password) {
  return new Promise(function (resolve, reject) {
    Group.create({
      name: displayName,
    })
    .then(function (group) {
      User.create({
        displayName: displayName,
        email: email,
        password: password,
        currentGroupId: group.id
      })
      .then(function (user) {
        group.addUser(user, {role: 'admin'})
          .then(function () {
            resolve(user);
          });
        });
      })
      .catch(function (error) {
        reject(error);
      });
    });
};

var getGroups = function(userId) {
  return new Promise(function (resolve, reject) {
    User.findById(userId)
    .then(function (user) {
      user.getGroups()
      .then(function (groups) {
        resolve(groups);
      });
    })
    .catch(function(error) {
      reject(error);
    });
  });
};

var getUser = function (query) {
  return User.findOne({where: query});
};

module.exports = {
  compileUserData: compileUserData,
  createUser: createUser,
  getGroups: getGroups,
  getUser: getUser
}
