angular.module('jam.groups', [])

.controller('GroupsController', ['$scope', 'Auth', 'Groups', function($scope, Auth, Groups) {
  $scope.user = {};
  $scope.data = {};

  $scope.filterGroups = function(group) {
    return function(group) {
      return group.id !== $scope.user.currentGroupId;
    }
  }

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