angular.module('jam.songs', [])

.controller('SongsController', ['$scope', '$location', 'Songs', 'Auth', 'Groups', 'Playlists', function ($scope, loc, Songs, Auth, GR, PL) {
  // When user adds a new link, put it in the collection
  $scope.data = {};
  $scope.user = {};

  var augmentUrls = function (songs) {
    songs.forEach(function(song) {
      song.apiUrl = '/api/songs/' + song.address;
    });
  };

  Auth.getUserData()
  .then(function (user) {
    $scope.user = user;
    augmentUrls(user.currentGroup.songs);
    $scope.data.songs = user.currentGroup.songs;
    GR.getPlaylistsByGroupId($scope.user.currentGroup.id)
    .then(function (playlists) {
      $scope.data.playlists = playlists;
    });
  })
  .catch(console.error);

  $scope.addToPlaylist = function(playlist) {
    $scope.newSong.playlistId = playlist.id;
    PL.addSongToPlaylist($scope.newSong.id, playlist.id)
    .then(function (resp) {
      // tell user song was added
    })
    .catch(console.error);
  };

  $scope.toggleModal = function () {
    $scope.modalShown = !$scope.modalShown;
  };

  $scope.refreshSongs = function() {
    Songs.getAllSongs($scope.user.currentGroupId)
    .then(function(songs) {
      augmentUrls(songs);
      $scope.data.songs = songs;
    })
    .catch(console.error);
  };

  $scope.deleteSong = function(index) {
    Songs.deleteSong($scope.data.songs[index])
    .then(function() {
      $scope.data.songs.splice(index, 1);
    })
    .catch(function (err) {
      $scope.message = 'error: ' + err;
    });
  };
}]);
