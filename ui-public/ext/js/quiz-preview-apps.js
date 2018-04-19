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
attendeeApp.controller("preview_players" , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings' , '$window',
( $scope, $rootScope, $timeout , $http , settings , $window  ) => {

    // ==> Scope init
    $scope.app_id              = $("#app-id").val();
    $scope.server_ip           = $("#server_ip").val();
    $scope.user_id             = $("#user_id").val();
    $scope.labels = ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
    $scope.json_source         = $scope.server_ip + settings.json_source;
    $scope.slide_screens = new Swiper('.swiper-container') ;
    $scope.__player_object     = null;
    $scope.this_attendee_draft = null;
    $scope.api_key_headers     = null;

    // => Urls
    $scope.url_application = $scope.server_ip + "api/" + $scope.app_id +'/application/retrieve';

    // => Functionalities
    $scope.get_slide_styles = (question_type) => {
      var classes = '';
        if(question_type == 0 ) classes = 'question_type_texts';
        if(question_type == 1 ) classes = 'question_type_media';
        if(question_type == 2 ) classes = 'question_type_boolean';
      return classes;
    };
    $scope.load_qs_theme = (question_type) => {
      var classes = '';
        if(question_type == 0 ) classes = 'question_type_texts_qs_brd';
        if(question_type == 1 ) classes = 'question_type_media_qs_brd';
        if(question_type == 2 ) classes = 'question_type_boolean_qs_brd';
      return classes;
    };
    $scope.load_slide_theme = (question_type) => {
      var classes = '';
      if(question_type == 0 ) classes = 'question_type_texts_bg';
      if(question_type == 1 ) classes = 'question_type_media_bg';
      if(question_type == 2 ) classes = 'question_type_boolean_bg';
      return classes;
    };
    $scope.load_border_styles = (question_type) => {
      var classes = '';
      if(question_type == 0 ) classes = 'question_type_texts_brd';
      if(question_type == 1 ) classes = 'question_type_media_brd';
      if(question_type == 2 ) classes = 'question_type_boolean_brd';
      return classes;
    };
    $scope.go_to_next_slider = () => {
      try {
        $scope.slide_screens.slideNext();
        // => When button navigation is fired
        // => Move into attendee draft object
        // $scope.attendee_draft_collection();
      } catch (e) {

      }
    }
    $scope.load_qs_note_theme =  (question_type) => {
      var classes = '';
      if(question_type == 0 ) classes = 'question_type_texts_colr';
      if(question_type == 1 ) classes = 'question_type_media_colr';
      if(question_type == 2 ) classes = 'question_type_boolean_colr';
      return classes;
    };
    $scope.load_case_many_answer_option =  (question_type , is_single_choice) => {
      var classes = '';
         if((question_type == 0 || question_type == 1 ) && is_single_choice == false )
          classes += 'case_many_answers ';

          if( question_type == 0 && is_single_choice == false ){
            classes += 'question_type_texts_qs_brd ';
          }
          if( question_type == 1 && is_single_choice == false ){
            classes += 'question_type_media_qs_brd ';
          }
         return classes;
    };
    $scope.classes_for_this_answer = (quiz_settings , question_id , answer_id) => {
      var classes = '';
      // => Two blocks per row or else
      if(quiz_settings.choice_style)
          classes += 'ng_inline_block';
          else
          classes += 'ng_block';

      // => check if this is selected answer or not from attendee
      if( $scope.attendee_draft != null && $scope.attendee_draft.user_id != undefined ){
          var drft_question = $scope.attendee_draft.questions_data.find(x => x.question_id == question_id ) ;
          if(drft_question != undefined ){
            var drft_selected_answer = drft_question.answer_ids.findIndex(x => x.answer_id == answer_id );
          if (drft_selected_answer != -1 ){ // => Add ( selected_answers )
            classes += ' selected_answer'
                }
            }
       }

      // => Get Classes according to database
      if($scope.this_attendee_draft != null && $scope.this_attendee_draft.questions_data != undefined ){
        var thisQuestion = $scope.this_attendee_draft.questions_data.find(x => x.question_id == question_id) ;
        if(thisQuestion != undefined) {
          var answers_array = thisQuestion.answer_ids ;
          var answer_object_index = answers_array.findIndex(x => x.answer_id == answer_id);
          if( answer_object_index != -1 ){
            var selected_answer = answers_array[answer_object_index];
            if($scope.__player_object.settings.show_results_per_qs){ // => true
              // =>> check if show the right answer option is true
              if(selected_answer.is_correct){
                classes += ' right_answer';
              }else {
                classes += ' wrong_answer';
              }
            } else classes += ' selected_answer';
          }
        }
      }

      return classes ;
    };
    $scope.join_this_quiz = (at_this_array_only = null ) => {
      if($scope.attendee_draft != null && $scope.attendee_draft.att_draft != undefined && $scope.attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) != -1)
        return false ;

      if($scope.attendee_draft == null || $scope.attendee_draft.application_id == undefined){
        $scope.attendee_draft = new Object();
        $scope.attendee_draft['att_draft'] = new Array();
        $scope.attendee_draft['application_id'] = $scope.application_id;
        $scope.attendee_draft['questionnaire_info'] = $scope.application_id;
      }

        if($scope.attendee_draft.att_draft == undefined)
          $scope.attendee_draft.att_draft = new Array();


        var cuIndex = $scope.attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) ;
        if(cuIndex == -1 ){
          $scope.attendee_draft.att_draft.push({
            'questions_data' : new Array() ,
            'is_loaded':true ,
            'start_expiration_time' : new Date() ,
            'user_id' : $scope.user_id ,
            'user_info':$scope.user_id ,
            'is_completed':false ,
            'impr_application_object':$scope.__player_object
          });
        }

        $scope.this_attendee_draft = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);

    };
    $scope.load_quiz_timer = () => {
      if($scope.__player_object.settings != undefined ){
         var timeSettings = $scope.__player_object.settings.time_settings;

         if(timeSettings && timeSettings.is_with_time)
            $scope.timer = setTimeout($scope.load_time_tracker , 1000);
       }
    }
    $scope.start_this_quiz = () => {
      $scope.join_this_quiz();
      $timeout(function (){
        $scope.load_quiz_timer ();
      } , 30);

      try {
        $scope.slide_screens.slideNext();

      } catch (e) {

      }
    };
    $scope.back_to_quizzes = () => {
      return window.location.href = $scope.server_ip+'quizzes';
    };
    $scope.load_quiz_status_theme = () => {
      var classes = '';
      // if($scope.quiz_status == 0 ) // =>  take thi quiz
       if ($scope.quiz_status == 1) // =>  Expire warning
      classes = 'expiration_warning_message'
       if ($scope.quiz_status == 2) // =>  is expire
      classes = 'quiz_is_expired'
      if ($scope.quiz_status == 3) // =>  is Completed
      classes = 'completed_quiz'
      return classes ;
    };
    $scope.load_application_for_preview = () => {
          $http({
            url : $scope.url_application ,
            type : "GET" ,
            headers : $scope.api_key_headers
          }).then(function(resp){
            $scope.__player_object = resp.data ;
            console.log({
              Player : $scope.__player_object
            });
          },function(err){ console.log(err); });
      };
    $scope.load_application_keys = () => {
      $.getJSON( $scope.json_source , function (apk_keys){
        $scope.api_key_headers = {
          "X-api-app-name":apk_keys.APP_NAME ,
          "X-api-keys":apk_keys.API_KEY
        }
         $scope.api_key_headers ;

         // ==> calling funcstionalities
         $scope.load_application_for_preview();
         // ...
      });
    }
    $scope.time_tracker_layout = () => {
      var layout_template = $scope.__player_object.settings.time_settings.timer_layout;
      return '/time-layouts/layout-'+layout_template+'.hbs';
    };
    $scope.progression_layout = () => {
       var layout_template = $scope.__player_object.settings.progression_bar.progression_bar_layout;
       return '/progressbar-layouts/layout-'+layout_template+'.hbs';
     };
    $scope.back_to_prev_slider = () => {
       try { $scope.slide_screens.slidePrev(); } catch (e) { }
     }

    // => Fire those fn.
    $scope.load_application_keys();

    // => Fire funcs with timeframe


}]);
