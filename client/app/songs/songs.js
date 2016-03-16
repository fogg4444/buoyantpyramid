angular.module('jam.songs', [])

.controller('SongsController', ['$scope', 'Songs', 'Auth', function ($scope, Songs, Auth) {
  // When user adds a new link, put it in the collection
  $scope.data = {};
  $scope.data.user = Auth.getUserData();
  Songs.getAllSongs($scope.data.user.currentGroupId)
  .then(function (res) {
    $scope.data.songs = res;
  })
  .catch(function (error) {
    console.error(error);
  });
}]);