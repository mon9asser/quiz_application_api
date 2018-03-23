var attendeeApp = angular.module("applications" , []);
attendeeApp.config([
  "$interpolateProvider"  ,
  function($interpolateProvider) {
      $interpolateProvider.startSymbol('{>');
      $interpolateProvider.endSymbol('<}');
  }
]);
attendeeApp.factory("settings" , [
  function (){
     var applications = {
        server_ip : (window.location.toString().includes('localhost')) ? "http://localhost:9000/" : "http://34.215.133.182/" ,
        json_source : "ext/json/json-keys.json" ,
        server_url : window.location.toString() ,
        page_name : window.location.pathname.replace(/^\/([^\/]*).*$/, '$1')
      }

      return applications ;
   }
]);
attendeeApp.filter ("caps_first_later" , [
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
attendeeApp.controller("attendee-controller" , [
  '$scope' , '$rootScope' , 'settings' ,
   function ($scope , $rootScope , settings ){
      $rootScope.page_name = settings.page_name;
     
   }
]); // ==> End The parent controller !!
