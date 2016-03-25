angular.module('jam.songFactory', ['jam.usersFactory'])

.factory('Songs', ['$http', '$q', function (http, q) {

  var player = new Audio(); 

  // stores all songs and current playlist songs
  var songQueue = {songs: [], playlist: []};
  // index of the current song playing
  var soundIndex = null;
  var currentLocation = 'songs';
  var volume = 0;
  var muted = false;

  // FUNCTIONS FOR SONGS

  var addSong = function (song, groupId) {
    console.log('Song', song);
    var songData = {
      size: song.size,
      lastModified: song.lastModified,
      name: song.displayName || song.name,
      uniqueHash: song.uniqueFilename,
      address: song.s3url,
      duration: song.duration
    };

    return q(function(resolve, reject) {
      http({
        method: 'POST',
        url: '/api/groups/' + groupId + '/songs/',
        data: songData
      })
      .then(function(response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
    });
  };

  var getAllSongs = function (groupId) {
    return http({
      method: 'GET',
      url: '/api/groups/' + groupId + '/songs/'
    })
    .then(function (res) {
      songQueue.songs = res.data;
      return res.data;
    });
  };

  var deleteSong = function (song) {
    return http({
      method: 'DELETE',
      url: '/api/songs/' + song.id,
    })
    .then(function (res) {
      return res.data;
    });
  };

  var addComment = function (comment, songId) {
    return http({
      method: 'POST',
      url: '/api/songs/' + songId + '/comments/',
      data: comment
    })
    .then(function (res) {
      return res.data;
    });
  };

  var deleteComment = function (tag) {
    return http({
      method: 'DELETE',
      url: '/api/tags/' + tag.id,
    })
    .then(function (res) {
      return res.data;
    });
  };

  // FUNCTIONS FOR PLAYLISTS 

  var createPlaylist = function (playlist) {
    // takes an object with a title and optional description
    return http({
      method: 'POST',
      url: '/api/playlists/',
      data: playlist
    })
    .then(function (res) {
      return res.data;
    });
  };

  var addSongToPlaylist = function (songId, plId) {
    // takes a playlist id and a song obj
    return http({
      method: 'POST',
      url: '/api/playlists/' + songId + '/' + plId + '/'
    })
    .then(function (res) {
      return res.data;
    });
  };

  var getPlaylistSongs = function (id) {
    return http({
      method: 'GET',
      url: '/api/playlists/' + id + '/'
    })
    .then(function (res) {
      songQueue.playlist = res.data;
      return res.data;
    })
    .catch(console.error);
  };

  var deleteFromPlaylist = function (sId, plId) {
    // Takes a playlist object with the song removed
    console.log('ID to delete: ', plId, sId);
    return http({
      method: 'DELETE',
      url: '/api/playlists/' + sId + '/' + plId + '/',
    })
    .then(function (res) {
      return res.data;
    });
  };

  var deletePlaylist = function (id) {
    return http({
      method: 'DELETE',
      url: '/api/playlists/' + id + '/' 
    })
    .then(function (res) {
      return res.data;
    });
  };

  // FUNCTIONS FOR PLAYBACK

  // use the observer pattern to watch for changes in the queue or song
  var observerCallbacks = {};

  //register an observer
  var registerObserverCallback = function(action, callback) {
    observerCallbacks[action] = callback;
  };

  // call this with the index of the callback to trigger just one
  var notifyObservers = function(action) {
    observerCallbacks[action]();
  };

  var getSoundsAndIndex = function () {
    return {
      songs: songQueue[currentLocation],
      index: soundIndex
    };
  };

  var nextIndex = function() {
    if (soundIndex < songQueue[currentLocation].length - 1) {
      soundIndex++;
    }
    notifyObservers('CHANGE_SONG');
  };

  var choose = function(index, location) {
    if (soundIndex === +index && currentLocation === location) {
      notifyObservers('TOGGLE_PLAY');
    } else {
      soundIndex = index;
      currentLocation = location;
      notifyObservers('CHANGE_SONG');
    }
  };

  var setVolume = function (percent) {
    volume = percent;
  };

  var getVolume = function () {
    return volume;
  };

  var setMuted = function (newMuted) {
    muted = newMuted;
  };

  var getMuted = function () {
    return muted;
  };

  return {
    addComment: addComment,
    addSong: addSong,
    deleteComment: deleteComment,
    deleteSong: deleteSong,
    getAllSongs: getAllSongs,
    createPlaylist: createPlaylist,
    addSongToPlaylist: addSongToPlaylist,
    getPlaylistSongs: getPlaylistSongs,
    deleteFromPlaylist: deleteFromPlaylist,
    deletePlaylist: deletePlaylist,
    getSoundsAndIndex: getSoundsAndIndex,
    nextIndex: nextIndex,
    choose: choose,
    registerObserverCallback: registerObserverCallback,
    player: player,
    setVolume: setVolume,
    getVolume: getVolume,
    setMuted: setMuted,
    getMuted: getMuted
  };
}]);