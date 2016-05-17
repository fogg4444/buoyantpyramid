angular.module('jam.info', [])
.controller('InfoController', ['$scope', '$location', 'Songs', 'Users', 'Groups', '$anchorScroll', function($scope, $location, Songs, Users, GR, $anchorScroll) {

  $scope.scrollTo = function(id) {
    console.log('scroll to :', id, $location);
    $location.hash(id);
    $anchorScroll();
  };

}]);