Array.prototype.find_unsolved_questions = function (questions_list) {
    return this.filter(function (i) {
      return questions_list.findIndex(x => x.question_id == i._id) === -1;
    });
};
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
// >> true html value inside element
attendeeApp.filter('trust_this_html_values' , [
  '$sce' , function ($sce){
    return function (returned_val){
       return $sce.trustAsHtml(returned_val);
    }
  }
]);
// >> application controller

// var $qs_val = [ 0 , 3 , 4 , 5 ];

attendeeApp.controller('players' , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings',
  function ($scope, $rootScope, $timeout , $http , settings ){

     // => Scopes
     $scope.user_id = $("#userId").val();
     $scope.application_id = $("#appId").val();
     $scope.is_resume = null ;
     $scope.application_data_object = null ;
     $scope.server_ip = settings.server_ip ;
     $scope.json_source = settings.server_ip + settings.json_source;
     $scope.labels = [  'a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
     $scope.application_status = [] ;
     $scope.app_screens = null ;
     $scope.__player_object = null ;
     $scope.__report_object = null ;
     $scope.attendee_draft = null ;
     $scope.this_attendee_draft= null ;
     $scope.current_question = null ;
     $scope.slide_screens = null ;

     // ==> timer object
     $scope.collected_time_vals = 0;
     $scope.seconds = 00 ;
     $scope.minutes = 00   ;
     $scope.hours = 0 ;
     $scope.timer = null ;
     $scope.quiz_time_tracker = "00:00";
     $scope.curren_question_slide = 0;
     $scope.warning_at_time = {
       number_1 : 0 ,
       number_2 : 0
     };
     $scope.warning_for_not_attended_question = function (){

       if($scope.attendee_draft.att_draft == undefined){
         if($scope.attendee_draft.error != undefined ){
           var not_attended_count = $scope.__player_object.questions.length;
           var plural_case = (not_attended_count > 1)? "s":"" ;
           $('.warning_case').css({display:'block'});
           $('.warning_case').html(not_attended_count+" question"+plural_case+" is not attended Click here to attend");
           return false;
         }

         var userInfo = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
         var not_attended_count = $scope.__player_object.questions.length;
         var plural_case = (not_attended_count > 1)? "s":"" ;
         $('.warning_case').css({display:'block'});
         $('.warning_case').html(not_attended_count+" question"+plural_case+" is not attended Click here to attend");

         return false ;
       }
        var userInfo = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
        if(userInfo != undefined){
         if($scope.__player_object.questions.length != userInfo.questions_data.length)
          {

            var not_attended_count = Math.round($scope.__player_object.questions.length - userInfo.questions_data.length)
            var plural_case = (not_attended_count > 1)? "s":"" ;
            $('.warning_case').css({display:'block'});
            $('.warning_case').html(not_attended_count+" question"+plural_case+" is not attended Click here to attend");
            return false;
          } else
          return true
        }

     };
     $scope.submit_quiz_into_report = function (show_warning = true ){
       // ==============> Starting progression
        var submit_icon = $('.fac-icon-submit');
        if(submit_icon.hasClass('fa-arrow-right')) {
            submit_icon.removeClass('fa-arrow-right');
            submit_icon.addClass('fa-spinner fa-spin');

            submit_icon.next('span').html('Submitting Quiz ...');
        }else
        return false ;
        // alert();
        if(show_warning == true ){
            // => Check if there is any question not solved and back to those questions ( According to impr_application_object )
            if( $scope.warning_for_not_attended_question() == false ) {
                if(submit_icon.hasClass('fa-spinner')){
                  submit_icon.removeClass('fa-spinner fa-spin');
                  submit_icon.addClass('fa-arrow-right');
                  submit_icon.next('span').html('Submit Quiz');
                }
              return false
            } ;
        }



        $.getJSON($scope.json_source , function (apk_keys){

           $http({
            url : $scope.url_attend_quiz ,
            method: "POST",
            data : { attendee_object : $scope.this_attendee_draft }  ,
            headers : {
              "X-api-app-name" : apk_keys.APP_NAME,
              "X-api-keys": apk_keys.API_KEY
            }
          }).then(function (response){
            // 4- => Update the status into completed ( attendee + report )
            try {
                 $http({method:'PATCH' , url : $scope.server_ip+"api/"+$scope.application_id+"/update/status" , data : {user_id:$scope.user_id}}).then((d)=>{
                 $scope.calculate_usage_time();
              } , function (err){console.log(err);});
            }catch (e) { }
          },(err)=>{console.log(err);})


        });
        //----------------------
        if(submit_icon.hasClass('fa-spinner')){
          submit_icon.removeClass('fa-spinner fa-spin');
          submit_icon.addClass('fa-arrow-right');
          submit_icon.next('span').html('Submit Quiz');
        }
      // ==============> End the progression
      $scope.slide_screens.slideNext();
     };
     $scope.add_quiz_time_tracker = function (){

       var sec  = $('.sec');
       var mins = $('.min');
       var hrs  = $('.hr');

       // ==> Calculate the time and transfer it into minutes

        if($scope.collected_time_vals  > 1 ){
            $scope.warning_at_time.number_1 = Math.round((15 / 100 ) * $scope.collected_time_vals );
            $scope.warning_at_time.number_2 = Math.round((5 / 100 ) * $scope.collected_time_vals );
        }
        var collected_time = Math.round( ( $scope.hours * 60 ) + ( (  $scope.seconds> 60 ) ?   $scope.seconds  / 60 : 0 ) + $scope.minutes ) ;

        if(collected_time <= $scope.warning_at_time.number_1 && collected_time > $scope.warning_at_time.number_2) {
          // => Change the color of timeframe
          $(".time-obj").css({
              color:'violet'
          });
        }else if (collected_time <= $scope.warning_at_time.number_2){
          $(".time-obj").addClass("highlighted_estimated_time")
        }


      //  console.log($scope.minutes);
       // => Calculate the time and show the warning regarding time 5% from all time '

       if( $scope.attendee_draft != undefined && $scope.attendee_draft.att_draft != undefined){
         $scope.this_attendee_draft_index = $scope.attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id);
         $scope.this_attendee_draft = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
         if( $scope.this_attendee_draft_index != -1 && $scope.attendee_draft.att_draft != undefined){
           // console.log($scope.this_attendee_draft.impr_application_object.settings );
           // => Save the current time into settings

           try {
             $http({
               method : "PATCH" ,
               data : {
                  user_id : $scope.user_id ,
                  data_timed_with : {
                    seconds :  $scope.seconds ,
                    minutes : $scope.minutes  ,
                    hours : $scope.hours
                  }
               } ,
               url : $scope.server_ip + 'api/' + $scope.application_id + "/update/settings"
             }).then((res)=>{
                //  console.log(res.data);

             } , (er)=>{
               console.log(er);
             });
           } catch (e) {

           }

          }
       }

       if($scope.hours == 0 && $scope.minutes == 0 && $scope.seconds == 0)
       {


          clearTimeout($scope.timer);
          // =>> Do an action for mongo ( Submit the quiz )

          // 1- ==> Slide into result screen to show the results  ;
          // ......

          // 2- ==> disable swip slider
          $scope.slide_screens.allowSlidePrev = false ;
          $scope.slide_screens.allowSlideNext = false ;
          $scope.slide_screens.noSwiping = false ;
          // 3- => Submit the quiz into report
          $scope.submit_quiz_into_report(false);
          // alert($scope.server_ip+"api/"+$scope.application_id+"/update/status");


          // 5- Freezing it
          return false ;
       }

       $scope.seconds--;

       //00:30:-1 ==> 00:29:00
       if( $scope.seconds < 0 ){
           $scope.seconds = 59;
           $scope.minutes--;
       }


       if($scope.__player_object.settings.time_settings.timer_type){
           if($scope.minutes < 00 && $scope.hours > 0 ) {
              $scope.minutes = 59;
              $scope.hours--;
           }
       }else {
         if($scope.minutes < 00 ) $scope.minutes = 00 ;
       }

       if($scope.seconds < 10 )
       $scope.seconds = '0' + $scope.seconds;

       sec.html($scope.seconds);
       mins.html(($scope.minutes < 10 ) ? '0'+$scope.minutes:$scope.minutes );

       if($scope.__player_object.settings.time_settings.timer_type == true)
        hrs.html( $scope.hours);

       $scope.quiz_timer();
     }
     $scope.quiz_timer = function (){
       $scope.timer = setTimeout($scope.add_quiz_time_tracker , 1000 );
     }
     $scope.calculate_usage_time = function(){

       if($scope.__player_object.settings.time_settings.is_with_time){

        // ==> Remaining times
        var remaining_hours =  $scope.__player_object.settings.time_settings.hours * 60
        var remaining_minutes =  $scope.__player_object.settings.time_settings.minutes
        var remaining_seconds =  parseInt(( $scope.__player_object.settings.time_settings.seconds > 60 ) ?  $scope.__player_object.settings.time_settings.seconds / 60 : 0);
        // console.log({remaining_hours : remaining_hours , remaining_minutes : remaining_minutes , remaining_seconds : remaining_seconds });
        // ==> Main Times
        var app_hours = $scope.application_data_object.settings.time_settings.hours * 60
        var app_minutes = $scope.application_data_object.settings.time_settings.minutes
        var app_seconds = parseInt(($scope.application_data_object.settings.time_settings.seconds > 60 ) ?  $scope.application_data_object.settings.time_settings.seconds / 60 : 0  );
        // console.log({app_hours : app_hours , app_minutes : app_minutes , app_seconds : app_seconds });

        // ==> Calculated the-usage times
        var usage_hours =  Math.round(app_hours - remaining_hours);
        var usage_minutes = Math.round ( app_minutes - remaining_minutes);
        var usage_seconds = Math.round ( app_seconds - remaining_seconds);

        var usage_times = usage_hours + usage_minutes  + usage_seconds;
        $('.time-status').html("Completed in : "+usage_times+" minute(s)");
       }
     };
     // quiz_timer();
     $scope.slide_screens_index = function (index){
       if(index > $scope.__player_object.questions.length )
        $scope.curren_question_slide = $scope.__player_object.questions.length;
         else
         $scope.curren_question_slide = parseInt(index) ;

         // calculation
         if($scope.__player_object.settings.progression_bar.is_available == true && $scope.__player_object.settings.progression_bar.progression_bar_layout == 0 ){
           var calc = $scope.curren_question_slide * 100 /  $scope.__player_object.questions.length ;
            $('.progress-highlighted').css({width: calc + '%'})
         }
     };

     // ==> time layouts
     $scope.time_tracker_layout = function(){
       var layout_template = $scope.__player_object.settings.time_settings.timer_layout;
       return '/time-layouts/layout-'+layout_template+'.hbs';
     };
     // ==> progression layouts
     $scope.progression_layout = function(){
       var layout_template = $scope.__player_object.settings.progression_bar.progression_bar_layout;
       return '/progressbar-layouts/layout-'+layout_template+'.hbs';
     };
     // => Api urls
     $scope.url_attendee_draft = $scope.server_ip + 'api/application/user_status/' + $scope.application_id;
     $scope.url_attendee_draft_get = $scope.server_ip + 'api/application/user_status/' + $scope.application_id + '/get';
     $scope.url_attendee_draft_get_attendee =$scope.server_ip + 'api/application/user_status/' + $scope.application_id + '/get/' +$scope.user_id;
     $scope.url_report_add = $scope.server_ip + 'api/'+ $scope.application_id  +'/report/add';
     $scope.url_attend_quiz = $scope.server_ip + 'api/'+ $scope.application_id  +'/add/attended/quiz';

     $scope.callback_question_id = function (object){
       if($scope.current_question == null )
        return false

       return object.question_id == $scope.current_question ;
     };
     $scope.callback_correct_answer = function (object){
       return object.is_correct == true ;
     };
     $scope.fill_with_labels = function (){
       // => Loading Answer labels
       $(".question-list").each(function(){
      $(this).children('li').each(function(i){
        // => Answers
        $(this).find('label.labels').html($scope.labels[i].toUpperCase())

          });
        });
        // => Loading Question Labels
        $('.question-container').each(function(i){
          $(this).children('.question-body').find('.qs-numericals').html(i + 1 );
        });

     };

     $scope.load_attendee_application = function (){
       try {


           $.getJSON( $scope.json_source , function (keys_object){
             $http({
               url : settings.server_ip + 'api/'+$scope.application_id+'/application/retrieve' ,
               type : "GET" ,
               headers: {
                 "X-api-keys": keys_object.API_KEY,
                 "X-api-app-name": keys_object.APP_NAME
               }
             }).then(function (resps){
               // ==> unchanged value
                $scope.application_data_object = resps.data ;
                $scope.__player_object = resps.data ;
                // ==> time tracker
                $scope.quiz_time_tracker =
                ($scope.__player_object.settings.time_settings.timer_type == true ) ?
                $scope.__player_object.settings.time_settings.value + ':00:00' :
                $scope.__player_object.settings.time_settings.value + ':00';

                // => time tacker (time)
                $scope.collected_time_vals = Math.round( ( $scope.__player_object.settings.time_settings.hours * 60 ) + ( ( $scope.__player_object.settings.time_settings.seconds> 60 ) ?   $scope.__player_object.settings.time_settings.seconds  / 60 : 0 ) + $scope.__player_object.settings.time_settings.minutes ) ;


                if($scope.attendee_draft == null || $scope.attendee_draft.att_draft == undefined ) {
                  $scope.seconds = $scope.__player_object.settings.time_settings.seconds ;
                  $scope.minutes = $scope.__player_object.settings.time_settings.minutes ;
                  $scope.hours = $scope.__player_object.settings.time_settings.hours ;
                }else {
                  var attendee_app =  $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
                  if ( attendee_app.is_loaded == undefined   )
                      {
                        $scope.seconds = $scope.__player_object.settings.time_settings.seconds ;
                        $scope.minutes = $scope.__player_object.settings.time_settings.minutes ;
                        $scope.hours = $scope.__player_object.settings.time_settings.hours ;
                      }
                }




                if($scope.__player_object.app_type == 1 ){ // => Quiz type
                  var all_questions = $scope.__player_object.questions ;

                  for (var i = 0; i < all_questions.length; i++) {
                     var this_question = all_questions[i];
                     var status_object = new Object();
                     // 1 -> check about count of answers
                          // A => only these question type is 0 - 1
                          if(this_question.question_type == 0 || this_question.question_type == 1 ){
                            if(this_question.answers_format.length < 3 ){
                              status_object['question_id'] = this_question._id ;
                              status_object['question_number'] = i + 1 ;
                              status_object['note_message'] = 0 ;
                              $scope.application_status.push(status_object);
                            }
                          }
                     // 2 -> check about correct answer is available or not
                        // for all questions
                        var answers = this_question.answers_format ;
                        if (answers.findIndex($scope.callback_correct_answer) == -1) {
                          status_object['question_id'] = this_question._id ;
                          status_object['question_number'] = i + 1 ;
                          status_object['note_message'] = 1;
                          $scope.application_status.push(status_object);
                        }


                  }
                }

             } , function (err){
                  console.log(err);
             });
           }); // End JSON
       } catch (e) {

       }
     };
     $scope.load_application_draft = function (){
       try {

            // $scope.attendee_draft
            $http({
              method : "POST" ,
              url : $scope.url_attendee_draft_get ,
              headers : {
                    "Content-Type":"application/json"
              } ,
              data : {
                user_id : $scope.user_id
              }
            }).then((res)=>{
              $scope.attendee_draft = res.data;

              if($scope.attendee_draft.att_draft != undefined)
              $scope.this_attendee_draft = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
            } , (err)=>{
              console.log(err);
            });
       } catch (e) {

       }
     }
     $scope.classes_for_this_answer = function (quiz_settings , question_id , answer_id ){
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

          if(thisQuestion != undefined)
            {

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
                 }else {
                   // =>> check if it else show the selected answer
                   classes += ' selected_answer';
                 }
                }
                // => some out cases !!
            }

        }

        // console.log(classes);

        // => selected answer
        // question_id
          return classes ;
     };





     $scope.go_to_next_question = () => {
       $timeout( () => {
         $scope.slide_screens.slideNext();
         $timeout(function (){
           $scope.slide_screens_index($scope.slide_screens.activeIndex);
         } , 80);
       } , 1500 );
     }
     $scope.store_into_attendee_draft = ( object , is_single = null ) => {

       var application_object = new Object()
       if (  $scope.attendee_draft != null && $scope.attendee_draft.application_id != undefined){
         // ==> application already exists
         if($scope.attendee_draft.application_id != undefined || $scope.attendee_draft.application_id != null){
            // => dont change anything here !
         }


         var findAttendeeIndex = $scope.attendee_draft.att_draft.findIndex(x => x.user_id == object.user_id);
         var findAttendee = $scope.attendee_draft.att_draft.find(x => x.user_id == object.user_id);
         if(findAttendeeIndex != - 1){
            // ==> attendee already exists
            var attendeeInfo = $scope.attendee_draft.att_draft[findAttendeeIndex];
            if(attendeeInfo.questions_data == undefined )
              attendeeInfo.questions_data = new Array();
            var findQuestionIndex = attendeeInfo.questions_data.findIndex(x => x.question_id == object.question_id);
            var findQuestion = attendeeInfo.questions_data.find(x => x.question_id == object.question_id);
            if(findQuestionIndex == -1){ // question doesn't exits
              //=> Add new question with his answers
              attendeeInfo.questions_data.push({
                question_id : object.question_id ,
                question_index : $scope.slide_screens.activeIndex - 1,
                question_type : object.question.question_type,
                question_text : object.question.question_body,
                answer_ids : new Array({answer_id : object.answer_id , is_correct : object.is_correct , answer_object : object.answer , answer_index : object.answer_index }) ,
                correct_answers : new Array() ,
                updated_date : new Date()
              });
            // ==> add correct answer array
             var correct_answer_args = attendeeInfo.questions_data[attendeeInfo.questions_data.length-1].correct_answers ;
             for (var i = 0; i < object.question.answers_format.length; i++) {
                  if(object.question.answers_format[i].is_correct == true){
                   //  console.log({"123":$scope.attendee_draft.att_draft[cnt]});
                    correct_answer_args.push(object.question.answers_format[i]._id);
                  }
                }

            }else {
              // question already exists
              var findAnswer = findQuestion.answer_ids.find(x => x.answer_id == object.answer_id);
              var findAnswerIndex = findQuestion.answer_ids.findIndex(x => x.answer_id == object.answer_id);
              if(findAnswerIndex == -1 ){ // => answer not found
                // => push this answer
                findQuestion.answer_ids.push({
                    answer_id : object.answer_id , is_correct : object.is_correct , answer_object : object.answer , answer_index : object.answer_index
                });
              }else { // => answer already exists
                // => Remove it
                findQuestion.answer_ids.splice(findAnswerIndex, 1);
              }
            }
         }else {

          //  alert(findAttendeeIndex);
            // ==> attendee doesn't exists
            // => Apply first impression rule ( store it for only one time => first time )
            $scope.attendee_draft.att_draft.push({
              user_id: object.user_id ,
              user_info : object.user_id ,
              is_completed : false ,
              questions_data : new Array(),
              impr_application_object : $scope.__player_object
            });

          var currentAttendee = $scope.attendee_draft.att_draft[$scope.attendee_draft.att_draft.length-1];
          currentAttendee.questions_data.push({
            question_id : object.question_id ,
            question_index : $scope.slide_screens.activeIndex - 1,
            question_type : object.question.question_type,
            question_text : object.question.question_body,
            answer_ids : new Array({answer_id : object.answer_id , is_correct : object.is_correct , answer_object : object.answer , answer_index : object.answer_index }) ,
            correct_answers : new Array() ,
            updated_date : new Date()
          });

          var correctAnswer = currentAttendee.questions_data[currentAttendee.questions_data.length-1].correct_answers;
          for (var i = 0; i < object.question.answers_format.length; i++) {
               if(object.question.answers_format[i].is_correct == true){
                //  console.log({"123":$scope.attendee_draft.att_draft[cnt]});
                 correctAnswer.push(object.question.answers_format[i]._id);
               }
             }
         }
       } else { // first time store/register app into scope object !

         // Add new application into attendee_draft
         application_object['application_id'] = object.app_id;
         application_object['questionnaire_info']  = object.app_id;
         application_object['att_draft'] = new Array();
         application_object['created_at'] = new Date();
         // ==> Attendee data
         application_object['att_draft'].push({
           is_loaded : true ,
           start_expiration_time : new Date(),
           user_id: object.user_id ,
           user_info : object.user_id ,
           is_completed : false ,
           questions_data : new Array(),
           impr_application_object : $scope.__player_object

         });
         // ===> Question data
         application_object.att_draft[0].questions_data.push({
           question_id : object.question_id ,
           question_index : $scope.slide_screens.activeIndex - 1,
           question_type : object.question.question_type,
           question_text : object.question.question_body,
           answer_ids : new Array({answer_id : object.answer_id , is_correct : object.is_correct , answer_object : object.answer , answer_index : object.answer_index }) ,
           correct_answers : new Array() ,
           updated_date : new Date()
         });
         // ===> answer data
        var correct_lst = application_object.att_draft[0].questions_data[0].correct_answers;
        for (var i = 0; i < object.question.answers_format.length; i++) {
             if(object.question.answers_format[i].is_correct == true){
              //  console.log({"123":$scope.attendee_draft.att_draft[cnt]});
               correct_lst.push(object.question.answers_format[i]._id);
             }
           }

          $scope.attendee_draft = application_object ;
       }

      //------------------------------------------------------------------
      // ============>>> Databases proccess
      //------------------------------------------------------------------

      try {
        $.getJSON( $scope.server_ip + settings.json_source , (api_key) => {
          // ==> ATTENDEE DRAFT COLLECTION ===========>>>>>============>>>>
          $http({
              url : $scope.url_attendee_draft ,
              method : "POST" ,
              data : {
                app_id : object.app_id ,
                user_id : object.user_id ,
                application_fields : $scope.attendee_draft
              } ,
              headers : {
                "Content-Type":"application/json"
              }
            }).then(function(respData){
              // console.log({"Successed" : respData});
            } , function(err){
              console.log(err);
            });
          // ==> REPORT COLLECTION ===================>>>>>============>>>>

        });
      } catch (e) {

      }

     }; // => END ----------------------
     $scope.select_this_answer = ( questionId , answerId , question , answer , app_id , user_id , is_correct , answerIndex) => {


       $('.warning_case').css({display:'none'});
        // ==> Consider the followings :-
        // => Make sure from require qs option
        // -------------------------------------------------------
        // Givens ======= *****
        // => consider ( show results per qs setting ) => ?
        var show_results_setting =  ( $scope.__player_object.settings != undefined ) ? $scope.__player_object.settings.show_results_per_qs : false ;
        // => consider ( review setting )
        var review_setting =  ( $scope.__player_object.settings != undefined ) ? $scope.__player_object.settings.review_setting : false ;
        // => consider ( multi answers  )
        var is_single_choice_setting = ( question.answer_settings.single_choice != undefined) ?  question.answer_settings.single_choice : true ;
        // => consider auto slide when answer select if it only single answer
        var auto_slide_setting = ( $scope.__player_object.settings != undefined ) ? $scope.__player_object.settings.auto_slide : false ;

        // =>> Vars
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
        }
        // ---------------------------------------------
        // ==> Scenario theater => do an action right now !
        // ---------------------------------------------

        // A ===> Main action ( Highlited question with animation )
            // => some cases in this action

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

            // console.log($scope.attendee_draft);

     }; // => Select answers here

     $scope.load_case_many_answer_option = (question_type , is_single_choice ) => {
       var classes = '';
       if((question_type == 0 || question_type == 1 ) && is_single_choice == false )
        classes = 'case_many_answers question_type_texts_qs_brd';
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
     $scope.load_this_slider = function (){
       // { allowTouchMove : $scope.__player_object.settings.allow_touch_move  }
       $scope.slide_screens = new Swiper('.swiper-container') ;

     };
     $scope.start_this_quiz = function (){
       $scope.quiz_timer();
       // Slide to next slide
       $scope.slide_screens.slideNext();
       $timeout(function (){
         $scope.slide_screens_index($scope.slide_screens.activeIndex);
       } , 80);

       // delete this slide
      //  $timeout(function(){
      //    $('.welcoming-screen-x').remove();
      //     $scope.slide_screens.slideTo( 0 );
      //  } , 500);
     };
     $scope.resume_quiz_next_unsolved_question = function (){
       $scope.quiz_timer();
       var app_questions = $scope.__player_object.questions;
       var me = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);

       var solved_questions = me.questions_data ; // .question_id
       var unsolved = app_questions.find_unsolved_questions(solved_questions);

       if(unsolved != undefined && unsolved.length >= 1) {
         var thisIndex = app_questions.findIndex(x => x._id == unsolved[0]._id );
         $scope.slide_screens.slideTo( thisIndex + 1);
         $timeout(function (){

           $scope.slide_screens_index($scope.slide_screens.activeIndex);
           return false ;
         } , 80);
       }

       if($scope.slide_screens.activeIndex != app_questions.length)
        $scope.slide_screens.slideTo( app_questions.length + 1 )
     };
     $scope.go_to_not_attended_question = function(){
        var app_questions = $scope.__player_object.questions;
        if($scope.attendee_draft.error == undefined ){
            var me = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);

            var solved_questions = me.questions_data ; // .question_id
            var unsolved = app_questions.find_unsolved_questions(solved_questions);

            if(unsolved != undefined && unsolved.length >= 1) {
              var thisIndex = app_questions.findIndex(x => x._id == unsolved[0]._id );
              $scope.slide_screens.slideTo( thisIndex +1 );
              $timeout(function (){
                $scope.slide_screens_index($scope.slide_screens.activeIndex);
              } , 80);
            }
        }
     };

     $scope.back_to_prev_slider = function (){

       $scope.slide_screens.slidePrev();
       $timeout(function (){
         $scope.slide_screens_index($scope.slide_screens.activeIndex);
       } , 80);

     };
     $scope.go_to_next_slider = function (  QSindex , warning_case = null ){
       if(warning_case == true && QSindex == ($scope.__player_object.questions.length - 1 ) ){
         if($scope.warning_for_not_attended_question() == false )
          return false ;
       }


      //  if($scope.__player_object.questions.length != $scope.attendee_draft.)
       $scope.slide_screens.slideNext();
       $timeout(function (){
         $scope.slide_screens_index($scope.slide_screens.activeIndex);
       } , 80);

     };

     $scope.continue_to_next_slider = function (){
       //  $scope.user_id ; // $scope.url_report_add // $scope.application_id  ;

       // => Build Data According to question type
       var attendee_results = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id );
       var attendee_index = $scope.attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id );
       var dt = $scope.attendee_draft.att_draft[attendee_index].questions_data[$scope.attendee_draft.att_draft[attendee_index].questions_data.length - 1] ;
       var dAnswers = [];
       for (var i = 0; i < dt.answer_ids.length; i++) {
          dAnswers.push(dt.answer_ids[i].answer_id)
       }
       var question_data = {
          answer_ids : dAnswers ,
          question_id : dt.question_id ,
          attendee_id : $scope.user_id
       };

       // => Save into report
       try {
         $.getJSON($scope.json_source , (api_keys) => {
            $http({
              method : "POST" ,
              url : $scope.url_report_add ,
              data : question_data ,
              headers : {
                  "X-api-app-name" : api_keys.APP_NAME ,
                  "X-api-keys":api_keys.API_KEY
              }
            }).then((res)=>{
              // console.log(res.data);
            } , (err)=>{
               console.log(err);
            });
         });
       } catch (e) {

       }
       // => Next Question
       $scope.slide_screens.slideNext();
       $timeout(function (){
         $scope.slide_screens_index($scope.slide_screens.activeIndex);
       } , 80);
     }
     $scope.back_to_quizzes = function (){
       return window.location.href = settings.server_ip + "quizzes";
     };
     $scope.load_attendee_application();




     $timeout(function (){
       $scope.load_this_slider();
     }, 1000);


     $scope.load_application_draft();
     $timeout(function(){
        // => check if thi quiz is loaded or closed by attendee
      if($scope.attendee_draft != null || $scope.attendee_draft.error == null ){
        var attendee_app =  $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
        if( attendee_app.is_loaded != undefined && attendee_app.is_loaded ){
           $scope.__player_object = attendee_app.impr_application_object ;
           // => Store the stopwatch
           $scope.seconds = $scope.__player_object.settings.time_settings.seconds ;
           $scope.minutes = $scope.__player_object.settings.time_settings.minutes ;
           $scope.hours = $scope.__player_object.settings.time_settings.hours ;

           if(attendee_app.is_completed == true ){
             var lastIndex = $(".quiz-contents").children('.swiper-slide').length ;

             // 1- ==> Move to last slide
             $scope.slide_screens.slideTo(lastIndex - 1);

             // 2- ==> Disable swip slider
             $scope.slide_screens.allowSlidePrev = false ;
             $scope.slide_screens.allowSlideNext = false ;
             $scope.slide_screens.noSwiping = false ;

             // 3- ==> Fill the progress bar
             if($scope.__player_object.settings.progression_bar.is_available)
             $('.progress-highlighted').css({width:'100%'});

             // 4- ==> Fill the question numbers
             if($scope.__player_object.settings.progression_bar.is_available)
              $scope.curren_question_slide = $scope.__player_object.questions.length;

             // 5- ==> Disable time ()
             $scope.calculate_usage_time ();

             return false ;
           }

           // => apply (inform not) about expiration date
           if( $scope.__player_object.settings.expiration.is_set ){ // => This quiz support expiration date
             var expiration_object = $scope.__player_object.settings.expiration ;
             // ==> check if this quiz is expired or not
             var expire_during_this_time = parseInt(expiration_object.through_time);
             var started_at = new Date(attendee_app.start_expiration_time).getTime() ;
             var date_now = new Date().getTime() ;
             var time_diff = Math.round(date_now - started_at);
             var days = Math.round(time_diff / ( 1000 * parseInt(60*60*24) ));
             if(days > expire_during_this_time ){
                // stop the slide
                $('.quiz-contents').remove(function(){
                  $('expired_message').css({display:'block'})
                });
             }else {
               /*
                  var tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
               */
               var attendee_app =  $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
               var expiration_object = $scope.__player_object.settings.expiration ;
               var expire_during_this_time = parseInt(expiration_object.through_time);
               var started_at = new Date(attendee_app.start_expiration_time)
               var roughly_date =  started_at.setDate(started_at.getDate() + expire_during_this_time);

               var date_now = new Date().getTime() ;
               var time_diff = Math.round(roughly_date - date_now  );
               var days = Math.round(time_diff / ( 1000 * parseInt(60*60*24) ));

               $scope.is_resume = {
                  status : true ,
                  expire_message :   expiration_object.title ,
                  through_timed : expire_during_this_time ,
                  through_date : {
                    after : days ,
                    in : new Date(roughly_date)
                  }
               };


             }
             // ==> Add new slide show the expiration date
           }else {

             $scope.is_resume = {
                status : false
             };
           }
           // => load the impr_application_object ( quiz object )
           // => Get the-index of unsolved question
           // => Go to this question
           // => Some cases ---
              // A ) Case all questions are solved => get submit slide
              // B ) Case there is no anquestions solved ( show it from first qs ) => hide the ( start screen )
              // C ) Case we've many random unsolved questions ( => go to first unsolved question )
        }
       }
       $scope.slide_screens.allowTouchMove = $scope.__player_object.settings.allow_touch_move ;



     } , 1500 );



     $timeout(function(){
       $scope.fill_with_labels();
       $('.loading-player').fadeOut();
     } , 1700);
  }]);
