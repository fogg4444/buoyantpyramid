var mongoose = require('mongoose');
var User = require('../users/userModel.js');
var Song = require('../songs/songModel.js');
var Playlist = require('../playlists/playlistModel.js');

var Schema = mongoose.Schema;

var GroupSchema = new Schema({
  groupname: {
    type: String,
    required: true
  },
  administrators: {
    type: [User]
  },
  members: {
    type: [User]
  },
  pendingMembers: {
    type: [User]
  },
  songs: {
    type: [Song]
  },
  playlists: {
    type: [Playlist]
  },
  bannerUrl: {
    type: String,
    default: "http://imgur.com/gallery/QI8f5gx" // Update
  }
});

module.exports = mongoose.model('Group', GroupSchema);