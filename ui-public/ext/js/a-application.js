
var apps ;

apps = angular.module("applications" , []);


  "use strict";

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

apps.factory("settings" , [
  function (){
     var applications = {
        server_ip : (window.location.toString().includes('localhost')) ? "http://localhost:9000/" : "http://35.166.78.187/" ,
        json_source : "ext/json/json-keys.json" ,
        server_url : window.location.toString() ,
        page_name : window.location.pathname.replace(/^\/([^\/]*).*$/, '$1')
      }

      return applications ;
   }
]);
apps.filter ("caps_first_later" , [
  function (chars){
    return function (chars){

        var thisChar='' ;
        for (var i = 0; i < chars.length; i++) {
            if(i == 0 )
              thisChar += chars[i].toUpperCase() ;
              else
            thisChar += chars[i] ;
          }
        return thisChar ;
    }
  }
]);
apps.controller("attendee-controller" , [
  '$scope' , '$rootScope' , 'settings' ,
   function ($scope , $rootScope , settings ){
      $rootScope.page_name = settings.page_name;

   }]); // ==> End The parent controller !!
