angular.module('jam.player', [])
.controller('PlayerController', ['$scope', 'Songs', function($scope, Songs) {
  $scope.playlist = Songs.getSoundsAndIndex();
  $scope.audio = Songs.player;
  $scope.currentTime = 0;

  $scope.muted = 0;

  $scope.stop = function () {
    $scope.audio.pause();
    $scope.audio.currentTime = 0;
  };

  setInterval(function() { $scope.$apply(); }, 200);

  $scope.mute = function () {
    if ($scope.muted) {
      $scope.audio.volume = $scope.muted;
      $scope.muted = 0;
    } else {
      $scope.muted = $scope.audio.volume;
      $scope.audio.volume = 0;
    }
  };

  $scope.togglePlay = function () {
    if ($scope.audio.paused) {
      $scope.audio.play();
    } else {
      $scope.audio.pause();
    }
  };

  var changeSong = function() {
    $scope.playlist = Songs.getSoundsAndIndex();
    $scope.audio.src = $scope.playlist.songs[$scope.playlist.index].compressedAddress ||
      $scope.playlist.songs[$scope.playlist.index].address;
    $scope.audio.onended = Songs.nextIndex;
    $scope.audio.play();
  };

  Songs.registerObserverCallback('CHANGE_SONG', changeSong);
  Songs.registerObserverCallback('TOGGLE_PLAY', $scope.togglePlay);
}]);
