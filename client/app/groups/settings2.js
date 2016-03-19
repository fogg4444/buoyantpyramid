angular.module('jam.groupSettings', [])

.controller('SettingsController', ['$scope', '$timeout', 'Upload', 'Auth', function($scope, to, Up, Auth) {
  $scope.user = {};

  Auth.getUserData()
  .then(function (user) {
    $scope.user = user;
  })
  .catch(console.error);

  $scope.sendInvite = function() {
    console.log($scope.invite);
  };

  $scope.updateGroupProfile = function() {
    // Update the group in the database
  };

  $scope.upload = function (dataUrl, name) {
    Up.upload({
      url: '/api/upload',
      data: {
        file: Up.dataUrltoBlob(dataUrl, name)
      },
    }).then(function (response) {
      to(function () {
        $scope.result = response.data;
      });
    }, function (response) {
      if (response.status > 0) {
        $scope.errorMsg = response.status + ': ' + response.data; 
      } 
    }, function (evt) {
      $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
    });
  };

  $scope.logUserGroup = function() {
    console.log($scope.user.currentGroup);
  };
}]);