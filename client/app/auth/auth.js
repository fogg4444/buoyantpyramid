angular.module('jam.auth', [])

.controller('AuthController', ['$scope', '$window', '$location', '$routeParams', 'Auth',
function ($scope, $window, $location, $routeParams, Auth) {
  $scope.confirm = false;
  $scope.passMismatch = false;
  $scope.loginError = '';
  $scope.signupError = '';
  $scope.user = {};
  $scope.user.email = $routeParams.email || '';

  $scope.login = function () {
    $scope.loginError = '';
    Auth.login($scope.user)
      .then(function (data) {
        $location.path('/songs');
      })
      .catch(function (error) {
        console.error(error.data);
        $scope.loginError = error.data;
      });
  };

  $scope.signup = function (pass) {
    $scope.signupError = '';
    if (pass === $scope.user.password) {
      $scope.passMismatch = false;
      $scope.user.displayName = 'anonymous';
      Auth.signup($scope.user)
        .then(function (data) {
          $location.path('/profile');
        })
        .catch(function (error) {
          console.error(error.data);
          $scope.signupError = error.data;
        });
    } else {
      $scope.newPassword = '';
      $scope.passMismatch = true;
      $scope.user.password = '';
    }
  };

  $scope.logout = function () {
    Auth.logout();
    $scope.user = null;
  };
}]);
