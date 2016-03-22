angular.module('jam.player', [])
.controller(['PlayerController'], ['$scope', 'ngAudio', function($scope, audio) {
  $scope.sound = audio.load("http://mattyluv.com/mp3/hickey_firstlp/Hickey%20-%2001%20-%20Believe.mp3");
}]);