angular.module('jam.songsFactory', [])

.factory('Songs', ['$http', '$q', function (http, q) {

  var player = new Audio(); 

  // stores all songs and current playlist songs
  var songQueue = {songs: [], playlist: []};
  // index of the current song playing
  var songIndex = null;
  var currentLocation = 'songs';
  var volume = 0;
  var muted = false;
  var playable = false;
  var viewLocation = null;
  var currentPlaylist = {};

  // FUNCTIONS FOR SONGS

  var addSong = function (song, groupId) {
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


  var getSong = function (songId) {
    return http({
      method: 'GET',
      url: '/api/songs/' + songId
    })
    .then(function (res) {
      return res.data;
    });
  };


  var updateSong = function (song) {
    return http({
      method: 'PUT',
      url: '/api/songs/' + song.id,
      data: song
    })
    .then(function (res) {
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

  var getComments = function (songId) {
    return http({
      method: 'GET',
      url: '/api/songs/' + songId + '/comments/',
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

  var addSongToPlaylist = function (songId, plId, index) {
    // takes a playlist id and a song obj
    var data = {index: index};
    return http({
      method: 'POST',
      url: '/api/playlists/' + songId + '/' + plId + '/',
      data: data
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

  var updatePlaylistPosition = function (playlistId, updateArray) {
    return http({
      method: 'PUT',
      url: '/api/playlists/' + playlistId,
      data: updateArray
    });
  };

  var deleteFromPlaylist = function (sId, plId) {
    // Takes a playlist object with the song removed
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

  var playFromAllSongs = function(songId, groupId) {
    var promise = q(function(resolve, reject) {
      if (songQueue.songs.length <= 0) {
        getAllSongs(groupId)
        .then(function () {
          resolve(true);
        })
        .catch(reject);
      } else {
        resolve(true);
      }
    });

    return promise.then(function () {
      var index = _.findIndex(songQueue.songs, function(song) {
        return songId === song.id;
      });
      choose(index, 'songs');
      return songQueue.songs[index];
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
    observerCallbacks['ANY_AUDIO_EVENT'](action);
  };

  var getSoundsAndIndex = function () {
    return {
      songs: songQueue[currentLocation],
      index: songIndex,
      location: currentLocation
    };
  };

  var nextIndex = function() {
    if (songIndex < songQueue[currentLocation].length - 1) {
      songIndex++;
      notifyObservers('CHANGE_SONG');
    } else {
      notifyObservers('RESET_PLAYER');
    }
  };

  var togglePlay = function() {
    notifyObservers('TOGGLE_PLAY');
  };

  var choose = function(index, location, playlist) {
    if (songIndex === +index && currentLocation === location) {
      notifyObservers('TOGGLE_PLAY');
    } else {
      songIndex = index;
      currentLocation = location;
      if (location === 'playlist') {
        currentPlaylist = playlist;
      } else {
        currentPlaylist = {};
      }
      notifyObservers('CHANGE_SONG');
      playable = true;
    }
  };

  var checkReset = function(songId, location) {
    if (location === currentLocation) {
      if (songQueue[currentLocation][songIndex] && songQueue[currentLocation][songIndex].id === songId) {
        player = new Audio();
        songQueue[currentLocation].splice(songIndex, 1);
        songIndex = null;
        playable = false;
        notifyObservers('RESET_PLAYER');
      } else {
        songQueue[currentLocation] = _.filter(songQueue[currentLocation], function(currentSong) {
          return currentSong.id !== songId;
        });
        notifyObservers('REFRESH_LIST');
      }
    }
  };

  var setSongIndex = function (index) {
    songIndex = index;
    notifyObservers('CHANGE_SONG');
  };

  var getSongIndex = function (index) {
    return songIndex;
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

  var getPlayer = function () {
    return player;
  };

  var setPlayable = function (playable) {
    playable = playable;
  };

  var getPlayable = function () {
    return playable;
  };

  var getCurrentSong = function () {
    var current = songIndex !== null ? songQueue[currentLocation][songIndex] : null;
    if (current) {
      current.location = currentLocation;
      return current;
    } else {
      return null;
    }
  };

  var getCurrentPlaylist = function () {
    return currentPlaylist;
  };

  var setViewLocation = function (location) {
    viewLocation = location;
  };

  var getViewLocation = function () {
    return viewLocation;
  };


  var timeFormat = function(seconds) {
    var s = Math.floor(seconds % 60);
    var m = Math.floor((seconds % 3600) / 60);
    var h = Math.floor(seconds / 3600);

    var format = (h) ? (h + ':') : ('');
    format += String('00' + m).slice(-2) + ':' + String('00' + s).slice(-2);

    return format;
  };

  var resetPlayer = function () {
    songIndex = null;
    playable = false;
    player = new Audio();
    notifyObservers('RESET_PLAYER');
  };

  return {
    addComment: addComment,
    addSong: addSong,
    getComments: getComments,
    deleteComment: deleteComment,
    deleteSong: deleteSong,
    getAllSongs: getAllSongs,
    getSong: getSong,
    updateSong: updateSong,
    createPlaylist: createPlaylist,
    addSongToPlaylist: addSongToPlaylist,
    getPlaylistSongs: getPlaylistSongs,
    updatePlaylistPosition: updatePlaylistPosition,
    deleteFromPlaylist: deleteFromPlaylist,
    deletePlaylist: deletePlaylist,
    getSoundsAndIndex: getSoundsAndIndex,
    nextIndex: nextIndex,
    choose: choose,
    getPlayer: getPlayer,
    checkReset: checkReset,
    resetPlayer: resetPlayer,
    setSongIndex: setSongIndex,
    getSongIndex: getSongIndex,
    setVolume: setVolume,
    getVolume: getVolume,
    setMuted: setMuted,
    getMuted: getMuted,
    togglePlay: togglePlay,
    setPlayable: setPlayable,
    getPlayable: getPlayable,
    getCurrentSong: getCurrentSong,
    getCurrentPlaylist: getCurrentPlaylist,
    playFromAllSongs: playFromAllSongs,
    setViewLocation: setViewLocation,
    getViewLocation: getViewLocation,
    registerObserverCallback: registerObserverCallback,
    timeFormat: timeFormat
  };
}]);