angular.module('jam.groupSettings', [])

.controller('SettingsController', ['$scope', '$timeout', 'Upload', 'Users', 'Groups', 'UploadFactory', function($scope, to, Up, Users, Groups, UploadFactory) {
  $scope.user = {};
  $scope.group = {};

  Users.getUserData()
  .then(function (user) {
    $scope.user = user;
    $scope.group = user.currentGroup;
  })
  .catch(console.error);


  $scope.showBannerModal = function (file) {
    $scope.file = file;
    $scope.bannerModalShown = true;
  };

  $scope.hideBannerModal = function () {
    $scope.bannerModalShown = false;
  };

  $scope.sendInvite = function() {
    Groups.sendInvite($scope.group, $scope.invite);
  };

  $scope.updateGroupProfile = function() {
    Groups.updateInfo($scope.group)
    .then(function(res) {
      console.log(res.data);
      _.extend($scope.user.currentGroup, res.data);
    })
    .catch(console.error);
  };

  $scope.removeBanner = function() {
    Groups.updateInfo({
      id: $scope.group.id,
      bannerUrl: ''
    })
    .then(function(res) {
      // console.log(res.data);
      _.extend($scope.user.currentGroup, res.data);
    })
    .catch(console.error);
  };

  var progressCallback = function(file, evt) {
    file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
  };

  var errorCallback = function (response) {
    $scope.errorMsg = response.status + ': ' + response.data;
  };

  var successCallback = function (file, response) {
    $scope.result = response.data;
    $scope.group.bannerUrl = file.s3url;
    $scope.hideBannerModal();
    $scope.updateGroupProfile($scope.group);
  };

  $scope.upload = function(dataUrl, name) {
    var file = Up.dataUrltoBlob(dataUrl, name);
    $scope.file = file;
    if (file) {
      UploadFactory.upload(file, 'images', successCallback, errorCallback, progressCallback);
    }
  };  



















  
}]);