
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
     $scope.attendee_draft = new Array();
     $scope.current_question = null ;
     $scope.slide_screens = null ;

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
     $scope.select_this_answer = function (questionId , answerId , question , answers , app_id , user_id){

        var is_single_choice = question.answer_settings.single_choice ;
        var answer_id = answerId ;

        $scope.current_question = questionId ;
        var index = $scope.attendee_draft.findIndex($scope.callback_question_id)
        if( index == -1 ){ // => first time to store it
          $scope.attendee_draft.push({
            application_id : app_id  , // under progression
            user_id : user_id , // under progression
            question_id : $scope.current_question ,
            answer_ids : new Array (answer_id) ,
            correct_answers : new Array() ,
            is_completed : false ,
            updated_date : new Date ()
          });

          // => storing correct answers
          for (var i = 0; i < question.answers_format.length; i++) {
            if(question.answers_format[i].is_correct == true)
              $scope.attendee_draft.find($scope.callback_question_id).correct_answers.push(question.answers_format[i]._id)
          }

        }else { // => Update question answers !
          if( !is_single_choice ) {
              var currAnswer = $scope.attendee_draft[index].answer_ids.indexOf(answer_id);
              if(currAnswer == -1 ){ // add new answer
                $scope.attendee_draft[index].answer_ids.push(answer_id);
              }
          }
        }

        var next_question_index = $scope.attendee_draft.length + 1 ;
        console.log($scope.attendee_draft);
        // => Go to next slide { Case it only one answer }
        if( is_single_choice ) {
          $scope.continue_to_next_slider();
        }
     };
     $scope.load_this_slider = function (){
       $scope.slide_screens = new Swiper('.swiper-container');
     };
     $scope.start_this_quiz = function (){
       $scope.slide_screens.slideNext();
     };
     $scope.continue_to_next_slider = function (){
       $scope.start_this_quiz();
     }
     $scope.back_to_quizzes = function (){
       return window.location.href = settings.server_ip + "quizzes";
     };
     $scope.load_attendee_application();
     $timeout(function (){
       $scope.load_this_slider();
     }, 1000);



     $timeout(function(){
      //  console.log("ISSUES");
      console.log($scope.application_status);
       $scope.fill_with_labels ();
     } , 1000 );
  }]);
