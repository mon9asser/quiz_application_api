apps.filter("user_name" , [
  '$http', 'settings',
  function ($http , settings){
    return function (user_id){
      var json_source =  settings.server_ip + settings.json_source;
      var user_name = '';
      $.getJSON( json_source , function(keys_object){
          $http({
            url : settings.server_ip + 'api/user/'+ user_id,
            type : "GET" ,
            headers: {
              "X-api-keys": keys_object.API_KEY,
              "X-api-app-name": keys_object.APP_NAME
            }
          }).then(function(response){
             user_name = response.data.email;
          } , function (err){
            console.log(err);
          });
      });
      return user_name ;
    }
  }
]);
apps.controller('list-apps' , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings',
  function ($scope, $rootScope, $timeout , $http , settings ){

     // => Scopes

     $scope.user_id = $("#userId").val();
     $scope.json_source = settings.server_ip + settings.json_source;
     $scope.__applications = [] ;
     $scope.__reports = null ;

     // ==> Functionalities
     // ==>> Load all applications into angular object
     $scope.load_attendee_application = function (){

      //  alert( settings.server_ip + 'api/applications/list');
      //  alert($scope.json_source);
       $.getJSON( $scope.json_source , function (keys_object){

         $http({
           url : settings.server_ip + 'api/applications/list' ,
           type : "GET" ,
           headers: {
             "X-api-keys": keys_object.API_KEY,
             "X-api-app-name": keys_object.APP_NAME
           }
         }).then(function (resps){
          //  console.log(resps);
           $scope.__applications = resps.data ;
           console.log($scope.__applications);
          //  console.log($scope.__applications);
         } , function (err){
              console.log(err);
         });
       }); // End JSON
     };

     // ==> Calling Functionalities
     $scope.load_attendee_application();
  }
]);
