angular.module('jam.profile', [])

.controller('ProfileController', ['$scope', '$location', '$window', '$timeout', 'Auth', 'Upload', 'UploadFactory',
function ($scope, loc, win, to, Auth, Up, UploadFactory) {
  $scope.avatarURL = '';
  Auth.getUserData()
  .then(function (userData) {
    $scope.user = userData;
    // $scope.avatarURL = '/api/users/' + $scope.user.id + '/avatar?rev=' + (++avatarRev);
  })
  .catch(console.error);

  // $scope.uploadFiles = function(file, errFiles) {
  //   $scope.f = file;
  //   $scope.errFile = errFiles && errFiles[0];
  //   if (file) {
  //     file.upload = Up.upload({
  //       url: '/api/users/avatar',
  //       data: {file: file}
  //     });

  //     file.upload.then(function (response) {
  //       to(function () {
  //         file.result = response.data;
  //         $scope.user.avatarURL = file.name;
  //         $scope.updateProfile();
  //         $scope.avatarURL = '/api/users/' + $scope.user.id + '/avatar?rev=' + (++avatarRev);
  //       });
  //     }, function (response) {
  //       if (response.status > 0) {
  //         $scope.errorMsg = response.status + ': ' + response.data;
  //       }
  //     }, function (evt) {
  //       file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
  //     });
  //   }
  // };

  var progressCallback = function(file, evt) {
    file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
  };

  var errorCallback = function (response) {
    $scope.errorMsg = response.status + ': ' + response.data;
  };

  var successCallback = function (file, response) {
    file.result = response.data;
    $scope.user.avatarURL = file.s3url;
    $scope.updateProfile();
  };

  $scope.uploadFiles = function(file, errFiles) {
    $scope.f = file;
    $scope.errFile = errFiles && errFiles[0];
    if (file) {
      UploadFactory.upload(file, 'images', successCallback, errorCallback, progressCallback);
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
