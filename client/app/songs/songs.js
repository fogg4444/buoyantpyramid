angular.module('jam.songs', [])

.controller('SongsController', ['$scope', '$location', 'Songs', 'Auth', 'Profile', function ($scope, loc, Songs, Auth, Profile) {
  // When user adds a new link, put it in the collection
  $scope.data = {};

  Profile.getProfile()
  .then(function (resp) {
    $scope.user = resp.data;
    Songs.getAllSongs($scope.user.currentGroupId)
    .then(function (res) {
      $scope.data.songs = res;
    })
    .catch(function (error) {
      console.error(error);
    });
  })
  .catch(function (error) {
    console.error('Error getting profile!');
  });

  $scope.logout = Auth.logout; 
}]);
