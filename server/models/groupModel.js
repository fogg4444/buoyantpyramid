var db = require('../db/database');
var Group = db.Group;
var Song = db.Song;
var User = db.User;
var UserGroups = db.UserGroups;
var UserModel = require('./userModel.js');
var config = require('../config/config');
var mailgun = require('mailgun-js')({apiKey: config.mailgun.api_key, domain: config.mailgun.domain});
var Promise = require('bluebird');


var addUser = function (groupId, userId, role) {
  return new Promise(function (resolve, reject) {
    getGroup(groupId)
    .then(function (group) {
      User.findOne({
        where: { id: userId },
        attributes: { exclude: ['password'] }
      })
      .then(function (user) {
        group.addUser(user, {role: role})
        .then(function () {
          resolve(user);
        });
      });
    })
    .catch(function(error) {
      reject(error);
    });
  });
};

var createGroup = function (name) {
      // TODO: Add banner
  return Group.create({name: name});
};

var getGroup = function (groupId) {
      // TODO: Add banner
  return Group.findById(groupId);
};

var getUsers = function(groupId) {
  return Group.findById(groupId, {
    include: [{
      model: User,
      attributes: { exclude: ['password'] }
    }]
  })
  .then(function(group) {
    return group.users;
  });
};

var getUserGroup = function(userId, groupId) {
  return UserGroups.findOne({
    where: {userId: userId, groupId: groupId}
  });
};

var removeUser = function (groupId, userId) {
  return UserGroups.findOne({where: {groupId: groupId, userId: userId}})
  .then(function (userGroup) {
    return userGroup.destroy();
  });
};

var deleteGroup = function (groupId) {
  return Group.findOne({where: {id: groupId}})
  .then(function (group) {
    // get and destroy all songs uploaded by the group
    return group.destroy();
  })
  .catch(console.error);
};

var sendEmailInvite = function(group, email) {
  var password = Math.random().toString(36).substring(5);
  return new Promise(function (resolve, reject) {
    UserModel.createUser(email, 'anonymous', password)
    .then(function (user) {
      group.addUser(user, {role: 'pending'})
      .then(function() {
        var data = {
          from: 'Audiopile <audiopile@samples.mailgun.org>',
          to: email,
          subject: 'Hello',
          text: 'You\'ve been invited to join ' + group.name + ' at Audiopile!\n\n' +
                'Click the link below and login with the following credentials:\n' +
                '\temail: ' + email + '\n' +
                '\tpassword: ' + password + '\n\n' +
                'http://www.audiopile.rocks/#/login/' + email + '\n'
        };
         
        mailgun.messages().send(data, function (error, body) {
          if (error) {
            reject(error);
          } else {
            resolve('Email sent successfully');
          }  
        }); 
      });
    })
    .catch(function (error) {
      reject(error);
    });
  });
};

var updateUserRole = function (groupId, userId, role) {
  return UserGroups.update({role: role}, {where: {groupId: groupId, userId: userId}});
};

var updateInfo = function(groupId, fields) {
  return Group.update(fields, {
    where: {
      id: groupId
    },
    returning: true
  });
};

module.exports = {
  addUser: addUser,
  createGroup: createGroup,
  getGroup: getGroup,
  getUserGroup: getUserGroup,
  getUsers: getUsers,
  removeUser: removeUser,
  deleteGroup: deleteGroup,
  sendEmailInvite: sendEmailInvite,
  updateUserRole: updateUserRole,
  updateInfo: updateInfo
};