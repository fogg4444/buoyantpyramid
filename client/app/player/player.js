angular.module('jam.player', [])
.controller('PlayerController', ['$scope', 'ngAudio', 'Songs', function($scope, audio, Songs) {
  $scope.playlist = Songs.getSoundsAndIndex();
  $scope.sound = $scope.playlist.sounds ? $scope.playlist.sounds[$scope.playlist.index] : null;
  $scope.Songs = Songs;
  $scope.playing = Songs.playing;

  var togglePlay = function () {
    if ($scope.sound.paused) {
      $scope.sound.play();
    } else {
      $scope.sound.pause();
    }
  };

  var changeSong = function() {
    if ($scope.sound) {
      $scope.sound.stop();
    }
    $scope.playlist = Songs.getSoundsAndIndex();
    $scope.sound = $scope.playlist.sounds[$scope.playlist.index];
    $scope.sound.complete(function() {
      Songs.nextIndex();
    });
    $scope.sound.play();
  };


  Songs.registerObserverCallback(changeSong);
  Songs.registerObserverCallback(togglePlay);
}]);
