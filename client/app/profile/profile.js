angular.module('jam.profile', [])

.controller('ProfileController', ['$scope', '$location', 'Profile', 'Auth',
function ($scope, loc, Profile, Auth) {
  $scope.profile = Auth.getUserData();
  if (!$scope.profile) {
    Auth.logout();
  }
  $scope.updateProfile = function () {
    Profile.updateUser($scope.profile)
    .then(function (res) {
      console.log('Profile updated', res.data);
      loc.path('/songs');
    })
    .catch(function (error) {
      console.error(error);
    });
  };
}]);