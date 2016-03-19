angular.module('jam.playlist', [])
.controller('PlaylistController', ['$scope', 'Playlists', function ($scope, PL) {
  $scope.currentPlaylist = {};
  
  $scope.toggleModal = function () {
    $scope.modalShown = !$scope.modalShown;
  };

  $scope.createPlaylist = function () {
    PL.createPlaylist($scope.newPlaylist)
    .then(function (playlist) {
      console.log("New! ", playlist);
    });
  };

}]);