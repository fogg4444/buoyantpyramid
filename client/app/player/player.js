angular.module('jam.player', [])
.controller('PlayerController', ['$scope', 'ngAudio', 'Player', function($scope, audio, Play) {
  $scope.playlist = Play.getSoundsAndIndex();
  $scope.sound = $scope.sound || $scope.playlist.sounds[$scope.playlist.index];
  
  var changeSong = function() {
    $scope.sound.stop();
    $scope.playlist = Play.getSoundsAndIndex();
    $scope.sound = $scope.playlist.sounds[$scope.playlist.index];
    $scope.sound.play();
    $scope.sound.complete(function() {
      Play.updateIndex();
    });
  };

  $scope.sound.complete(function() {
    console.log('When the song ended the index was: ', $scope.playlist.index);
    Play.updateIndex();
  });

  Play.registerObserverCallback(changeSong);
}]);
