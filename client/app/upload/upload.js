angular
  .module('jam.upload', [])
  .controller('UploadController', ['$scope', 'Upload', 'ngProgress', 'Auth', function($scope, Upload, ngProgressFactory, Auth) {

    // upload later on form submit or something similar
    $scope.submit = function() {
      // console.log('Submit', $scope.form.file);
      // if ($scope.form.file.$valid && $scope.file) {
      //   $scope.upload($scope.file);
      // }
    };

    $scope.addToQueue = function(files) {
      // console.log(files);
      for (file in files) {
        $scope.queue.push(files[file]);
        console.dir(file);
      }
      console.log($scope.queue);
    };

    $scope.queue = [];

    $scope.uploadingCount = 0;

    $scope.removeFile = function(index) {
      console.log('Remove file: ', file);
      if (index > -1) {
        $scope.queue.splice(index, 1);
      }
    };

    // upload on file select or drop
    $scope.upload = function(file) {
      console.log('Upload', file);
      
      var groupId;
      Auth.getUserData()
      .then(function(user) {
        Upload.upload({
          url: '/api/groups/' + user.currentGroupId + '/songs',
          data: { file: file }
        }).then(function(resp) {
          $scope.uploadingCount--;
          console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function(resp) {
          console.log('Error status: ' + resp.status);
          $scope.uploadingCount--;
        }, function(evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
          file['progressPercentage'] = progressPercentage;
          console.log($scope.queue);
        });
      });
    };
    // for multiple files:
    $scope.uploadFiles = function() {
      console.log('Upload files', $scope.queue);
      if ($scope.queue && $scope.queue.length) {
        for (var i = 0; i < $scope.queue.length; i++) {
          console.log('file: ', $scope.queue[i]);
          $scope.upload($scope.queue[i]);
        }
      }
    };
    // $scope.progressbar = ngProgressFactory.createInstance();
    // $scope.progressbar.start();
  }]);
