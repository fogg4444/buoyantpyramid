angular.module('jam.groups', [])

.controller('GroupsController', ['$scope', 'Auth', 'Groups', function($scope, Auth, Groups) {
  $scope.user = {};
  $scope.newGroup = {};
  $scope.data = {};
  $scope.modalShown = false;

  $scope.filterGroups = function (group) {
    return function(group) {
      return group.id !== $scope.user.currentGroupId;
    }
  };

  $scope.toggleModal = function () {
    $scope.modalShown = !$scope.modalShown;
  };

  $scope.createGroup = function () {
    Groups.createGroup($scope.newGroup)
    .then(function (group) {
      Groups.addUser(group.id, $scope.user.id)
      .then(function () {
        $scope.modalShown = false;
        $scope.user.currentGroupId = group.id;
        $scope.user.currentGroup = group;
        $scope.updateProfile($scope.user)
      });
    });
  };

  $scope.setCurrentGroup = function(group) {
    $scope.user.groupId = group.id;
    Groups.setCurrentGroup($scope.user.id, group.id)
    .then(function (user) {
      $scope.user.currentGroup = group;
      $scope.user.groupId = group.id;
    });
  };

  $scope.updateProfile = function () {
    return Auth.updateProfile($scope.user)
    .then(function (res) {
      $scope.user = res.data.user;
    })
    .catch(function (error) {
      console.error(error);
    });
  };

  // Load groups and group users
  Auth.getUserData()
  .then(function (userData) {
    $scope.user = userData;
    Groups.getGroupsByUserId(userData.id)
    .then(function (groups) {
      $scope.data.groups = groups;
    });
    Groups.getUsersByGroupId(userData.currentGroupId)
    .then(function (users) {
      $scope.data.users = users;
    });
  })
  .catch(console.error);
}]);