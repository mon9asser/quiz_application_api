var apps = angular.module("applications" , [] );
    "use strict";

// angular.module('applications', ['attedee_applications']);

// =============================================================
// ================> Configurations
// =============================================================
apps.config([
  "$interpolateProvider"  ,
  function($interpolateProvider) {
      $interpolateProvider.startSymbol('{>');
      $interpolateProvider.endSymbol('<}');
  }
]);



apps.controller("page-controller",[ "$scope" , "$rootScope" , function( $scope , $rootScope ){
  // alert("Login controller");
   $rootScope.page_name = window.location.pathname.replace(/^\/([^\/]*).*$/, '$1');
}]);
