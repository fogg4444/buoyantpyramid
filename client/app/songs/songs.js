angular.module('jam.songs', [])

.controller('SongsController', ['$scope', '$location', 'Songs', 'Auth', function ($scope, loc, Songs, Auth) {
  // When user adds a new link, put it in the collection
  $scope.data = {};
  $scope.user = Auth.getUserData();
  if ($scope.user) {
    Songs.getAllSongs($scope.user.currentGroupId)
    .then(function (res) {
      $scope.data.songs = res;
    })
    .catch(function (error) {
      console.error(error);
    });
  } else {
    loc.path('/login');
  }
}]);