attendeeApp.controller('list-apps' , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings',
  function ($scope, $rootScope, $timeout , $http , settings ){
     // => Scopes
     $scope.server_ip = $("#serverIp").val();
     $scope.user_id = $("#userId").val();
     $scope.json_source = $scope.server_ip + settings.json_source;
     $scope.__applications = null ;
     $scope.__reports = null ;

     // ==> Functionalities
     // ==>> Load all applications into angular object
     $scope.load_attendee_application = function (){
       $.getJSON( $scope.json_source , function (keys_object){
         $http({
           url : $scope.server_ip + 'api/applications/list' ,
           type : "GET" ,
           headers: {
             "X-api-keys": keys_object.API_KEY,
             "X-api-app-name": keys_object.APP_NAME
           }
         }).then(function (resps){
           $scope.__applications = resps.data ;
         } , function (err){
              console.log(err);
         });
       }); // End JSON
     };

     // ==> Calling Functionalities
     $scope.load_attendee_application();
  }
]);
