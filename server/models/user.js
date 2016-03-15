var db = require('../db/database');
var User = db.User;

// TODO: Add authentication
var createUser = function(req, res, next) {
  var email = req.body.email;
  var displayName = req.body.displayName;
  var password = req.body.password;

  User.create({
    email: email,
    displayName: displayName,
    password: password
  }).then(function(user) {
    res.json(user);
  })
  .catch(function(err) {
    next(err); 
  });
};

module.exports = {
  createUser: createUser
};
