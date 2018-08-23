apps.controller("quiz_player" , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings' , '$window' ,
  ( $scope, $rootScope, $timeout , $http , settings , $window ) => {

    $rootScope.user_id = $("#userId").val();
    $rootScope.application_id = $("#appId").val();
    $rootScope.server_ip = settings.server_ip ;

    $rootScope.attendee_draft = undefined ; // =>
    $rootScope.this_attendee_draft = undefined ; // =>
    $rootScope.theme_stylesheet = $rootScope.server_ip + 'themes/stylesheet_of_app_' + $rootScope.application_id + '.css' ; // stored
    $rootScope._application_ = undefined ; // ==>
    $rootScope._questions_ = undefined ;
    $rootScope._settings_ = undefined ;

   // ==> Load Application Draft
   $rootScope.attendee_draft_api = $rootScope.server_ip + 'api/' + $rootScope.application_id + '/player/data';
   $http({
     url : $rootScope.attendee_draft_api ,
     method : "GET"
    }).then((result) => {
      var mongodb_data = result.data ;
      if(mongodb_data.att__draft == undefined || mongodb_data.att__draft.att_draft == undefined ){
        $rootScope._application_ = mongodb_data ;
        $rootScope._questions_ = mongodb_data.questions ;
        $rootScope._settings_ = mongodb_data.settings ;
        $rootScope.attendee_draft = mongodb_data.att__draft;
      }else {
        var attendee_draft = mongodb_data.att__draft.att_draft.find(x => x.user_id == $rootScope.user_id );
        if(attendee_draft != undefined ){
          $rootScope._application_ = attendee_draft.impr_application_object;
          $rootScope._questions_ = attendee_draft.impr_application_object.questions ;
          $rootScope._settings_ = attendee_draft.impr_application_object.settings ;
          $rootScope.this_attendee_draft = attendee_draft ;
        }

      }
    }); // ==> End Api Get Calling



    // => Loading Application
    $timeout(function(){
      // ============================================>> Start Code Here
      var online_report = $rootScope.this_attendee_draft ;
      if( online_report != undefined  ){
        
      }
     // ============================================>> End Code Here
   } , 200 );
   $("body").on("click" , function(){
     console.log();
   })
}]);
