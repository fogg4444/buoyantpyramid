angular.module('jam.songs', [])

.controller('SongsController', ['$scope', '$location', 'Songs', 'Auth', function ($scope, loc, Songs, Auth) {
  // When user adds a new link, put it in the collection
  $scope.data = {};
  $scope.user = {};

  var augmentUrls = function (songs) {
    songs.forEach(function(song) {
      song.apiUrl = '/api/songs/' + song.address;
    });
  };

  $scope.addToPlaylist = function(song) {
    console.log(song);
  };

  $scope.refreshSongs = function() {
    Songs.getAllSongs($scope.user.currentGroupId)
    .then(function(songs) {
      augmentUrls(songs);
      $scope.data.songs = songs;
    })
    .catch(console.error);
  };

  Auth.getUserData()
  .then(function (user) {
    $scope.user = user;
    augmentUrls(user.currentGroup.songs);
    $scope.data.songs = user.currentGroup.songs;
  })
  .catch(console.error);
}]);
