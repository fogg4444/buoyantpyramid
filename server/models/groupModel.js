var db = require('../db/database');
var Group = db.Group;
var Song = db.Song;
var User = db.User;
var UserModel = require('./userModel.js');
var config = require('../config/config');
var mailgun = require('mailgun-js')({apiKey: config.mailgun.api_key, domain: config.mailgun.domain});

var addUser = function (groupId, userId, role) {
  return new Promise(function (resolve, reject) {
    getGroup(groupId)
    .then(function (group) {
      User.findOne({where: {id: userId}})
      .then(function (user) {
        group.addUser (user, {role: role})
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
  return new Promise(function (resolve, reject) {
    Group.findById(groupId)
    .then(function (group) {
      group.getPendingUsers()
      .then(function (pending) {
        group.getMemberUsers()
        .then(function (member) {
          group.getAdminUsers()
          .then(function (admin) {
            resolve({
              pending: pending,
              member: member,
              admin: admin
            });
          });
        });
      });
    })
    .catch(function (error) {
      reject(error);
    });
  });
};

var sendEmailInvite = function(group, email) {
  var password = Math.random().toString(36).substring(5);
  return new Promise(function (resolve, reject) {
    UserModel.createUser(email, 'anonymous', password)
    .then(function (user) {
      group.addUser(user, {role: 'pending'})
      .then(function() {
        var data = {
          from: 'Jam Record <jamrecord@samples.mailgun.org>',
          to: email,
          subject: 'Hello',
          text: 'You\'ve been invited to join ' + group.name + ' at JamRecord!\n' +
                'Follow the link below to sign up\n' +
                'Link: http://localhost:3000/#/login/' + email + '\n' + 
                'Please use the following temporary password: ' + password
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
  getUsers: getUsers,
  sendEmailInvite: sendEmailInvite,
  updateInfo: updateInfo
};