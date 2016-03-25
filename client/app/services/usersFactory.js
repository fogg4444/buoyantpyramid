angular.module('jam.usersFactory', [])

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

  var addUser = function (groupId, userId, role) {
    var data = {userId: userId, role: role};
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

  var sendInvite = function (group, email) {
    var data = {email: email, group: group};
    
    return http({
      method: 'post',
      url: '/api/groups/' + group.id + '/invite',
      data: data
    })
    .then(function (res) {
      return res.data;
    });
  };

  var updateUserRole = function (groupId, userId, role) {
    var data = {role: role};
    return http({
      method: 'PUT',
      url: '/api/groups/' + groupId + '/users/' + userId,
      data: data
    })
    .then(function (res) {
      return res.data;
    });
  };

  var removeUser = function (groupId, userId) {
    return http({
      method: 'DELETE',
      url: '/api/groups/' + groupId + '/users/' + userId,
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
    sendInvite: sendInvite,
    updateUserRole: updateUserRole,
    removeUser: removeUser
  };
}])

.factory('Auth', ['$http', '$location', '$window', '$q', function (http, loc, win, q) {
  // stores users token as com.jam
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

  var getGroupInvites = function (userId) {
    return http({
      method: 'GET',
      url: '/api/users/' + userId + '/invites/'
    })
    .then(function (res) {
      return res.data;
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
      _.extend(userData, res.data.user);
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
      .then(function(res) {
        if (userData) {
          _.extend(userData, res.data.user);
        } else {
          userData = res.data.user;
        }
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
    getGroupInvites: getGroupInvites,
    getProfile: getProfile,
    login: login,
    signup: signup,
    getUser: getUser,
    isAuth: isAuth,
    logout: logout,
    getUserData: getUserData
  };
}]);
