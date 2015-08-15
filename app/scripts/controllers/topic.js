'use strict';

/**
 * @ngdoc function
 * @name bgAngularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the bgAngularApp
 */
angular.module('bgAngularApp')
  .controller('TopicCtrl', ['$scope', 'badgame', '$location', '$anchorScroll', '$routeParams', function ($scope, badgame, $location, $anchorScroll, $routeParams) {
    // Init to 40, but use server settings after loading a page
    $scope.postsPerPage = 40;
    $scope.offsetOverride = undefined;
    $scope.breadcrumbs = [];
    
    function getOffset() {
      return $scope.offsetOverride ? $routeParams.offset : ($scope.currentPage - 1) * $scope.postsPerPage;
    }

    // Refresh the posts for the scope using current parameters
    $scope.refreshPosts = function() {
      var offset = getOffset(); 

      // Reset override
      if($scope.offsetOverride) {
        $scope.offsetOverride = undefined;
      }

      badgame.getPosts($routeParams.topicId, offset).then(function(data) {
        $scope.breadcrumbs = data.crumbs.slice(2);
        $scope.can_reply = data.can_reply ? true : false;
        $scope.uplink = $scope.breadcrumbs[0].url;
        $scope.posts = data.messages;
        $scope.currentPage = data.page_info.current_page;
        $scope.postsPerPage = data.page_info.items_per_page;
        $scope.totalItems = data.page_info.total_items;
        $scope.replyUrl = data.reply_url;
      });
    };

    // Monitor rendering status and jump to anchor
    $scope.$on('ngRepeatFinished', function(event) {
      $anchorScroll();
    });
    
    $scope.handleEdit = function(element) {
      badgame.postUrl = element.edit_url;
      $location.path('/post/msg' + element.id);
    }

    $scope.handleQuote = function(element) {
      badgame.postUrl = element.quote_url;
      $location.path('/post');
    };

    $scope.handleReply = function() {
      badgame.postUrl = $scope.replyUrl;
      $location.path('/post');
    };

    // Handle page changes
    $scope.pageChanged = function() {
      $location.path('/topic/' + $routeParams.topicId + '/' + getOffset());
      $location.hash('top');
    };

    if($routeParams.offset) {
      $scope.offsetOverride = true;
    }

    // Load the initial set of posts
    $scope.refreshPosts();
  }]);
