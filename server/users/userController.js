var User = require('./userModel.js');
var Q = require('q');
var jwt = require('jwt-simple');

// Promisify a few mongoose methods with the `q` promise library
var findUser = Q.nbind(User.findOne, User);
var createUser = Q.nbind(User.create, User);


var signin = function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  findUser({email: email})
    .then(function (user) {
      if (!user) {
        throw Error('User does not exist');
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

var signup = function (req, res, next) {
  var displayName = req.body.displayName;
  var email = req.body.email;
  var password = req.body.password;

  // check to see if user already exists
  findUser({email: email})
    .then(function (user) {
      if (user) {
        throw Error('User already exists!');
      } else {
        // make a new user if not one
        return createUser({
          displayName: displayName,
          email: email,
          password: password
        });
      }
    })
    .then(function (user) {
      // create token to send back for auth
      var token = jwt.encode(user, 'secret');
      res.json({token: token});
    })
    .fail(function (error) {
      next(error);
    });
};

var checkAuth = function (req, res, next) {
  // checking to see if the user is authenticated
  // grab the token in the header is any
  // then decode the token, which we end up being the user object
  // check to see if that user exists in the database
  var token = req.headers['x-access-token'];
  if (!token) {
    next(new Error('No token'));
  } else {
    var user = jwt.decode(token, 'secret');
    findUser({email: user.email})
      .then(function (foundUser) {
        if (foundUser) {
          res.send(200);
        } else {
          res.send(401);
        }
      })
      .fail(function (error) {
        next(error);
      });
  }
};

module.exports = {
  signin: signin,
  signup: signup,
  checkAuth: checkAuth
};

