angular.module('jam.infoFactory', [])

.factory('Info', ['$http', '$q', function (http, q) {

  var getStats = function() {
    return http({
      method: 'GET',
      url: '/api/info/'
    }).then(function(res) {
      return res;
    });
  };

  return {
    getStats: getStats
  };

}]);
