angular.module('jam.playlist', [])
.controller('PlaylistController', ['$scope', 'Auth', 'Playlists', 'Groups', function ($scope, Auth, PL, GR) {
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

      GR.getPlaylistsByGroupId($scope.user.currentGroup.id)
      .then(function (resp) {
        console.log(resp);
      })
      .catch(console.error);

    });
  };

}]);