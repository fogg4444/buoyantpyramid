angular
    .module('jam.upload', [])
    .controller('UploadController', function($scope, FileUploader) {
        $scope.uploader = new FileUploader();
        $scope.options = {
          'url': 'http://localhost:5000/upload',
          'queueLimit': 5
        }
    });