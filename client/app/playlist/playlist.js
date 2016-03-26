angular.module('jam.playlist', [])
.controller('PlaylistController', ['$scope', 'Users', 'Songs', 'Groups', function ($scope, Users, Songs, GR) {
  $scope.newPlaylist = {};
  $scope.data = {};
  $scope.data.currentPlaylist = {};
  $scope.data.playlists = [];
  $scope.user = {};

  $scope.updateIndex = function(index) {
    Songs.choose(index, 'playlist');
  };

  Users.getUserData()
  .then(function (user) {
    $scope.user = user;
    $scope.newPlaylist.groupId = $scope.user.currentGroup.id;
    GR.getPlaylistsByGroupId($scope.user.currentGroup.id)
    .then(function (playlists) {
      $scope.data.playlists = playlists;
    });
  })
  .catch(console.error);
  
  $scope.toggleCreateModal = function () {
    $scope.createModalShown = !$scope.createModalShown;
  };

  $scope.pendingDeletePlaylist = function (playlist) {
    $scope.pendingPlaylist = playlist;
    $scope.destroyModalShown = true;
  };

  $scope.makeCurrent = function (playlist) {
    $scope.data.currentPlaylist = playlist;
    Songs.getPlaylistSongs(playlist.id)
    .then(function (songs) {
      $scope.data.currentPlaylist.songs = songs;
    })
    .catch(console.error);
  };

  $scope.createPlaylist = function () {
    Songs.createPlaylist($scope.newPlaylist)
    .then(function (playlist) {
      $scope.createModalShown = false;
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
    Songs.deleteFromPlaylist(songId, $scope.data.currentPlaylist.id)
    .then(function(resp) {
      console.log(resp);
    })
    .catch(console.error);
  };

  $scope.deletePlaylist = function () {
    var playlist = $scope.pendingPlaylist;
    if ($scope.data.currentPlaylist.id === playlist.id) {
      $scope.data.currentPlaylist = {};
    }
    Songs.deletePlaylist(playlist.id)
    .then(function(resp) {
      $scope.destroyModalShown = false;
      $scope.data.playlists = _.filter($scope.data.playlists, function (currentPlaylist) {
        return currentPlaylist.id !== playlist.id;
      });
    })
    .catch(console.error);
  };

}]);