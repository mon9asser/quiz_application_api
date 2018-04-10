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
     $scope.slider_options = {
       allowSlidePrev : true ,
       allowSlideNext : true ,
       noSwiping : true
     };
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
    $scope.url_main_application_get = settings.server_ip + 'api/'+$scope.application_id+'/application/retrieve';
    $scope.url_attendee_draft = $scope.server_ip + 'api/application/user_status/' + $scope.application_id;
    $scope.url_attend_quiz = $scope.server_ip + 'api/'+ $scope.application_id  +'/add/attended/quiz';
    $scope.url_attendee_report = $scope.server_ip + "api/"+ $scope.application_id + "/retrieve/"+$scope.user_id+"/quiz/details";

    // alert($scope.url_attendee_report);
    // ====> Scope functionalities
    $scope.load_attendee_report = () => {

      $http({
        headers : $scope.api_key_headers ,
        method : "GET" ,
        url : $scope.url_attendee_report
      }).then(function(resp){
        $scope.__report_object = resp.data ;
        console.log($scope.__report_object);

      } , function(res){
        console.log(res);
      });

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


      } , function(err){console.log(err);})
    }
    $scope.fill_with_labels = () => {
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
           console.log("Found Attendee !");
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
           console.log("unfound Attendee !");

          //  alert(findAttendeeIndex);
            // ==> attendee doesn't exists
            // => Apply first impression rule ( store it for only one time => first time )
            $scope.attendee_draft.att_draft.push({
              user_id: object.user_id ,
              user_info : object.user_id ,
              is_loaded : true ,
              start_expiration_time : new Date(),
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
          if(application_object.att_draft != undefined )
             $scope.this_attendee_draft = application_object.att_draft.find(x => x.user_id == $scope.user_id);
       }

      //------------------------------------------------------------------
      // ============>>> Databases proccess
      //------------------------------------------------------------------


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
          console.log($scope.attendee_draft.att_draft);
      };
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


        console.log({sotred_object : stored_object});
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

              if($scope.is_submitted)
                $scope.fill_unsolved_question_counts();
                else
                $('.warning_case').css({display:'none'});
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
    $scope.slide_screens_index = function (index){
                // calculation
                if($scope.__player_object.settings.progression_bar.is_available == true && $scope.__player_object.settings.progression_bar.progression_bar_layout == 0 ){
                  var calc = $scope.curren_question_slide * 100 /  $scope.__player_object.questions.length ;
                   $('.progress-highlighted').css({width: calc + '%'})
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
    $scope.start_this_quiz = () => {
      $scope.slide_screens.slideNext();

    }
    $scope.back_to_prev_slider = () => {
      $scope.slide_screens.slidePrev();
    }
    $scope.go_to_next_slider = () => {
      $scope.slide_screens.slideNext();
    }
    $scope.go_to_next_question = () => {
      $timeout(function(){
        $scope.slide_screens.slideNext();
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
      var app_questions = $scope.__player_object.questions;
      var me = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);

      var solved_questions = me.questions_data ;
      var unsolved = app_questions.find_unsolved_questions(solved_questions);

      if(unsolved != undefined && unsolved.length >= 1) {
        var thisIndex = app_questions.findIndex(x => x._id == unsolved[0]._id );
        $scope.slide_screens.slideTo( thisIndex + 1);
      }

      if(unsolved == undefined || unsolved.length == 0 ) {
        $scope.slide_screens.slideTo( app_questions.length + 1);
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
        $scope.slide_screens.slideTo(1);
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
          $scope.slide_screens.slideTo(target_slider_index + 1);
      }
    };
    $scope.submit_quiz_into_a_report = () => {
      $('.loading-results').html('<b>loading results ...</b>');
      $scope.this_attendee_draft = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
      // alert($scope.this_attendee_draft);
      console.log({'val-1':$scope.this_attendee_draft});
      return $http({
         url : $scope.url_attend_quiz ,
         method: "POST",
         data : { "attendee_object" : $scope.this_attendee_draft } ,
         headers : $scope.api_key_headers
      }).then(function(resp){
        $http({method:'PATCH' , url : $scope.server_ip+"api/"+$scope.application_id+"/update/status" , data : {user_id:$scope.user_id}}).then((d)=>{
                $scope.load_attendee_report();
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
    $scope.submit_quiz_into_report = () => {
      $scope.is_submitted = true ;
      var submit_icon = $('.fac-icon-submit');
      if(submit_icon.hasClass('fa-arrow-right')) {
            submit_icon.removeClass('fa-arrow-right');
            submit_icon.addClass('fa-spinner fa-spin');

            submit_icon.next('span').html('Submitting Quiz ...');
        }else
      return false ;

      if( $scope.show_warning_unsolved_question() == false ){
        if(submit_icon.hasClass('fa-spinner')){
            submit_icon.removeClass('fa-spinner fa-spin');
            submit_icon.addClass('fa-arrow-right');
            submit_icon.next('span').html('Submit Quiz');
        }
        return false ;
      }

      // ====================================
      // =============>>>> Submit the Report
      // ====================================
      if ( $scope.submit_quiz_into_a_report() == false )
        {
          if(submit_icon.hasClass('fa-spinner')){
              submit_icon.removeClass('fa-spinner fa-spin');
              submit_icon.addClass('fa-arrow-right');
              submit_icon.next('span').html('Submit Quiz');
          }

          $(".warning_case").html("Your internet connection is very slow , please try later");
          $(".warning_case").addClass('warning_case_internet_connection');
          return false ;
        }
      if(submit_icon.hasClass('fa-spinner')){
          submit_icon.removeClass('fa-spinner fa-spin');
          submit_icon.addClass('fa-arrow-right');
          submit_icon.next('span').html('Submit Quiz');
      }
      $scope.slide_screens.slideNext();
    }
    // ====> Scope Do An Actions
    $scope.load_application_draft();

    $scope.load_application_json_file();


    // ====> Do An Actions through time
    $timeout(function (){ // => time is 50
        console.log($scope.api_key_headers);
        $scope.load_main_attendee_application();
        $scope.load_attendee_report();
    } , 650 );
    $timeout(function () { // => time is 150
      // ====================== Delete this lines
      console.log("------Report w Player objects --------");
      console.log($scope.__player_object);
      console.log($scope.__report_object);

      $scope.slide_screens = new Swiper('.swiper-container') ;
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

      });
    }, 1200);


    //=====> Load window objects
    $scope.window_object.on("load" , function (){
      $timeout(function(){

        if($scope.attendee_draft != null && $scope.attendee_draft.att_draft != undefined ){
          var userIndex = $scope.attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id);
          if(userIndex != -1 ){
            var user = $scope.attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
             console.log({this_attendee:$scope.this_attendee_draft ,user:user});
            // ==> Load the navigation status
            if(user.is_loaded != undefined && user.is_loaded){
              $scope.__player_object = user.impr_application_object;
            }else {
              // alert("Unloaded Page");
            } // End load navigation status

           if ( user.is_completed ) {
             $scope.quiz_status = 3;
             $scope.slide_screens.allowSlidePrev = false ;
             $scope.slide_screens.allowSlideNext = false ;
             $scope.slide_screens.noSwiping = false ;
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
      $scope.fill_with_labels();
      $('.loading-player').fadeOut();
    } , 2000);




  } // => end controller functionality
]);
