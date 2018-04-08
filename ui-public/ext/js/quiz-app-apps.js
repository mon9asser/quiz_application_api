//=============================================
// => Javasctipt code lines
//=============================================
Array.prototype.find_unsolved_questions = function (questions_list) {
    return this.filter(function (i) {
      return questions_list.findIndex(x => x.question_id == i._id) === -1;
    });
};

//=============================================
// => Filters
//=============================================
attendeeApp.filter("set_iframe" , [
      "$timeout" ,"$sce" ,
  function (  $timeout , $sce){
    return function (media_object){
      var embed_video , video_path , video_mp4  , iframe_size ;

      if( media_object.embed_path != null)
      {
         video_path = media_object.embed_path ;
         iframe_size = new Object();
         iframe_size.width = "100%";
         iframe_size.height = "130px" ;
      }
      else
      {
         video_path = media_object.video_source ;
         iframe_size = new Object();
         iframe_size.width = "100%";
         iframe_size.height = "130px" ;
      }

      if(media_object.mp4_option != undefined || media_object.mp4_option != null ){
        video_mp4 = new Object();
        video_mp4['mp4_url'] = media_object.mp4_option.mp4_url ;
        video_mp4['ogg_url'] = media_object.mp4_option.ogg_url ;

        iframe_size = new Object();
        iframe_size.width = "250px";
        iframe_size.height = "160px" ;
      }else {
        video_mp4 = new Object();
        video_mp4['mp4_url'] =  media_object.media_field+'.mp4';
        video_mp4['ogg_url'] =  media_object.media_field+'.ogg';
        iframe_size = new Object();
        iframe_size.width = "250px";
        iframe_size.height = "160px" ;
      }
      switch (media_object.media_type) {
        case 1:
          if( media_object.video_type == 0 ){
            embed_video = "<iframe width='"+iframe_size.width+"' height='"+iframe_size.height+"' src='"+video_path+"' ></iframe>";
          }
          if( media_object.video_type == 1 ){
            embed_video = "<iframe style='border:none;' width='"+iframe_size.width+"' height='"+iframe_size.height+"' src='"+video_path+"' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
          }
          if( media_object.video_type == 2 ){
            embed_video = '<video style="width:'+iframe_size.width+'; height:'+iframe_size.height+';" controls>' +
                          '<source src="'+video_mp4.mp4_url+'" type="video/mp4">'+
                          '<source src="'+video_mp4.ogg_url+'" type="video/ogg">'+
                          'Your browser does not support the video tag.' +
                        '</video>';
          }
        break;
      }

      return $sce.trustAsHtml(embed_video) ;
    };
}]);
attendeeApp.filter('trust_this_html_values' , [
  '$sce' , function ($sce){
    return function (returned_val){
       return $sce.trustAsHtml(returned_val);
    }
  }
]);

//=============================================
// => Controllers
//=============================================
attendeeApp.controller("players" , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings' ,
  ( $scope, $rootScope, $timeout , $http , settings ) => {

    // ====> Scope Variables
     $scope.app_screens = null ;
     $scope.__player_object = null ;
     $scope.__report_object = null ;
     $scope.attendee_draft = null ;
     $scope.this_attendee_draft= null ;
     $scope.this_attendee_draft_index = null ;
     $scope.current_question = null ;
     $scope.slide_screens = null ;
     $scope.is_resume = null ;
     $scope.timer = null;
     $scope.application_data_object = null ;
     $scope.user_id = $("#userId").val();
     $scope.application_id = $("#appId").val();
     $scope.key_headers = null ;
     $scope.server_ip = settings.server_ip ;
     $scope.json_source = settings.server_ip + settings.json_source;
     $scope.application_status = [] ;
     $scope.labels = [  'a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
     $scope.quiz_time_tracker = "00:00";
     $scope.collected_time_vals = 0;
     $scope.seconds = 00 ;
     $scope.minutes = 00;
     $scope.hours = 0 ;
     $scope.warning_at_time = {
       number_1 : 0 ,
       number_2 : 0
     };

    // ====> Api urls
    $scope.url_attendee_draft_get = $scope.server_ip + 'api/application/user_status/' + $scope.application_id + '/get';


    // ====> Scope functionalities
    $scope.load_application_draft = function (){
      try {
        $http({
          method : "POST" ,
          url : $scope.url_attendee_draft_get ,
          data : {
                user_id : $scope.user_id
              }
        }).then(function(res){
          $scope.attendee_draft = res.data;
          if($scope.attendee_draft.att_draft != undefined)
            {
              $scope.this_attendee_draft = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
              $scope.this_attendee_draft_index = $scope.attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id);
            }
        } , function (){});
        } catch (e) {

      }
    }
    $scope.load_application_json_file = function (){
      $.getJSON( $scope.json_source , function (apk_keys){
        $scope.api_key_headers = {
          "X-api-app-name":apk_keys.APP_NAME ,
          "X-api-keys":apk_keys.API_KEY
        }
        return $scope.api_key_headers ;
      });
    }
    $scope.load_main_attendee_application = function (){

    }
    // ====> Scope Do An Actions
    $scope.load_application_draft();
    $scope.load_application_json_file();
    $scope.load_main_attendee_application();

    // ====> Do An Actions through time
    $timeout(function (){ // => time is 1500
        console.log($scope.api_key_headers);
    } , 50);

  } // => end controller functionality
]);
