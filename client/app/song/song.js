angular.module('jam.song', [])

.controller('SongController', ['$scope', '$location', 'Songs', 'Users', function ($scope, loc, Songs, Users) {
  // When user adds a new link, put it in the collection
  $scope.song = Songs.getSongClicked();
  console.log($scope.song);

  console.log(Songs.getSongClicked());

}]);
