var db = require('../db/database');
var jwt = require('jwt-simple');
var config = require('../config/config.js');
var User = db.User;
var Group = db.Group;

var JWT_SECRET = config.JWT_SECRET || 's00p3R53kritt';

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
          var token = jwt.encode(user, JWT_SECRET);
          res.json({
            token: token,
            user: user
          });
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
  console.log(req.body.email);
  User.findOne({where: {email: email}})
    .then(function (user) {
      if (!user) {
        next(new Error('User does not exist'));
      } else {
        return user.comparePassword(password)
          .then(function (didMatch) {
            if (didMatch) {
              var token = jwt.encode(user, JWT_SECRET);
              res.json({
                token: token,
                user: user
              });
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

var getUser = function(req, res, next) {
  var userId = parseInt(req.params.id);
  var token = req.headers['x-access-token'];
  if (!token) {
    res.status(401).json('Not logged in');
  } else {
    var jwtUser = jwt.decode(token, JWT_SECRET);

    // VERIFY JWT USER HERE!!!!!!!!!!

    User.findById(userId)
      .then(function(foundUser) {
        // if requesting user is requested user, return all user's info
        if (foundUser) {
          // INCLUDE GROUPS TOO???
          res.json({
            id: foundUser.id,
            displayName: foundUser.displayName,
            avatarUrl: foundUser.avatarUrl
          });
        } else {
          res.status(404).json('user doesn\'t exist');
        } 
      })
      .catch(function(error) {
        next(error);
      });
  }
};

var getSelf = function(req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token) {
    res.status(401).json('Not logged in');
  } else {
    var jwtUser = jwt.decode(token, JWT_SECRET);

    // TODO: INCLUDE GROUP INFO
     
    User.findById(jwtUser.id)
      .then(function(foundUser) {
        if (foundUser) {
          res.json(foundUser);
        } else {
          res.status(404).json('jwt token doesn\'t match any user');
        } 
      })
      .catch(function(error) {
        next(error);
      });
  }
};


// var updateUser = function(req, res, next) {
//   var userId = req.params.userId;
//   var token = req.headers['x-access-token'];
//   if (!token) {
//     res.status(401).json('Not logged in');
//   } else {
//     var requestingUser = jwt.decode(token, JWT_SECRET);
//     findUser({ id: requestingUser.userId })
//       .then(function(foundUser) {
//         // if requesting user is requested user, return all user's info
//         if (foundUser) {
//           if (foundUser.username === username) {
//             res.json(foundUser);
//           } else {
//             // only send id and displayname if not logged in user
//             res.json({
//               id: foundUser.id,
//               displayName: foundUser.displayName,
//               avatarUrl: foundUser.avatarUrl
//             });
//           }
//         } else {
//           res.status(404).json('user doesn\'t exist');
//         } 
//       })
//       .catch(function(error) {
//         next(error);
//       });
//   }
// };


module.exports = {
  signup: signup,
  login: login,
  getUser: getUser,
  getSelf: getSelf
};
