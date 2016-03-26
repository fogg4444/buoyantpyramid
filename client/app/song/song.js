angular.module('jam.song', [])

.controller('SongController', ['$scope', '$location', 'Songs', 'Auth', function ($scope, loc, Songs, Auth) {
  // When user adds a new link, put it in the collection
  $scope.song = Songs.getSongClicked();
  console.log($scope.song);

  console.log(Songs.getSongClicked());

}]);
