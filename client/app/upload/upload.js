angular
  .module('jam.upload', [])
  .controller('UploadController', ['$scope', 'Upload', 'ngProgressFactory', 'Auth', '$http', function($scope, Upload, ngProgressFactory, Auth, $http) {
    
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

    // $scope.signature = '';
    // $scope.policy = '';
    // AWSAccessKey = 'AKIAIIIRPCLLGTLJGNZQ';

    // upload on file select or drop
    $scope.upload = function(file) {

      // hash filename here
      // var uniqueFileName = ;
      console.log('Upload called on client side');

      var postData = {
        uniqueFilename: 'uniqueFileName'
      }
      $http.post("http://localhost:5000/api/s3", postData)
      .then(function(res){
        console.log('Success', res);
        // Proceed to next step
        beginDirectS3Upload(res.data);
      }, function(res){
        console.log('Error', res);
        // AWS Signature API Error
      });

      var beginDirectS3Upload = function(customUrl) {
        console.log('Begin s3 upload', customUrl);
        var groupId;

        Auth.getUserData()
        .then(function(user) {
          console.log('After get user begin upload');
          Upload.upload({
            // url: '/api/groups/' + user.currentGroupId + '/songs',
            // need to get the database entry working again
            method: 'PUT',
            url: customUrl,
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
      }
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
