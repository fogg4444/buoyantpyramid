var Group = require('./groupModel.js');
var Q = require('q');

var createGroup = Q.nbind(Group.create, Group);
var findGroup = Q.nbind(Group.findOne, Group);

module.exports = {
};