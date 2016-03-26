angular.module('jam.player', [])
.controller('PlayerController', ['$scope', '$timeout', 'Songs', function($scope, timeout, Songs) {
  $scope.audio = Songs.getPlayer();
  $scope.currentTime = 0;
  $scope.song = null;
  $scope.muted = Songs.getMuted();
  $scope.timeFormat = '00:00';
  setInterval(function() { $scope.$apply(); }, 200);
  
  $scope.$watch(function(scope) {
    return scope.audio.volume;
  }, function(newV, oldV) {
    if (newV) {
      var vol = newV < 0.1 ? 0 : newV;
      if (newV < 0.1 && !$scope.muted) {
        $scope.mute();
      } else if ($scope.muted) {
        Songs.setMuted(false);
        $scope.muted = false;
      }
      Songs.setVolume(vol);
    }
  });


  $scope.$watch(function(scope) {
    return scope.audio.currentTime;
  }, function(newV, oldV) {
    if (newV) {
      $scope.timeFormat = Songs.timeFormat(newV);
    }
  });

  $scope.stop = function () {
    $scope.audio.pause();
    $scope.audio.currentTime = 0;
  };

  $scope.mute = function () {
    if ($scope.muted) {
      $scope.audio.volume = Songs.getVolume();
    } else {
      $scope.audio.volume = 0;
    }
    $scope.muted = !$scope.muted;
    Songs.setMuted($scope.muted);
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
    $scope.song = $scope.playlist.songs[$scope.playlist.index];
    $scope.audio.src = $scope.song.compressedAddress ||
      $scope.song.address;
    $scope.audio.onended = Songs.nextIndex;
    $scope.audio.play();
  };

  var resetPlayer = function() {
    $scope.stop();
    $scope.audio = Songs.getPlayer();
    $scope.playlist = Songs.getSoundsAndIndex();
  };

  var refreshList = function() {
    $scope.playlist = Songs.getSoundsAndIndex();
  };

  Songs.registerObserverCallback('CHANGE_SONG', changeSong);
  Songs.registerObserverCallback('TOGGLE_PLAY', $scope.togglePlay);
  Songs.registerObserverCallback('RESET_PLAYER', resetPlayer);
  Songs.registerObserverCallback('REFRESH_LIST', refreshList);
}]);
