angular.module('jam.player', [])
.controller('PlayerController', ['$scope', 'ngAudio', 'Songs', function($scope, audio, Songs) {
  $scope.playlist = Songs.getSoundsAndIndex();
  $scope.sound = $scope.sound || $scope.playlist.sounds[$scope.playlist.index];
  
  var changeSong = function() {
    $scope.sound.stop();
    $scope.playlist = Songs.getSoundsAndIndex();
    $scope.sound = $scope.playlist.sounds[$scope.playlist.index];
    $scope.sound.play();
    $scope.sound.complete(function() {
      Songs.nextIndex();
    });
  };

  $scope.sound.complete(function() {
    console.log('When the song ended the index was: ', $scope.playlist.index);
    Songs.nextIndex();
  });

  Songs.registerObserverCallback(changeSong);
}]);
