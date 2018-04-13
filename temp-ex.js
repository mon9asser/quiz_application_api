// object ==>
  /*
    question_id
    answer_id
    question
    answer
    app_id
    user_id
    is_correct
    answer_index
  */

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
        //  console.log("Found Attendee !");
          // ==> attendee already exists
          var attendeeInfo = $scope.attendee_draft.att_draft[findAttendeeIndex];
          if(attendeeInfo.questions_data == undefined )
            attendeeInfo.questions_data = new Array();
          var findQuestionIndex = attendeeInfo.questions_data.findIndex(x => x.question_id == object.question_id);
          var findQuestion = attendeeInfo.questions_data.find(x => x.question_id == object.question_id);
          if(findQuestionIndex == -1){ // question doesn't exits
            //=> Add new question with his answers
            try {
              attendeeInfo.questions_data.push({
                question_id : object.question_id ,
                question_index : $scope.slide_screens.activeIndex - 1,
                question_type : object.question.question_type,
                question_text : object.question.question_body,
                answer_ids : new Array({answer_id : object.answer_id , is_correct : object.is_correct , answer_object : object.answer , answer_index : object.answer_index }) ,
                correct_answers : new Array() ,
                updated_date : new Date()
              });
            } catch (e) {

            }
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
        //  console.log("unfound Attendee !");

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
        try {
          currentAttendee.questions_data.push({
            question_id : object.question_id ,
            question_index : $scope.slide_screens.activeIndex - 1,
            question_type : object.question.question_type,
            question_text : object.question.question_body,
            answer_ids : new Array({answer_id : object.answer_id , is_correct : object.is_correct , answer_object : object.answer , answer_index : object.answer_index }) ,
            correct_answers : new Array() ,
            updated_date : new Date()
          });
        } catch (e) {

        }

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
       try {
         application_object.att_draft[0].questions_data.push({
           question_id : object.question_id ,
           question_index : $scope.slide_screens.activeIndex - 1,
           question_type : object.question.question_type,
           question_text : object.question.question_body,
           answer_ids : new Array({answer_id : object.answer_id , is_correct : object.is_correct , answer_object : object.answer , answer_index : object.answer_index }) ,
           correct_answers : new Array() ,
           updated_date : new Date()
         });
       } catch (e) {

       }
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
        try {
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
        } catch (e) {

        }
        // ==> REPORT COLLECTION ===================>>>>>============>>>>
        // console.log($scope.attendee_draft.att_draft);
};
