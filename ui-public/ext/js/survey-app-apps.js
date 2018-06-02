//=============================================
// => Javasctipt code lines
//=============================================
// Array.prototype.find_unsolved_questions = function (questions_list) {
//     return this.filter(function (i) {
//       return questions_list.findIndex(x => x.question_id == i._id) === -1;
//     });
// };

// Array.prototype.is_correct_question = function (correct_answers) {
//   return this.filter(function(i){
//     return correct_answers.findIndex (x => x._id == i.answer_id);
//   });
// }

// a => correct answers
// b => solved answer
var question_status = function (a, b) {
  // var correct_answers = a.map( function(x){ return x._id; } );
  // var solved_answers = b.map( function(x){ return x.answer_id; } );
  // var is_right_question =  (solved_answers.sort().join('') == correct_answers.sort().join(''));
  // return is_right_question ;
}

//=============================================
// => Filters
//=============================================
apps.filter('show_chars' , [
  function(){
    return function(chars){
      return chars ;
    }
  }
]);
apps.filter('build_arrguments' , [
  function(){
    return function (number){
      return [0,1,2,3,4] ;
    }
  }
])

apps.filter('transfeer_into_json' , [
  function (){
    return function (obj){
       return JSON.stringify(obj);
    };
  }
]);
apps.filter('set_source_link' , [
  ()=>{
      return function (link_source){
        alert(link_source);
      }
  }
]);
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
apps.filter('math_around_it' , [
  '$sce' , function(){
    return (round_p) => {
        var rounded = ( Math.round(round_p) ) ? Math.round(round_p): 0  ;
        return rounded ;
    }
  }
]);
//=============================================
// => Controllers
//=============================================


