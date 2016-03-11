var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
  groupname: {
    type: String,
    required: true
  },
  administrators: {
    type: Array,
    default: []
  },
  members: {
    type: Array,
    default: []
  },
  pendingMembers: {
    type: Array,
    default: []
  },
  songs: {
    type: Array,
    default: []
  },
  bannerUrl: {
    type: String,
    default: "http://imgur.com/gallery/QI8f5gx" // Update
  }
});

module.exports = mongoose.model('Group', GroupSchema);