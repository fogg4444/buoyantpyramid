angular.module('jam.player', ['rzModule'])
.controller('PlayerController', ['$scope', '$timeout', 'Songs', function($scope, timeout, Songs) {
  var isTouchDevice = 'ontouchstart' in document.documentElement;
  $scope.audio = Songs.getPlayer();
  $scope.song = null;
  $scope.muted = Songs.getMuted();
  $scope.timeFormat = '00:00';
  $scope.playable = false;



  $scope.speeds = [0.5, 0.75, 1, 1.5, 2];

  $scope.timeSlider = { 
    options: {
      floor: 0,
      ceil: $scope.audio.duration,
      step: 0.1,
      precision:10,
      hideLimitLabels: true,
      disabled: true,
      translate: function(value) {
        return Songs.timeFormat(value);
      },
      onEnd: function(sliderId, modelValue, highValue) {
        // $scope.audio.currentTime = modelValue;
      }
    }
  };

  $scope.volSlider = { 
    options: {
      floor: 0,
      ceil: 1,
      step: 0.02,
      precision: 10,
      showSelectionBar: true,
      hideLimitLabels: true,
      translate: function(value) {
        return '';
      },
      onEnd: function(sliderId, modelValue, highValue) {
        if (modelValue < 0.05) {
          $scope.mute();
        }
      }
    }
  };

  setInterval(function() { $scope.$apply(); }, 200);

  $scope.showSpeed = false;
  
  $scope.$watch(function(scope) {
    return scope.audio.volume;
  }, function(newV, oldV) {
    if (newV) {
      // var vol = newV < 0.1 ? 0 : newV;
      // if (newV < 0.1 && !$scope.muted) {
      //   $scope.mute();
      // } else 
      if ($scope.muted) {
        Songs.setMuted(false);
        $scope.muted = false;
      }
      // Songs.setVolume(newV);
    }
  });


  // $scope.$watch(function(scope) {
  //   return scope.audio.currentTime;
  // }, function(newV, oldV) {
  //   $scope.timeFormat = Songs.timeFormat(newV);
  // });

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

  $scope.changeTrack = function (direction) {
    var currentSongIndex = Songs.getSongIndex();
    if (direction === 'back') {
      if (currentSongIndex === 0) {
        $scope.stop();
        $scope.audio.play();
      } else {
        Songs.setSongIndex(currentSongIndex - 1);
      }
    }
    if (direction === 'forward') {
      if (currentSongIndex === $scope.playlist.songs.length - 1) {
        $scope.stop();
      } else {
        Songs.setSongIndex(currentSongIndex + 1);
      }
    }
  };

  $scope.toggleSpeed = function () {
    var currentIndex = $scope.speeds.indexOf($scope.audio.playbackRate);
    console.log('currentRate ' + $scope.audio.playbackRate);
    console.log('currentIndex ' + currentIndex);
    var nextIndex = (currentIndex + 1) % $scope.speeds.length;
    console.log('nextIndex ' + currentIndex);
    $scope.audio.playbackRate = $scope.speeds[nextIndex];
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
    $scope.audio.src = $scope.song.compressedAddress || null;
    $scope.audio.onended = Songs.nextIndex;
    $scope.audio.ondurationchange = function(e) {
      $scope.timeSlider.options.disabled = !$scope.audio.duration || isTouchDevice;
      $scope.timeSlider.options.ceil = $scope.audio.duration;
      $scope.playable = !!$scope.audio.duration;
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
