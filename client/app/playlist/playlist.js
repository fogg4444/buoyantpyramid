angular.module('jam.playlist', [])
.controller('PlaylistController', ['$scope', 'Auth', 'Playlists', 'Groups', 'Player', function ($scope, Auth, PL, GR, Play) {
  $scope.newPlaylist = {};
  $scope.data = {};
  $scope.data.currentPlaylist = {};
  $scope.data.playlists = [];
  $scope.user = {};
  $scope.where = 'playlist';

  $scope.updateIndex = function(index) {
    console.log(index, ': ', $scope.where);
  };

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

  $scope.toggleSongs = function () {
    Play.toggleIndex();
  };
  
  $scope.toggleModal = function () {
    $scope.modalShown = !$scope.modalShown;
  };

  $scope.makeCurrent = function (playlist) {
    $scope.data.currentPlaylist = playlist;
    PL.getPlaylistSongs(playlist.id)
    .then(function (songs) {
      $scope.data.currentPlaylist.songs = songs;
    })
    .then(console.error);
  };

  $scope.createPlaylist = function () {
    PL.createPlaylist($scope.newPlaylist)
    .then(function (playlist) {
      $scope.modalShown = false;
      $scope.currentPlaylist = playlist;

      GR.getPlaylistsByGroupId($scope.user.currentGroup.id)
      .then(function (playlists) {
        $scope.data.playlists = playlists;
      })
      .catch(console.error);
    });
  };

  $scope.deleteSong = function (index) {
    var songId = $scope.data.currentPlaylist.songs[index].id;
    $scope.data.currentPlaylist.songs.splice(index, 1);
    PL.deleteFromPlaylist(songId, $scope.data.currentPlaylist.id)
    .then(function(resp) {
      console.log(resp);
    })
    .catch(console.error);
  };

  $scope.deletePlaylist = function (playlist) {
    PL.deletePlaylist(playlist.id)
    .then(function(resp) {
      // update view?
    })
    .catch(console.error);
  };

}]);