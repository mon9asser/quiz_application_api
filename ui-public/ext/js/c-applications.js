var apps = angular.module("applications" , [] );
    "use strict";

// angular.module('applications', ['attedee_applications']);

// =============================================================
// ================> Configurations
// =============================================================
apps.config([
  "$interpolateProvider" , "$qProvider" ,
  function($interpolateProvider , $qProvider) {
      $interpolateProvider.startSymbol('{>');
      $interpolateProvider.endSymbol('<}');
      $qProvider.errorOnUnhandledRejections(false);
  }
]);



apps.controller("page-controller",[ "$scope" , "$rootScope" , function( $scope , $rootScope ){
  // alert("Login controller");
   $rootScope.page_name = window.location.pathname.replace(/^\/([^\/]*).*$/, '$1');
}]);
