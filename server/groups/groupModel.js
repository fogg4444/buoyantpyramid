var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
  groupname: {
    type: String,
    required: true
  },
  administrators: [{
    type : Schema.ObjectId,
    ref : 'User'
  }],
  members: [{
    type : Schema.ObjectId, 
    ref : 'User'
  }],
  pendingMembers: [{
    type : Schema.ObjectId,
    ref : 'User'
  }],
  songs: [{
    type : Schema.ObjectId, 
    ref : 'Song'
  }],
  playlists: [{
    type : Schema.ObjectId, 
    ref : 'Playlist'
  }],
  bannerUrl: {
    type: String,
    default: "http://imgur.com/gallery/QI8f5gx" // Update
  }
});

module.exports = mongoose.model('Group', GroupSchema);