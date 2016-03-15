var db = require('../db/database');
var jwt = require('jwt-simple');

var User = db.User;
var Group = db.Group;

// TODO: Add authentication
var signup = function (req, res, next) {
  var displayName = req.body.displayName;
  var email = req.body.email;
  var password = req.body.password;

  User.findOne({where: {email: email}})
    .then(function (existingUser) {
      if (existingUser) {
        throw new Error('User already exists!');
      } else {
        return Group.create({
          name: req.body.displayName,
        });
      }
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
        .then(function() {
          var token = jwt.encode(user, 'secret');
          res.json({ token: token });
        });
      });
    }) 
    .catch(function (error) {
      next(error);
    });
};

var login = function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  User.findOne({where: {email: email}})
    .then(function (user) {
      if (!user) {
        next(new Error('User does not exist'));
      } else {
        return user.comparePassword(password)
          .then(function (didMatch) {
            if (didMatch) {
              var token = jwt.encode(user, 'secret');
              res.json({token: token});
            } else {
              return next(new Error('Incorrect password'));
            }
          });
      }
    })
    .catch(function (error) {
      next(error);
    });
};

module.exports = {
  signup: signup,
  login: login
};
