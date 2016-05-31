angular.module('jam', [
  'jam.song',
  'jam.songs',
  'jam.profile',
  'jam.auth',
  'jam.upload',
  'jam.groups',
  'jam.groupSettings',
  'jam.playlist',
  'jam.player',
  'jam.usersFactory',
  'jam.groupsFactory',
  'jam.uploadsFactory',
  'jam.songsFactory',
  'jam.infoFactory',
  'jam.info',
  'ngRoute',
  'ngAnimate',
  'ngFileUpload',
  'ngImgCrop',
  'ngProgress',
  'dndLists',
  'focus-if'
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
    .when('/song/:id', {
      templateUrl: 'app/song/song.html',
      controller: 'SongController',
      controllerAs: 'songCtrl',
      authenticate: true
    })
    .when('/songs', {
      templateUrl: 'app/songs/songs.html',
      controller: 'SongsController',
      controllerAs: 'songCtrl',
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
      controllerAs: 'playlistCtrl',
      authenticate: true
    })
    .when('/info', {
      templateUrl: 'app/info/info.html',
      controller: 'InfoController',
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
    controller: ['$scope', 'Users', '$window', function($scope, Users, $window) {
      $scope.logout = function () {
        Users.logout();
        $window.location.reload();
      }; 
      $scope.user = {};
      $scope.showMenu = false; // only matters for mobile
      
      $scope.toggleMenu = function () {
        $scope.showMenu = !$scope.showMenu;
      };

      Users.getUserData()
      .then(function (userData) {
        $scope.user = userData;

        return Users.getGroups(userData.id);
      })
      .then(function (groups) {
        $scope.user.invites = groups.pending;
      })
      .catch(console.error);
    }]
  };
})
.directive('groupsNav', function () {
  return {
    restrict: 'E',
    templateUrl: 'app/nav/groupsNav.html',
    scope: {},
    controller: ['$scope', 'Users', function ($scope, Users) {
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
    },
    controller: ['$scope', '$sce', '$route', '$location', 'Songs', function ($scope, $sce, $route, $location, Songs) {
      $scope.editTitle = false;
      $scope.arrowBack = false;

      if ($location.path().match(/^\/song\/.*/)) {
      // we are in single song view
        $scope.songUrl = '/#' + $location.search().from;
        $scope.arrowBack = true;
      } else {
        // we are in songs or playlists or something
        $scope.songUrl = '/#/song/' + $scope.song.id + '?from=' + $location.path(); 
      }

      $scope.$on('audioPlayerEvent', function(event, data) {
        // console.log('event: ', data);
        $scope.setIsPlaying();
      });

      $scope.updateSong = function() {
        Songs.updateSong($scope.song)
        .then(function(updatedSong) {
          _.extend($scope.song, updatedSong);
        });
      };
     
      $scope.setIsPlaying = function() {
        var currentSong = Songs.getCurrentSong();
        var loc = Songs.getViewLocation() || 'songs';
        if (currentSong && currentSong.id === $scope.song.id && loc === currentSong.location && !(Songs.getPlayer().paused)) {
          $scope.isPlaying = true;
        } else {
          $scope.isPlaying = false;
        }
      };

      $scope.setIsPlaying();
    }]
  };
})
.directive('player', function () {
  return {
    restrict: 'E',
    templateUrl: 'app/player/player.html'
  };
})
.directive('modalDialog', function () {
  return {
    restrict: 'E',
    templateUrl: 'app/modal/modal.html',
    scope: {
      show: '='
    },
    replace: true,
    transclude: true,
    link: function (scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width) {
        scope.dialogStyle.width = attrs.width;
      }
      if (attrs.height) {
        scope.dialogStyle.height = attrs.height;
      }
      scope.hideModal = function () {
        scope.show = false;
      };
    }
  };
})
.directive('myEnter', function () {
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.myEnter);
        });
        event.preventDefault();
      }
    });
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
.run(function ($rootScope, $location, Users) {
  // check for token on route change
  $rootScope.$on('$routeChangeStart', function (evt, next, current) {
    if (next.$$route && next.$$route.authenticate && !Users.isAuth()) {
      $location.path('/login');
    }
  });
});
