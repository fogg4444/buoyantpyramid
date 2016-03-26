angular.module('jam.groups', [])

.controller('GroupsController', ['$scope', '$route', 'Users', 'Groups', function($scope, $route, Users, Groups) {
  $scope.user = {};
  $scope.newGroup = {};
  $scope.data = {};
  $scope.chooseRole = {
    role: 'admin'
  };

  $scope.toggleCreateModal = function () {
    $scope.createModalShown = !$scope.createModalShown;
  };

  $scope.memberInfo = function (member) {
    $scope.clickedMember = member;
    $scope.clickedMember.isAdmin = member.role === 'admin' ? true : false;
    $scope.chooseRole.role = member.role;
    console.log(member);
    $scope.memberModalShown = true;
  };

  $scope.updateRole = function (userId) {
    if ($scope.chooseRole.role !== $scope.clickedMember.role) {
      Groups.updateUserRole($scope.user.currentGroupId, userId, $scope.chooseRole.role)
      .then(function () {
        console.log('Updated!');
        // update member role
        $scope.memberModalShown = false;
      })
      .catch(console.error);
    }
  };

  $scope.removeMember = function (userId) {
    Groups.removeUser($scope.user.currentGroupId, userId)
    .then(function () {
      // tell the user that the member is no more!
      $scope.data.members = _.filter($scope.data.members, function (member) {
        return member.id !== userId;
      });
      $scope.memberModalShown = false;
    })
    .catch(console.error);
  };

  $scope.acceptInvite = function (group) {
    Groups.updateUserRole(group.id, $scope.user.id, 'member');
    var index = $scope.data.pendingGroups.indexOf(group);
    var removed = $scope.data.pendingGroups.splice(index, 1);
    $scope.data.memberGroups.push(removed);
    $route.reload();
  };

  $scope.rejectInvite = function (group) {
    Groups.removeUser(group.id, $scope.user.id);
    var index = $scope.data.pendingGroups.indexOf(group);
    var removed = $scope.data.pendingGroups.splice(index, 1);
  };

  $scope.createGroup = function () {
    Groups.createGroup($scope.newGroup)
    .then(function (group) {
      Groups.addUser(group.id, $scope.user.id, 'admin')
      .then(function () {
        $scope.modalShown = false;
        $scope.user.currentGroupId = group.id;
        $scope.user.currentGroup = group;
        $scope.updateProfile($scope.user);
        $route.reload();
      });
    });
  };

  $scope.setCurrentGroup = function(group) {
    Users.updateProfile({currentGroupId: group.id})
    .then(function (res) {
      $scope.user = res.data.user;
      $route.reload();
    })
    .catch(function (error) {
      console.error(error);
    });
  };

  $scope.updateProfile = function () {
    return Users.updateProfile($scope.user)
    .then(function (res) {
      $scope.user = res.data.user;
    })
    .catch(function (error) {
      console.error(error);
    });
  };

  $scope.isNotCurrentGroup = function (group) {
    return group.id !== $scope.user.currentGroup.id;
  };

  // Load groups and group users
  Users.getUserData()
  .then(function (userData) {
    $scope.user = userData;
    Groups.getGroupsByUserId(userData.id)
    .then(function (groups) {
      $scope.data.pendingGroups = groups.pending;
      $scope.data.adminGroups = groups.admin;
      $scope.data.memberGroups = groups.member;
      $scope.data.isAdmin = _.reduce(groups.admin, function(accumulator, band) {
        return userData.currentGroupId === band.id || accumulator;
      }, false);
    });
    Groups.getUsersByGroupId(userData.currentGroupId)
    .then(function (users) {
      // Add all the group members to one array, with a key role and a value of their role
      $scope.data.members = _.reduce(users, function(allMembers, roleMembers, role) {
        _.each(roleMembers, function(member) {
          member.role = role;
          allMembers.push(member);
        });
        return allMembers;
      }, []);
    });
  })
  .catch(console.error);
}]);