angular.module('jam.playlist', [])
.controller('PlaylistController', ['$scope', 'Users', 'Songs', 'Groups', function ($scope, Users, Songs, GR) {
  $scope.newPlaylist = {};
  $scope.models = {
    selected: null
  };
  $scope.models.currentPlaylist = Songs.getCurrentPlaylist();
  $scope.models.playlists = [];
  $scope.user = {};
  $scope.where = 'playlist';
  Songs.setViewLocation($scope.where);
  $scope.playable = Songs.getPlayable();

  $scope.updateIndex = function(index) {
    Songs.choose(index, $scope.where, $scope.models.currentPlaylist);
  };

  $scope.dropCallback = function(event, index, item, external, type, allowedType) {
    $scope.reorderPlaylist($scope.models.selected, index);
    return item;
  };

  $scope.reorderPlaylist = function(song, newIndex) {
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
        updateArray.push({songId: $scope.models.currentPlaylist.songs[i].id, listPosition: i});
      }
      Songs.updatePlaylistPosition($scope.models.currentPlaylist.id, updateArray)
      .then(function(resp) {
        // anything?
      })
      .catch(console.error);
    }
  };

  Users.getUserData()
  .then(function (user) {
    $scope.user = user;
    $scope.newPlaylist.groupId = $scope.user.currentGroup.id;
    GR.getPlaylistsByGroupId($scope.user.currentGroup.id)
    .then(function (playlists) {
      $scope.models.playlists = playlists;
    });
  })
  .catch(console.error);
  
  $scope.toggleCreateModal = function () {
    $scope.createModalShown = !$scope.createModalShown;
  };

  $scope.pendingDeletePlaylist = function (playlist) {
    $scope.pendingPlaylist = playlist;
    $scope.destroyModalShown = true;
  };

  $scope.makeCurrent = function (playlist) {
    $scope.models.currentPlaylist = playlist;
    Songs.getPlaylistSongs(playlist.id)
    .then(function (songs) {
      $scope.models.currentPlaylist.songs = songs;
    })
    .catch(console.error);
  };

  $scope.createPlaylist = function () {
    Songs.createPlaylist($scope.newPlaylist)
    .then(function (playlist) {
      $scope.createModalShown = false;
      GR.getPlaylistsByGroupId($scope.user.currentGroup.id)
      .then(function (playlists) {
        $scope.models.playlists = playlists;
      })
      .catch(console.error);
    });
  };

  $scope.deleteSong = function (index) {
    var songId = $scope.models.currentPlaylist.songs[index].id;
    $scope.models.currentPlaylist.songs.splice(index, 1);
    Songs.deleteFromPlaylist(songId, $scope.models.currentPlaylist.id)
    .then(function(resp) {
      console.log(resp);
    })
    .catch(console.error);
  };

  $scope.deletePlaylist = function () {
    var playlist = $scope.pendingPlaylist;
    if ($scope.models.currentPlaylist.id === playlist.id) {
      $scope.models.currentPlaylist = {};
    }
    Songs.deletePlaylist(playlist.id)
    .then(function(resp) {
      $scope.destroyModalShown = false;
      $scope.models.playlists = _.filter($scope.models.playlists, function (currentPlaylist) {
        return currentPlaylist.id !== playlist.id;
      });
    })
    .catch(console.error);
  };

}]);