angular.module('jam.player', [])
.controller('PlayerController', ['$scope', 'ngAudio', 'Songs', function($scope, audio, Songs) {
  $scope.playlist = Songs.getSoundsAndIndex();
  $scope.sound = $scope.playlist.sounds ? $scope.playlist.sounds[$scope.playlist.index] : null;
  $scope.Songs = Songs;
  $scope.playing = Songs.playing;
  $scope.togglePlay = function () {
    if ($scope.sound.paused) {
      $scope.sound.play();
    } else {
      $scope.sound.pause();
    }
  };

  var changeSong = function() {
    if ($scope.sound) {
      $scope.sound.stop();
      $scope.$watch('Songs.playing', function (newVal, oldVal, scope) {
        console.log("Watching!", newVal, oldVal);
        $scope.togglePlay();
      });
    }
    $scope.playlist = Songs.getSoundsAndIndex();
    $scope.sound = $scope.playlist.sounds[$scope.playlist.index];
    $scope.sound.complete(function() {
      Songs.nextIndex();
    });
    $scope.sound.play();
  };


  Songs.registerObserverCallback(changeSong);
}]);
