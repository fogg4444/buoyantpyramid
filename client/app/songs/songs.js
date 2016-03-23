angular.module('jam.songs', [])

.controller('SongsController', ['$scope', '$location', 'Songs', 'Auth', 'Groups', function ($scope, loc, Songs, Auth, GR, PL) {
  // When user adds a new link, put it in the collection
  $scope.data = {};
  $scope.user = {};
  $scope.where = 'songs';

  $scope.updateIndex = function(index) {
    Songs.choose(index, $scope.where);
  };

  Auth.getUserData()
  .then(function (user) {
    $scope.user = user;
    $scope.refreshSongs();
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
      $scope.data.songs = songs;
    })
    .catch(console.error);
  };

  $scope.deleteSong = function(index) {
    console.log($scope.data.songs[index].id);
    Songs.deleteSong($scope.data.songs[index])
    .then(function() {
      $scope.data.songs.splice(index, 1);
    })
    .catch(function (err) {
      $scope.message = 'error: ' + err;
    });
  };
}]);
