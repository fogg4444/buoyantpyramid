angular
  .module('jam.upload', [])
  .controller('UploadController', ['$scope', 'Upload', 'ngProgressFactory', 'Auth', function($scope, Upload, ngProgressFactory, Auth) {
    
    $scope.progressbar = ngProgressFactory.createInstance();

    var totalToUpload = 0;
    var totalUploaded = 0;
    var totalPercent = 0;
    // upload later on form submit or something similar
    $scope.submit = function() {
      // console.log('Submit', $scope.form.file);
      // if ($scope.form.file.$valid && $scope.file) {
      //   $scope.upload($scope.file);
      // }
    };

    var findTotalPercent = function() {
      var total = 0;
      for (var i = 0; i < $scope.queue.length; i++) {
        if ($scope.queue[i].progressPercentage) {
          total += $scope.queue[i].progressPercentage;
        }
      }

      totalPercent = Math.ceil(total / (totalToUpload));
      console.log('totalpercent ' + totalPercent);
      $scope.progressbar.set(totalPercent);
      if (totalPercent === 100) {
        $scope.progressbar.complete();
      }   
    };

    var throttledTotal = _.throttle(findTotalPercent, 250);

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
      // console.log('Upload', file);
      
      var groupId;
      Auth.getUserData()
      .then(function(user) {
        Upload.upload({
          url: '/api/groups/' + user.currentGroupId + '/songs',
          data: { file: file }
        }).then(function(resp) {
          totalUploaded++;
          // var totalPercent = Math.ceil(100 * (totalUploaded / totalToUpload));
          // console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
          // $scope.progressbar.set(totalPercent);
          // console.log('totalpercent ' + totalPercent);
        }, function(resp) {
          console.log('Error status: ' + resp.status);
          totalUploaded++;
          // $scope.progressbar.set(Math.ceil(100 * (totalUploaded / totalToUpload)));
        }, function(evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          // console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
          file['progressPercentage'] = progressPercentage;
          // findTotalPercent();
          // console.log($scope.queue);
          throttledTotal();
        });
      });
    };
    // for multiple files:
    $scope.uploadFiles = function() {
      $scope.progressbar.set(0);
      // console.log('Upload files', $scope.queue);
      if ($scope.queue && $scope.queue.length) {
        totalToUpload = $scope.queue.length;
        totalUploaded = 0;
        for (var i = 0; i < $scope.queue.length; i++) {
          // console.log('file: ', $scope.queue[i]);
          $scope.upload($scope.queue[i]);
        }
      }
    };
     // $scope.progressbar.start();
  }]);
