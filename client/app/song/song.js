angular.module('jam.song', [])

.controller('SongController', ['$scope', '$location', 'Songs', 'Users', function ($scope, loc, Songs, Users) {
  // When user adds a new link, put it in the collection
  $scope.song = Songs.getSongClicked();
  $scope.player = Songs.getPlayer();

  // setInterval(function() {
  //   console.log('player ............ ', );
  // }, 100);

  var frequencyData = new Uint8Array(200);

  frequencyData = [1, 10, 180, 150, 200, 100, 400, 180, 150, 200, 100, 400, 180, 150, 200, 100, 400,
  180, 150, 200, 100, 400,180, 150, 200, 100, 400,180, 150, 200, 100, 400,180, 150, 200, 100, 400];
  var svgHeight = '300';
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
          .attr('fill', function(d) {
             return 'rgb(0, 0, ' + d + ')';
          });
    }

    renderChart();
}]);
