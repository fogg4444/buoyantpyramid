var db = require('../db/database');
var Group = db.Group;
var UserGroups = db.UserGroups;
var Song = db.Song;
var User = db.User;
var Promise = require('bluebird');

var sanitizeUser = function (user) {
  var sanitizedUser = user.toJSON();
  // user = JSON.parse(JSON.stringify(user));
  delete sanitizedUser.password;
  return sanitizedUser;
};

var compileUserData = function(user) {
  return Group.findById(user.currentGroupId, {include: [{model: Song}]})
  .then(function(currentGroup) {
    // Get rid of the password;
    user = sanitizeUser(user);
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
      })
      .catch(function (error) {
        reject(error);
      });
    })
    .catch(function (error) {
      reject(error);
    });
  });
};

var getGroups = function(userId) {
  return User.findById(userId, {
    include: [{
      model: Group,
      include: [{
        model: User,
        attributes: { exclude: ['password'] }
      }]
    }]
  })
  .then(function(user) {
    return user.groups;
  });
};

var getUser = function (query) {
  return User.findOne({where: query});
};

module.exports = {
  compileUserData: compileUserData,
  createUser: createUser,
  getGroups: getGroups,
  getUser: getUser,
  sanitizeUser: sanitizeUser
};
