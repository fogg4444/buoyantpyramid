// do not tamper with this code in here, study it, but do not touch
// this Auth controller is responsible for our client side authentication
// in our signup/login forms using the injected Auth service
angular.module('jam.auth', [])

.controller('AuthController', ['$scope', '$window', '$location', 'Auth', function ($scope, $window, $location, Auth) {
  $scope.user = {};

  $scope.login = function () {
    Auth.login($scope.email)
      .then(function (token) {
        $window.localStorage.setItem('com.jam', token);
        $location.path('/songs');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function () {
    $scope.user.displayName = 'anonymous';
    Auth.signup($scope.user)
      .then(function (token) {
        $window.localStorage.setItem('com.jam', token);
        $location.path('/profile');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signout = function () {
    Auth.signout()
      .then(function () {
      })
      .catch(function (error) {
        console.error(error);
      });
  };
}]);
