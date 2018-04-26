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
apps.filter("set_iframe" , [
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
apps.filter('trust_this_html_values' , [
  '$sce' , function ($sce){
    return function (returned_val){
       return $sce.trustAsHtml(returned_val);
    }
  }
]);
apps.controller("preview_players" , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings' , '$window',
( $scope, $rootScope, $timeout , $http , settings , $window  ) => {

    // ==> Scope init
    $scope.app_id              = $("#app-id").val();
    $scope.server_ip           = $("#server_ip").val();
    $scope.user_id             = $("#user_id").val();
    $scope.labels = ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
    $scope.json_source         = $scope.server_ip + settings.json_source;
    // if( window.parent.location == window.location )
    $scope.__player_object     = null;
    $scope.this_attendee_draft = null;
    $scope.api_key_headers     = null;
    // ==> Time  objects
    $scope.seconds = 9 ;
    $scope.minutes = 0;
    $scope.hours = 0 ;
    $scope.quiz_time_status_is_counting = true ;
    $scope.warning_at_time = {
       number_1 : 0 ,
       number_2 : 0
    };
    // => Urls
    $scope.url_application = $scope.server_ip + "api/" + $scope.app_id +'/application/retrieve';
    $window.player_questions = (questions , sliderIndex) => {
      var newQuestion = questions[sliderIndex] ;
      $scope.slide_screens.noSwiping = true ;
      $scope.__player_object.questions.splice( sliderIndex , 0 , newQuestion );
      $scope.$apply();
      $scope.slide_screens.update();
      $timeout(function(){
        var targetIndex = sliderIndex + 1 ;
        $scope.slide_screens.slideTo ( targetIndex , 200 );
      } , 500);
    };
    // => Functionalities
    $window.add_data_to_view = (question_id , answer_data) => {

     var this_question_data = $scope.__player_object.questions.find(x => x._id == question_id);
     var questionIndex = $scope.__player_object.questions.findIndex(x => x._id == question_id);
     if( this_question_data != undefined )
        {
           this_question_data.answers_format.push({$$hashKey:null , _id:answer_data._id , value : answer_data.value});
        }
        $scope.$apply();
    };
    $window.slide_system = () => {
        $scope.slide_screens = new Swiper('.swiper-container') ;
        $scope.slide_screens.update();
        $scope.slide_screens.on('slideChange' , function (i){
              $scope.touch_move++;
              var lengther = $(this);
              var current_index = lengther[0].activeIndex ;
              if(current_index >= $scope.__player_object.questions.length)
                 current_index = $scope.__player_object.questions.length ;
                // $scope.curren_question_slide = parseInt(current_index) ;
                //   // => Store current index
                //  $scope.curren_question_slide = current_index ;
                //  $scope.current_index = current_index ;
                //  $scope.previous_index =lengther[0].previousIndex;
              // => load to ui

              // => Load to next index

              if (window.location != window.parent.location){
                 var question_lists = $(window.parent.document).find('#docQuestions') ;

                  $timeout(function(){
                    if(current_index == 0 ) current_index = 0
                    else current_index = current_index - 1 ;
                    question_lists.children('li').eq(current_index).
                    find('.single-question-container').trigger('click');

                  } , 50 );
               }

        });
    }
    $window.change_data_in_answer_view = (question_id  , model_type = 0 , model_id = null , model_index = null  , model_value  = null  , media_data = null ) => {
      var this_question_data = $scope.__player_object.questions.find(x => x._id == question_id);
      var questionIndex = $scope.__player_object.questions.findIndex(x => x._id == question_id);

      if(model_type == 0){ // =>> Question
          if(questionIndex != -1){
            if(model_value != null)
              $scope.__player_object.questions[questionIndex].question_body = model_value;

            if(media_data != null ){
              if($scope.__player_object.questions[questionIndex].media_question == undefined)
              $scope.__player_object.questions[questionIndex].media_question  = new Object() ;
              $scope.__player_object.questions[questionIndex].media_question = media_data ;
            }
          }
      }else if (model_type == 1 ){ // =>> Description
        if(questionIndex != -1){
          if(model_value != null)
            $scope.__player_object.questions[questionIndex].question_description = model_value;
        }
      }else if (model_type == 2 ){ // =>> Answer
        if(questionIndex != -1){
            var answerIndex = $scope.__player_object.questions[questionIndex].answers_format.findIndex( x => x._id ==  model_id );
            if(answerIndex != -1 ){
              if(model_value != null)
              $scope.__player_object.questions[questionIndex].answers_format[answerIndex].value = model_value;

              if(media_data != null ){
                var question_object = $scope.__player_object.questions[questionIndex] ;
                var thisAnswer = $scope.__player_object.questions[questionIndex].answers_format[answerIndex];


                if(question_object.question_type == 0 ){
                  // => Text optional with media optional
                    thisAnswer.media_optional = media_data
                }

                if(question_object.question_type == 1 ){

                  if( media_data.media_type == 0 ){
                      if(thisAnswer.media_name == undefined )
                        thisAnswer.media_name = null ;
                      if(thisAnswer.media_src == undefined )
                        thisAnswer.media_src = null ;
                      if(thisAnswer.media_type == undefined )
                        thisAnswer.media_type = null

                      thisAnswer.media_name = media_data.media_name;
                      thisAnswer.media_src= media_data.media_src;
                      thisAnswer.media_type= media_data.media_type;
                      thisAnswer.Media_directory = $scope.server_ip + media_data.media_src;
                  }
                  if( media_data.media_type == 1 ){
                    if(thisAnswer.media_name == undefined )
                    thisAnswer.media_name = null ;
                    if(thisAnswer.media_src == undefined )
                    thisAnswer.media_src = null ;
                    if(thisAnswer.media_type == undefined )
                    thisAnswer.media_type = null

                    if(thisAnswer.Media_directory == undefined )
                    thisAnswer.Media_directory = null
                    if(thisAnswer.embed_path == undefined )
                    thisAnswer.embed_path = null
                    if(thisAnswer.video_id == undefined )
                    thisAnswer.video_id = null
                    if(thisAnswer.video_type == undefined )
                    thisAnswer.video_video_typeid = null

                    thisAnswer.Media_directory = media_data.Media_directory;
                    thisAnswer.embed_path= media_data.embed_path;
                    thisAnswer.video_id= media_data.video_id;
                    thisAnswer.video_type= media_data.video_type;
                    thisAnswer.media_name = media_data.media_name;
                    thisAnswer.media_src= media_data.media_src;
                    thisAnswer.media_type= media_data.media_type;
                    thisAnswer.Media_directory =  media_data.media_src;

                  }

                }

                  console.log({QUESTION_OBJECT__VF__TT : question_object});
              }
            }
        }
      }
      $scope.$apply();

      // ==> Expand the iframe according to content height !
      if(window.location != window.parent.location){
          $timeout(function (){
            console.log(window.parent);
          } , 1000 );
      }
    };
    $window.set_application_settings = (settings) => {

      if($scope.__player_object.settings == undefined )
        $scope.__player_object.settings = new Object();

      $scope.__player_object.settings = settings;
      $scope.$apply();
    };
    $window.model_deletion = (model_type , basic_model_id , model_id = null) => {
      var this_question_data = $scope.__player_object.questions.find(x => x._id == basic_model_id);
      var questionIndex = $scope.__player_object.questions.findIndex(x => x._id == basic_model_id);
      if(questionIndex == -1 ) return false ;

      if(model_type == 0 ) {
        // => Bug number 1
        $scope.__player_object.questions.splice(questionIndex , 1);
        $scope.$apply();
      } // Question
      if(model_type == 1 ) {
        var answerIndex = $scope.__player_object.questions[questionIndex].answers_format.findIndex(x => x._id == model_id );
        if(answerIndex  != -1) {
          $scope.__player_object.questions[questionIndex].answers_format.splice(answerIndex , 1);
        }
      } //  Answer
      $scope.$apply();
    };
    $scope.set_image_background = (image_sourc , set_server = null)=>{
      var set_server_ip = $scope.server_ip
      if(set_server != null )
        set_server_ip = '';
        // http://34.215.133.182/img/media-icon.png
      if(image_sourc == set_server_ip+image_sourc)
        set_server_ip = '';
      return {
        "background-image" : "url('"+set_server_ip+image_sourc+"')"
      }
    }
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
    $scope.go_to_next_slider = (current_index , val = null) => {
      try {
        // if( window.parent.location == window.location )
          $scope.slide_screens.slideNext();

        // => When button navigation is fired
        // => Move into attendee draft object
        // $scope.attendee_draft_collection();
      } catch (e) {

      }
    }
    $scope.slide_to_question_cross_iframe = () => {
      var this_input = $("input#cross_iframe_qs_index_value").val();
      $scope.slide_screens.slideTo(this_input);
    };
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
    $scope.load_time_tracker = () => {

    }
    $scope.load_quiz_timer = () => {
      if($scope.__player_object.settings != undefined ){
         var timeSettings = $scope.__player_object.settings.time_settings;

         if(timeSettings && timeSettings.is_with_time)
            $scope.timer = setTimeout($scope.load_time_tracker , 1000);
       }
    }
    $scope.load_template_timer = () => {
       console.log({
         settings : $scope.__player_object
       });
       if($scope.__player_object != undefined && $scope.__player_object != null && $scope.__player_object.settings != undefined ){
       var timeSettings = $scope.__player_object.settings.time_settings;

         if(timeSettings && timeSettings != undefined || timeSettings.is_with_time){
           $scope.seconds = timeSettings.seconds;
           $scope.minutes = timeSettings.minutes ;
           $scope.hours   = timeSettings.hours;

         }
       }
     }
    $scope.load_time_tracker  = () => {
      if( $scope.quiz_time_status_is_counting){
            var sec  = $('.sec');
            var mins = $('.min');
            var hrs  = $('.hr');
            var is_hourly = $scope.__player_object.settings.time_settings.timer_type ;
            if(is_hourly){
               if($scope.seconds == 0 && $scope.minutes == 0 && $scope.hours == 0)
                  {
                    // $scope.do_an_action_with_closest_time();
                    return false ;
                  }
               }else {
                  if( $scope.seconds == 0 && $scope.minutes == 0 )
                      {
                        // $scope.do_an_action_with_closest_time();
                        return false ;
                      }
            }
            $scope.seconds--;
            if( $scope.seconds < 0 ){
               $scope.seconds = 59;
               $scope.minutes--;
            }

            if(is_hourly){
                 if($scope.minutes < 00 && $scope.hours > 0 ) {
                   $scope.minutes = 59;
                   $scope.hours--;
                 }
            }

          sec.html(($scope.seconds < 10 ) ? '0'+ $scope.seconds : $scope.seconds);
          mins.html(($scope.minutes < 10 ) ? '0'+$scope.minutes:$scope.minutes );
          if(is_hourly){
              hrs.html( ( $scope.hours < 10 ) ? '0'+$scope.hours : $scope.hours);
          }
          // Load time
          $scope.load_quiz_timer();
      }
    }
    $scope.start_this_quiz = () => {
      $scope.join_this_quiz();
      $timeout(function (){
        $scope.load_quiz_timer ();
      } , 30);

      try {
        // if( window.parent.location == window.location )
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
        // if( window.parent.location == window.location ){
          try { $scope.slide_screens.slidePrev(); } catch (e) { }
        // }
     }

    // => Fire those fn.
    $scope.load_application_keys();

    // => Fire after time
    $timeout(function () {
        $scope.slide_screens.update();
        $scope.load_template_timer();
        $scope.slide_screens.on('slideChange' , function (i){
              $scope.touch_move++;
              var lengther = $(this);
              var current_index = lengther[0].activeIndex ;
              if(current_index >= $scope.__player_object.questions.length)
                 current_index = $scope.__player_object.questions.length ;
                // $scope.curren_question_slide = parseInt(current_index) ;
                //   // => Store current index
                //  $scope.curren_question_slide = current_index ;
                //  $scope.current_index = current_index ;
                //  $scope.previous_index =lengther[0].previousIndex;
              // => load to ui

              // => Load to next index

              if (window.location != window.parent.location){
                 var question_lists = $(window.parent.document).find('#docQuestions') ;

                  $timeout(function(){
                    if(current_index == 0 ) current_index = 0
                    else current_index = current_index - 1 ;
                    question_lists.children('li').eq(current_index).
                    find('.single-question-container').trigger('click');

                  } , 50 );
                 // question_lists.children('li').eq( current_index - 1 ).trigger('click');
               }
              // current_index

          // => When slideChange is fired
          // => Move into attendee draft object
          // if(current_index != 0)
          // // $scope.attendee_draft_collection();
        });
    }, 1000);





    // ===========================================>>>> Window Objects
    // $window

    $window.app_id              = $("#app-id").val();
    $window.server_ip           = $("#server_ip").val();
    $window.user_id             = $("#user_id").val();
    $window.labels = ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
    $window.json_source         = $window.server_ip + settings.json_source;
    // if( window.parent.location == window.location )

    $window.__player_object     = null;
    $window.this_attendee_draft = null;
    $window.api_key_headers     = null;
    // ==> Time  objects
    $window.seconds = 9 ;
    $window.minutes = 0;
    $window.hours = 0 ;
    $window.quiz_time_status_is_counting = true ;
    $window.warning_at_time = {
       number_1 : 0 ,
       number_2 : 0
    };
    // => Urls
    $window.url_application = $window.server_ip + "api/" + $window.app_id +'/application/retrieve';

    // => Functionalities
    $window.get_slide_styles = (question_type) => {
      var classes = '';
        if(question_type == 0 ) classes = 'question_type_texts';
        if(question_type == 1 ) classes = 'question_type_media';
        if(question_type == 2 ) classes = 'question_type_boolean';
      return classes;
    };
    $window.load_qs_theme = (question_type) => {
      var classes = '';
        if(question_type == 0 ) classes = 'question_type_texts_qs_brd';
        if(question_type == 1 ) classes = 'question_type_media_qs_brd';
        if(question_type == 2 ) classes = 'question_type_boolean_qs_brd';
      return classes;
    };
    $window.load_slide_theme = (question_type) => {
      var classes = '';
      if(question_type == 0 ) classes = 'question_type_texts_bg';
      if(question_type == 1 ) classes = 'question_type_media_bg';
      if(question_type == 2 ) classes = 'question_type_boolean_bg';
      return classes;
    };
    $window.load_border_styles = (question_type) => {
      var classes = '';
      if(question_type == 0 ) classes = 'question_type_texts_brd';
      if(question_type == 1 ) classes = 'question_type_media_brd';
      if(question_type == 2 ) classes = 'question_type_boolean_brd';
      return classes;
    };
    $window.go_to_next_slider = (current_index , val = null) => {
      try {
        // if( window.parent.location == window.location )
          $window.slide_screens.slideNext();

        // => When button navigation is fired
        // => Move into attendee draft object
        // $window.attendee_draft_collection();
      } catch (e) {

      }
    }
    $window.slide_to_question_cross_iframe = () => {
      var this_input = $("input#cross_iframe_qs_index_value").val();
      $window.slide_screens.slideTo(this_input);
    };
    $window.load_qs_note_theme =  (question_type) => {
      var classes = '';
      if(question_type == 0 ) classes = 'question_type_texts_colr';
      if(question_type == 1 ) classes = 'question_type_media_colr';
      if(question_type == 2 ) classes = 'question_type_boolean_colr';
      return classes;
    };
    $window.load_case_many_answer_option =  (question_type , is_single_choice) => {
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
    $window.classes_for_this_answer = (quiz_settings , question_id , answer_id) => {
      var classes = '';
      // => Two blocks per row or else
      if(quiz_settings.choice_style)
          classes += 'ng_inline_block';
          else
          classes += 'ng_block';

      // => check if this is selected answer or not from attendee
      if( $window.attendee_draft != null && $window.attendee_draft.user_id != undefined ){
          var drft_question = $window.attendee_draft.questions_data.find(x => x.question_id == question_id ) ;
          if(drft_question != undefined ){
            var drft_selected_answer = drft_question.answer_ids.findIndex(x => x.answer_id == answer_id );
          if (drft_selected_answer != -1 ){ // => Add ( selected_answers )
            classes += ' selected_answer'
                }
            }
       }

      // => Get Classes according to database
      if($window.this_attendee_draft != null && $window.this_attendee_draft.questions_data != undefined ){
        var thisQuestion = $window.this_attendee_draft.questions_data.find(x => x.question_id == question_id) ;
        if(thisQuestion != undefined) {
          var answers_array = thisQuestion.answer_ids ;
          var answer_object_index = answers_array.findIndex(x => x.answer_id == answer_id);
          if( answer_object_index != -1 ){
            var selected_answer = answers_array[answer_object_index];
            if($window.__player_object.settings.show_results_per_qs){ // => true
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
    $window.join_this_quiz = (at_this_array_only = null ) => {
      if($window.attendee_draft != null && $window.attendee_draft.att_draft != undefined && $window.attendee_draft.att_draft.findIndex (x => x.user_id == $window.user_id) != -1)
        return false ;

      if($window.attendee_draft == null || $window.attendee_draft.application_id == undefined){
        $window.attendee_draft = new Object();
        $window.attendee_draft['att_draft'] = new Array();
        $window.attendee_draft['application_id'] = $window.application_id;
        $window.attendee_draft['questionnaire_info'] = $window.application_id;
      }

        if($window.attendee_draft.att_draft == undefined)
          $window.attendee_draft.att_draft = new Array();


        var cuIndex = $window.attendee_draft.att_draft.findIndex (x => x.user_id == $window.user_id) ;
        if(cuIndex == -1 ){
          $window.attendee_draft.att_draft.push({
            'questions_data' : new Array() ,
            'is_loaded':true ,
            'start_expiration_time' : new Date() ,
            'user_id' : $window.user_id ,
            'user_info':$window.user_id ,
            'is_completed':false ,
            'impr_application_object':$window.__player_object
          });
        }

        $window.this_attendee_draft = $window.attendee_draft.att_draft.find(x => x.user_id == $window.user_id);

    };
    $window.load_time_tracker = () => {

    }
    $window.load_quiz_timer = () => {
      if($window.__player_object.settings != undefined ){
         var timeSettings = $window.__player_object.settings.time_settings;

         if(timeSettings && timeSettings.is_with_time)
            $window.timer = setTimeout($window.load_time_tracker , 1000);
       }
    }
    $window.load_template_timer = () => {
       console.log({
         settings : $window.__player_object
       });
       if($window.__player_object != undefined && $window.__player_object != null && $window.__player_object.settings != undefined ){
       var timeSettings = $window.__player_object.settings.time_settings;

         if(timeSettings && timeSettings != undefined || timeSettings.is_with_time){
           $window.seconds = timeSettings.seconds;
           $window.minutes = timeSettings.minutes ;
           $window.hours   = timeSettings.hours;

         }
       }
     }
    $window.load_time_tracker  = () => {
      if( $window.quiz_time_status_is_counting){
            var sec  = $('.sec');
            var mins = $('.min');
            var hrs  = $('.hr');
            var is_hourly = $window.__player_object.settings.time_settings.timer_type ;
            if(is_hourly){
               if($window.seconds == 0 && $window.minutes == 0 && $window.hours == 0)
                  {
                    // $window.do_an_action_with_closest_time();
                    return false ;
                  }
               }else {
                  if( $window.seconds == 0 && $window.minutes == 0 )
                      {
                        // $window.do_an_action_with_closest_time();
                        return false ;
                      }
            }
            $window.seconds--;
            if( $window.seconds < 0 ){
               $window.seconds = 59;
               $window.minutes--;
            }

            if(is_hourly){
                 if($window.minutes < 00 && $window.hours > 0 ) {
                   $window.minutes = 59;
                   $window.hours--;
                 }
            }

          sec.html(($window.seconds < 10 ) ? '0'+ $window.seconds : $window.seconds);
          mins.html(($window.minutes < 10 ) ? '0'+$window.minutes:$window.minutes );
          if(is_hourly){
              hrs.html( ( $window.hours < 10 ) ? '0'+$window.hours : $window.hours);
          }
          // Load time
          $window.load_quiz_timer();
      }
    }
    $window.start_this_quiz = () => {
      $window.join_this_quiz();
      $timeout(function (){
        $window.load_quiz_timer ();
      } , 30);

      try {
        // if( window.parent.location == window.location )
          $window.slide_screens.slideNext();

      } catch (e) {

      }
    };
    $window.back_to_quizzes = () => {
      return window.location.href = $window.server_ip+'quizzes';
    };
    $window.load_quiz_status_theme = () => {
      var classes = '';
      // if($window.quiz_status == 0 ) // =>  take thi quiz
       if ($window.quiz_status == 1) // =>  Expire warning
      classes = 'expiration_warning_message'
       if ($window.quiz_status == 2) // =>  is expire
      classes = 'quiz_is_expired'
      if ($window.quiz_status == 3) // =>  is Completed
      classes = 'completed_quiz'
      return classes ;
    };
    $window.load_application_for_preview = function () {
      return  $http({
            url : $window.url_application ,
            type : "GET" ,
            headers : $window.api_key_headers
          }).then(function(resp){

          return  $window.__player_object = resp.data ;
          },function(err){ console.log(err); });
      };
    $window.load_application_keys = () => {
      $.getJSON( $window.json_source , function (apk_keys){
        $window.api_key_headers = {
          "X-api-app-name":apk_keys.APP_NAME ,
          "X-api-keys":apk_keys.API_KEY
        }
         $window.api_key_headers ;

         // ==> calling funcstionalities
         $window.load_application_for_preview();
         // ...
      });
    }
    $window.time_tracker_layout = () => {
      var layout_template = $window.__player_object.settings.time_settings.timer_layout;
      return '/time-layouts/layout-'+layout_template+'.hbs';
    };
    $window.progression_layout = () => {
       var layout_template = $window.__player_object.settings.progression_bar.progression_bar_layout;
       return '/progressbar-layouts/layout-'+layout_template+'.hbs';
     };
    $window.back_to_prev_slider = () => {
        // if( window.parent.location == window.location ){
          try { $window.slide_screens.slidePrev(); } catch (e) { }
        // }
     }

    // => Fire those fn.
    $window.load_application_keys();

    // => Fire after time
    $timeout(function () {
        // $window.slide_screens.update();
        // $window.load_template_timer();
        // $window.slide_screens.on('slideChange' , function (i){
        //       $window.touch_move++;
        //       var lengther = $(this);
        //       var current_index = lengther[0].activeIndex ;
        //       if(current_index >= $window.__player_object.questions.length)
        //          current_index = $window.__player_object.questions.length ;
        //         // $window.curren_question_slide = parseInt(current_index) ;
        //         //   // => Store current index
        //         //  $window.curren_question_slide = current_index ;
        //         //  $window.current_index = current_index ;
        //         //  $window.previous_index =lengther[0].previousIndex;
        //       // => load to ui
        //
        //       // => Load to next index
        //
        //       if (window.location != window.parent.location){
        //          var question_lists = $(window.parent.document).find('#docQuestions') ;
        //
        //           $timeout(function(){
        //             if(current_index == 0 ) current_index = 0
        //             else current_index = current_index - 1 ;
        //             question_lists.children('li').eq(current_index).
        //             find('.single-question-container').trigger('click');
        //
        //           } , 50 );
        //          // question_lists.children('li').eq( current_index - 1 ).trigger('click');
        //        }
        // });
    }, 1000);


    $timeout(function(){
      $window.slide_system();
    } , 10);
}]);
