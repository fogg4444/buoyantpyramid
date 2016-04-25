angular.module('jam.uploadsFactory', ['jam.usersFactory'])
.factory('UploadFactory', ['$http', '$window', '$q', 'Upload', 'Users', 'Songs',
function ($http, win, q, Upload, Users, Songs) {
  var audioQueue = [];
  var uploadedAudio = [];

  // upload on file select or drop
  var upload = function(file, directory, successCallback, errorCallback, progressCallback) {

    var postData = {
      uniqueFilename: file.name,
      fileType: file.type
    };

    $http.post('/api/s3', postData)
    .then(function(res) {
      var s3Credentials = res.data;
      beginDirectS3Upload(s3Credentials, file);
    }, function(res) {
      // AWS Signature API Error
      console.log('Error', res);
    });

    String.prototype.uuid = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = (c === 'x') ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    };

    var beginDirectS3Upload = function(s3Credentials, file) {

      console.log('Begin s3 upload', s3Credentials);
      var groupId;

      Users.getUserData()
      .then(function(user) {
        var fileExtension = file.name.replace(/^.*\./, '');
        var uniqueFilename = ( Date.now() + file.name ).uuid() + '.' + fileExtension;
        var dataObj = {
          'key': directory + '/' + uniqueFilename,
          'acl': 'public-read',
          'Content-Type': file.type,
          'AWSAccessKeyId': s3Credentials.AWSAccessKeyId,
          'success_action_status': '201',
          'Policy': s3Credentials.s3Policy,
          'Signature': s3Credentials.s3Signature
        };

        // init upload bar on this element
        // var divId = 'progressBar' + file.queueId;
        // $scope[divId] = ngProgressFactory.createInstance();
        // console.log('Progress bar test!', $scope[divId]);
        // $scope[divId].setParent(document.getElementById(divId));
        // $scope[divId].start();
        // $scope[divId].setAbsolute();
        file.status = 'UPLOADING';
        file.progressPercentage = 0;
        file.uploader = Upload.upload({
          url: 'https://' + s3Credentials.bucketName + '.s3.amazonaws.com/',
          method: 'POST',
          transformRequest: function (data, headersGetter) {
            var headers = headersGetter();
            delete headers['Authorization'];
            return data;
          },
          data: dataObj,
          file: file,
        });
        file.uploader.then(function(response) {
          // On upload confirmation
          file.status = 'COMPLETE';
          file.progressPercentage = parseInt(100);
          console.log('Upload confirmed');
          if (response.status === 201) {
            var escapedUrl = new DOMParser().parseFromString(response.data, 'application/xml').getElementsByTagName('Location')[0].textContent;
            file.s3url = unescape(escapedUrl);
            file.uniqueFilename = uniqueFilename;
            if (successCallback) {
              successCallback(file, response);
            }
          } else {
            file.status = 'ERROR';
            if (errorCallback) {
              errorCallback(response);
            }
          }
        },
        null, // WHAT IS THIS?
        function(evt) {
          if (progressCallback) {
            progressCallback(file, evt);
          }
          
        });
        file.uploader.catch(errorCallback);
      });
    };
  };
  return {
    upload: upload,
    audioQueue: audioQueue

  };
}]);
