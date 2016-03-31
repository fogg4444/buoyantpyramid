angular.module('jam.auth', [])

.controller('AuthController', ['$scope', '$window', '$location', '$routeParams', 'Users',
function ($scope, $window, $location, $routeParams, Users) {
  $scope.confirm = false;
  $scope.passMismatch = false;
  $scope.loginError = '';
  $scope.signupError = '';
  $scope.user = {};
  $scope.user.email = $routeParams.email || '';
  $scope.showLogin = false;

  $scope.showLoginModal = function () {
    $scope.showLogin = true;
  };

  $scope.showSignupModal = function () {
    $scope.showSignup = true;
  };

  $scope.login = function () {
    $scope.loginError = '';
    Users.login($scope.user)
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
      Users.signup($scope.user)
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
    Users.logout();
    $scope.user = null;
  };

  $scope.images = [
    'evergreen1.jpg',
    'evergreen2.jpg',
    'evergreen3.jpg',
    'evergreen4.jpg',
    'safety1.JPG',
    'safety2.JPG',
    'safety3.JPG',
    'safety4.JPG',
    'safety5.JPG'
  ];

  $scope.backImage = {
    'background-image': 'url(assets/bands/' + $scope.images[Math.floor(Math.random() * $scope.images.length)] + ')'
  };

}]);
