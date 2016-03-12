var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlaylistSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  songs: [{
    type: Schema.ObjectId,
    ref: 'Song'
  }]
});

module.exports = mongoose.model('Playlist', PlaylistSchema);