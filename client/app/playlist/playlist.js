angular.module('jam.playlist', [])
.controller('PlaylistController', ['$scope', 'Auth', 'Playlists', function ($scope, Auth, PL) {
  $scope.newPlaylist = {};
  $scope.currentPlaylist = {};
  $scope.user = {};

  Auth.getUserData()
  .then(function (user) {
    $scope.user = user;
  })
  .catch(console.error);
  
  $scope.toggleModal = function () {
    $scope.modalShown = !$scope.modalShown;
  };

  $scope.createPlaylist = function () {
    PL.createPlaylist($scope.newPlaylist)
    .then(function (playlist) {
      $scope.modalShown = false;
    });
  };

}]);