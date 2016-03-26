angular.module('jam.song', [])

.controller('SongController', ['$scope', '$location', 'Songs', 'Users', function ($scope, loc, Songs, Users) {
  // When user adds a new link, put it in the collection
  $scope.song = Songs.getSongClicked();
  $scope.player = Songs.getPlayer();
  $scope.duration = $scope.player.duration;

  // setInterval(function() {
  //   console.log('player ............ ', );
  // }, 100);

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

  function createSvg(parent, height, width) {
    return d3.select(parent).append('svg').attr('height', height).attr('width', width);
  }

  var svg = createSvg('.visualizer', svgHeight, svgWidth);

  svg.selectAll('rect')
       .data(frequencyData)
       .enter()
       .append('rect')
       .attr('x', function (d, i) {
          console.log('...', i / frequencyData.length);
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
          .duration(800)
          .attr('fill', function(d, i) {
            if ((i / frequencyData.length) < ($scope.player.currentTime / $scope.duration)) {
              return 'rgb(0, 0, ' + 220 + ')';
            } else {
              return 'rgb(0, 0, ' + 100 + ')';
            }
          });
    }

    setInterval(renderChart, 300);
}]);
