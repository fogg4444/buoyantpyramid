angular.module('jam.song', [])

.controller('SongController', ['$scope', '$location', '$route', 'Songs', 'Users', function ($scope, loc, $route, Songs, Users) {
  $scope.song = Songs.getSongClicked();
  $scope.audio = Songs.getPlayer();
  $scope.duration = $scope.audio.duration;
  $scope.commentTime = null;
  $scope.pinningComment = false;
  $scope.user = {};
  $scope.comments = [];
  $scope.selectedComment = [{}];
  // $scope.width = '1000px';
  var pinWidth = 12;
  var pageWidth = document.getElementsByClassName('page-content')[0].offsetWidth;
  var svgHeight = '100';
  var svgHeight2 = '20';
  var svgWidth = pageWidth * 0.9;
  var barPadding = '1';
  var svg = createSvg('.waveform-container', svgHeight, svgWidth);
  var commentPins = d3.select('body').selectAll('.pin-container').style('height', '20px').style('width', svgWidth + 'px');

  $scope.width = svgWidth + 'px';

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
  .then(function () {
    Songs.getComments($scope.song.id)
    .then(function (comments) {
      $scope.comments = comments;
      renderComments(comments);
    });
  });

  svg.attr('class', 'visualizer')
    .selectAll('rect')
    .data(frequencyData)
    .enter()
    .append('rect')
    .attr('rx', '2px')
    .attr('ry', '2px')
    .attr('x', function (d, i) {
     return i * (svgWidth / frequencyData.length);
    })
    .attr('width', svgWidth / frequencyData.length - barPadding);

    d3.select('body').selectAll('.selected-comment-container')
      .style('height', '20px')
      .style('width', svgWidth + 'px');

    var box = d3.select('body').selectAll('.selected-comment');
    var comment = d3.select('body').selectAll('.comment-icon');

  $scope.addComment = function (comment) {
    var time = Math.floor($scope.commentTime * $scope.audio.duration);
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

  function createSvg(parent, height, width) {
    return d3.select(parent).append('svg').attr('height', height).attr('width', width);
  };

  $scope.pinComment = function () {
    $scope.commentTime = $scope.audio.currentTime / $scope.audio.duration;
    $scope.pinningComment = true;
  };

  var renderComments = function(comments) {
    commentPins.selectAll('div')
      .data($scope.comments)
      .enter()
      .append('div')
      .style("left", function (d) {
        var left = Math.floor(d.time / $scope.duration * svgWidth) - pinWidth / 2;
        return left + 'px';
      })
      .attr('class', 'pin')
      .on('mouseover', function(d, i) {
        $scope.selectedComment = [d];
        renderSelectedComment();
      });
  };

  var renderSelectedComment = function(comment) {
    var left = Math.floor($scope.selectedComment[0].time / $scope.duration * svgWidth);
    box.data($scope.selectedComment)
      .style({left: left + 'px'})
      .style('width', svgWidth / 2 + 'px')
      .text(function (d) {
        return d.note;
      })
  };

  function renderFlow() {
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

  $scope.setPlayTime = function (e) {
    div = document.getElementsByClassName('visualizer')[0];
    var x = e.clientX - div.offsetLeft;
    $scope.audio.currentTime = $scope.audio.duration * x / svgWidth;
  };

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

  setInterval(renderFlow, 300);

}]);
