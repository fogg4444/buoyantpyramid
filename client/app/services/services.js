angular.module('jam.services', [])

.factory('Songs', ['$http', function (http) {

  var addSong = function (song, groupId) {
    return http({
      method: 'POST',
      url: '/api/groups/' + groupId + '/songs/',
      data: song
    })
    .then(function (res) {
      return res;
    });
  };

  var getAllSongs = function (groupId) {
    return http({
      method: 'GET',
      url: '/api/groups/' + groupId + '/songs/'
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

  return {
    addSong: addSong,
    deleteSong: deleteSong,
    getAllSongs: getAllSongs
  };
}])

.factory('Playlists', ['$http', function(http) {
  var createPlaylist = function (playlist) {
    // takes an object with a title and optional description
    return http({
      method: 'POST',
      url: '/api/playlists/',
      data: playlist
    });
  };

  var addSongToPlaylist = function (id, song) {
    // takes a playlist id and a song obj
    return http({
      method: 'PUT',
      url: '/api/playlists/' + id + '/add/',
      data: song
    });
  };

  var getPlaylistSongs = function (id) {
    return http({
      method: 'GET',
      url: '/api/playlists/' + id
    });
  };

  return {
    createPlaylist: createPlaylist,
    addSongToPlaylist: addSongToPlaylist,
    getPlaylistSongs: getPlaylistSongs
  };
}])

.factory('Groups', ['$http', function (http) {
  var createGroup = function (newGroup) {
    return http({
      method: 'POST',
      url: '/api/groups/',
      data: newGroup
    })
    .then(function (res) {
      return res.data;
    });
  };

  var addUser = function (groupId, userId) {
    data = {userId: userId, role: 'admin'};
    return http({
      method: 'POST',
      url: '/api/groups/' + groupId + '/users/',
      data: data
    })
    .then(function (res) {
      return res.data;
    });
  };

  var getGroupsByUserId = function (userId) {
    return http({
      method: 'GET',
      url: '/api/users/' + userId + '/groups/'
    })
    .then(function (res) {
      return res.data;
    });
  };

  var getUsersByGroupId = function (groupId) {
    return http({
      method: 'GET',
      url: '/api/groups/' + groupId + '/users/'
    })
    .then(function (res) {
      return res.data;
    });
  };

  var getPlaylistsByGroupId = function (groupId) {
    return http({
      method: 'GET',
      url: '/api/groups/' + groupId + '/playlists/'
    })
    .then(function (res) {
      return res.data;
    });
  };

  var updateInfo = function(group) {
    return http({
      method: 'PUT',
      url: '/api/groups/info',
      data: group
    })
    .then(function(res) {
      return res;
    })
    .catch(console.error);
  };

  var sendInvite = function (band, email) {
    var data = {email: email, band: band};
    
    return http({
      method: 'post',
      url: '/api/users/invite',
      data: data
    })
    .then(function (res) {
      return res.data;
    });
  };

  return {
    createGroup: createGroup,
    addUser: addUser,
    getGroupsByUserId: getGroupsByUserId,
    getUsersByGroupId: getUsersByGroupId,
    getPlaylistsByGroupId: getPlaylistsByGroupId,
    updateInfo: updateInfo,
    sendInvite: sendInvite
  };
}])


.factory('Auth', ['$http', '$location', '$window', '$q', function (http, loc, win, q) {
  // This is responsible for authenticating our user
  // by exchanging the user's email and password
  // for a JWT from the server
  // that JWT is then stored in localStorage as 'com.jam'

  var userData = null;

  var login = function (user) {
    return http({
      method: 'POST',
      url: '/api/users/login',
      data: user
    })
    .then(function (resp) {
      userData = resp.data.user;
      win.localStorage.setItem('com.jam', resp.data.token);
      return resp.data;
    });
  };

  var signup = function (user) {
    return http({
      method: 'POST',
      url: '/api/users/signup',
      data: user
    })
    .then(function (resp) {
      userData = resp.data.user;
      win.localStorage.setItem('com.jam', resp.data.token);
      return resp.data;
    });
  };

  var getUser = function(userId) {
    return http({
      method: 'GET',
      url: '/api/users/' + userId
    })
    .then(function(resp) {
      return resp.data.user;
    });
  };

  var logout = function () {
    win.localStorage.removeItem('com.jam');
    userData = null;
    loc.path('/login');
  };

  var updateProfile = function(profile) {
    return http({
      method: 'PUT',
      url: '/api/users/profile',
      data: profile
    })
    .then(function(res) {
      userData = res.data.user;
      return res;
    })
    .catch(console.error);
  };
  
  var getProfile = function(profile) {
    return http({
      method: 'GET',
      url: '/api/users/profile'
    });
  };

  var getUserData = function( force ) {
    force = force || false;
    return q(function(resolve, reject) {
      if (userData && !force) {
        resolve(userData);
      }
      getProfile()
      .then(function(response) {
        userData = response.data.user;
        resolve(userData);
      })
      .catch(function (error) {
        reject(error);
      });
    });
  };

  var isAuth = function () {
    return !!win.localStorage.getItem('com.jam');
  };

  return {
    updateProfile: updateProfile,
    getProfile: getProfile,
    login: login,
    signup: signup,
    getUser: getUser,
    isAuth: isAuth,
    logout: logout,
    getUserData: getUserData
  };
}]);
