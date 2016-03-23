angular.module('jam.playFactory', ['jam.usersFactory'])

.factory('Songs', ['$http', '$q', 'ngAudio', function (http, q, audio) {

  var addSong = function (song, groupId) {
    console.log('Song', song);
    var songData = {
      size: song.size,
      lastModified: song.lastModified,
      name: song.name,
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
      // this will return the ngAudio objects
      return res.data.reduce(function(songs, song) {
        song.sound = audio.load(song.address);
        songs = songs.concat([song]);
        return songs;
      }, []);
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

  return {
    addComment: addComment,
    addSong: addSong,
    deleteComment: deleteComment,
    deleteSong: deleteSong,
    getAllSongs: getAllSongs
  };  
}])

.factory('Playlists', ['$http', 'ngAudio', function(http, audio) {
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
      return res.data.reduce(function(songs, song) {
        song.sound = audio.load(song.address);
        songs = songs.concat([song])
        return songs;
      }, []);
    });
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

  return {
    createPlaylist: createPlaylist,
    addSongToPlaylist: addSongToPlaylist,
    getPlaylistSongs: getPlaylistSongs,
    deleteFromPlaylist: deleteFromPlaylist,
    deletePlaylist: deletePlaylist
  };
}])

.factory('Player', ['ngAudio', 'Auth', function (audio, Auth) {
  // use the observer pattern to watch for changes in the queue or song
  var observerCallbacks = [];

  //register an observer
  var registerObserverCallback = function(callback) {
    observerCallbacks.push(callback);
  };

  //call this when something chages
  var notifyObservers = function() {
    angular.forEach(observerCallbacks, function(callback) {
      callback();
    });
  };

  // songs in the queue
  var songQueue = ["http://mattyluv.com/mp3/hickey_firstlp/Hickey%20-%2001%20-%20Believe.mp3", "http://mattyluv.com/mp3/hickey_firstlp/Hickey%20-%2007%20-%20Stupid%20Sun.mp3", 'http://mattyluv.com/mp3/hickey_firstlp/Hickey%20-%2008%20-%20War%20of%20the%20Super%20Egos.mp3'];
  // index of the current song playing
  var soundIndex = 0;
  var location = 'songs';
  // array of all current user's songs
  var allSongs;
  // array of current playlist songs
  var currentPlaylist;

  // load next song on song end
  var sounds = songQueue.map(function(url) {
    return audio.load(url);
  });
  sounds.updated = Date.now();

  var getSoundsAndIndex = function () {
    return {
      sounds: sounds,
      index: soundIndex
    };
  };
  
  var updateQueueByUser = function (userId) {
    // get the songs and set the song queue
  };

  var updateQueueByPlaylist = function (playlistId) {
    // get the songs and set the queue
  };

  var updateIndex = function() {
    if (soundIndex < sounds.length - 1) {
      soundIndex++;
    } 
    console.log("After update the index was ", soundIndex);
    notifyObservers();
  };

  return {
    getSoundsAndIndex: getSoundsAndIndex,
    updateQueueByUser: updateQueueByUser,
    updateQueueByPlaylist: updateQueueByPlaylist,
    updateIndex: updateIndex,
    registerObserverCallback: registerObserverCallback
  };
}]);