apps.controller("survey" , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings' , '$window',
  ( $scope, $rootScope, $timeout , $http , settings , $window ) => {

    // ====> Scope Variables
     $scope.answer_value = null ;
     $scope.rating_scale_elements = [];
     $scope.quiz_time_status_is_counting = true ;
     $scope.show_submitter_button = false ;
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
     $scope.rating_scale_block = $('ul.rating_scale_block');
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
           $scope.seconds = timeSettings.seconds;
           $scope.minutes = timeSettings.minutes ;
           $scope.hours   = timeSettings.hours;
         }
       }
     }
     $scope.select_rating_scale__ = function ( index , type , question_id = null  , answer_id = null , question_type = null ){
         var thisElement = index ;


         if(type == 1 ) { // ==> Rating
             var highlighted_stars = $('.fa-star').length ;
             if($('.start-o').children("li").eq(index).children("span").children("i").hasClass("fa-star")){
                if((highlighted_stars - 1 ) == index){
                  $(".start-o li").each(function(i){
                    $(this).children("span").children("i").removeClass("fa-star");
                    $(this).children("span").children("i").addClass("fa-star-o");
                  });
                }else {
                  $(".start-o li").each(function(i){
                     if($(this).children("span").children("i").hasClass('fa-star')){
                         $(this).children("span").children("i").removeClass('fa-star');
                         $(this).children("span").children("i").addClass("fa-star-o");
                     }
                     if(i <= thisElement){
                         $(this).children("span").children("i").removeClass("fa-star-o");
                          $(this).children("span").children("i").addClass('fa-star');
                      }
                  });
                }
             }else {
               $(".start-o li").each(function(i){
                 if(i <= thisElement){
                   $(this).children("span").children("i").removeClass("fa-star-o");
                   $(this).children("span").children("i").addClass("fa-star");
                 }
               });
             }
          }
          if( type == 0 ) { // ==> Scale .scalet-o li span
             if($('.scalet-o').children("li").eq(index).children("span").hasClass("highlighted_scale")){
               $('.scalet-o').children("li").eq(index).children("span").removeClass("highlighted_scale");
             }else {
               $('.scalet-o').children("li").each(function (){
                 $(this).children("span").removeClass("highlighted_scale");
               });
               $('.scalet-o').children("li").eq(index).children("span").addClass("highlighted_scale");
             }
          }

          //==> Fill Object of answer with solved question
          // ==> Rating Scale value ; index
          if($scope.attendee_draft != undefined && $scope.attendee_draft.att_draft != undefined){
            var this_User = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
            if(this_User != undefined ){
                var question_objk = $scope.__player_object.questions.find(x => x._id == question_id);
                // console.log({___ : $scope.__player_object.questions , __ : question_id});
                // console.log(question_objk);
                var stored_object = {
                    question_id : question_id ,
                    answer_id : answer_id ,
                    question : question_objk ,
                    answer: question_objk.answers_format[0] ,
                    app_id : $scope.application_id ,
                    user_id : $scope.user_id ,
                    value_object : index
                };
                $scope.store_into_attendee_draft( stored_object , false );
            }
          }


      };

     $scope.select_this_rating_value = (index , class_name , answer_id , question_id , rs_type ) => {


       var question_exists = $scope.__player_object.questions.findIndex( x => x._id == question_id );
       if(question_exists == -1) return false ;

       var user_exists = $scope.attendee_draft.att_draft.findIndex( x => x.user_id == $scope.user_id );
       if( user_exists != -1 ){


         if(rs_type == 0 ){ // => Scale type
            var get_answers = $(".ul_scal_"+ question_id).children("li");
            get_answers.eq(index).children(".scale_value_"+answer_id).css({
              background : 'red'
            })
         }
         if(rs_type == 1 ){ // => Rating type

         }




          var attendee_data =  $scope.attendee_draft.att_draft.find( x => x.user_id == $scope.user_id );

          var stored_object = {
             question_id : question_id ,
             answer_id : answer_id ,
             question : $scope.__player_object.questions[question_exists] ,
             answer: $scope.__player_object.questions[question_exists].answers_format[0] ,
             app_id : $scope.application_id ,
             user_id : $scope.user_id ,
             value_object : index
          };

          $scope.store_into_attendee_draft( stored_object , false );
       }




       console.log({
         index : index ,
         class_name : class_name ,
         answer_id : answer_id ,
         question_id : question_id ,
         rs_type : rs_type
       });
     };
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
        //  thi
         // => Question Progress
         $scope.slide_screens_index($scope.__player_object.questions.length);
       }
     };


     $scope.do_an_action_with_closest_time = () => {
         // => Calculate the quiz time and progress bar
         $scope.time__calculation_compilation();
         $scope.progress__calculation_compilation();
         // => Freeze the quiz right now !
         $scope.slide_screens.slideTo($('.swiper-slide').length - 1);
         $timeout(function () {
           $scope.attendee_draft_collection();
           $scope.report_quiz_collection();
           $scope.freez_the_quiz_right_now();
         }, 200);

     };
     $scope.load_time_tracker  = () => {
       if( $scope.quiz_time_status_is_counting){
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

             // => Storing data into array
             $scope.store_the_current_time();
            //  $scope.time__calculation_compilation(true);
             $scope.load_quiz_timer();
      }
     };
     $scope.store_the_current_time = () => {
       if($scope.attendee_draft != null && $scope.attendee_draft.att_draft != undefined ) {
         var current_attendee_index = $scope.attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id );
         if(current_attendee_index != -1 ){
           var current_attendee = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id );
           current_attendee.impr_application_object.settings.time_settings.hours    = $scope.hours;
           current_attendee.impr_application_object.settings.time_settings.minutes  = $scope.minutes;
           current_attendee.impr_application_object.settings.time_settings.seconds  = $scope.seconds;
         }
       }
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
       $scope.load_main_attendee_application();
       $('.retake-this-quiz').children("span").html("Please wait ..");
       $('.retake-this-quiz').children("i").removeClass('fa-repeat')
       $('.retake-this-quiz').children("i").addClass('fa-spinner fa-spin');

       if($scope.attendee_draft != null && $scope.attendee_draft.att_draft != undefined){
          var curIndex = $scope.attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id );
          if(curIndex != -1 ){
            // ==> Delete this user now
            $scope.attendee_draft.att_draft.splice(curIndex , 1);
          }
       }
       $scope.quiz_time_status_is_counting = true ;

       $timeout(function(){
         $('.warning_case').removeClass("submit_quiz_now_xx");
         $scope.show_submitter_button = false ;

         $scope.load_template_timer();
         $scope.join_this_quiz();
         $scope.load_quiz_timer ();
         $scope.is_submitted = false ;
         $scope.slide_screens = new Swiper('.swiper-container') ;
         $(".answer-container ul li").removeClass('selected_answer');
         $(".answer-container ul li").removeClass('right_answer');
         $(".answer-container ul li").removeClass('wrong_answer');
         $scope.unfreez_the_quiz_right_now();
         // => Set event handler
         $scope.slide_screens.on('slideChange' , function (i){

           $scope.touch_move++;
           var lengther = $(this);
           var current_index = lengther[0].activeIndex ;
           if(current_index >= $scope.__player_object.questions.length)
              current_index = $scope.__player_object.questions.length ;


              // => check about question index
              var question_s= $scope.__player_object.questions;
              if( current_index < ( question_s.length ) && current_index != 0 ){

                var target_question = $scope.__player_object.questions[current_index-1];
                if( target_question.question_type == 3 ){
                  var ques_rat_scal_type = target_question.answers_format[0].ratscal_type;
                  var steps = target_question.answers_format[0].step_numbers;
                  $scope.rating_scale_elements = [];
                  for (var i = 0; i < steps; i++) {
                      $scope.rating_scale_elements.push({"val": i});
                  }
                  $timeout(function (){$scope.$apply();} , 350);
                }

              }

         $scope.curren_question_slide = parseInt(current_index) ;
           // => Store current index
          $scope.curren_question_slide = current_index ;
          $scope.current_index = current_index ;
          $scope.previous_index =lengther[0].previousIndex;
           // => load to ui
           $(".current-question").html($scope.curren_question_slide);
           // => Load to next index
           $scope.slide_screens_index(current_index);
         });

         $scope.slide_screens.slideTo(1);
         $('.retake-this-quiz').children("span").html("Retake");
         $('.retake-this-quiz').children("i").removeClass('fa-spinner fa-spin')
         $('.retake-this-quiz').children("i").addClass('fa-repeat');
         $timeout(function(){

         } , 1000 );
       } , 4000);
     }
     $scope.retake_this_quiz_deprecated = () => {
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
        $scope.is_review = true ;
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

               // => check about question index
               var question_s= $scope.__player_object.questions;
               if( current_index < ( question_s.length ) && current_index != 0 ){

                 var target_question = $scope.__player_object.questions[current_index-1];
                 if( target_question.question_type == 3 ){
                   var ques_rat_scal_type = target_question.answers_format[0].ratscal_type;
                   var steps = target_question.answers_format[0].step_numbers;
                   $scope.rating_scale_elements = [];
                   for (var i = 0; i < steps; i++) {
                       $scope.rating_scale_elements.push({"val": i});
                   }

                   $timeout(function (){$scope.$apply();} , 350);
                 }
               }

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
            // if(current_index != 0)
            // // $scope.attendee_draft_collection();
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
            classes += ' selected_answer';
            // if($scope.__player_object.settings.show_results_per_qs){ // => true
            //   // =>> check if show the right answer option is true
            //   if(selected_answer.is_correct){
            //     classes += ' right_answer';
            //   }else {
            //     classes += ' wrong_answer';
            //   }
            // } else classes += ' selected_answer';
          }
        }
      }

      return classes ;
    }


    $scope.store_into_attendee_draft = ( object , is_single = null ) => {
      var question_type = object.question.question_type;

      var application_object = new Object();
      if ( $scope.attendee_draft != null && $scope.attendee_draft.application_id != undefined) {
        var findAttendeeIndex = $scope.attendee_draft.att_draft.findIndex(x => x.user_id == object.user_id);
        var findAttendee = $scope.attendee_draft.att_draft.find(x => x.user_id == object.user_id);
        if( findAttendeeIndex == -1 ){
          var add_new_attendee = {
              questions_data : new Array() ,
              is_loaded :true ,
              start_expiration_time: new Date() ,
              user_id : $scope.user_id,
              user_info: $scope.user_id ,
              is_completed : false ,
              impr_application_object : $scope.__player_object
          };

          if($scope.attendee_draft.att_draft == undefined) $scope.attendee_draft.att_draft = new Array();
          $scope.attendee_draft.att_draft.push(add_new_attendee);
          if( $scope.attendee_draft.statistics == undefined ) $scope.attendee_draft.statistics = new Array();
          if( $scope.attendee_draft.application_id== undefined ) $scope.attendee_draft.application_id = $scope.application_id;
          if( $scope.attendee_draft.questionnaire_info== undefined ) $scope.attendee_draft.application_id = $scope.questionnaire_info;

        }


        var attendeeInfo = $scope.attendee_draft.att_draft[findAttendeeIndex];



        // =================================================================================================================


        // =====================================================
        // ==============>> Build Question and answer Object
        // =====================================================
        var question_id = object.question_id ;
        var question_objects = object.question ;

        var answer_object = new Object() ;
        var question_object = new Object() ;
        var answer = object.answer ;
        // ==> Givines
        // I => Storing Question Data
        question_object['question_id'] = question_objects._id;
        question_object['question_index'] = 0 ;
        question_object['question_type'] = question_objects.question_type;
        question_object['question_text']  = question_objects.question_body;
        answer_object['answer_id'] = object.answer_id;

        // II => Storing Answer Data
        if( question_type == 0 ){
           answer_object['answer_value'] = answer.value ;
        }
        if( question_type == 1 ){

          if( answer.media_src.includes('media-icon.png') == true)
            answer_object['answer_value'] = 'No Media here !';

          if(answer.media_type != undefined && answer.media_type == 0 && answer.media_src.includes('media-icon.png') == false ){
             answer_object['answer_value'] = answer.Media_directory;
          }
          if(answer.media_type != undefined && answer.media_type == 1 && answer.media_src.includes('media-icon.png') == false ){
            if(answer.video_type == 0 ) answer_object['answer_value'] = answer.embed_path;
            if(answer.video_type == 1 ) answer_object['answer_value'] = answer.embed_path;
            if(answer.video_type == 2 ) answer_object['answer_value'] = answer.media_src;
          }
        }
        if( question_type == 2 ){
          answer_object['answer_value'] = answer.boolean_value;
        }
        if( question_type == 3 ){
          answer_object['answer_value'] = object.value_object + 1 ;
        }
        if( question_type == 4 ){
          answer_object['answer_value'] = question_objects.answers_format[0].free_text_value;
        }
        // => Store answer in question
        answer_object['answer_object'] = answer ;
        question_object['question_answers'] = answer_object ;

        // =================================================================================================================

        // ==> Build attendee Data
        var online_report = $scope.attendee_draft ;
        var att_draft = ( online_report.att_draft != undefined ) ?  online_report.att_draft : [] ;
        var current_user = att_draft.findIndex(x => x.user_id == $scope.user_id );
        if(current_user != -1){
          var current_user_data = att_draft.find (x => x.user_id == $scope.user_id );

          // => Building objects and arrays
          if(current_user_data.questions_data == undefined ) current_user_data.questions_data = new Array();
          if(current_user_data.report_questions == undefined ) current_user_data.report_questions = new Object();
          if(current_user_data.report_attendee_details == undefined ) current_user_data.report_attendee_details = new Object();
          if(current_user_data.report_attendees == undefined ) current_user_data.report_attendees = new Object();
          if(current_user_data.attendee_questions == undefined ) current_user_data.attendee_questions = new Array();

          // [ A ] ==>  questions_data
           var questions_data_exists = current_user_data.questions_data.findIndex(x => x.question_id == question_object.question_id );
           if(questions_data_exists == -1 ){
             // didn't find this question
             current_user_data.questions_data.push({
               question_id : question_object.question_id ,
               question_index : 0 ,
               question_type : question_object.question_type,
               question_text : question_object.question_text ,
               answer_ids : new Array({
                 answer_id : question_object.question_answers.answer_id ,
                 answer_index : 0 ,
                 answer_object : {
                   _id : question_object.question_answers.answer_id,
                   answer_value : question_object.question_answers.answer_value ,
                   answer_elements : question_object.answer_object
                 }
               }) ,
               updated_date : new Date()
             });
           }else {
             // found this question
             var questions_data = current_user_data.questions_data.find(x => x.question_id == question_object.question_id );
             var answer_exists_before = questions_data.answer_ids.findIndex(x => x.answer_id == question_object.question_answers.answer_id );
             if(answer_exists_before == -1 ){
               questions_data.answer_ids.push({
                 answer_id : question_object.question_answers.answer_id ,
                 answer_index : 0 ,
                 answer_object : {
                   _id : question_object.question_answers.answer_id,
                   answer_value : question_object.question_answers.answer_value ,
                   answer_elements : question_object.answer_object
                 }
               });
             }else {
                if(question_object.question_type < 3){
                    // ==> multi choices + media choices + true false
                    questions_data.answer_ids.splice(answer_exists_before , 1);
                }else {
                    // ==> Free text + rating and scales
                    questions_data.answer_ids[answer_exists_before].answer_object.answer_value = question_object.question_answers.answer_value;
                }
             }
           }

          // [ B ] ==>  report_questions
          if(current_user_data.report_questions.all_questions == undefined ) current_user_data.report_questions.all_questions = new Array();
          var all_qs_index = current_user_data.report_questions.all_questions.indexOf(question_object.question_id);
          if(all_qs_index == -1 ) {
            current_user_data.report_questions.all_questions.push(question_object.question_id);
          }else {
            if( current_user_data.questions_data[all_qs_index].answer_ids == undefined )  current_user_data.questions_data[all_qs_index].answer_ids = [] ;
            if( current_user_data.questions_data[all_qs_index].answer_ids.length == 0  )  current_user_data.report_questions.all_questions.splice(all_qs_index , 1);
          }

          // [ C ] ==>  report_attendee_details
          if(current_user_data.report_attendee_details.attendee_id == undefined )
          current_user_data.report_attendee_details['attendee_id'] = $scope.user_id;
          current_user_data.report_attendee_details['attendee_id'] = $scope.user_id;
          if(current_user_data.report_attendee_details.attendee_information == undefined )
          current_user_data.report_attendee_details['attendee_information'] = $scope.user_id;
          current_user_data.report_attendee_details['attendee_information'] = $scope.user_id;
          if(current_user_data.report_attendee_details.total_questions == undefined )
          current_user_data.report_attendee_details['total_questions'] = current_user_data.questions_data.length ;
          current_user_data.report_attendee_details['total_questions'] = current_user_data.questions_data.length ;
          if(current_user_data.report_attendee_details.completed_status == undefined )
          current_user_data.report_attendee_details['completed_status'] = ( current_user_data.impr_application_object.questions.length == current_user_data.questions_data.length )?  true : false ;
          current_user_data.report_attendee_details['completed_status'] = ( current_user_data.impr_application_object.questions.length == current_user_data.questions_data.length )?  true : false ;
          if(current_user_data.report_attendee_details.created_at == undefined )
          current_user_data.report_attendee_details['created_at'] = new Date();
          current_user_data.report_attendee_details['created_at'] = new Date();
          if(current_user_data.report_attendee_details.completed_date == undefined )
          current_user_data.report_attendee_details['completed_date'] = new Date();
          current_user_data.report_attendee_details['completed_date'] = new Date();

          // [ - ] ==> Build attendee question
          if(current_user_data.attendee_questions == undefined ) current_user_data.attendee_questions = new Array();
          var thisquestion_exists = current_user_data.attendee_questions.findIndex(x => x.question_id == question_object.question_id);
          if(thisquestion_exists == -1 ){
              current_user_data.attendee_questions.push({
                question_id : question_object.question_id ,
                question_type : question_object.question_type ,
                question_text : $("<p>"+question_object.question_text+"</p>").text(),
                attendee_answers : new Array({
                  answer_id : question_object.question_answers.answer_id ,
                  answer_value : $("<p>"+question_object.question_answers.answer_value+"</p>").text() ,
                  answer_object : question_object.question_answers.answer_object
                })
              });
          }else {
            var target__question = current_user_data.attendee_questions[thisquestion_exists];
            var this_answer_exs = target__question.attendee_answers.findIndex(x => x.answer_id ==  question_object.question_answers.answer_id );
            if( this_answer_exs == -1 ){
              target__question.attendee_answers.push({
                answer_id : question_object.question_answers.answer_id ,
                answer_value : $("<p>"+question_object.question_answers.answer_value+"</p>").text() ,
                answer_object : question_object.question_answers.answer_object
              });
            }else {
              target__question.attendee_answers[this_answer_exs].answer_id  =  question_object.question_answers.answer_id ,
              target__question.attendee_answers[this_answer_exs].answer_value  =   $("<p>"+question_object.question_answers.answer_value+"</p>").text()
              target__question.attendee_answers[this_answer_exs].answer_object = question_object.question_answers.answer_object
            }
          }

          // [ D ] ==>  report_attendees
          if( current_user_data.report_attendees == undefined ) current_user_data.report_attendees = new Object();
          var report_attendee_exists =  current_user_data.report_attendees.attendee_id
          if(report_attendee_exists == undefined ){
              var answer_body_objecxxxx = new Object();
              answer_body_objecxxxx['answer_id_' + question_object.question_answers.answer_id] = question_object.question_answers.answer_object;


              current_user_data.report_attendees.created_at = new Date()
              current_user_data.report_attendees.updated_at = new Date()
              current_user_data.report_attendees.attendee_id = $scope.user_id ;
              current_user_data.report_attendees.user_information = $scope.user_id
              current_user_data.report_attendees.is_completed = ( current_user_data.impr_application_object.questions.length == current_user_data.questions_data.length )?  true : false ;
              current_user_data.report_attendees.survey_quiz_answers = new Array({
                question_id : question_object.question_id,
                questions :{
                  question_id : question_object.question_id ,
                  question_body : question_object.question_text,
                  question_type : question_object.question_type
                } ,
                answers :{
                  answer_id : new Array(question_object.question_answers.answer_id),
                  answer_body : answer_body_objecxxxx
                }
              });

              // current_user_data.report_attendees = {
              //   created_at : new Date() ,
              //   updated_at : new Date(),
              //   attendee_id: $scope.user_id ,
              //   user_information:$scope.user_id ,
              //   is_completed : ( current_user_data.impr_application_object.questions.length == current_user_data.questions_data.length )?  true : false  ,
              //   survey_quiz_answers : new Array({
              //     question_id : question_object.question_id,
              //     questions :{
              //       question_id : question_object.question_id ,
              //       question_body : question_object.question_text,
              //       question_type : question_object.question_type
              //     } ,
              //     answers :{
              //       answer_id : new Array(question_object.question_answers.answer_id),
              //       answer_body : answer_body_objecxxxx
              //     }
              //   })
              // } ;
          }else {
            // => updates in answer
            var current_qs_attended = current_user_data.report_attendees;
            if(current_qs_attended.survey_quiz_answers == undefined ) current_qs_attended.survey_quiz_answers = new Array();
            var current_ques_exists = current_qs_attended.survey_quiz_answers.findIndex(x => x.question_id == question_object.question_id);
            if(current_ques_exists != -1){
              var answer_body_objecxxxx = new Object();
              answer_body_objecxxxx['answer_id_' + question_object.question_answers.answer_id] = question_object.question_answers.answer_object;
              current_qs_attended.is_completed = ( current_user_data.impr_application_object.questions.length == current_user_data.questions_data.length )?  true : false  ;
              current_qs_attended.survey_quiz_answers[current_ques_exists].answers.answer_id = question_object.question_answers.answer_id
              current_qs_attended.survey_quiz_answers[current_ques_exists].answers.answer_body = answer_body_objecxxxx ;

            }else {

              var answer_body_objecxxxx = new Object();
              answer_body_objecxxxx['answer_id_' + question_object.question_answers.answer_id] = question_object.question_answers.answer_object;

              var all_rpt_ques = {
                question_id : question_object.question_id,
                questions :{
                  question_id : question_object.question_id ,
                  question_body : question_object.question_text,
                  question_type : question_object.question_type
                } ,
                answers :{
                  answer_id : new Array(question_object.question_answers.answer_id),
                  answer_body : answer_body_objecxxxx
                }
              };

              current_qs_attended.survey_quiz_answers.push(all_rpt_ques);
            }
          }

      } // => End current user data

      } // => attendee_draft is found






      // ===================================================================================
      // ================>>> Build statistics
      // ===================================================================================
      if(object != null && $scope.__player_object.app_type == 0 ){

          if($scope.attendee_draft.statistics == undefined)
            $scope.attendee_draft.statistics = new Array();

          if($scope.attendee_draft.overview == undefined)
          $scope.attendee_draft.overview = new Object();

          $scope.attendee_draft.statistics["question_id"] = '';
          $scope.attendee_draft.statistics["question_body"] = '';
          $scope.attendee_draft.statistics["attendee_count"] = 0 ;
          $scope.attendee_draft.statistics["question_answers"] = new Array();

          var question_stisc_index =  $scope.attendee_draft.statistics.findIndex(x => x.question_id == object.question_id );

          if(object.question.question_type == 0 ) {
                 $scope.answer_value = $("<b>" + object.answer.value + "</b>" ).text() ;
            }
           if(object.question.question_type == 1 ) {
                 $scope.answer_value = ( object.answer.media_src == $scope.server_ip + "img/media-icon.png") ? "No Media here !" : object.answer.media_src; ;
            }
           if(object.question.question_type == 2 ) {

              $scope.answer_value = object.answer.boolean_value ;
            }
           if(object.question.question_type == 3 ) {
                 $scope.answer_value = object.value_object + 1  ;
            }
            if(object.question.question_type == 4 ) {
               $scope.answer_value = object.answer;
            }

            // ==============================================
           // ================>>>>>> attendee_answers
           // ==============================================
            if( question_stisc_index != -1 ){
              var current_question = $scope.attendee_draft.statistics.find(x => x.question_id == object.question_id );
              var current_answer_attendee_object = current_question.attendee_answers.find(x => x.attendee_id == $scope.user_id );
              var current_answer_attendee_index = current_question.attendee_answers.findIndex(x => x.attendee_id == $scope.user_id );
              if(current_answer_attendee_index == -1 ){
                // => attendee is not found
                 var answer_attendee_objx = {
                    attendee_id :  $scope.user_id ,
                    answer_ids : [ object.answer_id ] ,
                    solved_at : new Date()
                  };
                  current_question.attendee_answers.push(answer_attendee_objx);
              }else{
                // => attendee is found
                var answer_exists = current_answer_attendee_object.answer_ids.indexOf(object.answer_id);
                if(answer_exists == -1 ){
                  // => Answer isn't found
                   current_answer_attendee_object.answer_ids.push(object.answer_id);
                }else {
                  // => Answer is found
                  var this_answer = current_answer_attendee_object.answer_ids[answer_exists];
                  current_answer_attendee_object.answer_ids.splice( answer_exists , 1 );

                  $timeout(function(){
                    if( current_answer_attendee_object.answer_ids.length == 0 ){
                      var user_index = current_question.attendee_answers.findIndex(x => x.attendee_id == $scope.user_id );
                      if ( user_index != -1 ) current_question.attendee_answers.splice( user_index , 1 );
                    }
                  } , 300 );
                }
              }


            // ==============================================
            // ================>>>>>> question_answers
            // ==============================================
            var question_answers = current_question.question_answers.find( x => x.answer_id == object.answer_id );
            var question_answer_index = current_question.question_answers.findIndex( x => x.answer_id == object.answer_id );
            if( question_answer_index != -1 ){
              // => Answer is Found
              var attendee_index = current_question.question_answers[question_answer_index].answer_attendees.findIndex(x => x.attendee_id == $scope.user_id )
              if(attendee_index == -1 ){
                current_question.question_answers[question_answer_index].answer_attendees.push({ attendee_id : $scope.user_id });
              }else{
                current_question.question_answers[question_answer_index].answer_attendees.splice(attendee_index , 1 );
              }

              if ( object.question.question_type == 3 || object.question.question_type == 4 ){
                // alert($scope.answer_value);
                var this_ansx =  current_question.question_answers[question_answer_index].answer_body ;
                var current_answer_is_exists = this_ansx.findIndex(x => x.answer_value == $scope.answer_value);
                if( current_answer_is_exists == -1 ){
                  // ==> doesn't exists
                  var new_answer = { answer_value : $scope.answer_value , attendee_count : 1 };
                  this_ansx.push(new_answer);
                }else {
                  // ==> We've the same answer
                  this_ansx[current_answer_is_exists].attendee_count = this_ansx[current_answer_is_exists].attendee_count + 1 ;
                }
              }

              if( attendee_index != -1 )
                current_question.question_answers.splice( question_answer_index , 1 );

            }else {

              current_question.question_answers.push({
                answer_id: object.answer_id,
                answer_body : ( object.question.question_type == 3 || object.question.question_type == 4) ? new Array({answer_value : $scope.answer_value , attendee_count : 1}) : $scope.answer_value ,
                attendee_percentage_count : 0,
                attendee_raw_count : 0,
                answer_attendees : [
                    { attendee_id : $scope.user_id }
                ]
              });
            }

            // ==============================================
            // ================>>>>>> attendee_info
            // ==============================================
            var attendee_info = current_question.attendee_info.findIndex(x => x.attendee_id == $scope.user_id );
           if( attendee_info != -1 ){
             var is_me = current_question.attendee_answers.find( x => x.attendee_id == $scope.user_id);
             if( is_me != undefined ){
               if(is_me.answer_ids.length == 0 )
                 current_question.attendee_info.splice(attendee_info , 1 )
             }
           }else {
             current_question.attendee_info.push({ attendee_id : $scope.user_id });
           }

          }else {
            // => Question not found
            var question_s_obj = {
                 question_id : object.question_id ,
                 question_body : object.question.question_body ,
                 attendee_count : 1 ,
                 attendee_answers : [
                   {
                     attendee_id :  $scope.user_id ,
                     answer_ids : [ object.answer_id ] ,
                     solved_at : new Date()
                   }
                 ] ,
                 question_answers : new Array({
                   answer_id: object.answer_id,
                   answer_body : ( object.question.question_type == 3 || object.question.question_type == 4) ? new Array({ answer_value : $scope.answer_value , attendee_count : 1 }) : $scope.answer_value ,
                   attendee_percentage_count : 0,
                   attendee_raw_count : 0,
                   answer_attendees : [
                     { attendee_id : $scope.user_id }
                   ]
                 }) ,
                 attendee_info : new Array({
                   attendee_id : $scope.user_id
                 })
               };

             $scope.attendee_draft.statistics.push(question_s_obj);
          }


          //--------------------------------------------
            // ==> Log Calcs
            //--------------------------------------------
            var this_question = $scope.attendee_draft.statistics.find(x => x.question_id == object.question_id);
            if(this_question != undefined ){
              this_question.attendee_count = (this_question.attendee_answers == undefined)? 0 : this_question.attendee_answers.length ;
              var attendee_answers = this_question.attendee_answers;
              var question_answers = this_question.question_answers;

              // ==> Collect answers together
              var answer_counts = 0 ;
              for (var i = 0; i < attendee_answers.length; i++) {
                var att_answers = attendee_answers[i];
                answer_counts = parseInt(answer_counts + att_answers.answer_ids.length) ;
              }

              // ==> per-cent value
              var hcent = 100 / answer_counts;

              // ==> calculate each answer as alone
                for (var i = 0; i < question_answers.length; i++) {
                  var this_question_answers = question_answers[i];
                  var answer_on_this_one = ( this_question_answers.answer_attendees == undefined ) ? 0 : this_question_answers.answer_attendees.length ;
                  this_question_answers.attendee_percentage_count = (( hcent * answer_on_this_one ).toFixed(2).split('.').pop() == "00" )? parseInt( hcent * answer_on_this_one ) :( hcent * answer_on_this_one ).toFixed(2) ;
                  this_question_answers.attendee_raw_count = this_question_answers.answer_attendees.length;
                }
            }

      }



      $scope.this_attendee_draft = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id) ;
      $timeout( function () {
          $scope.attendee_draft_collection();
       }, 4500);
    };

    // ==> Select answer scenario !!
    $scope.select_this_answer = ( questionId = null , answerId = null , question = null , answer = null , app_id  = null , user_id  = null , is_correct = null , answerIndex = null) => {

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
        // is_correct : is_correct ,
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
                                      // this_answer.addClass('right_answer');
                                    }else {
                                      // => show wrong answer
                                      // this_answer.addClass('wrong_answer');
                                      // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                                      // answer_iu_list.each(function (i){
                                      //   var currentAnswer = $(this);
                                      //   var answers_inBackend = question.answers_format[i].is_correct ;
                                      //   if(answers_inBackend){
                                      //     currentAnswer.addClass('right_answer');
                                      //   }
                                      // });
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
                                      // this_answer.addClass('right_answer');
                                    }else {
                                      // => Show wrong answer
                                      // this_answer.addClass('wrong_answer');
                                      // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                                      // answer_iu_list.each(function (i){
                                      //   var currentAnswer = $(this);
                                      //   var answers_inBackend = question.answers_format[i].is_correct ;
                                      //   if(answers_inBackend){
                                      //     currentAnswer.addClass('right_answer');
                                      //   }
                                      // });
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
                                  // if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                                  //   // =>> Show The correct
                                  //   this_answer.addClass('right_answer');
                                  // }else {
                                  //   // => show wrong answer
                                  //   this_answer.addClass('wrong_answer');
                                  //   // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                                  //   answer_iu_list.each(function (i){
                                  //     var currentAnswer = $(this);
                                  //     var answers_inBackend = question.answers_format[i].is_correct ;
                                  //     if(answers_inBackend){
                                  //       currentAnswer.addClass('right_answer');
                                  //     }
                                  //   });
                                  // }
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
                                    // if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                                    //   // =>> Show The correct
                                    //   this_answer.addClass('right_answer');
                                    // }else {
                                    //   // => show wrong answer
                                    //   this_answer.addClass('wrong_answer');
                                    //   // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                                    //   answer_iu_list.each(function (i){
                                    //     var currentAnswer = $(this);
                                    //     var answers_inBackend = question.answers_format[i].is_correct ;
                                    //     if(answers_inBackend){
                                    //       currentAnswer.addClass('right_answer');
                                    //     }
                                    //   });
                                    // }
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
                //  if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                //    // =>> Show The correct
                //    this_answer.addClass('right_answer');
                //  }else {
                //    // => show wrong answer
                //    this_answer.addClass('wrong_answer');
                //    // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                //    answer_iu_list.each(function (i){
                //      var currentAnswer = $(this);
                //      var answers_inBackend = question.answers_format[i].is_correct ;
                //      if(answers_inBackend){
                //        currentAnswer.addClass('right_answer');
                //      }
                //    });
                //  }

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
                    //  var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                    //  if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                    //    // =>> Show The correct
                    //    this_answer.addClass('right_answer');
                    //  }else {
                    //    // => show wrong answer
                    //    this_answer.addClass('wrong_answer');
                    //    // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                    //    answer_iu_list.each(function (i){
                    //      var currentAnswer = $(this);
                    //      var answers_inBackend = question.answers_format[i].is_correct ;
                    //      if(answers_inBackend){
                    //        currentAnswer.addClass('right_answer');
                    //      }
                    //    });
                    //  }

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


   $scope.submit_quiz_into_report = () => {
     $scope.is_review = false ;
     $scope.is_submitted = true ;
     $('.submi_the_quiz_handler').children('i').removeClass('fa-arrow-right');
     $('.submi_the_quiz_handler').children('i').addClass("fa-spinner fa-spin");
     $('.submi_the_quiz_handler').children('span').html("Please Wait its submitting the quiz ... ");

     if( $scope.show_warning_unsolved_question() == false ){
          $('.submi_the_quiz_handler').children('i').removeClass('fa-spinner fa-spin');
          $('.submi_the_quiz_handler').children('i').addClass("fa-arrow-right");
          $('.submi_the_quiz_handler').children('span').html("Submit quiz");
        return false ;
      }



     $timeout(function(){
       // => Move to attendee draft
       $scope.attendee_draft_collection();
       // => Move results into rebort
       $scope.report_quiz_collection();

       $timeout(function(){
         $scope.slide_screens.slideNext();
         $('.submi_the_quiz_handler').children('i').removeClass('fa-spinner fa-spin');
         $('.submi_the_quiz_handler').children('i').addClass("fa-arrow-right");
         $('.submi_the_quiz_handler').children('span').html("Quiz is Submitted");
         // freez the slider right now
         $scope.freez_the_quiz_right_now();
       } , 1000)
     } , 3000);
   }
   $scope.report_quiz_collection = () => {
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

         var leor_object = new Object();
         if($scope.__player_object.app_type == 0 ) {
           leor_object['statistics'] = ( $scope.attendee_draft.statistics == undefined ) ? null : $scope.attendee_draft.statistics ;
         }

         leor_object['attendee_draft'] = dataObject;
        //  alert($scope.url_report_collecation);
         $http({
           url : $scope.url_report_collecation ,
           method: "POST",
           data : leor_object ,
           headers : {
             "Content-Type": "application/json"
           } ,
         }).then(function(reData){
          //  console.log(reData);
         } , function (err){
           console.log(err);
         });
     }
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



         // if(($scope.question_count_at_promise != parseInt($scope.__player_object.questions.length)) && $scope.is_review  == false ){
            // console.log(" This Question is reviewed !! ====>=> " + $scope.question_count_at_promise);
            $http({
              url : $scope.url_attendee_draft_collecation ,
              method: "POST",
              data : { attendee_draft : dataObject , statistics :  $scope.attendee_draft.statistics } ,
              headers : {
                "Content-Type": "application/json"
              } ,
            }).then(function(respData){
              try {
                var object_collection = respData.data ;
                // console.log(object_collection);

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






      }

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
        // => Move into attendee draft object
        if( at_this_array_only == null ){
          $timeout(function(){
            $scope.attendee_draft_collection();
          } , 1500 );
        }

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
        // $scope.attendee_draft_collection();
      } catch (e) {

      }
    }
    $scope.go_to_next_slider = () => {
      try {
        $scope.slide_screens.slideNext();
        // => When button navigation is fired
        // => Move into attendee draft object
        // $scope.attendee_draft_collection();
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
      // var unsolved = app_questions.find_unsolved_questions(solved_questions);

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
        // var unsolved_questions = all_questions.find_unsolved_questions(solved_questions);

        if(unsolved_questions && unsolved_questions.length != 0 ) {
          $('.warning_case').html(unsolved_questions.length + " question(s) isn't attended click here to attend ");
          $(".warning_case").css({display:'block'})
          return false;
        } else {
            if(unsolved_questions.length < 1 ) {
                // ==> Submit the quiz
                $('.warning_case').addClass("submit_quiz_now_xx");
                $('.warning_case').html("Submit this quiz by clicking here");
                $scope.show_submitter_button = true ;
            }
           // $(".warning_case").css({display:'none'})
        };
    }
    $scope.go_to_not_attended_question = () => {

      if($scope.show_submitter_button == true ){
        $(".warning_case").html("<i class='fa fa-spinner fa-spin'></i> please wait while submitting the quiz ...");
        $timeout(function(){
          $scope.report_quiz_collection();
          $timeout(function(){
              $scope.slide_screens.slideTo($('.swiper-slide').length - 1);
              $scope.freez_the_quiz_right_now();
            } , 1000);
          } , 3000);


      }


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
      // var unsolved = app_questions.find_unsolved_questions(solved_questions);
      // if(unsolved && unsolved.length > 0 ){
      //     var target_slider = unsolved[0]._id;
      //     var target_slider_index = app_questions.findIndex(x => x._id == target_slider)
      //     try {
      //       $scope.slide_screens.slideTo(target_slider_index + 1);
      //     } catch (e) {
      //
      //     }
      // }
    };

    // $scope.freez_the_quiz_right_now = () => {
    //   try {
    //     // ==> Freeze the slider application
    //       $scope.slide_screens.allowSlidePrev = true ;
    //       $scope.slide_screens.allowSlideNext = true ;
    //       // Load The quiz from database right now
    //       if($scope.__player_object != null && $scope.__player_object.settings != undefined){
    //         $scope.slide_screens.allowTouchMove = $scope.__player_object.settings.allow_touch_move ;
    //         $scope.slide_screens.noSwiping = $scope.__player_object.settings.allow_touch_move ;
    //         $scope.slide_screens.touches = $scope.__player_object.settings.allow_touch_move ;
    //       }
    //       // extract this time
    //     // ==> Stop the timer if it active
    //
    //     if($scope.__player_object != null && $scope.__player_object.settings != undefined){
    //
    //       if($scope.__player_object.settings.time_settings.is_with_time)
    //          $scope.quiz_time_status_is_counting = false ;
    //     }
    //
    //   } catch (e) {
    //
    //   }
    // }

    $scope.unfreez_the_quiz_right_now = () => {
      try {
        // ==> Freeze the slider application
          $scope.slide_screens.allowSlidePrev = true ;
          $scope.slide_screens.allowSlideNext = true ;

        // ==> Stop the timer if it active

        if($scope.__player_object != null && $scope.__player_object.settings != undefined){

          $scope.slide_screens.allowTouchMove = $scope.__player_object.allow_touch_move ;
          $scope.slide_screens.noSwiping = false ;

        }

      } catch (e) {

      }
    }


    $scope.freez_the_quiz_right_now = () => {
      try {
        // ==> Freeze the slider application
          $scope.slide_screens.allowSlidePrev = false ;
          $scope.slide_screens.allowSlideNext = false ;
          $scope.slide_screens.allowTouchMove = false ;
          $scope.slide_screens.noSwiping = false ;
        // ==> Stop the timer if it active

        if($scope.__player_object != null && $scope.__player_object.settings != undefined){

          if($scope.__player_object.settings.time_settings.is_with_time)
             $scope.quiz_time_status_is_counting = false ;
        }

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
                // $('.resultx-x-counts').html($scope.__report_object.correct_answers);
                $('.resultx-x-all').html($scope.__report_object.total_questions);
                // $('.resultx-x-grade').html($scope.__report_object.score + '%');

                // freez the slider right now
                $scope.freez_the_quiz_right_now();

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
        // var unsolved_questions = all_questions.find_unsolved_questions(solved_questions);

        if( $scope.__player_object.app_type == 1 ){
          if(unsolved_questions && unsolved_questions.length != 0 ) {
            $('.warning_case').html(unsolved_questions.length + " question(s) isn't attended click here to attend ");
            $(".warning_case").css({display:'block'})
            return false;
          } else   $(".warning_case").css({display:'none'});
        }

        return true ;
    };

    $scope.free_texts_question_type_changes = (question_id , question_object) => {
      if($scope.attendee_draft != null && $scope.attendee_draft.att_draft != undefined){
         var userIndex =  $scope.attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id);
         if( userIndex != -1 ){
           // ==> This uer is found
           var attendee = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);

            var question_data_object = {
              question_id : question_id ,
              question_index : 0 ,
              question_text : question_object.question_body ,
              question_type : question_object.question_type ,
              updated_date : new Date() ,
              answer_ids : [{
                answer_id : question_object.answers_format[0]._id,
                answer_index : 0 ,
                answer_object : {
                  _id : question_object.answers_format[0]._id,
                  answer_value : ""
                }
              }]
            };

            question_data_object.answer_ids[0].answer_object.answer_value = question_object.answers_format[0].free_text_value ;
            var question_index = attendee.questions_data.findIndex(x => x.question_id ==  question_object._id );
            if(question_index == -1 ){
              attendee.questions_data.push(question_data_object);

              $timeout(function (){
                if($scope.answer_value = attendee.questions_data[attendee.questions_data.length - 1].answer_ids.answer_object != undefined )
                  $scope.answer_value = attendee.questions_data[attendee.questions_data.length - 1].answer_ids.answer_object.answer_value;
              } , 500);
            }else {
              if(attendee.questions_data[question_index].answer_ids == undefined )
              attendee.questions_data[question_index].answer_ids[0].answer_object.answer_value = question_object.answers_format[0].free_text_value ;

              $scope.answer_value = question_object.answers_format[0].free_text_value ;
            }



         }
      }
    }
    $scope.save_and_go_to_next_slider = ($index ,  question , question_id) => {
        var stored_object = {
          question_id : question_id ,
          answer_id : question.answers_format[0]._id ,
          question : question ,
          answer : $scope.answer_value , // => answer that in
          app_id : $scope.app_id ,
          user_id : $scope.user_id,
          answer_index: $index
        };
        if(question.question_type == 3 ) {}
        if(question.question_type == 4 )
        {
          stored_object.answer = new Object();
          stored_object.answer['_id'] = question.answers_format[0]._id ;
          stored_object.answer['answer_value'] = $scope.answer_value ;
        }


        $scope.store_into_attendee_draft(stored_object);
        $scope.slide_screens.slideNext();
    }
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

          // => check about question index
          var question_s= $scope.__player_object.questions;
          if( current_index < ( question_s.length ) && current_index != 0 ){

            var target_question = $scope.__player_object.questions[current_index-1];
            if( target_question.question_type == 3 ){
              var ques_rat_scal_type = target_question.answers_format[0].ratscal_type;
              var steps = target_question.answers_format[0].step_numbers;
              $scope.rating_scale_elements = [];
              for (var i = 0; i < steps; i++) {
                  $scope.rating_scale_elements.push({"val": i});
              }

              $timeout(function (){$scope.$apply();} , 350);
            }
          }



          if(current_index >= $scope.__player_object.questions.length)
             current_index = $scope.__player_object.questions.length ;

        $scope.curren_question_slide = parseInt(current_index) ;


          // obj_val.question_type == 4
          // alert(target_question.question_type);

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
          // if(current_index != 0)
          // // $scope.attendee_draft_collection();
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
