angular.module('jam.auth', [])

.controller('AuthController', ['$scope', '$window', '$location', 'Auth',
function ($scope, $window, $location, Auth) {
  $scope.user = null;

  $scope.login = function () {
    Auth.login($scope.user)
      .then(function (data) {
        $location.path('/songs');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function () {
    $scope.user.displayName = 'anonymous';
    Auth.signup($scope.user)
      .then(function (data) {
        $location.path('/profile');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.logout = function () {
    Auth.logout();
    $scope.user = null;
  };
}]);
