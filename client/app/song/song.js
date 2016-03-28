angular.module('jam.song', [])

.controller('SongController', ['$scope', '$location', '$route', 'Songs', 'Users', function ($scope, loc, $route, Songs, Users) {
  $scope.song = {};
  $scope.audio = Songs.getPlayer();
  $scope.commentTime = null;
  $scope.pinningComment = false;
  $scope.user = {};
  $scope.comments = [];
  $scope.selectedComment = [{}];
  // $scope.currentSongIsPlaying = true;

  var pageWidth = document.getElementsByClassName('page-content')[0].offsetWidth;
  var waveHeight = '100';
  var waveWidth = pageWidth * 0.9;
  var pinWidth = '12';
  var pinHeight = '20';
  var barPadding = '1';

  $scope.width = waveWidth + 'px';

  // mock data
  var frequencyData = [1, 10, 30, 30, 60, 80, 140, 180, 150, 140, 150, 100, 50, 20, 20, 30, 50,
  90, 100, 120, 120, 100, 120, 115, 120, 150, 100, 50, 20, 20, 30, 50, 80, 140, 180,
   90, 100, 120, 120, 100, 120, 115, 120, 150, 100, 50, 20, 20, 30, 50, 1, 10, 30, 30, 60, 80, 140, 180,
    90, 100, 120, 120, 100, 120, 115, 120, 150, 100, 50, 20, 20, 30, 50, 60, 80, 140, 180,
     90, 100, 120, 120, 100, 120, 115, 120, 150, 100, 50, 20, 20, 30, 50, 30, 30, 60, 80, 140, 180,
      90, 100, 120, 120, 100, 120, 115, 120, 150, 100, 50, 20, 20, 30, 30, 60, 80, 140, 180,
       90, 100, 120, 120, 100, 120, 115, 120, 150, 100, 50, 20, 20, 30, 50, 1, 10, 30, 30, 60, 80, 140, 180];
 
  Users.getUserData()
  .then(function (user) {
    $scope.user = user;
  })
  .then(function() {
    return Songs.getSong(loc.path().split('/')[2])
    .then(function (song) {
      $scope.song = song;
    });
  })
  .then(function () {
    Songs.getComments($scope.song.id)
    .then(function (comments) {
      $scope.comments = comments;
      renderComments(comments);
      $scope.currentSongIsPlaying = $scope.song.address === $scope.audio.src;
    });
  });

  var createSvg = function (parent, height, width) {
    return d3.select(parent).append('svg').attr('height', height).attr('width', width);
  };

  // D3
  var svg = createSvg('.waveform-container', waveHeight, waveWidth);

  var commentPins = d3.select('body').selectAll('.pin-container')
                      .style('height', pinHeight + 'px')
                      .style('width', waveWidth + 'px');

  svg.attr('class', 'visualizer')
    .selectAll('rect')
    .data(frequencyData)
    .enter()
    .append('rect')
    .attr('rx', '2px')
    .attr('ry', '2px')
    .attr('x', function (d, i) {
     return i * (waveWidth / frequencyData.length);
    })
    .attr('width', waveWidth / frequencyData.length - barPadding);

  d3.select('body').selectAll('.selected-comment-container')
    .style('height', pinHeight + 'px')
    .style('width', waveWidth + 'px');

  var box = d3.select('body').selectAll('.selected-comment');
  var comment = d3.select('body').selectAll('.comment-icon');

  $scope.addComment = function (comment) {
    var time = Math.floor($scope.commentTime * $scope.song.duration);
    Songs.addComment({note: comment, time: time, userId: $scope.user.id}, $scope.song.id)
    .then(function (comment) {
      $scope.comments.push(comment);
      renderComments($scope.comments);
      $scope.pinningComment = false;
      $scope.comment = '';
    });
  };

  $scope.commentSelected = function () {
    return !!Object.keys($scope.selectedComment[0]).length;
  };

  $scope.pinComment = function () {
    $scope.commentTime = $scope.audio.currentTime / $scope.song.duration;
    $scope.pinningComment = true;
  };

  var renderComments = function(comments) {
    commentPins.selectAll('div')
      .data($scope.comments)
      .enter()
      .append('div')
      .style("left", function (d) {
        var left = Math.floor(d.time / $scope.song.duration * waveWidth) - pinWidth / 2;
        return left + 'px';
      })
      .attr('class', 'pin')
      .on('mouseover', function(d, i) {
        $scope.selectedComment = [d];
        renderSelectedComment();
      });
  };

  var renderSelectedComment = function(comment) {
    var left = Math.floor($scope.selectedComment[0].time / $scope.song.duration * waveWidth);
    box.data($scope.selectedComment)
      .style({left: left + 'px'})
      .style('width', waveWidth / 2 + 'px')
      .text(function (d) {
        return d.note;
      })
  };

  function renderFlow() {
    svg.selectAll('rect')
      .data(frequencyData)
      .attr('y', function(d) {
         return waveHeight - d;
      })
      .attr('height', function(d) {
         return d;
      })
      .transition()
      .duration(600)
      .attr('fill', function(d, i) {
        if ((i / frequencyData.length) < ($scope.audio.currentTime / $scope.song.duration) && $scope.currentSongIsPlaying) {
          return 'rgb(0, 0, ' + 220 + ')';
        } else {
          return 'rgb(0, 0, ' + 100 + ')';
        }
      });
  };

  $scope.setPlayTime = function (e) {
    if ($scope.currentSongIsPlaying) {
      div = document.getElementsByClassName('visualizer')[0];
      var x = e.clientX - div.offsetLeft;
      $scope.audio.currentTime = $scope.song.duration * x / waveWidth;
    }
  };

  $scope.togglePlay = function () {
    if ($scope.currentSongIsPlaying) {
      if ($scope.audio.paused) {
        $scope.audio.play();
      } else {
        $scope.audio.pause();
      }
    } else {
      $scope.audio.src = $scope.song.compressedAddress ||
        $scope.song.address;
      $scope.currentSongIsPlaying = $scope.song.address === $scope.audio.src;
      $scope.audio.play();
    }
  };  

  setInterval(renderFlow, 300);

}]);
