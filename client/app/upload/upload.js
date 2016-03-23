angular
  .module('jam.upload', [])
  .controller('UploadController', ['$scope', 'Upload', 'UploadFactory', 'ngProgressFactory', 'Auth', 'Songs', '$http', function($scope, Upload, UploadFactory, ngProgressFactory, Auth, Songs, $http) {
    
    // var socket = io.connect('http://localhost:8080');
    // socket.on('news', function (data) {
    //   console.log(data);
    //   socket.emit('my other event', { my: 'data' });
    // });

    // socket.on('trancodeStatus', function(data) {
    //   console.log('Transcod data to client: ', data);
    // });

    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.queue = UploadFactory.audioQueue;

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
      // console.log('Total percent progress bar: ========== ', totalPercent);

      $scope.progressbar.set(totalPercent);
      if (totalPercent === 100) {
        $scope.progressbar.complete();
      }   
    };

    var throttledTotal = _.throttle(findTotalPercent, 250);

    $scope.addToQueue = function(files) {
      for (file in files) {
        var thisFile = files[file];
        thisFile['queueId'] = Math.floor( Math.random() * 10000000 );
        thisFile.status = 'READY';
        thisFile.editing = false;
        thisFile.displayName = thisFile.name;
        $scope.queue.push(thisFile);
      }
    };

    
    $scope.removeFile = function(index) {
      if (index > -1) {
        $scope.queue.splice(index, 1);
      }
    };

    var getAudioLength = function(file, cb) {
      var objectUrl;
      var a = document.createElement('audio');
      a.addEventListener('canplaythrough', function(e) {
        var seconds = e.currentTarget.duration;
        cb(seconds);
        URL.revokeObjectURL(objectUrl);
      });
      objectUrl = URL.createObjectURL(file);
      a.setAttribute('src', objectUrl);
    };

    var progressCallback = function(file, evt) {
      var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      file['progressPercentage'] = progressPercentage;
      throttledTotal();
    };

// <<<<<<< d1ac01fff9b90868c42a018aaad4514ad97268e6
    var successCallback = function (file, response) {
      Auth.getUserData()
      .then(function(user) {
        getAudioLength(file, function(duration) {
          file.duration = duration;
          return Songs.addSong(file, user.currentGroupId);
// =======
//             // TODO: pass data to progress bar
//             throttledTotal();
//           });
// >>>>>>> (feat) implement download queue on compression server
        });
      })
      .then(function(data) {
        // console.log('Song added: ', data);
      })
      .catch(console.error);
    };

    $scope.cancelUpload = function(file) {
      if (file.uploader) {
        file.uploader.abort();
        file.status = 'CANCELLED';
      }
    };

    $scope.upload = function(file) {
      file.editing = false;
      UploadFactory.upload(file, 'audio', successCallback, console.error, progressCallback);
      file.progressPercentage = 0;
    };

    // for multiple files:
    $scope.cancelAll = function() {
      $scope.progressbar.set(0);
      if ($scope.queue && $scope.queue.length) {
        totalToUpload = 0;
        totalUploaded = 0;
        for (var i = 0; i < $scope.queue.length; i++) {
          if ($scope.queue[i].status === 'UPLOADING') {
            $scope.cancelUpload($scope.queue[i]);
          }
        }
      }
    };

    // for multiple files:
    $scope.uploadFiles = function() {
      $scope.progressbar.set(0);
      if ($scope.queue && $scope.queue.length) {
        totalToUpload = $scope.queue.length;
        totalUploaded = 0;
        for (var i = 0; i < $scope.queue.length; i++) {
          if ($scope.queue[i].status === 'READY') {
            $scope.upload($scope.queue[i]);
          }
        }
      }
    };
  }]);
 
