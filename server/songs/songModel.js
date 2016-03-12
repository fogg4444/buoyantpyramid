var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SongSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  dateRecorded: {
    type: Date,
    required: true
  },
  duration: {
    type: Number // (seconds)
  },
  address: {
    type: String,
    default: "" // Complete url
  },
  coverUrl: {
    type: String,
    default: "" // Complete url
  },
  uploadedBy: {
    type: Schema.ObjectId,
    required: true
  },
  markers: {
    type: Array,
    default: []
  }
});

module.exports = mongoose.model('Song', SongSchema);