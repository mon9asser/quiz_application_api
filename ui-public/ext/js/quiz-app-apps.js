
// >> true html value inside element
attendeeApp.filter('trust_this_html_values' , [
  '$sce' , function ($sce){
    return function (returned_val){
       return $sce.trustAsHtml(returned_val);
    }
  }
]);



attendeeApp.controller('players' , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings',
  function ($scope, $rootScope, $timeout , $http , settings ){

     // => Scopes
     $scope.user_id = $("#userId").val();
     $scope.application_id = $("#appId").val();
     $scope.json_source = settings.server_ip + settings.json_source;
     $scope.__player_object = null ;
     $scope.__report_object = null ;

     // ==> Functionalities
     // ==>> Load all applications into angular object
    //  alert(settings.server_ip + 'api/'+$scope.application_id+'/application/retrieve');
     $scope.load_attendee_application = function (){
       $.getJSON( $scope.json_source , function (keys_object){
         $http({
           url : settings.server_ip + 'api/'+$scope.application_id+'/application/retrieve' ,
           type : "GET" ,
           headers: {
             "X-api-keys": keys_object.API_KEY,
             "X-api-app-name": keys_object.APP_NAME
           }
         }).then(function (resps){
            $scope.__player_object = resps.data ;
         } , function (err){
              console.log(err);
         });
       }); // End JSON
     };
     $scope.back_to_quizzes = function (){
       return window.location.href = settings.server_ip + "quizzes";
     };

     // ==> Calling Functionalities
     $scope.load_attendee_application();



     var swiper = new Swiper('.swiper-container', {
       pagination: {
         el: '.swiper-pagination',
         type: 'progressbar',
       },
       navigation: {
         nextEl: '.swiper-button-next',
         prevEl: '.swiper-button-prev',
       },
     });

  }
]);
