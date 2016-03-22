var db = require('../db/database');
var Group = db.Group;
var Playlist = db.Playlist;
var Song = db.Song;
var PlaylistsSongs = db.PlaylistsSongs;

var createPlaylist = function(req, res, next) {
  var groupId = req.body.groupId;
  var title = req.body.title;
  var description = req.body.description;

  Playlist.create({
    title: req.body.title,
    description: req.body.description,
    groupId: groupId
  },
  {include: {
    model: Group}
  }).then(function(playlist) {
    res.json(playlist);
  })
  .catch(function(err) {
    next(err);
  });
};

var addSong = function(req, res, next) {
  var songId = req.params.sid;
  var playlistId = req.params.pid;

  Song.findOne({where: {id: songId}})
  .then(function(song) {
    Playlist.findOne({where: {id: playlistId}})
    .then(function(playlist) {
      playlist.addSong(song);
      res.json(song);
    });
  })
  .catch(function(err) {
    next(err);
  });

  // Song.update(
  //   {
  //     playlistId: playlistId
  //   },
  //   {
  //     where: {id: songId}
  //   },
  // {include: {
  //   model: Playlist}
  // }).then(function(song) {
  //   res.json(song);
  // })
  // .catch(function(err) {
  //   next(err);
  // });
};

var fetchSongs = function(req, res, next) {
  var playlistId = req.params.id;

  Playlist.findById(playlistId)
  .then(function(playlist) {
    playlist.getSongs()
    .then(function(songs) {
      res.json(songs);
    });
  })
  .catch(function(err) {
    next(err);
  });

  // console.log("Fetching songs in controller");
  // Playlist.findOne({where: {id: playlistId}})
  // .then(function(playlist) {
  //   console.log(playlist);
  //   PlaylistsSongs.find
  //   .then(function(songs) {
  //     res.json(songs);
  //   });
  // })
  // .catch(function(err) {
  //   next(err);
  // });
};

var removeSong = function(req, res, next) {
  var playlistId = req.params.pid;
  var songId = rq.params.sid;

  PlaylistsSongs.destroy({ where: {songId: songId, playlistId: playlistId}})
  .then(function(resp) {
    res.json(resp);
  })
  .catch(function(err) {
    next(err);
  });

  // Playlist.findOne({where: {id: playlistId}})
  // .then(function(playlist) {
  //   playlist.update(req.body)
  //   .then(function(playlist) {
  //     res.json(playlist);
  //   });
  // })
  // .catch(function(err) {
  //   next(err);
  // });
};

// playlist.removeSong(song obj)
// exercise_muscle_tie.destroy({ where: { exerciseId: 1856, muscleId: 57344 } })

var deletePlaylist = function(req, res, next) {
  var playlistId = req.params.id;
  Playlist.findOne({where: {id: playlistId}})
  .then(function(playlist) {
    playlist.destroy();
    res.json(playlist);
  })
  .catch(function(err) {
    next(err);
  });
};

module.exports = {
  createPlaylist: createPlaylist,
  addSong: addSong,
  fetchSongs: fetchSongs,
  removeSong: removeSong,
  deletePlaylist: deletePlaylist
};
