angular.module('jam.playlist', [])
.controller('PlaylistController', ['$scope', 'Auth', 'Playlists', function ($scope, Auth, PL) {
  $scope.newPlaylist = {};
  $scope.currentPlaylist = {};
  $scope.user = {};

  Auth.getUserData()
  .then(function (user) {
    $scope.user = user;
    $scope.newPlaylist.groupId = $scope.user.currentGroup.id;
  })
  .catch(console.error);
  
  $scope.toggleModal = function () {
    $scope.modalShown = !$scope.modalShown;
  };

  $scope.createPlaylist = function () {
    PL.createPlaylist($scope.newPlaylist)
    .then(function (playlist) {
      $scope.modalShown = false;
      $scope.currentPlaylist = playlist.data;
      console.log($scope.currentPlaylist);
    });
  };

}]);