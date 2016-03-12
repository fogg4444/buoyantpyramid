var mongoose = require('mongoose');
var Song = require('../songs/songModel.js');

var Schema = mongoose.Schema;

var PlaylistSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  songs: {
    type: [Song]
  }
});

module.exports = mongoose.model('Playlist', PlaylistSchema);