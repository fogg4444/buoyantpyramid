angular
  .module('jam.upload', [])
  .controller('UploadController', ['$scope', 'Upload', 'ngProgressFactory', 'Auth', function($scope, Upload, ngProgressFactory, Auth) {
    
    $scope.progressbar = ngProgressFactory.createInstance();

    var totalToUpload = 0;
    var totalUploaded = 0;
    var totalPercent = 0;

    var findTotalPercent = function() {
      var total = 0;
      for (var i = 0; i < $scope.queue.length; i++) {
        if ($scope.queue[i].progressPercentage) {
          total += $scope.queue[i].progressPercentage;
        }
      }

      totalPercent = Math.ceil(total / (totalToUpload));
      $scope.progressbar.set(totalPercent);
      if (totalPercent === 100) {
        $scope.progressbar.complete();
      }   
    };

    var throttledTotal = _.throttle(findTotalPercent, 250);

    $scope.addToQueue = function(files) {
      for (file in files) {
        $scope.queue.push(files[file]);
      }
    };

    $scope.queue = [];
    
    $scope.removeFile = function(index) {
      if (index > -1) {
        $scope.queue.splice(index, 1);
      }
    };

    // upload on file select or drop
    $scope.upload = function(file) {
      var groupId;
      Auth.getUserData()
      .then(function(user) {
        Upload.upload({
          url: '/api/groups/' + user.currentGroupId + '/songs',
          data: { file: file }
        }).then(function(resp) {
          totalUploaded++;
        }, function(resp) {
          console.error('Error status: ' + resp.status);
          totalUploaded++;
        }, function(evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          file['progressPercentage'] = progressPercentage;
          throttledTotal();
        });
      });
    };
    // for multiple files:
    $scope.uploadFiles = function() {
      $scope.progressbar.set(0);
      if ($scope.queue && $scope.queue.length) {
        totalToUpload = $scope.queue.length;
        totalUploaded = 0;
        for (var i = 0; i < $scope.queue.length; i++) {
          $scope.upload($scope.queue[i]);
        }
      }
    };
  }]);
