angular.module('jam', [
  'jam.services',
  'jam.songs',
  'jam.profile',
  'jam.auth',
  'jam.upload',
  'jam.groups',
  'jam.groupSettings',
  'jam.playlist',
  'ngRoute',
  'ngAnimate',
  'ngFileUpload',
  'ngImgCrop',
  'ngProgress'
])
.config(function ($routeProvider, $httpProvider) {
  $routeProvider
    .when('/login/', {
      templateUrl: 'app/auth/login.html',
      controller: 'AuthController'
    })
    .when('/login/:email', {
      templateUrl: 'app/auth/login.html',
      controller: 'AuthController'
    })
    .when('/songs', {
      templateUrl: 'app/songs/songs.html',
      controller: 'SongsController',
      authenticate: true
    })
    .when('/profile', {
      templateUrl: 'app/profile/profile.html',
      controller: 'ProfileController',
      authenticate: true
    })
    .when('/upload', {
      templateUrl: 'app/upload/upload.html',
      controller: 'UploadController',
      authenticate: true
    })
    .when('/groups', {
      templateUrl: 'app/groups/groups.html',
      controller: 'GroupsController',
      authenticate: true
    })
    .when('/group/settings', {
      templateUrl: 'app/groups/settings.html',
      controller: 'SettingsController',
      authenticate: true
    })
    .when('/playlists', {
      templateUrl: 'app/playlist/playlist.html',
      controller: 'PlaylistController',
      authenticate: true
    })
    .otherwise({
      redirectTo: '/songs'
    });

  // We add our $httpInterceptor into the array
  // of interceptors. Think of it like middleware for your ajax calls
  $httpProvider.interceptors.push('AttachTokens');
})
.directive('navBar', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/nav/nav.html',
    scope: {},
    controller: ['$scope', 'Auth', function($scope, Auth) {
      $scope.logout = Auth.logout;
      $scope.user = {};
      Auth.getUserData()
      .then(function (userData) {
        $scope.user = userData;
      })
      .catch(console.error);
    }]
  };
})
.directive('groupsNav', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/nav/groupsNav.html',
    scope: {},
    controller: ['$scope', 'Auth', function($scope, Auth) {
    }]
  };
})
.directive('songView', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/songs/songView.html',
    scope: {
      song: '=',
      index: '='

    }
  };
})
.directive('modalDialog', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/modal/modal.html',
    scope: {
      show: '='
    },
    replace: true,
    transclude: true,
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width) {
        scope.dialogStyle.width = attrs.width;
      }
      if (attrs.height) {
        scope.dialogStyle.height = attrs.height;
      }
      scope.hideModal = function() {
        scope.show = false;
      };
    }
  };
})
.directive('avatarFallback', function($http) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var avatars = [
        'http://vignette3.wikia.nocookie.net/metalocalypse/images/4/41/Nathan_Explosion.jpg',
        'http://vignette3.wikia.nocookie.net/metalocalypse/images/f/f6/Pickles.jpg',
        'http://vignette2.wikia.nocookie.net/metalocalypse/images/9/91/Skwigelf1.jpg',
        'http://vignette2.wikia.nocookie.net/metalocalypse/images/3/39/Metalocalypse-Toki_Wartooth.jpg',
        'http://vignette2.wikia.nocookie.net/metalocalypse/images/c/c5/William_Murderf.jpg'
      ];
      attrs.$observe('ngSrc', function(ngSrc) {
        $http.get(ngSrc).success(function() {
        }).error(function() {
          element.attr('src', avatars[Math.floor(Math.random() * avatars.length)]); // set default image
        });
      });
    }
  };

})
.factory('AttachTokens', function ($window) {
  // http request interceptor adds tokens
  var attach = {
    request: function (object) {
      if (! object.url.match(/^\/api\/.*/) ) {
        return object;
      }
      var jwt = $window.localStorage.getItem('com.jam');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})
.run(function ($rootScope, $location, Auth) {
  // check for token on route change
  $rootScope.$on('$routeChangeStart', function (evt, next, current) {
    if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
      $location.path('/login');
    }
  });
});
