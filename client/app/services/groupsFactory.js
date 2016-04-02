angular.module('jam.groupsFactory', [])

.factory('Groups', ['$http', '$q', function (http, q) {

  // Each group has an array of members
  var groupsData = null;

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
      _.extend(groupsData, res.data);
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
      return res.data;
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

  var getGroupsData = function(user, force) {
    force = force || false;
    return q(function(resolve, reject) {
      if (groupsData && !force) {
        resolve(groupsData);
      }
      getGroupsByUserId(user.id)
      .then(function(groups) {
        if (groupsData) {
          _.extend(groupsData, groups);
        } else {
          groupsData = groups;
        }
        resolve(groupsData);
      })
      .catch(function (error) {
        reject(error);
      });
    });
  };

  var setGroupsData = function(data) {
    if (!data) {
      groupsData = null;
    } else {
      _.extend(groupsData, data);
    }
  };

  var deleteGroup = function(id) {
    return http({
      method: 'DELETE',
      url: '/api/groups/' + id
    })
    .then(function (res) {
      return res.data;
    });
  };

  return {
    createGroup: createGroup,
    addUser: addUser,
    getGroupsByUserId: getGroupsByUserId,
    getPlaylistsByGroupId: getPlaylistsByGroupId,
    updateInfo: updateInfo,
    sendInvite: sendInvite,
    updateUserRole: updateUserRole,
    removeUser: removeUser,
    getGroupsData: getGroupsData,
    setGroupsData: setGroupsData,
    deleteGroup: deleteGroup
  };
}]);
