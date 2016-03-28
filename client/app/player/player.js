angular.module('jam.player', ['rzModule'])
.controller('PlayerController', ['$scope', '$timeout', 'Songs', function($scope, timeout, Songs) {
  $scope.audio = Songs.getPlayer();
  $scope.song = null;
  $scope.muted = Songs.getMuted();
  $scope.timeFormat = '00:00';

  $scope.timeSlider = { 
    options: {
      floor: 0,
      ceil: $scope.audio.duration,
      showSelectionBar: true,
      step: 0.01,
      hideLimitLabels: true,
      disabled: true,
      translate: function(value) {
        return Songs.timeFormat(value);
      }
    }
  };

  $scope.volSlider = { 
    options: {
      floor: 0.0,
      ceil: 1.0,
      step: 0.01,
      showSelectionBar: true,
      hideLimitLabels: true,
      translate: function(value) {
        return '';
      }
    }
  };

  setInterval(function() { $scope.$apply(); }, 200);

  $scope.showSpeed = false;
  
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
    $scope.timeFormat = Songs.timeFormat(newV);
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

  $scope.toggleSpeed = function () {
    $scope.showSpeed = !$scope.showSpeed;
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
    $scope.audio.ondurationchange = function(e) {
      $scope.timeSlider.options.disabled = !$scope.audio.duration;
      $scope.timeSlider.options.ceil = $scope.audio.duration;
    };
    $scope.audio.play();
  };

  var resetPlayer = function() {
    $scope.stop();
    $scope.audio = Songs.getPlayer();
    $scope.playlist = Songs.getSoundsAndIndex();
    $scope.timeSlider.options.disabled = !$scope.audio.duration;
  };

  var refreshList = function() {
    $scope.playlist = Songs.getSoundsAndIndex();
    $scope.timeSlider.options.disabled = !$scope.audio.duration;
  };

  Songs.registerObserverCallback('CHANGE_SONG', changeSong);
  Songs.registerObserverCallback('TOGGLE_PLAY', $scope.togglePlay);
  Songs.registerObserverCallback('RESET_PLAYER', resetPlayer);
  Songs.registerObserverCallback('REFRESH_LIST', refreshList);
}]);
