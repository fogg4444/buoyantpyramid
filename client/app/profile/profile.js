angular.module('jam.profile', [])

.controller('ProfileController', ['$scope', '$location', '$window', '$timeout', 'Users', 'Upload', 'UploadFactory',
function ($scope, loc, win, to, Users, Up, UploadFactory) {
  $scope.avatarURL = '';
  Users.getUserData()
  .then(function (userData) {
    $scope.user = userData;
    // $scope.avatarURL = '/api/users/' + $scope.user.id + '/avatar?rev=' + (++avatarRev);
  })
  .catch(console.error);

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
    Users.updateProfile($scope.user)
    .then(function (res) {
      console.log('Profile updated', res.data.user);
      $scope.user = res.data.user;
    })
    .catch(function (error) {
      console.error(error);
    });
  };
}]);
