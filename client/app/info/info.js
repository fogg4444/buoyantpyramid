angular.module('jam.info', [])
.controller('InfoController', ['$scope', '$location', 'Songs', 'Users', 'Groups', 'Info', '$anchorScroll', function($scope, $location, Songs, Users, GR, Info, $anchorScroll) {

  $scope.scrollTo = function(id) {
    console.log('scroll to :', id, $location);
    $location.hash(id);
    $anchorScroll();
  };

  Info.getStats().then(function(res) {
    console.log('then!', res);
    $scope.userCount = res.data.userCount;
    $scope.songCount = res.data.songCount;
  });
  

}]);