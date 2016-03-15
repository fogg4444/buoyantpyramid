var db = require('../db/database');
var User = db.User;
var jwt = require('jwt-simple');

// TODO: Add authentication
var signup = function (req, res, next) {
  var displayName = req.body.displayName;
  var email = req.body.email;
  var password = req.body.password;

  User.findOne({where: {email: email}})
    .then(function (user) {
      if (user) {
        throw new Error('User already exists!');
      } else {
        return User.create({
          displayName: displayName,
          email: email,
          password: password
        });
      }
    })
    .then(function (user) {
      var token = jwt.encode(user, 'secret');
      res.json({token: token});
    })
    .catch(function (error) {
      next(error);
    });
};

var signin = function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  User.findOne({where: {username: username}})
    .then(function (user) {
      if (!user) {
        next(new Error('User does not exist'));
      } else {
        return user.comparePasswords(password)
          .then(function (foundUser) {
            if (foundUser) {
              var token = jwt.encode(user, 'secret');
              res.json({token: token});
            } else {
              return next(new Error('No user'));
            }
          });
      }
    })
    .fail(function (error) {
      next(error);
    });
};

module.exports = {
  signup: signup,
  sigin: signin
};
