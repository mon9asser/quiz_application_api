//=============================================
// => Javasctipt code lines
//=============================================
Array.prototype.find_unsolved_questions = function (questions_list) {
    return this.filter(function (i) {
      return questions_list.findIndex(x => x.question_id == i._id) === -1;
    });
};

Array.prototype.is_correct_question = function (correct_answers) {
  return this.filter(function(i){
    return correct_answers.findIndex (x => x._id == i.answer_id);
  });
}
// a => correct answers
// b => solved answer
var question_status = function (a, b) {
  var correct_answers = a.map( function(x){ return x._id; } );
  var solved_answers = b.map( function(x){ return x.answer_id; } );
  var is_right_question =  (solved_answers.sort().join('') == correct_answers.sort().join(''));
  return is_right_question ;
}

//=============================================
// => Filters
//=============================================

attendeeApp.filter('set_source_link' , [
  ()=>{
      return function (link_source){
        alert(link_source);
      }
  }
]);
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
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings' , '$window',
  ( $scope, $rootScope, $timeout , $http , settings , $window ) => {

    // ====> Scope Variables

     $scope.is_submitted = false ;
     $scope.is_disabled = false ;
     $scope.quiz_status = 0; // => 0 => take quiz , 1 => expired warning , 2 => is expired   3 => is Completed
     $scope.curren_question_slide = 0 ;
     $scope.touch_move = 0;
     $scope.current_index = 0;
     $scope.previous_index = 0;
     $scope.window_object = $(window);
     $scope.app_screens = null ;
     $scope.__player_object = null ;
     $scope.__report_object = null ; //
     $scope.attendee_draft = null ;
     $scope.attendee_draft_timeframe = null ;
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
     $scope.question_count_at_promise = -1 ;
     $scope.is_review   = false ;

     $scope.slider_options = {
       allowSlidePrev : true ,
       allowSlideNext : true ,
       noSwiping : true
     };
     $scope.quiz_time_tracker = "00:00";
     $scope.collected_time_vals = 0;
     $scope.seconds = 9 ;
     $scope.minutes = 0;
     $scope.hours = 0 ;
     $scope.warning_at_time = {
       number_1 : 0 ,
       number_2 : 0
     };
     $scope.load_template_timer = () => {
       if($scope.__player_object != undefined && $scope.__player_object != null ){
       var timeSettings = $scope.__player_object.settings.time_settings;
         if(timeSettings && timeSettings != undefined || timeSettings.is_with_time){
           $scope.seconds =timeSettings.seconds;
           $scope.minutes =timeSettings.minutes ;
           $scope.hours =timeSettings.hours;
         }
       }
     }

     $scope.time__calculation_compilation = (is_final = null) => {

       if($scope.__player_object.settings.time_settings.is_with_time){
        var existing_seconds = $scope.application_data_object.settings.time_settings.seconds ;

        var remaining_hours =  $scope.__player_object.settings.time_settings.hours * 60
        var remaining_minutes =  $scope.__player_object.settings.time_settings.minutes
        var remaining_seconds =  parseInt(( $scope.__player_object.settings.time_settings.seconds > 60 ) ?  $scope.__player_object.settings.time_settings.seconds / 60 : 0);

        var app_hours = $scope.application_data_object.settings.time_settings.hours * 60
        var app_minutes = $scope.application_data_object.settings.time_settings.minutes
        var app_seconds = parseInt(($scope.application_data_object.settings.time_settings.seconds > 60 ) ?  $scope.application_data_object.settings.time_settings.seconds / 60 : 0  );

        var usage_hours =  Math.round(app_hours - remaining_hours);
        var usage_minutes = Math.round ( app_minutes - remaining_minutes);
        var usage_seconds = Math.round ( app_seconds - remaining_seconds);

        var usage_times = usage_hours + usage_minutes  + usage_seconds;
        usage_format = " Minute(s)";
        if(usage_times == 0) {
          usage_format =( existing_seconds > 60 )? usage_format = " Minute(s)" : usage_format = " Second(s)";
          usage_times = ( existing_seconds > 60 )? usage_times : Math.round(existing_seconds - $scope.__player_object.settings.time_settings.seconds);
        }
        if(is_final == null )
        $('.time-status').html("Completed in : "+usage_times+usage_format);
       };
     }

     $scope.progress__calculation_compilation = () =>{
       if($scope.__player_object.settings.progression_bar.is_available ){
         // => Question Numbers
         var question_pro = $('.current-question');
         question_pro.html($scope.__player_object.questions.length);
         // => Question Progress
         $scope.slide_screens_index($scope.__player_object.questions.length);
       }
     };
     $scope.do_an_action_with_closest_time = () => {
       $scope.submit_quiz_into_a_report();
       $scope.quiz_status = 3 ;
       try {
         $scope.slide_screens.slideTo(0);
         $scope.slide_screens.allowSlidePrev = false ;
         $scope.slide_screens.allowSlideNext = false ;
         $scope.slide_screens.allowTouchMove = false ;
         $scope.slide_screens.noSwiping = false ;
       } catch (e){}
       $scope.time__calculation_compilation();
       $scope.progress__calculation_compilation();
     };

     $scope.load_time_tracker  = () => {

       var sec  = $('.sec');
       var mins = $('.min');
       var hrs  = $('.hr');

       var is_hourly = $scope.__player_object.settings.time_settings.timer_type ;

       // ==> Check if all with 0 value
       if(is_hourly){
         if($scope.seconds == 0 && $scope.minutes == 0 && $scope.hours == 0)
          {
            $scope.do_an_action_with_closest_time();
            return false ;
          }
       }else {
          if( $scope.seconds == 0 && $scope.minutes == 0 )
              {
                $scope.do_an_action_with_closest_time();
                return false ;
              }
       }


       // ==> seconds and minutes object
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
       // ==> Html Values
       sec.html(($scope.seconds < 10 ) ? '0'+ $scope.seconds : $scope.seconds);
       mins.html(($scope.minutes < 10 ) ? '0'+$scope.minutes:$scope.minutes );
       if(is_hourly){
          hrs.html( ( $scope.hours < 10 ) ? '0'+$scope.hours : $scope.hours);
       }
      //  $scope.time__calculation_compilation(true);
       $scope.load_quiz_timer();
     };
     $scope.load_quiz_timer = () => {
       if($scope.__player_object.settings != undefined ){
         var timeSettings = $scope.__player_object.settings.time_settings;

         if(timeSettings && timeSettings.is_with_time)
         $scope.timer = setTimeout($scope.load_time_tracker , 1000);
       }
     };


    // ====> Api urls
    $scope.url_attendee_draft_get = $scope.server_ip + 'api/application/user_status/' + $scope.application_id + '/get';
    $scope.url_main_application_get = settings.server_ip + 'api/'+$scope.application_id+'/application/retrieve';
    $scope.url_attendee_draft = $scope.server_ip + 'api/application/user_status/' + $scope.application_id;
    $scope.url_attendee_draft_collecation = $scope.server_ip+"api/"+$scope.application_id+"/attendee_collection/"+$scope.user_id ;
    $scope.url_report_collecation = $scope.server_ip+"api/"+$scope.application_id+"/report_collection/"+$scope.user_id ;

    $scope.url_attend_quiz = $scope.server_ip + 'api/'+ $scope.application_id  +'/add/attended/quiz';
    $scope.url_attendee_report = $scope.server_ip + "api/"+ $scope.application_id + "/retrieve/"+$scope.user_id+"/quiz/details";
    $scope.url_attendee_retake = $scope.server_ip + "api/"+$scope.application_id + "/clear/report/" + $scope.user_id ;
    // alert($scope.url_attendee_report);
    // ====> Scope functionalities
    $scope.load_attendee_report = () => {

      $http({
        headers : $scope.api_key_headers ,
        method : "GET" ,
        url : $scope.url_attendee_report
      }).then(function(resp){
        $scope.__report_object = resp.data ;
        // console.log($scope.__report_object);

      } , function(res){
        console.log(res);
      });

    }
    $scope.retake_this_quiz = () => {
      // ==> Destroy ==> Attendee object from anywhere
      // 1 => attebdee_draft mongo object
      // 2 => attendee_draft angular object
      // 3 => report Object
      $http({
        url :$scope.url_attendee_retake ,
        method : "PATCH"
      }).then(function(resp){

        var retake_object = resp.data ;
        if(retake_object.is_cleared != undefined && retake_object.is_cleared ){
          if($scope.attendee_draft.att_draft != undefined){
              var curIndex = $scope.attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id );
              if(curIndex != -1 ){
                $scope.attendee_draft.att_draft.splice(curIndex , 1);
              }

              $scope.quiz_status = 0 ;

              $scope.load_main_attendee_application () ;
              // ==> Reload Page
              location.reload();
          }
        }
       // =================>> Start it

      } , function(err){
        console.log(err);
      });
    }
    $scope.review_all_resolved_question = () => {
      // ==> Get application and change the value related settings
      if(!$scope.this_attendee_draft || $scope.this_attendee_draft == null || $scope.this_attendee_draft == undefined )
        return false ;

      var attendee_application = $scope.this_attendee_draft.impr_application_object.settings;
      if (attendee_application.review_setting == false )
        attendee_application.review_setting = true ;

      if($scope.slide_screens != null && $scope.slide_screens != undefined ){
        // => Quiz status
        //  $scope.quiz_status = 1
        // => Enable slider
        try {
          $scope.slide_screens.allowSlidePrev = true ;
          $scope.slide_screens.allowSlideNext = true ;

          if(attendee_application.allow_touch_move)
            {
              $scope.slide_screens.noSwiping = true ;
              $scope.slide_screens.touches = true;
            }
          // => Go to first slide
          $scope.slide_screens.slideTo(1);
          // => Set event handler
          $scope.slide_screens.on('slideChange' , function (i){
            $scope.touch_move++;
            var lengther = $(this);
            var current_index = lengther[0].activeIndex ;
            if(current_index >= $scope.__player_object.questions.length)
               current_index = $scope.__player_object.questions.length ;
          $scope.curren_question_slide = parseInt(current_index) ;
            // => Store current index
           $scope.curren_question_slide = current_index ;
           $scope.current_index = current_index ;
           $scope.previous_index =lengther[0].previousIndex;
            // => load to ui
            $(".current-question").html($scope.curren_question_slide);
            // => Load to next index
            $scope.slide_screens_index(current_index);

            // => When slideChange is fired
            // => Move into attendee draft object
            if(current_index != 0)
            $scope.attendee_draft_collection();
          });
        } catch (e) {

        }
      }
    }
    $scope.load_application_draft = () => {
      try {
        $http({
                method : "POST" ,
                url : $scope.url_attendee_draft_get ,
                data : { user_id : $scope.user_id }
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
    $scope.load_application_json_file = () => {
      $.getJSON( $scope.json_source , function (apk_keys){
        $scope.api_key_headers = {
          "X-api-app-name":apk_keys.APP_NAME ,
          "X-api-keys":apk_keys.API_KEY
        }
        return $scope.api_key_headers ;
      });
    }
    $scope.load_main_attendee_application = () => {

      $http({
        headers : $scope.api_key_headers ,
        url : $scope.url_main_application_get ,
        type : "GET"
      }).then(function(resp){
        // ==> Setup data
        $scope.application_data_object = resp.data ;
        $scope.__player_object = resp.data ;

        // Loading time
        if($scope.__player_object.settings != null ){
          if( $scope.__player_object.settings.time_settings.is_with_time){
            $scope.seconds = $scope.__player_object.settings.time_settings.seconds ;
            $scope.minutes = $scope.__player_object.settings.time_settings.minutes;
            $scope.hours = $scope.__player_object.settings.time_settings.hours ;
          }
        }
      } , function(err){console.log(err);})
    }

    $scope.classes_for_this_answer = ( quiz_settings , question_id , answer_id ) => {
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
    }



      $scope.store_into_attendee_draft = (object , is_single = null) => {

        var application_object = new Object();
        if (  $scope.attendee_draft != null && $scope.attendee_draft.application_id != undefined)
          { // ==> attendee_draft is not empty
              var findAttendeeIndex = $scope.attendee_draft.att_draft.findIndex(x => x.user_id == object.user_id);
              var findAttendee = $scope.attendee_draft.att_draft.find(x => x.user_id == object.user_id);
              if(findAttendeeIndex != - 1){
                // ==> Attendee Object [FOUND]
                var attendeeInfo = $scope.attendee_draft.att_draft[findAttendeeIndex];
                if(attendeeInfo.questions_data == undefined )
                attendeeInfo.questions_data = new Array();
                var findQuestionIndex = attendeeInfo.questions_data.findIndex(x => x.question_id == object.question_id);
                var findQuestion = attendeeInfo.questions_data.find(x => x.question_id == object.question_id);
                if(findQuestionIndex == -1){

                  // ==> Question UNFOUND
                  attendeeInfo.questions_data.push({
                    question_id : object.question_id ,
                    question_index : $scope.slide_screens.activeIndex - 1,
                    question_type : object.question.question_type,
                    question_text : object.question.question_body,
                    answer_ids : new Array({answer_id : object.answer_id , is_correct : object.is_correct , answer_object : object.answer , answer_index : object.answer_index }) ,
                    correct_answers : object.question.answers_format.filter(x => x.is_correct == true) ,
                    updated_date : new Date()
                  });


                  // ==============================>> Report Questions ( all_questions , right_questions , wrong_questions )
                  if(attendeeInfo.report_questions == undefined)
                  attendeeInfo.report_questions = new Object();

                  if(attendeeInfo.report_questions.all_questions == undefined )
                    attendeeInfo.report_questions.all_questions = new Array();
                    // ==> Store the questions here plz
                    attendeeInfo.report_questions.all_questions.push(object.question_id);


                  // ==> store correct answers that solved
                  if(attendeeInfo.report_questions.right_questions == undefined )
                    attendeeInfo.report_questions.right_questions = new Array();

                  // ==> store wrong answers that solved
                  if(attendeeInfo.report_questions.wrong_questions == undefined )
                    attendeeInfo.report_questions.wrong_questions = new Array();


                  var answerIndexVal = object.question.answers_format.findIndex(x => x._id == object.answer_id );
                  if(answerIndexVal != -1 ){
                    answerObject = object.question.answers_format.find(x => x._id == object.answer_id );
                    if(answerObject.is_correct == true )
                      attendeeInfo.report_questions.right_questions.push(object.question_id) ;
                    else
                      attendeeInfo.report_questions.wrong_questions.push(object.question_id) ;
                  }

                  // ==============================>> Report attendee_details
                  if(attendeeInfo.report_attendee_details == undefined )
                    attendeeInfo.report_attendee_details = new Object();

                    // ==> Calculations
                    if( $scope.__player_object.settings  == undefined || $scope.__player_object.settings == null )
                      alert("Something went wrong !")

                    var app_grade_value = parseInt($scope.__player_object.settings.grade_settings.value);
                    var total_app_questions = parseInt($scope.__player_object.questions.length);
                    var correct_questions = parseInt(attendeeInfo.report_questions.right_questions.length);
                    var wrong_questions  = parseInt(attendeeInfo.report_questions.wrong_questions.length);
                    var percentage = Math.round(correct_questions * 100 ) / total_app_questions ;
                    var isPassed = ( percentage >= app_grade_value )? true : false ;
                    var is_completed = ( total_app_questions == attendeeInfo.questions_data.length ) ? true : false ;

                    attendeeInfo.report_attendee_details.attendee_id = $scope.user_id ;
                    attendeeInfo.report_attendee_details.attendee_information = $scope.user_id ;
                    attendeeInfo.report_attendee_details.total_questions = attendeeInfo.questions_data.length ;
                    attendeeInfo.report_attendee_details.pass_mark = isPassed ,
                    attendeeInfo.report_attendee_details.correct_answers =  correct_questions ,
                    attendeeInfo.report_attendee_details.wrong_answers = wrong_questions ;
                    attendeeInfo.report_attendee_details.status= (isPassed == true ) ? "Passed": "Failed";
                    attendeeInfo.report_attendee_details.score= percentage;
                    attendeeInfo.report_attendee_details.completed_status= is_completed;
                    attendeeInfo.report_attendee_details.created_at= new Date();
                    attendeeInfo.report_attendee_details.completed_date= new Date();

                    // ==============================>> Report report_attendees
                    if(attendeeInfo.report_attendees == undefined )
                      attendeeInfo.report_attendees = new Object();

                      attendeeInfo.report_attendees.created_at = new Date()
                      attendeeInfo.report_attendees.updated_at = new Date()
                      attendeeInfo.report_attendees.attendee_id = $scope.user_id;
                      attendeeInfo.report_attendees.user_information = $scope.user_id;
                      attendeeInfo.report_attendees.is_completed = is_completed ;
                      attendeeInfo.report_attendees.passed_the_grade = isPassed ;
                      attendeeInfo.report_attendees.survey_quiz_answers = new Array();
                      attendeeInfo.report_attendees.results = new Object();
                      attendeeInfo.report_attendees.results['wrong_answers'] = wrong_questions;
                      attendeeInfo.report_attendees.results['correct_answers'] = correct_questions ;
                      attendeeInfo.report_attendees.results['count_of_questions'] = attendeeInfo.questions_data.length ;
                      attendeeInfo.report_attendees.results['result'] = new Object();
                      attendeeInfo.report_attendees.results['result']['percentage_value'] = percentage;
                      attendeeInfo.report_attendees.results['result']['raw_value'] = correct_questions ;
                      attendeeInfo.report_attendees.survey_quiz_answers.push({
                        question_id :  object.question_id  ,
                        questions : {
                          question_id : object.question_id,
                          question_body :object.question.question_body ,
                          question_type : object.question.question_type
                        } ,
                        answers : {
                          answer_id : new Array (object.answer_id) ,
                          answer_body :  new Object() ,
                          is_correct : object.is_correct
                        }
                      });
                      attendeeInfo.report_attendees.survey_quiz_answers[attendeeInfo.report_attendees.survey_quiz_answers.length - 1 ].
                      answers.answer_body["answer_id_"+object.answer_id] = {
                               answer_id : object.answer_id ,
                               answer_body : object.answer ,
                               is_correct : object.is_correct
                       }

                      // console.log(attendeeInfo);
                }else {
                  // ==> Question FOUND ==> Update here !
                   var findAnswer = findQuestion.answer_ids.find(x => x.answer_id == object.answer_id);
                   var findAnswerIndex = findQuestion.answer_ids.findIndex(x => x.answer_id == object.answer_id);
                   if(findAnswerIndex == -1 ){
                     findQuestion.answer_ids.push({
                        answer_id : object.answer_id , is_correct : object.is_correct , answer_object : object.answer , answer_index : object.answer_index
                      });
                   }else{
                     findQuestion.answer_ids.splice(findAnswerIndex, 1);
                   }


                   var app_correct_answers =  findQuestion.correct_answers
                   var attendee_solved_answers =  findQuestion.answer_ids

                   var isCorrect =  question_status (app_correct_answers , attendee_solved_answers);

                   if(findQuestion.answer_ids.length != 0){
                           var all_report_questions_index = attendeeInfo.report_questions.all_questions.findIndex(x => x == object.question_id);
                           if(all_report_questions_index != -1 ){

                             var wrong_exists =  attendeeInfo.report_questions.wrong_questions.findIndex(x => x == object.question_id);
                             var right_exists =  attendeeInfo.report_questions.right_questions.findIndex(x => x == object.question_id);

                             if(isCorrect == false ){
                               if( wrong_exists == -1 )  // add  here
                                 attendeeInfo.report_questions.wrong_questions.push(object.question_id);

                               if(right_exists != -1 )  // delete it from here
                                 attendeeInfo.report_questions.right_questions.splice(right_exists , 1 );
                             }else {
                               if(right_exists == -1 )  // add  here
                                  attendeeInfo.report_questions.right_questions.push(object.question_id);

                               if( wrong_exists != -1 ){ // delete it from here
                                  attendeeInfo.report_questions.wrong_questions.splice(wrong_exists , 1);
                               }
                             }
                           } // => End all questions
                    }else if(findQuestion.answer_ids.length == 0){
                     var qsIndex_all = attendeeInfo.report_questions.all_questions.findIndex( x => x == object.question_id);
                     var qsIndex_wrong = attendeeInfo.report_questions.wrong_questions.findIndex(x => x == object.question_id);
                     var qsIndex_right = attendeeInfo.report_questions.right_questions.findIndex(x => x == object.question_id);

                     if(qsIndex_wrong != -1)
                     attendeeInfo.report_questions.wrong_questions.splice(qsIndex_wrong , 1);

                     if(qsIndex_right != -1)
                     attendeeInfo.report_questions.right_questions.splice(qsIndex_right , 1);

                     if(qsIndex_all != -1)
                     attendeeInfo.report_questions.all_questions.splice(qsIndex_all , 1);
                   } // End store answer question



                   var app_grade_value = parseInt($scope.__player_object.settings.grade_settings.value);
                   var total_app_questions = parseInt($scope.__player_object.questions.length);
                   var correct_questions = parseInt(attendeeInfo.report_questions.right_questions.length);
                   var wrong_questions  = parseInt(attendeeInfo.report_questions.wrong_questions.length);
                   var percentage = Math.round(correct_questions * 100 ) / total_app_questions ;
                   var isPassed = ( percentage >= app_grade_value )? true : false ;
                   var is_completed = ( total_app_questions == attendeeInfo.questions_data.length ) ? true : false ;

                   attendeeInfo.report_attendee_details.total_questions = attendeeInfo.questions_data.length ;
                   attendeeInfo.report_attendee_details.pass_mark = isPassed ,
                   attendeeInfo.report_attendee_details.correct_answers =  correct_questions ,
                   attendeeInfo.report_attendee_details.wrong_answers = wrong_questions ;
                   attendeeInfo.report_attendee_details.status= (isPassed == true ) ? "Passed": "Failed";
                   attendeeInfo.report_attendee_details.score= percentage;
                   attendeeInfo.report_attendee_details.completed_status= is_completed;
                   attendeeInfo.report_attendee_details.completed_date= new Date();


                   attendeeInfo.report_attendees.updated_at = new Date()
                   attendeeInfo.report_attendees.attendee_id = $scope.user_id;
                   attendeeInfo.report_attendees.user_information = $scope.user_id;
                   attendeeInfo.report_attendees.is_completed = is_completed ;
                   attendeeInfo.report_attendees.passed_the_grade = isPassed ;

                   attendeeInfo.report_attendees.results['wrong_answers'] = wrong_questions;
                   attendeeInfo.report_attendees.results['correct_answers'] = correct_questions ;
                   attendeeInfo.report_attendees.results['count_of_questions'] = attendeeInfo.questions_data.length ;
                   attendeeInfo.report_attendees.results['result']['percentage_value'] = percentage;
                   attendeeInfo.report_attendees.results['result']['raw_value'] = correct_questions ;
                   var qsIndex_x = attendeeInfo.report_attendees.survey_quiz_answers.findIndex(x => x.question_id == object.question_id);
                   var question_obj_val ;
                   if(qsIndex_x != -1 ){
                      question_obj_val = {
                        question_id :  object.question_id  ,
                        questions : {
                          question_id : object.question_id,
                          question_body :object.question.question_body ,
                          question_type : object.question.question_type
                        } ,
                        answers : {
                          answer_id : new Array (object.answer_id) ,
                          answer_body :  new Object() ,
                          is_correct : object.is_correct
                        }
                      }; // end question object

                       question_obj_val.answers.answer_body["answer_id_"+object.answer_id] = {
                               answer_id : object.answer_id ,
                               answer_body : object.answer ,
                               is_correct : object.is_correct
                       }

                       attendeeInfo.report_attendees.survey_quiz_answers[qsIndex_x] = question_obj_val ;

                   }
                }
              }else {
                // ==> Attenee Object [UNFOUND]

              }
          }else {
            // ==> attendee_draft is empty

          }


       $scope.this_attendee_draft = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id) ;
       // => When Select answer is happened
       // => Move into attendee draft object
       $scope.attendee_draft_collection();
    };
    // ==> Select answer scenario !!
    $scope.select_this_answer = ( questionId , answerId , question , answer , app_id , user_id , is_correct , answerIndex) => {

  // ==> Consider the followings :-
  // => Make sure from require qs option

  /*+++++++++++++++++++++++++++++++++++*/
  // Givens ======= *****
  /*+++++++++++++++++++++++++++++++++++*/
  // => consider ( show results per qs setting ) => ?
  var show_results_setting =  ( $scope.__player_object.settings != undefined ) ? $scope.__player_object.settings.show_results_per_qs : false ;
  // => consider ( review setting )
  var review_setting =  ( $scope.__player_object.settings != undefined ) ? $scope.__player_object.settings.review_setting : false ;
  // => consider ( multi answers  )
  var is_single_choice_setting = ( question.answer_settings.single_choice != undefined) ?  question.answer_settings.single_choice : true ;
  // => consider auto slide when answer select if it only single answer
  var auto_slide_setting = ( $scope.__player_object.settings != undefined ) ? $scope.__player_object.settings.auto_slide : false ;


  var answer_iu_list = $('#question_' + questionId).children('li');
  var this_answer = $('.answer_'+answerId) ;
  var stored_object = {
        question_id : questionId ,
        answer_id : answerId ,
        question : question ,
        answer: answer ,
        app_id : app_id ,
        user_id : user_id ,
        is_correct : is_correct ,
        answer_index : answerIndex
    };



          //---------------------------------------------------------------
          // ==============>> Multiple Choices ( Texts Or Media )
          //---------------------------------------------------------------
          if( question.question_type == 0 || question.question_type == 1 )
              {
                  if( is_single_choice_setting ){ // 1 - case this question has single answer
                                  // =====> Single Answer
                        if(review_setting && show_results_setting == false ){
                                      /* Many clicks ! */
                                     // => Delete the-old highlited answer and Highlight the new selected answer
                                     answer_iu_list.removeClass('selected_answer animated shake');
                                     this_answer.addClass('selected_answer animated shake');

                                      if($scope.attendee_draft.att_draft != undefined){
                                        // remove old answer answer_ids
                                        var question_id = stored_object.question_id ;
                                        // question_id
                                        var attendee_part = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
                                        if(attendee_part != undefined){
                                          var target_question = attendee_part.questions_data.find(x => x.question_id == question_id);
                                          if(target_question != undefined)
                                          target_question.answer_ids = new Array();
                                        }
                                      }
                                     // => No need to show the correct answer here
                                     // => Angular backend ( attendee_draft  ) do this --->  allow attendee change the answer
                                     // => Mongo status => move the data into mongo ( attendee draft )
                                     $scope.store_into_attendee_draft(stored_object); // => Mongo VS Angular
                                     // => Auto slide status ( true ) => move to next slide directly
                                     if(auto_slide_setting) $scope.go_to_next_question();
                        }else if(review_setting == false && show_results_setting ) {
                                    /* One Click ! */
                                    // => Highlight the selected answer for some moments ( timeframe )
                                    var there_is_highlighted_answer = false ;
                                    answer_iu_list.each(function (i){
                                      var there = $(this).hasClass('selected_answer');
                                      if(there) there_is_highlighted_answer = true;
                                    });
                                    if(there_is_highlighted_answer == false )
                                    this_answer.addClass('selected_answer animated shake');
                                    else
                                      return false ; // => Prevent user from correct or edit his answer

                                    // => Show the correct answer if selected is wrong show the wrong style + right style ( answer )
                                        // if user select the correct answer only need to show the right style in the selected answer
                                    var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                                    if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                                      // =>> Show The correct
                                      this_answer.addClass('right_answer');
                                    }else {
                                      // => show wrong answer
                                      this_answer.addClass('wrong_answer');
                                      // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                                      answer_iu_list.each(function (i){
                                        var currentAnswer = $(this);
                                        var answers_inBackend = question.answers_format[i].is_correct ;
                                        if(answers_inBackend){
                                          currentAnswer.addClass('right_answer');
                                        }
                                      });
                                    }
                                    // => Angular backend ( attendee_draft  ) do this ---> don't allow attendee change the selected answer
                                    // => Mongo status => move the data into mongo ( attendee draft )
                                    $scope.store_into_attendee_draft(stored_object); // => Mongo VS Angular
                                    // => Auto slide status ( true ) => move to next slide directly after few moments ( timeframe )
                                    if(auto_slide_setting) $scope.go_to_next_question();
                        } else if ( review_setting == false && show_results_setting == false ) {
                                    /* One Click ! */
                                    // => Highlight the selected answer
                                    var there_is_highlighted_answer = false ;
                                    answer_iu_list.each(function (i){
                                      var there = $(this).hasClass('selected_answer');
                                      if(there) there_is_highlighted_answer = true;
                                    });
                                    if(there_is_highlighted_answer == false )
                                    this_answer.addClass('selected_answer animated shake');
                                    else
                                      return false ;
                                    // => No need to show the correct answer here
                                    // => Angular backend ( attendee_draft  ) do this ---> don't allow attendee change the selected answer
                                    // => Mongo status => move the data into mongo ( attendee draft )
                                    $scope.store_into_attendee_draft(stored_object); // => Mongo VS Angular
                                    // => Auto slide status ( true ) => move to next slide directly
                                    if(auto_slide_setting) $scope.go_to_next_question();
                        } else if (review_setting   && show_results_setting ) {
                                    /* Many clicks ! */
                                    // => Delete the-old highlited answer and Highlight the new selected answer for some moments ( timeframe )
                                    var there_is_highlighted_answer = false ;
                                    answer_iu_list.each(function (i){
                                      var there = $(this).hasClass('selected_answer');
                                      if(there) there_is_highlighted_answer = true;
                                    });
                                    if(there_is_highlighted_answer == false )
                                    this_answer.addClass('selected_answer animated shake');
                                    // => Show the correct answer if selected is wrong show the wrong style + right style ( answer )
                                    // if user select the correct answer only need to show the right style in the selected answer
                                    var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                                    if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                                      // =>> Show The correct
                                      this_answer.addClass('right_answer');
                                    }else {
                                      // => Show wrong answer
                                      this_answer.addClass('wrong_answer');
                                      // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                                      answer_iu_list.each(function (i){
                                        var currentAnswer = $(this);
                                        var answers_inBackend = question.answers_format[i].is_correct ;
                                        if(answers_inBackend){
                                          currentAnswer.addClass('right_answer');
                                        }
                                      });
                                    }



                                    // => Angular backend ( attendee_draft  ) do this ---> allow attendee change the selected answer
                                    $scope.store_into_attendee_draft(stored_object); // => Mongo VS Angular
                                    // => Auto slide status ( true ) => move to next slide directly after few moments ( timeframe )
                                    if(auto_slide_setting) $scope.go_to_next_question();
                        }

                  }else { // 2 - case this question has many answers
                                // =====> Many answer cases
                        if(review_setting && show_results_setting == false ){
                                  /* Many clicks ! */
                                  /*
                                    if attendee clicked on selected answer
                                      ( Delete the highlighted style ) => from { UI - AngulrBD  - Mongo }
                                  */
                                  /*
                                    if attendee clicked on unselected answer
                                      ( Add the highlighted style ) => into { UI - AngulrBD  - Mongo }
                                  */
                                  if(this_answer.hasClass('selected_answer animated shake')){
                                    this_answer.removeClass('selected_answer animated shake');
                                  }else {
                                    this_answer.addClass('selected_answer animated shake');
                                  }

                                  // ===================> Updates

                                  // => No need to show the correct answers
                                  // => Angular backend ( attendee_draft  ) do this --->  allow attendee change or add the answer
                                  // => Mongo status => move the data into mongo ( attendee draft )
                                  $scope.store_into_attendee_draft( stored_object , false );
                                  // => Auto slide status ( NO need to go to the next slide ) onlu continue button do this action
                        }else if(review_setting == false && show_results_setting ) {
                                  /* One Click for each answer ! */
                                  var has_wrong_answer = false ;
                                  answer_iu_list.each(function(i){
                                    var there = $(this);
                                    if(there.hasClass('wrong_answer'))
                                      has_wrong_answer = true;
                                  });
                                  if(has_wrong_answer ) return false ;
                                  /*
                                    if attendee clicked on selected answer
                                    ( Add the highlighted style ) => into { UI } ==> consider ( timeframe )
                                      Show the correct answers if attendee selected any wrong answer from many correct answers
                                  */
                                  if(!this_answer.hasClass('selected_answer'))
                                  this_answer.addClass('selected_answer animated shake');
                                  else return false ;


                                  // => Show the correct answers ( Case all correct answers are selected ) without wrong style
                                  var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                                  if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                                    // =>> Show The correct
                                    this_answer.addClass('right_answer');
                                  }else {
                                    // => show wrong answer
                                    this_answer.addClass('wrong_answer');
                                    // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                                    answer_iu_list.each(function (i){
                                      var currentAnswer = $(this);
                                      var answers_inBackend = question.answers_format[i].is_correct ;
                                      if(answers_inBackend){
                                        currentAnswer.addClass('right_answer');
                                      }
                                    });
                                  }
                                  // => Angular backend ( attendee_draft  ) do this ---> dont allow attendee change the selected answer only add new answer !
                                  // => Mongo status => move the data into mongo ( attendee draft )
                                  $scope.store_into_attendee_draft( stored_object , false );
                                  // => Auto slide status ( NO need to go to the next slide ) only continue button do this action
                        } else if ( review_setting == false && show_results_setting == false ) {
                                  /* One Click for each answer ! */
                                  /*
                                    if attendee clicked on selected answer
                                    ( Add the highlighted style ) => into { UI }
                                  */
                                  if(!this_answer.hasClass('selected_answer'))
                                  this_answer.addClass('selected_answer animated shake');
                                  else return false ;
                                  // => No need to show the correct answers
                                  // => Angular backend ( attendee_draft  ) do this ---> dont allow attendee change the selected answer only add new answer !
                                  // => Mongo status => move the data into mongo ( attendee draft )
                                  $scope.store_into_attendee_draft( stored_object , false );
                                  // => Auto slide status ( NO need to go to the next slide ) only continue button do this action
                        } else if (review_setting   && show_results_setting ) {
                                  /* Many clicks ! */
                                  /*
                                    if attendee clicked on selected answer
                                      ( Delete the highlighted style ) => from  { UI } => with timeframe

                                      => case the sleceted answer is wrong - show the correct results with wrong answer style
                                  */
                                  /*
                                    if attendee clicked on unselected answer
                                      ( Add the highlighted style ) => into { UI } => with timeframe

                                      => case the sleceted answer is right - show the correct results
                                  */

                                   if(!this_answer.hasClass('selected_answer'))
                                    this_answer.addClass('selected_answer animated shake');
                                    else this_answer.removeClass('selected_answer animated shake');

                                    var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                                    if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                                      // =>> Show The correct
                                      this_answer.addClass('right_answer');
                                    }else {
                                      // => show wrong answer
                                      this_answer.addClass('wrong_answer');
                                      // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                                      answer_iu_list.each(function (i){
                                        var currentAnswer = $(this);
                                        var answers_inBackend = question.answers_format[i].is_correct ;
                                        if(answers_inBackend){
                                          currentAnswer.addClass('right_answer');
                                        }
                                      });
                                    }
                                  // => Angular backend ( attendee_draft  ) do this --->  allow attendee change the selected answer Or add new answer !
                                  // => Mongo status => move the data into mongo ( attendee draft )
                                  $scope.store_into_attendee_draft( stored_object , false );
                                  // => Auto slide status ( NO need to go to the next slide ) only continue button do this action
                        }
                  }  //  => ( End multi answers With single answer )
              } // End multiple Choices OR Media answers
          //---------------------------------------------------------------
          // ==============>>  True False ( Questions )
          //---------------------------------------------------------------
          if( question.question_type == 2 ){ // => True False
             if ( review_setting && show_results_setting ) {
                 /* Many clicks ! */
                 // => Delete the-old highlighted answer and Highlight the new selected answer
                 if(!this_answer.hasClass('selected_answer')){
                   answer_iu_list.each(function(i){
                     var there = $(this);
                      there.removeClass('selected_answer animated shake')
                   });
                  this_answer.addClass('selected_answer animated shake');
                 }

                 // => show the correct answer here
                 var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                 if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                   // =>> Show The correct
                   this_answer.addClass('right_answer');
                 }else {
                   // => show wrong answer
                   this_answer.addClass('wrong_answer');
                   // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                   answer_iu_list.each(function (i){
                     var currentAnswer = $(this);
                     var answers_inBackend = question.answers_format[i].is_correct ;
                     if(answers_inBackend){
                       currentAnswer.addClass('right_answer');
                     }
                   });
                 }

                 var has_wrong_answer = false ;
                 answer_iu_list.each(function(i){
                   var there = $(this);
                  if(there.hasClass('wrong_answer')) has_wrong_answer = true ;
                 });
                 if(has_wrong_answer) return false ;


                 // => Review Old answer

                 // => Angular backend ( attendee_draft  ) do this --->  allow attendee change the answer
                 // => Mongo status => move the data into mongo ( attendee draft )
                 $scope.store_into_attendee_draft( stored_object );
                 // => Auto slide status ( true ) => move to next slide directly
                 if(auto_slide_setting) $scope.go_to_next_question();
               } else if ( review_setting == false && show_results_setting ){
                 /* One Click ! */
                 // => Highlight the selected answer for some moments ( timeframe )
                 var has_wrong_answer = false ;
                 answer_iu_list.each(function(i){
                   var there = $(this);
                  if(there.hasClass('wrong_answer') || there.hasClass('right_answer')) has_wrong_answer = true ;
                 });
                 if(has_wrong_answer) return false ;


                 // => Show the correct answer if selected is wrong show the wrong style + right style ( answer )
                     // if user select the correct answer only need to show the right style in the selected answer
                     var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                     if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                       // =>> Show The correct
                       this_answer.addClass('right_answer');
                     }else {
                       // => show wrong answer
                       this_answer.addClass('wrong_answer');
                       // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                       answer_iu_list.each(function (i){
                         var currentAnswer = $(this);
                         var answers_inBackend = question.answers_format[i].is_correct ;
                         if(answers_inBackend){
                           currentAnswer.addClass('right_answer');
                         }
                       });
                     }

                 // => Angular backend ( attendee_draft  ) do this ---> don't allow attendee change the selected answer
                 // => Mongo status => move the data into mongo ( attendee draft )
                 $scope.store_into_attendee_draft( stored_object );
                 // => Auto slide status ( true ) => move to next slide directly after few moments ( timeframe )
                 if(auto_slide_setting) $scope.go_to_next_question();
               } else if ( review_setting && show_results_setting == false ){
                 /* Many clicks ! */
                // => Delete the-old highlited answer and Highlight the new selected answer
                 answer_iu_list.each(function(i){
                    var there = $(this);
                      if(there.hasClass('selected_answer'))
                     there.removeClass('selected_answer animated shake')
                 });
                this_answer.addClass('selected_answer animated shake');

                // ==> Review old Answer
                // ===================> Updates
                if($scope.attendee_draft.att_draft != undefined){
                    // remove old answer answer_ids
                    var question_id = stored_object.question_id ;
                    // question_id
                    var attendee_part = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
                    var attendee_inx = $scope.attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id);

                    if(attendee_inx != -1 ){
                        var target_question = attendee_part.questions_data.find(x => x.question_id == question_id);
                        if(target_question != undefined)
                          target_question.answer_ids = new Array();
                     }
                  }
                // => No need to show the correct answer here
                // => Angular backend ( attendee_draft  ) do this --->  allow attendee change the answer
                // => Mongo status => move the data into mongo ( attendee draft )
                $scope.store_into_attendee_draft( stored_object );
                // => Auto slide status ( true ) => move to next slide directly
                 if(auto_slide_setting) $scope.go_to_next_question();
             } else if ( review_setting == false && show_results_setting  == false ){
                 var is_selected_answer = false ;
                  answer_iu_list.each(function(){
                    var there = $(this);
                    if(there.hasClass('selected_answer')) is_selected_answer = true ;
                  });
                  if(is_selected_answer) return false ;
                 this_answer.addClass('selected_answer animated shake');
                 $scope.store_into_attendee_draft(stored_object);
                 if(auto_slide_setting) $scope.go_to_next_question();
             }
          } // => End true/false question

          if($scope.is_submitted)
            $scope.fill_unsolved_question_counts();
            else
            $('.warning_case').css({display:'none'});
   };  // ==> End Select answer
    $scope.load_case_many_answer_option = (question_type , is_single_choice ) => {
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
        }
    $scope.load_qs_note_theme = (question_type) => {
           var classes = '';
           if(question_type == 0 ) classes = 'question_type_texts_colr';
           if(question_type == 1 ) classes = 'question_type_media_colr';
           if(question_type == 2 ) classes = 'question_type_boolean_colr';
           return classes;
         }
    $scope.load_qs_theme = (question_type) => {
            var classes = '';
            if(question_type == 0 ) classes = 'question_type_texts_qs_brd';
            if(question_type == 1 ) classes = 'question_type_media_qs_brd';
            if(question_type == 2 ) classes = 'question_type_boolean_qs_brd';
            return classes;
          }
    $scope.load_border_styles = (question_type) => {
             var classes = '';
             if(question_type == 0 ) classes = 'question_type_texts_brd';
             if(question_type == 1 ) classes = 'question_type_media_brd';
             if(question_type == 2 ) classes = 'question_type_boolean_brd';
             return classes;
           }
    $scope.load_slide_theme = (question_type) => {
             var classes = '';
               if(question_type == 0 ) classes = 'question_type_texts_bg';
               if(question_type == 1 ) classes = 'question_type_media_bg';
               if(question_type == 2 ) classes = 'question_type_boolean_bg';
             return classes;
           };
    $scope.get_slide_styles = (question_type) => {
             var classes = '';
             if(question_type == 0 ) classes = 'question_type_texts';
             if(question_type == 1 ) classes = 'question_type_media';
             if(question_type == 2 ) classes = 'question_type_boolean';
             return classes;
           };
    $scope.slide_screens_index = function (index){
                // calculation
              if($scope.__player_object.settings != undefined ){
                if($scope.__player_object.settings.progression_bar.is_available == true && $scope.__player_object.settings.progression_bar.progression_bar_layout == 0 ){
                  var calc = $scope.curren_question_slide * 100 /  $scope.__player_object.questions.length ;
                   $('.progress-highlighted').css({width: calc + '%'})
                }
              }
        };
    $scope.time_tracker_layout = () => {
              var layout_template = $scope.__player_object.settings.time_settings.timer_layout;
              return '/time-layouts/layout-'+layout_template+'.hbs';
            };
    $scope.progression_layout = () => {
              var layout_template = $scope.__player_object.settings.progression_bar.progression_bar_layout;
              return '/progressbar-layouts/layout-'+layout_template+'.hbs';
            };

   $scope.report_quiz_collection = () => {
     $http({
       url : $scope.url_report_collecation ,
       method: "POST",
       data : { attendee_draft : $scope.attendee_draft } ,
       headers : {
         "Content-Type": "application/json"
       } ,
     }).then(function(response){
       console.log(response.data);
     } , function(err){
       console.log(err);
     });
   }
   $scope.submit_quiz_into_report = () => {
     $timeout(function(){
       $('.submi_the_quiz_handler').children('i').removeClass('fa-arrow-right');
       $('.submi_the_quiz_handler').children('i').addClass("fa-spinner fa-spin");
       $('.submi_the_quiz_handler').children('span').html("Submitting quiz ... ");

       $scope.slide_screens.slideNext();
     } , 11000);

      // => Move to attendee draft
      $scope.attendee_draft_collection();
      // => Move results into rebort
      $scope.report_quiz_collection();
   }
   $scope.attendee_draft_collection = function (){
      if($scope.attendee_draft != null && $scope.attendee_draft != undefined && $scope.attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id) != -1 ){
        var dataObject = new Object() ;
        if($scope.attendee_draft != null )
          {
            dataObject['att_draft']  = new Array();
            dataObject['application_id'] = $scope.application_id;
            dataObject['questionnaire_info'] = $scope.application_id  ;
            var sAtt = $scope.attendee_draft.att_draft.find (x => x.user_id == $scope.user_id) ;
            if( sAtt  != undefined )
             dataObject.att_draft.push(  $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id));
             // increase performace in express server nodejs
          }

        if(($scope.question_count_at_promise != parseInt($scope.__player_object.questions.length)) && $scope.is_review  == false ){
            console.log("Saved Qs Number " + $scope.question_count_at_promise);
            $http({
              url : $scope.url_attendee_draft_collecation ,
              method: "POST",
              data : { attendee_draft : dataObject } ,
              headers : {
                "Content-Type": "application/json"
              } ,
            }).then(function(respData){
              try {
                var object_collection = respData.data ;
                var this_attendee_index = object_collection.att_draft.findIndex(x => x.user_id == $scope.user_id) ;
                if(this_attendee_index != -1){
                    var this_att_object = object_collection.att_draft[this_attendee_index];
                    $scope.question_count_at_promise = this_att_object.questions_data.length;
                }
              } catch (e) {

              }
            } , function(err){
              console.log(err);
            });
        } // => End if case





      }

    };

    $scope.join_this_quiz = () => {
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
        // => Move into attendee draft object
        $scope.attendee_draft_collection();
    };
    $scope.start_this_quiz = () => {
      $scope.join_this_quiz();

      $timeout(function (){
        $scope.load_quiz_timer ();
      } , 30);

      try {
        $scope.slide_screens.slideNext();

      } catch (e) {

      }
    }
    $scope.back_to_prev_slider = () => {
      try {
        $scope.slide_screens.slidePrev();
        // => When button navigation is fired
        // => Move into attendee draft object
        $scope.attendee_draft_collection();
      } catch (e) {

      }
    }
    $scope.go_to_next_slider = () => {
      try {
        $scope.slide_screens.slideNext();
        // => When button navigation is fired
        // => Move into attendee draft object
        $scope.attendee_draft_collection();
      } catch (e) {

      }
    }
    $scope.go_to_next_question = () => {
      $timeout(function(){
        try {
          $scope.slide_screens.slideNext();
        } catch (e) {

        }
      } , 1500);
    }
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
    }
    $scope.back_to_quizzes = () => {
      return window.location.href = $scope.server_ip+'quizzes';
    };
    $scope.resume_quiz_next_unsolved_question = () => {
      $scope.load_quiz_timer();
      var app_questions = $scope.__player_object.questions;
      var me = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);

      var solved_questions = me.questions_data ;
      var unsolved = app_questions.find_unsolved_questions(solved_questions);

      if(unsolved != undefined && unsolved.length >= 1) {
        var thisIndex = app_questions.findIndex(x => x._id == unsolved[0]._id );
        try {
          $scope.slide_screens.slideTo( thisIndex + 1);
        } catch (e) {

        }
      }

      if(unsolved == undefined || unsolved.length == 0 ) {
        try {
          $scope.slide_screens.slideTo( app_questions.length + 1);
        } catch (e) {

        }
      }
    };
    $scope.fill_unsolved_question_counts = () => {
      if($scope.attendee_draft.att_draft == undefined || $scope.attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) == -1 ){
        // ==> This attendee didn't solve any thing
        $(".warning_case").html("You didn't solve any question , click here to attend ");
        $(".warning_case").css({display:'block'})
        return false;
      }

        var attendeeIndex = $scope.attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) ;
        var attendee = $scope.attendee_draft.att_draft.find (x => x.user_id == $scope.user_id) ;
        var all_questions = $scope.__player_object.questions;
        var solved_questions = attendee.questions_data;
        var unsolved_questions = all_questions.find_unsolved_questions(solved_questions);

        if(unsolved_questions && unsolved_questions.length != 0 ) {
          $('.warning_case').html(unsolved_questions.length + " question(s) isn't attended click here to attend ");
          $(".warning_case").css({display:'block'})
          return false;
        } else   $(".warning_case").css({display:'none'});
    }
    $scope.go_to_not_attended_question = () => {

      if($scope.attendee_draft == null || $scope.attendee_draft.att_draft == undefined || $scope.attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id) == -1 )
      {
        try {
          $scope.slide_screens.slideTo(1);
        } catch (e) {

        }
        $('.warning_case').css('display','none');
        return false;
      }

      var app_questions = $scope.__player_object.questions;
      var me = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);

      var solved_questions = me.questions_data ;
      var unsolved = app_questions.find_unsolved_questions(solved_questions);
      if(unsolved && unsolved.length > 0 ){
          var target_slider = unsolved[0]._id;
          var target_slider_index = app_questions.findIndex(x => x._id == target_slider)
          try {
            $scope.slide_screens.slideTo(target_slider_index + 1);
          } catch (e) {

          }
      }
    };
    $scope.freez_the_slider = () => {
      try {
        $scope.slide_screens.allowSlidePrev = false ;
        $scope.slide_screens.allowSlideNext = false ;
        $scope.slide_screens.allowTouchMove = false ;
        $scope.slide_screens.noSwiping = false ;
      } catch (e) {

      }
    }

    $scope.submit_quiz_into_a_report = () => {
      if($scope.attendee_draft.att_draft == undefined ) return false ;
      $scope.this_attendee_draft = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
      // alert($scope.this_attendee_draft);
      // console.log({'val-1':$scope.this_attendee_draft});

      return $http({
         url : $scope.url_attend_quiz ,
         method: "POST",
         data : { "attendee_object" : $scope.this_attendee_draft } ,
         headers : $scope.api_key_headers
      }).then(function(resp){
        $http({method:'PATCH' , url : $scope.server_ip+"api/"+$scope.application_id+"/update/status" , data : {user_id:$scope.user_id}}).then((d)=>{
                $scope.load_attendee_report();

                $scope.progress__calculation_compilation();
                // store results
                $('.resultx-x-counts').html($scope.__report_object.correct_answers);
                $('.resultx-x-all').html($scope.__report_object.total_questions);
                $('.resultx-x-grade').html($scope.__report_object.score + '%');

                // freez the slider right now
                $scope.freez_the_slider();

                $timeout(function(){
                  $('.grade_result_loder').fadeOut();
                } , 1000);
            } , function (err){console.log(err);});
        return true ;
      } , function(err){
        console.log(err); return false;
      });
    }
    $scope.show_warning_unsolved_question = () => {
       //  $(".warning_case").removeClass('warning_case_internet_connection');
      if($scope.attendee_draft.att_draft == undefined || $scope.attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) == -1 ){
        // ==> This attendee didn't solve any thing
        $(".warning_case").html("You didn't solve any question , click here to attend ");
        $(".warning_case").css({display:'block'})
        return false;
      }

        var attendeeIndex = $scope.attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) ;
        var attendee = $scope.attendee_draft.att_draft.find (x => x.user_id == $scope.user_id) ;
        var all_questions = $scope.__player_object.questions;
        var solved_questions = attendee.questions_data;
        var unsolved_questions = all_questions.find_unsolved_questions(solved_questions);

        if(unsolved_questions && unsolved_questions.length != 0 ) {
          $('.warning_case').html(unsolved_questions.length + " question(s) isn't attended click here to attend ");
          $(".warning_case").css({display:'block'})
          return false;
        } else   $(".warning_case").css({display:'none'});


        return true ;
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

    // ====> Scope Do An Actions
    $scope.load_application_draft();
    $scope.load_application_json_file();


    // ====> Do An Actions through time
    $timeout(function (){ // => time is 50
        // console.log($scope.api_key_headers);
        $scope.load_main_attendee_application();
        $scope.load_attendee_report();
    } , 650 );
    $timeout(function () { // => time is 150
      // ====================== Delete this lines
      // console.log("------Report w Player objects --------");
      // console.log($scope.__player_object);
      // console.log($scope.__report_object);
      try {
        $scope.slide_screens = new Swiper('.swiper-container') ;

        if($scope.__player_object != null ){
          if($scope.__player_object.settings.allow_touch_move != undefined )
            $scope.slide_screens.touches = $scope.__player_object.settings.allow_touch_move;
        }

        $scope.slide_screens.on('slideChange' , function (i){

          $scope.touch_move++;
          var lengther = $(this);
          var current_index = lengther[0].activeIndex ;

          if(current_index >= $scope.__player_object.questions.length)
             current_index = $scope.__player_object.questions.length ;

        $scope.curren_question_slide = parseInt(current_index) ;

          // => Store current index
         $scope.curren_question_slide = current_index ;
         $scope.current_index = current_index ;
         $scope.previous_index =lengther[0].previousIndex;


          // => load to ui
          $(".current-question").html($scope.curren_question_slide);

          // => Load to next index
          $scope.slide_screens_index(current_index);
          // => When slideChange is fired
          // => Move into attendee draft object
          if(current_index != 0)
          $scope.attendee_draft_collection();
        });
      } catch (e) {

      }

    }, 1200);


    //=====> Load window objects
    $scope.window_object.on("load" , function (){
      $timeout(function(){

        if($scope.attendee_draft != null && $scope.attendee_draft.att_draft != undefined ){
          var userIndex = $scope.attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id);
          if(userIndex != -1 ){
            var user = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
            //  console.log({this_attendee:$scope.this_attendee_draft ,user:user});
            // ==> Load the navigation status
            if(user.is_loaded != undefined && user.is_loaded){
              $scope.__player_object = user.impr_application_object;
              $scope.load_template_timer();
            }else {
              // alert("Unloaded Page");
            } // End load navigation status

           if ( user.is_completed ) {
             $scope.quiz_status = 3;
             try {
               $scope.slide_screens.allowSlidePrev = false ;
               $scope.slide_screens.allowSlideNext = false ;
               $scope.slide_screens.noSwiping = false ;
               $scope.slide_screens.allowTouchMove = false ;
             } catch (e) {

             }
             $scope.time__calculation_compilation()
             $scope.progress__calculation_compilation()

              return false ;
           }
           // ==> Load The status if this quiz with expiration setting
           var expiration_object = $scope.__player_object.settings.expiration;
           if((expiration_object && expiration_object.is_set ) && (user.is_loaded != undefined && user.is_loaded) ){
              //  alert("Show the expiration warning")
            $scope.quiz_status = 2;
            var expiration_period =  parseInt(expiration_object.through_time);
            var started_at = new Date(user.start_expiration_time) ;
            var roughly_date = started_at.setDate(started_at.getDate() + expiration_period );
            var date_now = new Date().getTime() ;
            var time_diff = Math.round(roughly_date - date_now  );
            var days = Math.round(time_diff / ( 1000 * parseInt(60*60*24) ));
            if(days < 0 ) {
              // alert("Quiz is expired !");
              $scope.slide_screens.allowSlidePrev = false ;
              $scope.slide_screens.allowSlideNext = false ;
              $scope.slide_screens.allowTouchMove = false ;
              $scope.slide_screens.noSwiping = false ;
                return false ;
            }
           }// End expiration object

           // => Load this page if quiz is expired
           if( expiration_object && expiration_object.is_set &&  user.is_completed == false ){
             $scope.quiz_status = 1;
             var expiration_period =  parseInt(expiration_object.through_time);
             var started_at = new Date(user.start_expiration_time) ;
             var roughly_date = started_at.setDate(started_at.getDate() + expiration_period );
             var date_now = new Date().getTime() ;
             var time_diff = Math.round(roughly_date - date_now  );
             var days = Math.round(time_diff / ( 1000 * parseInt(60*60*24) ));
             $scope.is_resume = {
                  status : true ,
                  expire_message2500 :   expiration_object.title ,
                  through_timed : expiration_period ,
                  through_date : {
                    after : days ,
                    in : new Date(roughly_date)
                  }
               };

          }else {
            $scope.is_resume = {
                status : false
             };
             return false ;
          } // => expiration settings is false

         } // End user object
        }// End if statement

      } , 1500);
    });
    $timeout(function(){ // => time is 1000
      $('.loading-player').fadeOut();
    } , 2000);




  } // => end controller functionality
]);
