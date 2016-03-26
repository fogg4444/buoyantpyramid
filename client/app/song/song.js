angular.module('jam.song', [])

.controller('SongController', ['$scope', '$location', 'Songs', 'Users', function ($scope, loc, Songs, Users) {
  // When user adds a new link, put it in the collection
  $scope.song = Songs.getSongClicked();
  $scope.audio = Songs.getPlayer();
  $scope.duration = $scope.audio.duration;
  $scope.commentTime = null;
  $scope.pinningComment = false;
  $scope.user = {};

  Users.getUserData()
  .then(function (user) {
    $scope.user = user;
  });

  // mock data
  var frequencyData = [1, 10, 30, 30, 60, 80, 140, 180, 150, 140, 150, 100, 50, 20, 20, 30, 50,
  90, 100, 120, 120, 100, 120, 115, 120, 150, 100, 50, 20, 20, 30, 50, 80, 140, 180,
   90, 100, 120, 120, 100, 120, 115, 120, 150, 100, 50, 20, 20, 30, 50, 1, 10, 30, 30, 60, 80, 140, 180,
    90, 100, 120, 120, 100, 120, 115, 120, 150, 100, 50, 20, 20, 30, 50, 60, 80, 140, 180,
     90, 100, 120, 120, 100, 120, 115, 120, 150, 100, 50, 20, 20, 30, 50, 30, 30, 60, 80, 140, 180,
      90, 100, 120, 120, 100, 120, 115, 120, 150, 100, 50, 20, 20, 30, 30, 60, 80, 140, 180,
       90, 100, 120, 120, 100, 120, 115, 120, 150, 100, 50, 20, 20, 30, 50, 1, 10, 30, 30, 60, 80, 140, 180];

  var svgHeight = '200';
  var svgWidth = '1000';
  var barPadding = '1';
  $scope.width = '1000px';

  $scope.togglePlay = function () {
    if ($scope.audio.src) {
      if ($scope.audio.paused) {
        $scope.audio.play();
      } else {
        $scope.audio.pause();
      }
    } else {
      $scope.audio.src = $scope.song.compressedAddress ||
        $scope.song.address;
      $scope.audio.play();
    }
  };

  $scope.pinComment = function () {
    $scope.commentTime = $scope.audio.currentTime / $scope.audio.duration;
    $scope.pinningComment = true;
  };

  $scope.addComment = function (comment) {
    var time = Math.floor($scope.commentTime * $scope.audio.duration);
    Songs.addComment({note: comment, time: time, userId: $scope.user.id}, $scope.song.id);
    $scope.pinningComment = false;
    $scope.comment = '';
  };

  $scope.setPlayTime = function (e) {
    div = document.getElementsByClassName('visualizer')[0];
    var x = e.clientX - div.offsetLeft;
    
    $scope.audio.currentTime = $scope.audio.duration * x / svgWidth;
  };
  function createSvg(parent, height, width) {
    return d3.select(parent).append('svg').attr('height', height).attr('width', width);
  }

  var svg = createSvg('.visualizer', svgHeight, svgWidth);

  svg.selectAll('rect')
    .data(frequencyData)
    .enter()
    .append('rect')
    .attr('x', function (d, i) {
     return i * (svgWidth / frequencyData.length);
    })
    .attr('width', svgWidth / frequencyData.length - barPadding);

  // Continuously loop and update chart with frequency data.
  function renderChart() {
     // Update d3 chart with new data.
     svg.selectAll('rect')
        .data(frequencyData)
        .attr('y', function(d) {
           return svgHeight - d;
        })
        .attr('height', function(d) {
           return d;
        })
        .transition()
        .duration(600)
        .attr('fill', function(d, i) {
          if ((i / frequencyData.length) < ($scope.audio.currentTime / $scope.duration)) {
            return 'rgb(0, 0, ' + 220 + ')';
          } else {
            return 'rgb(0, 0, ' + 100 + ')';
          }
        });
  }

  setInterval(renderChart, 300);

}]);
