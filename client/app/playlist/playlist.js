angular.module('jam.playlist', [])
.controller('PlaylistController', ['$scope', 'Auth', 'Playlists', 'Groups', function ($scope, Auth, PL, GR) {
  $scope.newPlaylist = {};
  $scope.data = {};
  $scope.data.currentPlaylist = {};
  $scope.data.playlists = [];
  $scope.user = {};

  var augmentUrls = function (songs) {
    songs.forEach(function(song) {
      song.apiUrl = '/api/songs/' + song.address;
    });
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
  
  $scope.toggleModal = function () {
    $scope.modalShown = !$scope.modalShown;
  };

  $scope.makeCurrent = function (playlist) {
    console.log("playlist", playlist);
    $scope.data.currentPlaylist = playlist;
    PL.getPlaylistSongs(playlist.id)
    .then(function (songs) {
      augmentUrls(songs);
      $scope.data.currentPlaylist.songs = songs;
    })
    .then(console.error);
  };

  $scope.createPlaylist = function () {
    PL.createPlaylist($scope.newPlaylist)
    .then(function (playlist) {
      $scope.modalShown = false;
      $scope.currentPlaylist = playlist.data;

      GR.getPlaylistsByGroupId($scope.user.currentGroup.id)
      .then(function (resp) {
        console.log(resp);
      })
      .catch(console.error);
    });
  };

  $scope.deleteSong = function (index) {
    // console.log("Delete this song: ", index, $scope.data.currentPlaylist[index]);
    $scope.data.currentPlaylist.splice(index, 1);
    console.log($scope.data.currentPlaylist);
    PL.deleteFromPlaylist($scope.data.currentPlaylist)
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