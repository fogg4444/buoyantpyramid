angular.module('jam.profile', [])

.controller('ProfileController', function ($scope, $location, Profile) {
  // When user adds a new link, put it in the collection
  $scope.profile = {};
  User.update()
  .then(function (res) {
    console.log('Profile updated', res.data);
    $location.path('/songs');
  })
  .catch(function (error) {
    console.error(error);
  });
});