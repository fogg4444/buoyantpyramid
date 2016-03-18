angular.module('jam.profile', [])

.controller('ProfileController', ['$scope', '$location', '$window', '$timeout', 'Auth', 'Upload',
function ($scope, loc, win, to, Auth, Up) {
  Auth.getUserData()
  .then(function (userData) {
    $scope.user = userData;
  })
  .catch(console.error);

  $scope.uploadFiles = function(file, errFiles) {
    $scope.f = file;
    $scope.errFile = errFiles && errFiles[0];
    if (file) {
      file.upload = Up.upload({
        url: '/api/upload',
        data: {file: file}
      });

      file.upload.then(function (response) {
        to(function () {
          file.result = response.data;
          $scope.user.avatarURL = file.name;

          $scope.updateProfile();
        });
      }, function (response) {
        if (response.status > 0) {
          $scope.errorMsg = response.status + ': ' + response.data;
        }
      }, function (evt) {
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    }
  };

  $scope.updateProfile = function () {
    Auth.updateProfile($scope.user)
    .then(function (res) {
      console.log('Profile updated', res.data.user);
      $scope.user = res.data.user;
    })
    .catch(function (error) {
      console.error(error);
    });
  };
}]);
