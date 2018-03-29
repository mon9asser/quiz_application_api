
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
        iframe_size.width = "100%";
        iframe_size.height = "130px" ;
      }else {
        video_mp4 = new Object();
        video_mp4['mp4_url'] =  media_object.media_field+'.mp4';
        video_mp4['ogg_url'] =  media_object.media_field+'.ogg';
        iframe_size = new Object();
        iframe_size.width = "100%";
        iframe_size.height = "130px" ;
      }
      switch (media_object.media_type) {
        case 1:
          if( media_object.video_type == 0 ){
            embed_video = "<iframe width='"+iframe_size.width+"' height='"+iframe_size.height+"' src='"+video_path+"' ></iframe>";
          }
          if( media_object.video_type == 1 ){
            embed_video = "<iframe width='"+iframe_size.width+"' height='"+iframe_size.height+"' src='"+video_path+"' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
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
attendeeApp.controller('players' , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings',
  function ($scope, $rootScope, $timeout , $http , settings ){
     // => Scopes
     $scope.user_id = $("#userId").val();
     $scope.application_id = $("#appId").val();
     $scope.server_ip = settings.server_ip ;
     $scope.json_source = settings.server_ip + settings.json_source;
     $scope.labels = [  'a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
     $scope.application_status = [] ;
     $scope.app_screens = null ;
     $scope.__player_object = null ;
     $scope.__report_object = null ;
     $scope.attendee_draft = new Object();
     $scope.current_question = null ;
     $scope.slide_screens = null ;

     // => Api urls
     $scope.url_attendee_draft = $scope.server_ip + 'api/application/user_status/' + $scope.application_id
     $scope.url_attendee_draft_get = $scope.server_ip + 'api/application/user_status/' + $scope.application_id + '/get'
     $scope.url_attendee_draft_get_attendee =$scope.server_ip + 'api/application/user_status/' + $scope.application_id + '/get/' +$scope.user_id;
     $scope.url_report_add = $scope.server_ip + 'api/'+ $scope.application_id  +'/report/add';

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
         })
       });
       // => Loading Question Labels
       $('.question-container').each(function(i){
         $(this).children('.question-body').find('.label-question').html(i + 1 );
       })
     };
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
     };
     $scope.load_attendee_draft = function (){
        // $scope.attendee_draft
        $http({
          method : "GET" ,
          url : $scope.url_attendee_draft_get_attendee ,
          headers : {
                "Content-Type":"application/json"
          }
        }).then((res)=>{
          $scope.attendee_draft = res.data ;
        } , (err)=>{
          console.log(err);
        });
     }

     $scope.classes_for_this_answer = function (quiz_settings , question_id){
        var classes = '';
        // => Two blocks per row or else
        if(quiz_settings.choice_style)
          classes += 'ng_inline_block';
          else
          classes += 'ng_block';

           console.log($scope.attendee_draft);

        // => selected answer
        // question_id
          return classes ;
     };
     $scope.submit_quiz_into_report = function (){
        //  $scope.user_id ; // $scope.url_report_add // $scope.application_id  ;
        //  $.getJSON($scope.json_source , (api_keys) => {
        //
        //   $http({
        //     method : "GET" ,
        //     url : $scope.url_attendee_draft_get ,
        //     headers : {
        //       "Content-Type":"application/json"
        //     }
        //   }).then(function(resp){
        //       var userInfo = resp.data.att_draft.find(x => x.user_id == $scope.user_id );
        //       var questions = userInfo.questions_data ;
        //       for (var i = 0; i < questions.length; i++) {
        //         var question_object = questions[i] ;
        //
        //         var data = {
        //           attendee_id : $scope.user_id ,
        //           question_id : question_object.question_id,
        //           answer_ids : question_object.answer_ids
        //         };
        //
        //
        //         if(question_object.question_type == 2 )
        //           data['true_false_value'] = false ; // for testing only
        //
        //
        //         $http({
        //           method : "POST" ,
        //           url : $scope.url_report_add ,
        //           data : data ,
        //           headers : {
        //               "X-api-app-name" : api_keys.APP_NAME ,
        //               "X-api-keys":api_keys.API_KEY
        //           }
        //         }).then((resp)=>{
        //           console.log(resp);
        //         } , (err)=>{
        //           console.log(err);
        //         });
        //       }
        //   } , function(err){
        //     console.log(err);
        //   });
        //
        //
        //
        //
        // });
     };
     $scope.select_this_answer = function (questionId , answerId , question , answers , app_id , user_id , is_correct ){
        // given !
        var is_single_choice = question.answer_settings.single_choice ;
        var answer_id = answerId ;
        $scope.current_question = questionId ;
        $scope.user_id =  user_id ;

        $scope.attendee_draft['application_id'] = $scope.__player_object._id;
        $scope.attendee_draft['questionnaire_info'] = $scope.__player_object._id;
        $scope.attendee_draft['application'] =  $scope.__player_object  ;
        $scope.attendee_draft['creation_date'] = new Date();
        if ($scope.attendee_draft.att_draft == undefined )
          $scope.attendee_draft['att_draft'] = new Array() ;

        var attendeeIndex = $scope.attendee_draft.att_draft.findIndex( x => x.user_id ==  user_id );


        if(attendeeIndex == -1 ){ // => Add new
          // => Build attendee information
          $scope.attendee_draft.att_draft.push({
            user_id : user_id ,
            user_info : user_id ,
            is_completed : false ,
            questions_data : new Array()
          });

          // => Push the question data
          var cnt = $scope.attendee_draft.att_draft.length - 1 ;

         if($scope.attendee_draft.att_draft[cnt].questions_data == undefined )
          $scope.attendee_draft.att_draft[cnt].questions_data = new Array ();

          $scope.attendee_draft.att_draft[cnt].questions_data.push({
            question_id : $scope.current_question,
            answer_ids : new Array({answer_id : answer_id , is_correct : is_correct }) ,
            question_index : 0 ,
            question_type : question.question_type ,
            correct_answers : new Array () ,
            updated_date : new Date()
          });

          // => store correct answers here !
          for (var i = 0; i < question.answers_format.length; i++) {
             if(question.answers_format[i].is_correct == true){
              //  console.log({"123":$scope.attendee_draft.att_draft[cnt]});
               $scope.attendee_draft.att_draft[cnt].questions_data.find($scope.callback_question_id).correct_answers.push(question.answers_format[i]._id);

             }
           }
        }else { // => Update the current
          var questionIndex = $scope.attendee_draft.att_draft[attendeeIndex].questions_data.findIndex(x => x.question_id == questionId );
          if(questionIndex == -1){ // => Add New Question
            $scope.attendee_draft.att_draft[attendeeIndex].questions_data.push({
              question_id : $scope.current_question,
              answer_ids : new Array({answer_id : answer_id , is_correct : is_correct }) ,
              question_type : question.question_type ,
              question_index : $scope.attendee_draft.att_draft[attendeeIndex].questions_data.length ,
              correct_answers : new Array () ,
              updated_date : new Date()
            });

            // => store correct answers here !
            var cnt = $scope.attendee_draft.att_draft.length - 1 ;
            for (var i = 0; i < question.answers_format.length; i++) {
               if(question.answers_format[i].is_correct == true)
               {

                 $scope.attendee_draft.att_draft[cnt].questions_data.find($scope.callback_question_id).correct_answers.push(question.answers_format[i]._id);

               }
             }
          }else { // => update ( multi answers inside each question  )
              if( !is_single_choice ) {
                 var answerExists = $scope.attendee_draft.att_draft[attendeeIndex].questions_data[questionIndex].answer_ids.findIndex(x => x.answer_id == answer_id);
                 if(answerExists == -1 ) { // Add this answer into args
                    $scope.attendee_draft.att_draft[attendeeIndex].questions_data[questionIndex].answer_ids.push({
                      answer_id : answer_id , is_correct : is_correct
                    });
                 }else { // => Update current answer value
                    // => we do not need to do that !!
                 }
              }
          }
        }

          console.log($scope.attendee_draft);

        // => Save this question into draft
        $http({
          url : $scope.url_attendee_draft ,
          method : "POST" ,
          data : {
            app_id : app_id ,
            user_id : user_id ,
            application_fields : $scope.attendee_draft
          } ,
          headers : {
            "Content-Type":"application/json"
          }
        }).then(function(respData){
          console.log({"Successed" : respData});
        } , function(err){
          console.log(err);
        });
        console.log($scope.attendee_draft);
     };
     $scope.load_this_slider = function (){
       $scope.slide_screens = new Swiper('.swiper-container');
     };
     $scope.start_this_quiz = function (){
       $scope.slide_screens.slideNext();
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
            console.log(res.data);
          } , (err)=>{
             console.log(err);
          });
       });
       // => Next Question
       $scope.slide_screens.slideNext();
     }
     $scope.back_to_quizzes = function (){
       return window.location.href = settings.server_ip + "quizzes";
     };
     $scope.load_attendee_application();
     $timeout(function (){
       $scope.load_this_slider();
     }, 1000);


     $scope.load_attendee_draft();
     $timeout(function(){
      //  console.log("ISSUES");
      // console.log($scope.application_status);
       $scope.fill_with_labels ();
     } , 1000 );
  }]);
