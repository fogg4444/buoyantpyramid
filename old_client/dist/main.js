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
  'ngRoute',
  'ngAnimate',
  'ngFileUpload',
  'ngImgCrop',
  'ngProgress',
  'dndLists',
  'focus-if'
]).config([
  '$routeProvider',
  '$httpProvider',
  function ($routeProvider, $httpProvider) {
    $routeProvider.when('/login/', {
      templateUrl: 'app/auth/login.html',
      controller: 'AuthController'
    }).when('/login/:email', {
      templateUrl: 'app/auth/login.html',
      controller: 'AuthController'
    }).when('/song/:id', {
      templateUrl: 'app/song/song.html',
      controller: 'SongController',
      controllerAs: 'songCtrl',
      authenticate: true
    }).when('/songs', {
      templateUrl: 'app/songs/songs.html',
      controller: 'SongsController',
      controllerAs: 'songCtrl',
      authenticate: true
    }).when('/profile', {
      templateUrl: 'app/profile/profile.html',
      controller: 'ProfileController',
      authenticate: true
    }).when('/upload', {
      templateUrl: 'app/upload/upload.html',
      controller: 'UploadController',
      authenticate: true
    }).when('/groups', {
      templateUrl: 'app/groups/groups.html',
      controller: 'GroupsController',
      authenticate: true
    }).when('/group/settings', {
      templateUrl: 'app/groups/settings.html',
      controller: 'SettingsController',
      authenticate: true
    }).when('/playlists', {
      templateUrl: 'app/playlist/playlist.html',
      controller: 'PlaylistController',
      controllerAs: 'playlistCtrl',
      authenticate: true
    }).otherwise({ redirectTo: '/songs' });
    // We add our $httpInterceptor into the array
    // of interceptors. Think of it like middleware for your ajax calls
    $httpProvider.interceptors.push('AttachTokens');
  }
]).directive('navBar', function () {
  return {
    restrict: 'E',
    templateUrl: 'app/nav/nav.html',
    scope: {},
    controller: [
      '$scope',
      'Users',
      '$window',
      function ($scope, Users, $window) {
        $scope.logout = function () {
          Users.logout();
          $window.location.reload();
        };
        $scope.user = {};
        $scope.showMenu = false;
        // only matters for mobile
        $scope.toggleMenu = function () {
          $scope.showMenu = !$scope.showMenu;
        };
        Users.getUserData().then(function (userData) {
          $scope.user = userData;
          return Users.getGroups(userData.id);
        }).then(function (groups) {
          $scope.user.invites = groups.pending;
        }).catch(console.error);
      }
    ]
  };
}).directive('groupsNav', function () {
  return {
    restrict: 'E',
    templateUrl: 'app/nav/groupsNav.html',
    scope: {},
    controller: [
      '$scope',
      'Users',
      function ($scope, Users) {
      }
    ]
  };
}).directive('songView', function () {
  return {
    restrict: 'E',
    templateUrl: 'app/songs/songView.html',
    scope: {
      song: '=',
      index: '='
    },
    controller: [
      '$scope',
      '$sce',
      '$route',
      '$location',
      'Songs',
      function ($scope, $sce, $route, $location, Songs) {
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
        $scope.$on('audioPlayerEvent', function (event, data) {
          // console.log('event: ', data);
          $scope.setIsPlaying();
        });
        $scope.updateSong = function () {
          Songs.updateSong($scope.song).then(function (updatedSong) {
            _.extend($scope.song, updatedSong);
          });
        };
        $scope.setIsPlaying = function () {
          var currentSong = Songs.getCurrentSong();
          var loc = Songs.getViewLocation() || 'songs';
          if (currentSong && currentSong.id === $scope.song.id && loc === currentSong.location && !Songs.getPlayer().paused) {
            $scope.isPlaying = true;
          } else {
            $scope.isPlaying = false;
          }
        };
        $scope.setIsPlaying();
      }
    ]
  };
}).directive('player', function () {
  return {
    restrict: 'E',
    templateUrl: 'app/player/player.html'
  };
}).directive('modalDialog', function () {
  return {
    restrict: 'E',
    templateUrl: 'app/modal/modal.html',
    scope: { show: '=' },
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
}).directive('myEnter', function () {
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
}).factory('AttachTokens', [
  '$window',
  function ($window) {
    // http request interceptor adds tokens
    var attach = {
        request: function (object) {
          if (!object.url.match(/^\/api\/.*/)) {
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
  }
]).run([
  '$rootScope',
  '$location',
  'Users',
  function ($rootScope, $location, Users) {
    // check for token on route change
    $rootScope.$on('$routeChangeStart', function (evt, next, current) {
      if (next.$$route && next.$$route.authenticate && !Users.isAuth()) {
        $location.path('/login');
      }
    });
  }
]);
angular.module('jam.auth', []).controller('AuthController', [
  '$scope',
  '$window',
  '$location',
  '$routeParams',
  'Users',
  function ($scope, $window, $location, $routeParams, Users) {
    $scope.confirm = false;
    $scope.passMismatch = false;
    $scope.loginError = '';
    $scope.signupError = '';
    $scope.user = {};
    $scope.user.email = $routeParams.email || '';
    $scope.toggleLogin = function () {
      $scope.user.email = $scope.user.password = '';
      $scope.loginForm.$setPristine();
      $scope.showLogin = !$scope.showLogin;
      if ($scope.showSignup && $scope.showLogin) {
        $scope.showSignup = false;
      }
    };
    $scope.toggleSignup = function () {
      $scope.user.email = $scope.user.password = '';
      $scope.signupForm.$setPristine();
      $scope.showSignup = !$scope.showSignup;
      if ($scope.showSignup && $scope.showLogin) {
        $scope.showLogin = false;
      }
    };
    $scope.login = function () {
      $scope.loginError = '';
      Users.login($scope.user).then(function (data) {
        $location.path('/songs');
      }).catch(function (error) {
        console.error(error.data);
        $scope.loginError = error.data;
      });
    };
    $scope.signup = function (pass) {
      $scope.signupError = '';
      if (pass === $scope.user.password) {
        $scope.passMismatch = false;
        $scope.user.displayName = 'anonymous';
        Users.signup($scope.user).then(function (data) {
          $location.path('/profile');
        }).catch(function (error) {
          console.error(error.data);
          $scope.signupError = error.data;
        });
      } else {
        $scope.newPassword = '';
        $scope.passMismatch = true;
        $scope.user.password = '';
      }
    };
    $scope.logout = function () {
      Users.logout();
      $scope.user = null;
    };
    $scope.images = [
      'evergreen1.jpg',
      'evergreen2.jpg',
      'evergreen3.jpg',
      'evergreen4.jpg',
      'safety1.JPG',
      'safety2.JPG',
      'safety3.JPG',
      'safety4.JPG',
      'safety5.JPG'
    ];
    $scope.backImage = { 'background-image': 'url(assets/bands/' + $scope.images[Math.floor(Math.random() * $scope.images.length)] + ')' };
  }
]);
angular.module('jam.groups', []).controller('GroupsController', [
  '$scope',
  '$route',
  'Users',
  'Groups',
  'Songs',
  function ($scope, $route, Users, Groups, Songs) {
    $scope.user = {};
    $scope.newGroup = {};
    $scope.data = {};
    $scope.chooseRole = { role: 'admin' };
    $scope.playable = Songs.getPlayable();
    $scope.invitees = [];
    $scope.toggleCreateModal = function () {
      $scope.createModalShown = !$scope.createModalShown;
    };
    $scope.memberInfo = function (member, index) {
      $scope.clickedMember = member;
      $scope.clickedMember.isAdmin = member.userGroups.role === 'admin' ? true : false;
      $scope.clickedMember.index = index;
      $scope.chooseRole.role = member.userGroups.role;
      $scope.memberModalShown = true;
    };
    $scope.updateRole = function (userId) {
      if ($scope.chooseRole.role !== $scope.clickedMember.role) {
        Groups.updateUserRole($scope.user.currentGroupId, userId, $scope.chooseRole.role).then(function () {
          $scope.data.members[$scope.clickedMember.index].userGroups.role = $scope.chooseRole.role;
          $scope.memberModalShown = false;
        }).catch(console.error);
      }
    };
    $scope.removeMember = function (userId) {
      Groups.removeUser($scope.user.currentGroupId, userId).then(function () {
        // tell the user that the member is no more!
        $scope.data.members.splice($scope.clickedMember.index, 1);
        $scope.memberModalShown = false;
      }).catch(console.error);
    };
    $scope.acceptInvite = function (group, index) {
      Groups.updateUserRole(group.id, $scope.user.id, 'member').then(function () {
        group.userGroups.role = 'member';
        _.each(group.users, function (user) {
          if ($scope.user.id === user.id) {
            user.userGroups.role = 'member';
          }
        });
        $scope.data.groups.push(group);
        $scope.data.pendingGroups.splice(index, 1);
      }).catch(console.error);
    };
    $scope.rejectInvite = function (group, index) {
      Groups.removeUser(group.id, $scope.user.id).then(function (data) {
        $scope.data.pendingGroups.splice(index, 1);
      }).catch(console.error);
    };
    $scope.createGroup = function () {
      Groups.createGroup($scope.newGroup).then(function (group) {
        Groups.addUser(group.id, $scope.user.id, 'admin').then(function (user) {
          $scope.createModalShown = false;
          $scope.refreshGroups(user, true);
          $scope.sendInvites(group);
        });
      });
    };
    $scope.sendInvites = function (group) {
      _.each($scope.invitees, function (invitee) {
        Groups.sendInvite(group, invitee).then(function (res) {
          console.log(invitee + ' invited! ');
        }).catch(console.error);
      });
    };
    $scope.setCurrentGroup = function (group) {
      Users.updateProfile({ currentGroupId: group.id }).then(function (res) {
        $scope.user = res.data.user;
        $scope.user.currentGroup = group;
        $scope.user.isAdmin = $scope.user.currentGroup.userGroups.role === 'admin' ? true : false;
        $scope.data.members = $scope.user.currentGroup.users;
        Songs.resetPlayer();
      }).catch(function (error) {
        console.error(error);
      });
    };
    $scope.updateProfile = function () {
      return Users.updateProfile($scope.user).then(function (res) {
      }).catch(function (error) {
        console.error(error);
      });
    };
    $scope.isNotCurrentGroup = function (group) {
      return group.id !== $scope.user.currentGroup.id;
    };
    $scope.refreshGroups = function (userId, force) {
      Groups.getGroupsData(userId, force).then(function (groups) {
        $scope.data.groups = [];
        $scope.data.pendingGroups = [];
        _.each(groups, function (group) {
          if (group.id === $scope.user.currentGroupId) {
            $scope.user.currentGroup = group;
            $scope.user.isAdmin = $scope.user.currentGroup.userGroups.role === 'admin' ? true : false;
            $scope.data.members = $scope.user.currentGroup.users;
          }
          if (group.userGroups.role === 'pending') {
            $scope.data.pendingGroups.push(group);
          } else {
            $scope.data.groups.push(group);
          }
        });
      });
    };
    $scope.deleteGroup = function (id) {
      Groups.deleteGroup(id).then(function (resp) {
        console.log(resp);
      }).catch(console.error);
    };
    // Load groups and group users
    Users.getUserData().then(function (userData) {
      $scope.user = userData;
      $scope.refreshGroups(userData);
    }).catch(console.error);
  }
]);
angular.module('jam.groupSettings', []).controller('SettingsController', [
  '$scope',
  '$timeout',
  'Upload',
  'Users',
  'Groups',
  'UploadFactory',
  'Songs',
  function ($scope, $timeout, Up, Users, Groups, UploadFactory, Songs) {
    $scope.user = {};
    $scope.group = {};
    $scope.sendingInvite = false;
    $scope.playable = Songs.getPlayable();
    $scope.inviteError = '';
    Users.getUserData().then(function (user) {
      $scope.user = user;
      $scope.group = user.currentGroup;
    }).catch(console.error);
    $scope.showBannerModal = function (file) {
      $scope.file = file;
      $scope.bannerModalShown = true;
    };
    $scope.hideBannerModal = function () {
      $scope.bannerModalShown = false;
    };
    $scope.sendInvite = function () {
      $scope.inviteError = '';
      $scope.sendingInvite = true;
      Groups.sendInvite($scope.group, $scope.invite).then(function (res) {
        $scope.invite = '';
        $scope.inviteForm.$setPristine();
        Groups.getGroupsData($scope.user, true).then(function () {
          $scope.sendingInvite = false;
        }).catch(console.error);
      }).catch(function (error) {
        $scope.inviteError = error.data;
        $scope.sendingInvite = false;
        console.error(error);
      });
    };
    $scope.updateGroupProfile = function (triggerButton) {
      if (triggerButton) {
        $scope.updatingName = true;
        $timeout(function () {
          $scope.updatingName = false;
        }, 300);
      }
      Groups.updateInfo($scope.group).then(function (updatedGroup) {
        _.extend($scope.user.currentGroup, updatedGroup);
      }).catch(console.error);
    };
    $scope.removeBanner = function () {
      Groups.updateInfo({
        id: $scope.group.id,
        bannerUrl: ''
      }).then(function (res) {
        _.extend($scope.user.currentGroup, res.data);
      }).catch(console.error);
    };
    var progressCallback = function (file, evt) {
      file.progress = Math.min(100, parseInt(100 * evt.loaded / evt.total));
    };
    var errorCallback = function (response) {
      $scope.errorMsg = response.status + ': ' + response.data;
    };
    var successCallback = function (file, response) {
      $scope.result = response.data;
      $scope.group.bannerUrl = file.s3url;
      $scope.hideBannerModal();
      $scope.updateGroupProfile();
    };
    $scope.upload = function (dataUrl, name) {
      var file = Up.dataUrltoBlob(dataUrl, name);
      $scope.file = file;
      if (file) {
        UploadFactory.upload(file, 'images', successCallback, errorCallback, progressCallback);
      }
    };
  }
]);
angular.module('jam.player', []).controller('PlayerController', [
  '$scope',
  '$rootScope',
  '$timeout',
  'Songs',
  function ($scope, $rootScope, timeout, Songs) {
    $scope.isTouchDevice = 'ontouchstart' in document.documentElement;
    $scope.audio = Songs.getPlayer();
    $scope.song = Songs.getCurrentSong();
    $scope.playlist = Songs.getSoundsAndIndex();
    $scope.muted = Songs.getMuted();
    $scope.timeFormat = '00:00';
    $scope.playable = Songs.getPlayable();
    $scope.timeSliderDisabled = !$scope.playable || $scope.isTouchDevice;
    $scope.snapVol = function () {
      if ($scope.audio.volume < 0.05) {
        $scope.mute();
      }
    };
    $scope.speeds = [
      0.5,
      0.8,
      1,
      1.5,
      2
    ];
    setInterval(function () {
      $scope.$apply();
    }, 200);
    $scope.showSpeed = false;
    $scope.$watch(function (scope) {
      return scope.audio.volume;
    }, function (newV, oldV) {
      if (newV) {
        if ($scope.muted) {
          Songs.setMuted(false);
          $scope.muted = false;
        }
      }
    });
    $scope.$watch(function (scope) {
      return scope.audio.currentTime;
    }, function (newV, oldV) {
      $scope.timeFormat = Songs.timeFormat(newV);
    });
    $scope.stop = function () {
      $scope.audio.pause();
      $scope.audio.currentTime = 0;
    };
    $scope.mute = function () {
      if ($scope.muted) {
        $scope.audio.volume = Songs.getVolume();
      } else {
        $scope.audio.volume = 0;
      }
      $scope.muted = !$scope.muted;
      Songs.setMuted($scope.muted);
    };
    $scope.changeTrack = function (direction) {
      var currentSongIndex = Songs.getSongIndex();
      if (direction === 'back') {
        if (currentSongIndex === 0) {
          $scope.stop();
          $scope.audio.play();
        } else {
          Songs.setSongIndex(currentSongIndex - 1);
        }
      }
      if (direction === 'forward') {
        if (currentSongIndex === $scope.playlist.songs.length - 1) {
          Songs.resetPlayer();
          $scope.song = Songs.getCurrentSong();
        } else {
          Songs.setSongIndex(currentSongIndex + 1);
        }
      }
    };
    $scope.setSpeed = function (inc) {
      var currentIndex = $scope.speeds.indexOf($scope.audio.playbackRate);
      nextIndex = currentIndex + inc;
      if (nextIndex < 0) {
        nextIndex = 0;
      }
      if (nextIndex >= $scope.speeds.length) {
        nextIndex = $scope.speeds.length - 1;
      }
      $scope.audio.playbackRate = $scope.speeds[nextIndex];
    };
    $scope.togglePlay = function () {
      if ($scope.audio.paused) {
        $scope.audio.play();
      } else {
        $scope.audio.pause();
      }
      $rootScope.$broadcast('audioPlayerEvent', 'TOGGLE_PLAY');
    };
    var changeSong = function () {
      $scope.playlist = Songs.getSoundsAndIndex();
      $scope.song = $scope.playlist.songs[$scope.playlist.index];
      $scope.audio.src = $scope.song.address || null;
      $scope.audio.onended = Songs.nextIndex;
      $scope.audio.ondurationchange = function (e) {
        $scope.timeSliderDisabled = !$scope.audio.duration || $scope.isTouchDevice;
        Songs.setPlayable(!!$scope.audio.duration);
        $scope.playable = Songs.getPlayable();
      };
      $scope.audio.play();
    };
    var resetPlayer = function () {
      $scope.stop();
      $scope.audio = Songs.getPlayer();
      $scope.playlist = Songs.getSoundsAndIndex();
      $scope.timeSliderDisabled = !$scope.audio.duration;
    };
    var refreshList = function () {
      $scope.playlist = Songs.getSoundsAndIndex();
      $scope.timeSliderDisabled = !$scope.audio.duration;
    };
    // broadcast audio events to all views
    var broadcastEvent = function (event) {
      $rootScope.$broadcast('audioPlayerEvent', event);
    };
    Songs.registerObserverCallback('CHANGE_SONG', changeSong);
    Songs.registerObserverCallback('TOGGLE_PLAY', $scope.togglePlay);
    Songs.registerObserverCallback('RESET_PLAYER', resetPlayer);
    Songs.registerObserverCallback('REFRESH_LIST', refreshList);
    Songs.registerObserverCallback('ANY_AUDIO_EVENT', broadcastEvent);
  }
]);
angular.module('jam.playlist', []).controller('PlaylistController', [
  '$scope',
  'Users',
  'Songs',
  'Groups',
  function ($scope, Users, Songs, GR) {
    $scope.newPlaylist = {};
    $scope.models = { selected: null };
    $scope.models.currentPlaylist = Songs.getCurrentPlaylist();
    $scope.models.playlists = [];
    $scope.user = {};
    $scope.where = 'playlist';
    Songs.setViewLocation($scope.where);
    $scope.playable = Songs.getPlayable();
    $scope.updateIndex = function (index) {
      Songs.choose(index, $scope.where, $scope.models.currentPlaylist);
    };
    $scope.dropCallback = function (event, index, item, external, type, allowedType) {
      $scope.reorderPlaylist($scope.models.selected, index);
      return item;
    };
    $scope.reorderPlaylist = function (song, newIndex) {
      var oldIndex = song.playlistSongs.listPosition;
      if (oldIndex < newIndex) {
        newIndex--;
      }
      if (oldIndex !== newIndex) {
        var targetSong = $scope.models.currentPlaylist.songs[oldIndex];
        $scope.models.currentPlaylist.songs.splice(oldIndex, 1);
        $scope.models.currentPlaylist.songs.splice(newIndex, 0, targetSong);
        // rekey all the list positions:
        var updateArray = [];
        for (var i = 0, l = $scope.models.currentPlaylist.songs.length; i < l; i++) {
          $scope.models.currentPlaylist.songs[i].playlistSongs.listPosition = i;
          updateArray.push({
            songId: $scope.models.currentPlaylist.songs[i].id,
            listPosition: i
          });
        }
        Songs.updatePlaylistPosition($scope.models.currentPlaylist.id, updateArray).then(function (resp) {
        }).catch(console.error);
      }
    };
    Users.getUserData().then(function (user) {
      $scope.user = user;
      $scope.newPlaylist.groupId = $scope.user.currentGroup.id;
      GR.getPlaylistsByGroupId($scope.user.currentGroup.id).then(function (playlists) {
        $scope.models.playlists = playlists;
        playlists.length && $scope.makeCurrent(playlists[0]);
      });
    }).catch(console.error);
    $scope.toggleCreateModal = function () {
      $scope.createModalShown = !$scope.createModalShown;
    };
    $scope.pendingDeletePlaylist = function (playlist) {
      $scope.pendingPlaylist = playlist;
      $scope.destroyModalShown = true;
    };
    $scope.makeCurrent = function (playlist) {
      $scope.models.currentPlaylist = playlist;
      Songs.getPlaylistSongs(playlist.id).then(function (songs) {
        $scope.models.currentPlaylist.songs = songs;
      }).catch(console.error);
    };
    $scope.createPlaylist = function () {
      Songs.createPlaylist($scope.newPlaylist).then(function (playlist) {
        $scope.createModalShown = false;
        GR.getPlaylistsByGroupId($scope.user.currentGroup.id).then(function (playlists) {
          $scope.models.playlists = playlists;
        }).catch(console.error);
      });
    };
    $scope.deleteSong = function (index) {
      var songId = $scope.models.currentPlaylist.songs[index].id;
      $scope.models.currentPlaylist.songs.splice(index, 1);
      Songs.deleteFromPlaylist(songId, $scope.models.currentPlaylist.id).then(function (resp) {
        console.log(resp);
      }).catch(console.error);
    };
    $scope.deletePlaylist = function () {
      var playlist = $scope.pendingPlaylist;
      if ($scope.models.currentPlaylist.id === playlist.id) {
        $scope.models.currentPlaylist = {};
      }
      Songs.deletePlaylist(playlist.id).then(function (resp) {
        $scope.destroyModalShown = false;
        $scope.models.playlists = _.filter($scope.models.playlists, function (currentPlaylist) {
          return currentPlaylist.id !== playlist.id;
        });
      }).catch(console.error);
    };
  }
]);
angular.module('jam.profile', []).controller('ProfileController', [
  '$scope',
  '$location',
  '$window',
  '$timeout',
  'Users',
  'Upload',
  'UploadFactory',
  'Songs',
  function ($scope, loc, win, to, Users, Up, UploadFactory, Songs) {
    $scope.avatarURL = '';
    $scope.playable = Songs.getPlayable();
    Users.getUserData().then(function (userData) {
      $scope.user = userData;  // $scope.avatarURL = '/api/users/' + $scope.user.id + '/avatar?rev=' + (++avatarRev);
    }).catch(console.error);
    $scope.showAvatarModal = function (file) {
      $scope.file = file;
      $scope.avatarModalShown = true;
    };
    $scope.hideAvatarModal = function () {
      $scope.avatarModalShown = false;
    };
    var progressCallback = function (file, evt) {
      file.progressPercentage = Math.min(100, parseInt(100 * evt.loaded / evt.total));
    };
    var errorCallback = function (response) {
      $scope.errorMsg = response.status + ': ' + response.data;
    };
    var successCallback = function (file, response) {
      file.result = response.data;
      $scope.user.avatarURL = file.s3url;
      $scope.hideAvatarModal();
      $scope.updateProfile();
    };
    $scope.upload = function (dataUrl, name) {
      var file = Up.dataUrltoBlob(dataUrl, name);
      $scope.file = file;
      if (file) {
        UploadFactory.upload(file, 'images', successCallback, errorCallback, progressCallback);
      }
    };
    $scope.updateProfile = function () {
      Users.updateProfile($scope.user).then(function (res) {
        $scope.user = res.data.user;
      }).catch(function (error) {
        console.error(error);
      });
    };
  }
]);
angular.module('jam.groupsFactory', []).factory('Groups', [
  '$http',
  '$q',
  function (http, q) {
    // Each group has an array of members
    var groupsData = null;
    var createGroup = function (newGroup) {
      return http({
        method: 'POST',
        url: '/api/groups/',
        data: newGroup
      }).then(function (res) {
        return res.data;
      });
    };
    var addUser = function (groupId, userId, role) {
      var data = {
          userId: userId,
          role: role
        };
      return http({
        method: 'POST',
        url: '/api/groups/' + groupId + '/users/',
        data: data
      }).then(function (res) {
        return res.data;
      });
    };
    var getGroupsByUserId = function (userId) {
      return http({
        method: 'GET',
        url: '/api/users/' + userId + '/groups/'
      }).then(function (res) {
        _.extend(groupsData, res.data);
        return res.data;
      });
    };
    var getPlaylistsByGroupId = function (groupId) {
      return http({
        method: 'GET',
        url: '/api/groups/' + groupId + '/playlists/'
      }).then(function (res) {
        return res.data;
      });
    };
    var updateInfo = function (group) {
      return http({
        method: 'PUT',
        url: '/api/groups/info',
        data: group
      }).then(function (res) {
        return res.data;
      }).catch(console.error);
    };
    var sendInvite = function (group, email) {
      var data = {
          email: email,
          group: group
        };
      return http({
        method: 'post',
        url: '/api/groups/' + group.id + '/invite',
        data: data
      }).then(function (res) {
        return res.data;
      });
    };
    var updateUserRole = function (groupId, userId, role) {
      var data = { role: role };
      return http({
        method: 'PUT',
        url: '/api/groups/' + groupId + '/users/' + userId,
        data: data
      }).then(function (res) {
        return res.data;
      });
    };
    var removeUser = function (groupId, userId) {
      return http({
        method: 'DELETE',
        url: '/api/groups/' + groupId + '/users/' + userId
      }).then(function (res) {
        return res.data;
      });
    };
    var getGroupsData = function (user, force) {
      force = force || false;
      return q(function (resolve, reject) {
        if (groupsData && !force) {
          resolve(groupsData);
        }
        getGroupsByUserId(user.id).then(function (groups) {
          if (groupsData) {
            _.extend(groupsData, groups);
          } else {
            groupsData = groups;
          }
          resolve(groupsData);
        }).catch(function (error) {
          reject(error);
        });
      });
    };
    var setGroupsData = function (data) {
      if (!data) {
        groupsData = null;
      } else {
        _.extend(groupsData, data);
      }
    };
    var deleteGroup = function (id) {
      return http({
        method: 'DELETE',
        url: '/api/groups/' + id
      }).then(function (res) {
        return res.data;
      });
    };
    return {
      createGroup: createGroup,
      addUser: addUser,
      getGroupsByUserId: getGroupsByUserId,
      getPlaylistsByGroupId: getPlaylistsByGroupId,
      updateInfo: updateInfo,
      sendInvite: sendInvite,
      updateUserRole: updateUserRole,
      removeUser: removeUser,
      getGroupsData: getGroupsData,
      setGroupsData: setGroupsData,
      deleteGroup: deleteGroup
    };
  }
]);
angular.module('jam.songsFactory', []).factory('Songs', [
  '$http',
  '$q',
  function (http, q) {
    var player = new Audio();
    // stores all songs and current playlist songs
    var songQueue = {
        songs: [],
        playlist: []
      };
    // index of the current song playing
    var songIndex = null;
    var currentLocation = 'songs';
    var volume = 0;
    var muted = false;
    var playable = false;
    var viewLocation = null;
    var currentPlaylist = {};
    // FUNCTIONS FOR SONGS
    var addSong = function (song, groupId) {
      var songData = {
          size: song.size,
          lastModified: song.lastModified,
          name: song.displayName || song.name,
          uniqueHash: song.uniqueFilename,
          address: song.s3url,
          duration: song.duration
        };
      return q(function (resolve, reject) {
        http({
          method: 'POST',
          url: '/api/groups/' + groupId + '/songs/',
          data: songData
        }).then(function (response) {
          resolve(response);
        }).catch(function (error) {
          reject(error);
        });
      });
    };
    var getAllSongs = function (groupId) {
      return http({
        method: 'GET',
        url: '/api/groups/' + groupId + '/songs/'
      }).then(function (res) {
        songQueue.songs = res.data;
        return res.data;
      });
    };
    var getSong = function (songId) {
      return http({
        method: 'GET',
        url: '/api/songs/' + songId
      }).then(function (res) {
        return res.data;
      });
    };
    var updateSong = function (song) {
      return http({
        method: 'PUT',
        url: '/api/songs/' + song.id,
        data: song
      }).then(function (res) {
        return res.data;
      });
    };
    var deleteSong = function (song) {
      return http({
        method: 'DELETE',
        url: '/api/songs/' + song.id
      }).then(function (res) {
        return res.data;
      });
    };
    var addComment = function (comment, songId) {
      return http({
        method: 'POST',
        url: '/api/songs/' + songId + '/comments/',
        data: comment
      }).then(function (res) {
        return res.data;
      });
    };
    var getComments = function (songId) {
      return http({
        method: 'GET',
        url: '/api/songs/' + songId + '/comments/'
      }).then(function (res) {
        return res.data;
      });
    };
    var deleteComment = function (tag) {
      return http({
        method: 'DELETE',
        url: '/api/tags/' + tag.id
      }).then(function (res) {
        return res.data;
      });
    };
    // FUNCTIONS FOR PLAYLISTS 
    var createPlaylist = function (playlist) {
      // takes an object with a title and optional description
      return http({
        method: 'POST',
        url: '/api/playlists/',
        data: playlist
      }).then(function (res) {
        return res.data;
      });
    };
    var addSongToPlaylist = function (songId, plId, index) {
      // takes a playlist id and a song obj
      var data = { index: index };
      return http({
        method: 'POST',
        url: '/api/playlists/' + songId + '/' + plId + '/',
        data: data
      }).then(function (res) {
        return res.data;
      });
    };
    var getPlaylistSongs = function (id) {
      return http({
        method: 'GET',
        url: '/api/playlists/' + id + '/'
      }).then(function (res) {
        songQueue.playlist = res.data;
        return res.data;
      }).catch(console.error);
    };
    var updatePlaylistPosition = function (playlistId, updateArray) {
      return http({
        method: 'PUT',
        url: '/api/playlists/' + playlistId,
        data: updateArray
      });
    };
    var deleteFromPlaylist = function (sId, plId) {
      // Takes a playlist object with the song removed
      return http({
        method: 'DELETE',
        url: '/api/playlists/' + sId + '/' + plId + '/'
      }).then(function (res) {
        return res.data;
      });
    };
    var deletePlaylist = function (id) {
      return http({
        method: 'DELETE',
        url: '/api/playlists/' + id + '/'
      }).then(function (res) {
        return res.data;
      });
    };
    var playFromAllSongs = function (songId, groupId) {
      var promise = q(function (resolve, reject) {
          if (songQueue.songs.length <= 0) {
            getAllSongs(groupId).then(function () {
              resolve(true);
            }).catch(reject);
          } else {
            resolve(true);
          }
        });
      return promise.then(function () {
        var index = _.findIndex(songQueue.songs, function (song) {
            return songId === song.id;
          });
        choose(index, 'songs');
        return songQueue.songs[index];
      });
    };
    // FUNCTIONS FOR PLAYBACK
    // use the observer pattern to watch for changes in the queue or song
    var observerCallbacks = {};
    //register an observer
    var registerObserverCallback = function (action, callback) {
      observerCallbacks[action] = callback;
    };
    // call this with the index of the callback to trigger just one
    var notifyObservers = function (action) {
      observerCallbacks[action]();
      observerCallbacks['ANY_AUDIO_EVENT'](action);
    };
    var getSoundsAndIndex = function () {
      return {
        songs: songQueue[currentLocation],
        index: songIndex,
        location: currentLocation
      };
    };
    var nextIndex = function () {
      if (songIndex < songQueue[currentLocation].length - 1) {
        songIndex++;
        notifyObservers('CHANGE_SONG');
      } else {
        notifyObservers('RESET_PLAYER');
      }
    };
    var togglePlay = function () {
      notifyObservers('TOGGLE_PLAY');
    };
    var choose = function (index, location, playlist) {
      if (songIndex === +index && currentLocation === location) {
        notifyObservers('TOGGLE_PLAY');
      } else {
        songIndex = index;
        currentLocation = location;
        if (location === 'playlist') {
          currentPlaylist = playlist;
        } else {
          currentPlaylist = {};
        }
        notifyObservers('CHANGE_SONG');
        playable = true;
      }
    };
    var checkReset = function (songId, location) {
      if (location === currentLocation) {
        if (songQueue[currentLocation][songIndex] && songQueue[currentLocation][songIndex].id === songId) {
          player = new Audio();
          songQueue[currentLocation].splice(songIndex, 1);
          songIndex = null;
          playable = false;
          notifyObservers('RESET_PLAYER');
        } else {
          songQueue[currentLocation] = _.filter(songQueue[currentLocation], function (currentSong) {
            return currentSong.id !== songId;
          });
          notifyObservers('REFRESH_LIST');
        }
      }
    };
    var setSongIndex = function (index) {
      songIndex = index;
      notifyObservers('CHANGE_SONG');
    };
    var getSongIndex = function (index) {
      return songIndex;
    };
    var setVolume = function (percent) {
      volume = percent;
    };
    var getVolume = function () {
      return volume;
    };
    var setMuted = function (newMuted) {
      muted = newMuted;
    };
    var getMuted = function () {
      return muted;
    };
    var getPlayer = function () {
      return player;
    };
    var setPlayable = function (playable) {
      playable = playable;
    };
    var getPlayable = function () {
      return playable;
    };
    var getCurrentSong = function () {
      var current = songIndex !== null ? songQueue[currentLocation][songIndex] : null;
      if (current) {
        current.location = currentLocation;
        return current;
      } else {
        return null;
      }
    };
    var getCurrentPlaylist = function () {
      return currentPlaylist;
    };
    var setViewLocation = function (location) {
      viewLocation = location;
    };
    var getViewLocation = function () {
      return viewLocation;
    };
    var timeFormat = function (seconds) {
      var s = Math.floor(seconds % 60);
      var m = Math.floor(seconds % 3600 / 60);
      var h = Math.floor(seconds / 3600);
      var format = h ? h + ':' : '';
      format += String('00' + m).slice(-2) + ':' + String('00' + s).slice(-2);
      return format;
    };
    var resetPlayer = function () {
      songIndex = null;
      playable = false;
      player = new Audio();
      notifyObservers('RESET_PLAYER');
    };
    return {
      addComment: addComment,
      addSong: addSong,
      getComments: getComments,
      deleteComment: deleteComment,
      deleteSong: deleteSong,
      getAllSongs: getAllSongs,
      getSong: getSong,
      updateSong: updateSong,
      createPlaylist: createPlaylist,
      addSongToPlaylist: addSongToPlaylist,
      getPlaylistSongs: getPlaylistSongs,
      updatePlaylistPosition: updatePlaylistPosition,
      deleteFromPlaylist: deleteFromPlaylist,
      deletePlaylist: deletePlaylist,
      getSoundsAndIndex: getSoundsAndIndex,
      nextIndex: nextIndex,
      choose: choose,
      getPlayer: getPlayer,
      checkReset: checkReset,
      resetPlayer: resetPlayer,
      setSongIndex: setSongIndex,
      getSongIndex: getSongIndex,
      setVolume: setVolume,
      getVolume: getVolume,
      setMuted: setMuted,
      getMuted: getMuted,
      togglePlay: togglePlay,
      setPlayable: setPlayable,
      getPlayable: getPlayable,
      getCurrentSong: getCurrentSong,
      getCurrentPlaylist: getCurrentPlaylist,
      playFromAllSongs: playFromAllSongs,
      setViewLocation: setViewLocation,
      getViewLocation: getViewLocation,
      registerObserverCallback: registerObserverCallback,
      timeFormat: timeFormat
    };
  }
]);
angular.module('jam.uploadsFactory', ['jam.usersFactory']).factory('UploadFactory', [
  '$http',
  '$window',
  '$q',
  'Upload',
  'Users',
  'Songs',
  function ($http, win, q, Upload, Users, Songs) {
    var audioQueue = [];
    var uploadedAudio = [];
    // upload on file select or drop
    var upload = function (file, directory, successCallback, errorCallback, progressCallback) {
      var postData = {
          uniqueFilename: file.name,
          fileType: file.type
        };
      $http.post('/api/s3', postData).then(function (res) {
        var s3Credentials = res.data;
        beginDirectS3Upload(s3Credentials, file);
      }, function (res) {
        // AWS Signature API Error
        console.log('Error', res);
      });
      String.prototype.uuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0;
          var v = c === 'x' ? r : r & 3 | 8;
          return v.toString(16);
        });
      };
      var beginDirectS3Upload = function (s3Credentials, file) {
        console.log('Begin s3 upload', s3Credentials);
        var groupId;
        Users.getUserData().then(function (user) {
          var fileExtension = file.name.replace(/^.*\./, '');
          var uniqueFilename = (Date.now() + file.name).uuid() + '.' + fileExtension;
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
            file: file
          });
          file.uploader.then(function (response) {
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
          }, null, function (evt) {
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
  }
]);
angular.module('jam.usersFactory', []).factory('Users', [
  '$http',
  '$location',
  '$window',
  '$q',
  'Groups',
  function (http, loc, win, q, Groups) {
    // stores users token as com.jam
    var userData = null;
    var login = function (user) {
      return http({
        method: 'POST',
        url: '/api/users/login',
        data: user
      }).then(function (resp) {
        userData = resp.data.user;
        win.localStorage.setItem('com.jam', resp.data.token);
        return resp.data;
      });
    };
    var signup = function (user) {
      return http({
        method: 'POST',
        url: '/api/users/signup',
        data: user
      }).then(function (resp) {
        userData = resp.data.user;
        win.localStorage.setItem('com.jam', resp.data.token);
        return resp.data;
      });
    };
    var getGroups = function (userId) {
      return http({
        method: 'GET',
        url: '/api/users/' + userId + '/groups/'
      }).then(function (res) {
        return res.data;
      });
    };
    var getUser = function (userId) {
      return http({
        method: 'GET',
        url: '/api/users/' + userId
      }).then(function (resp) {
        return resp.data.user;
      });
    };
    var logout = function () {
      win.localStorage.removeItem('com.jam');
      userData = null;
      Groups.setGroupsData(null);
      loc.path('/login');
    };
    var updateProfile = function (profile) {
      return http({
        method: 'PUT',
        url: '/api/users/profile',
        data: profile
      }).then(function (res) {
        _.extend(userData, res.data.user);
        win.localStorage.setItem('com.jam', res.data.token);
        return res;
      }).catch(console.error);
    };
    var getProfile = function (profile) {
      return http({
        method: 'GET',
        url: '/api/users/profile'
      });
    };
    var getUserData = function (force) {
      force = force || false;
      return q(function (resolve, reject) {
        if (userData && !force) {
          resolve(userData);
        }
        getProfile().then(function (res) {
          if (userData) {
            _.extend(userData, res.data.user);
          } else {
            userData = res.data.user;
          }
          resolve(userData);
        }).catch(function (error) {
          reject(error);
        });
      });
    };
    var isAuth = function () {
      return !!win.localStorage.getItem('com.jam');
    };
    return {
      updateProfile: updateProfile,
      getGroups: getGroups,
      getProfile: getProfile,
      login: login,
      signup: signup,
      getUser: getUser,
      isAuth: isAuth,
      logout: logout,
      getUserData: getUserData
    };
  }
]);
angular.module('jam.song', []).controller('SongController', [
  '$scope',
  '$location',
  '$route',
  'Songs',
  'Users',
  function ($scope, loc, $route, Songs, Users) {
    $scope.song = {};
    $scope.audio = Songs.getPlayer();
    $scope.commentTime = null;
    $scope.pinningComment = false;
    $scope.user = {};
    $scope.comments = [];
    $scope.selectedComment = [{}];
    $scope.songInPlayer = false;
    $scope.alreadyPlaying = false;
    $scope.playable = Songs.getPlayable();
    $scope.fromUrl = '/#' + loc.search().from;
    var pageWidth = document.getElementsByClassName('page-content')[0].offsetWidth;
    var waveHeight = 100;
    var waveWidth = pageWidth * 0.9;
    var waveRadius = 2;
    var pinWidth = 12;
    var pinHeight = 20;
    var barPadding = 1;
    var initialDelay = 2000;
    var scaledAmplitudes;
    $scope.width = waveWidth + 'px';
    // Obtain song information and display comments
    Users.getUserData().then(function (user) {
      $scope.user = user;
    }).then(function () {
      return Songs.getSong(loc.path().split('/')[2]);
    }).then(function (song) {
      $scope.song = song;
      var rawAmplitudes = song.amplitudeData.max;
      var max = _.max(rawAmplitudes);
      var scale = 100 / max;
      scaledAmplitudes = rawAmplitudes.map(function (amp) {
        return amp * scale;
      });
    }).then(function () {
      return Songs.getComments($scope.song.id);
    }).then(function (comments) {
      $scope.comments = comments;
      renderComments(comments);
      $scope.songInPlayer = Songs.getCurrentSong() && $scope.song.id === Songs.getCurrentSong().id;
      if ($scope.songInPlayer && !$scope.audio.paused) {
        $scope.$broadcast('audioPlayerEvent', 'ALREADY_PLAYING');
      }
      initialRender();
    });
    var createSvg = function (parent, height, width) {
      return d3.select(parent).append('svg').attr('height', height).attr('width', width);
    };
    // D3
    var svg = createSvg('.waveform-container', waveHeight, waveWidth);
    var selectedComment = d3.select('body').selectAll('.selected-comment');
    var comment = d3.select('body').selectAll('.comment-icon');
    var commentPins = d3.select('body').selectAll('.pin-container').style('height', pinHeight + 'px').style('width', waveWidth + 'px');
    var initialRender = function () {
      svg.attr('class', 'visualizer').selectAll('rect').data(scaledAmplitudes).enter().append('rect').attr('rx', waveRadius + 'px').attr('ry', waveRadius + 'px').attr('x', function (d, i) {
        return i * (waveWidth / scaledAmplitudes.length);
      }).attr('y', waveHeight).attr('height', 0).transition().delay(function (d, i) {
        return initialDelay * i / scaledAmplitudes.length;
      }).attr('width', waveWidth / scaledAmplitudes.length - barPadding).attr('y', function (d) {
        return waveHeight - d;
      }).attr('height', function (d) {
        return d;
      }).attr('fill', '#999');
      d3.select('body').selectAll('.comment-pin-container').style('height', pinHeight * 2 + 'px').style('width', waveWidth + 'px');
      d3.select('body').selectAll('.selected-comment-container').style('height', pinHeight + 'px').style('width', waveWidth + 'px');
      _.delay(setInterval, initialDelay, renderFlow, 300);
    };
    $scope.addComment = function (comment) {
      var time = Math.floor($scope.commentTime * $scope.song.duration);
      Songs.addComment({
        note: comment,
        time: time,
        userId: $scope.user.id
      }, $scope.song.id).then(function (comment) {
        $scope.comments.push(comment);
        renderComments($scope.comments);
        $scope.pinningComment = false;
        $scope.comment = '';
      });
    };
    $scope.commentSelected = function () {
      return !!Object.keys($scope.selectedComment[0]).length;
    };
    $scope.formatTime = function (time) {
      return Songs.timeFormat(time);
    };
    $scope.pinComment = function () {
      $scope.commentTime = $scope.audio.currentTime / $scope.song.duration;
      $scope.pinningComment = true;
      $scope.selectedComment = [{}];
    };
    var renderComments = function () {
      commentPins.selectAll('div').data($scope.comments).enter().append('div').style('left', function (d) {
        var left = Math.floor(d.time / $scope.song.duration * waveWidth) - pinWidth / 2;
        return left + 'px';
      }).attr('class', 'pin').on('mouseover', function (d, i) {
        $scope.setSelectedComment(d);
      });
    };
    var renderSelectedComment = function () {
      var left = Math.floor($scope.selectedComment[0].time / $scope.song.duration * waveWidth);
      var onLeft = left < waveWidth / 2;
      selectedComment.data($scope.selectedComment).style('left', function () {
        if (onLeft) {
          return left + 'px';
        } else {
          return left - waveWidth / 2 + 'px';
        }
      }).classed('left', onLeft).classed('right', !onLeft).style('width', waveWidth / 2 + 'px').text(function (d) {
        return d.note;
      });
    };
    var renderFlow = function () {
      svg.selectAll('rect').data(scaledAmplitudes).transition().duration(600).attr('fill', function (d, i) {
        if (i / scaledAmplitudes.length < $scope.audio.currentTime / $scope.song.duration && $scope.songInPlayer) {
          return '#99D1B2';
        } else {
          return '#999';
        }
      });
    };
    $scope.setSelectedComment = function (comment) {
      $scope.selectedComment = [comment];
      renderSelectedComment();
    };
    $scope.setPlayTime = function (e) {
      if ($scope.songInPlayer) {
        var visualizer = document.getElementsByClassName('visualizer')[0];
        var rect = visualizer.getBoundingClientRect();
        var x = e.clientX - rect.left;
        $scope.audio.currentTime = $scope.song.duration * x / waveWidth;
      }
    };
    // hack to work with songview for now
    $scope.updateIndex = function () {
      var currentSong = Songs.getCurrentSong();
      if (currentSong && currentSong.id === $scope.song.id) {
        Songs.togglePlay();
      } else {
        Songs.playFromAllSongs($scope.song.id, $scope.user.currentGroupId);
      }
      $scope.songInPlayer = true;
    };
  }
]);
angular.module('jam.songs', []).controller('SongsController', [
  '$scope',
  '$location',
  'Songs',
  'Users',
  'Groups',
  function ($scope, loc, Songs, Users, GR) {
    // When user adds a new link, put it in the collection
    $scope.data = {};
    $scope.user = {};
    $scope.time = null;
    $scope.timeFormat = '00:00';
    $scope.comment = {};
    $scope.message = '';
    $scope.commentSong = {};
    $scope.where = 'songs';
    Songs.setViewLocation($scope.where);
    $scope.playable = Songs.getPlayable();
    // $scope.$on('audioPlayerEvent', function(event, data) {
    //   $scope.broadcastTest = event + ' ' + data;
    //   console.log('EVENT');
    // });
    $scope.updateIndex = function (index) {
      Songs.choose(index, $scope.where);
    };
    Users.getUserData().then(function (user) {
      $scope.user = user;
      $scope.refreshSongs();
      GR.getPlaylistsByGroupId($scope.user.currentGroup.id).then(function (playlists) {
        $scope.data.playlists = playlists;
      });
    }).catch(console.error);
    $scope.addToPlaylist = function (playlist) {
      $scope.newSong.playlistId = playlist.id;
      var index = playlist.length;
      console.log('the playlist: ', playlist);
      Songs.addSongToPlaylist($scope.newSong.id, playlist.id, index).then(function (resp) {
        // tell user song was added
        console.log(resp);
      }).catch(console.error);
    };
    $scope.getTime = function () {
      $scope.time = Songs.getPlayer().currentTime;
      $scope.timeFormat = Songs.timeFormat($scope.time);
    };
    $scope.toggleCommentModal = function (song, userId) {
      $scope.commentSong = song;
      var playingSong = Songs.getCurrentSong();
      if (playingSong && playingSong.id === song.id) {
        $scope.getTime();
      }
      $scope.commentModalShown = !$scope.commentModalShown;
    };
    $scope.addComment = function () {
      $scope.comment.time = $scope.time;
      $scope.comment.userId = $scope.user.id;
      Songs.addComment($scope.comment, $scope.commentSong.id).then(function (comment) {
        $scope.comment = {};
        $scope.time = null;
        $scope.commentModalShown = false;
        $scope.message = 'comment posted: ' + comment;
      });
    };
    $scope.toggleAddModal = function () {
      $scope.addModalShown = !$scope.addModalShown;
    };
    $scope.refreshSongs = function () {
      Songs.getAllSongs($scope.user.currentGroupId).then(function (songs) {
        $scope.data.songs = songs;
      }).catch(console.error);
    };
    $scope.makeSongPending = function (song, index) {
      $scope.deleteModalShown = true;
      $scope.pendingSong = song;
      $scope.pendingSong.index = index;
    };
    $scope.deleteSong = function (index) {
      var song = $scope.data.songs[index];
      Songs.checkReset(song.id, 'songs');
      Songs.deleteSong(song).then(function () {
        $scope.deleteModalShown = false;
        $scope.data.songs = _.filter($scope.data.songs, function (currentSong) {
          return currentSong.id !== song.id;
        });
      }).catch(function (err) {
        $scope.message = 'error: ' + err;
      });
    };
  }
]);
angular.module('jam.upload', []).controller('UploadController', [
  '$scope',
  'Upload',
  'UploadFactory',
  'ngProgressFactory',
  'Users',
  'Songs',
  '$http',
  function ($scope, Upload, UploadFactory, ngProgressFactory, Users, Songs, $http) {
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.queue = UploadFactory.audioQueue;
    $scope.playable = Songs.getPlayable();
    var totalToUpload = 0;
    var totalUploaded = 0;
    var totalPercent = 0;
    var findTotalPercent = function () {
      var total = 0;
      for (var i = 0; i < $scope.queue.length; i++) {
        if ($scope.queue[i].progressPercentage) {
          total += $scope.queue[i].progressPercentage;
        }
      }
      totalPercent = Math.ceil(total / totalToUpload);
      // console.log('Total percent progress bar: ========== ', totalPercent);
      $scope.progressbar.set(totalPercent);
      if (totalPercent === 100) {
        $scope.progressbar.complete();
      }
    };
    var throttledTotal = _.throttle(findTotalPercent, 250);
    $scope.addToQueue = function (files) {
      for (file in files) {
        var thisFile = files[file];
        thisFile['queueId'] = Math.floor(Math.random() * 10000000);
        thisFile.status = 'READY';
        thisFile.editing = false;
        thisFile.displayName = thisFile.name;
        $scope.queue.push(thisFile);
      }
    };
    $scope.removeFile = function (index) {
      if (index > -1) {
        $scope.queue.splice(index, 1);
      }
    };
    var getAudioLength = function (file, cb) {
      var objectUrl;
      var a = document.createElement('audio');
      a.addEventListener('canplaythrough', function (e) {
        var seconds = e.currentTarget.duration;
        cb(seconds);
        URL.revokeObjectURL(objectUrl);
      });
      objectUrl = URL.createObjectURL(file);
      a.setAttribute('src', objectUrl);
    };
    var progressCallback = function (file, evt) {
      var progressPercentage = parseInt(100 * evt.loaded / evt.total);
      file['progressPercentage'] = progressPercentage;
      throttledTotal();
    };
    var successCallback = function (file, response) {
      Users.getUserData().then(function (user) {
        getAudioLength(file, function (duration) {
          file.duration = duration;
          return Songs.addSong(file, user.currentGroupId);
        });
      }).then(function (data) {
      }).catch(console.error);
    };
    $scope.cancelUpload = function (file) {
      if (file.uploader) {
        file.uploader.abort();
        file.status = 'CANCELLED';
      }
    };
    $scope.upload = function (file) {
      file.editing = false;
      UploadFactory.upload(file, 'audio', successCallback, console.error, progressCallback);
      file.progressPercentage = 0;
    };
    // for multiple files:
    $scope.cancelAll = function () {
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
    $scope.uploadFiles = function () {
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
  }
]);