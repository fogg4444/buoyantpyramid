angular.module('jam.playlist', [])
.controller('PlaylistController', ['$scope', 'Auth', 'Playlists', 'Groups', function ($scope, Auth, PL, GR) {
  $scope.newPlaylist = {};
  $scope.data = {};
  $scope.data.currentPlaylist = {};
  $scope.data.playlists = [];
  $scope.user = {};

  Auth.getUserData()
  .then(function (user) {
    $scope.user = user;
    $scope.newPlaylist.groupId = $scope.user.currentGroup.id;
    GR.getPlaylistsByGroupId($scope.user.currentGroup.id)
    .then(function (playlists) {
      $scope.data.playlists = playlists;
    });
  })
  .catch(console.error);
  
  $scope.toggleModal = function () {
    $scope.modalShown = !$scope.modalShown;
  };

  $scope.makeCurrent = function (playlist) {
    $scope.data.currentPlaylist = playlist;
    console.log($scope.data.currentPlaylist);
    PL.getPlaylistSongs(playlist.id)
    .then(function (resp) {
      console.log(resp);
    })
    .then(console.error);
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