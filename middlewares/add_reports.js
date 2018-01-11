rptRouters.post("/:app_id/report/add", api_key_reprot_auth , (req , res) => {

  var requests = new Object();
  var required_fields = new Array();
  if(req.body.attendee_id  == null )
    required_fields[required_fields.length]= "attendee_id";
  if(req.body.question_id == null )
    required_fields[required_fields.length] = "question_id";
  if(req.body.answer_ids == null )
    required_fields[required_fields.length]= "`answer_ids` Array"

  var user_id = req.user_id;
  var userType = req.verified_user_type;
  var application_id = req.params.app_id;
  var attendee_id = req.body.attendee_id;


  console.log(userType);
  if (userType != 0) {
      return new Promise( (resolve , reject) => {
        res.send(notes.Warnings.Permission_Warning);
      });
  }

  if(required_fields.length != 0){
      return new Promise( (resolve , reject) => {
        res.send(notes.Messages.Required_Message(required_fields));
      });
    }

  if (user_id != attendee_id  ) {
    return new Promise( (resolve , reject) => {
      res.send(notes.Warnings.Permission_Warning);
    });
  }

  if(!_.isArray(req.body.answer_ids))
  {
    return new Promise( (resolve , reject) => {
      res.send({"Warning":"This field 'answer_ids' should be an array !"});
    });
  }
  var question_id = req.body.question_id ;
  var answer_ids = req.body.answer_ids ;
    qtnr.findById(application_id, (error, qtnrDocument) => {
      if (!qtnrDocument){
            return new Promise((resolve , reject )=>{
              res.send(notes.Errors.Error_Doesnt_exists("Application"));
            });
        }
      var updatedAt = new Date();
      rpt.findOne({ "questionnaire_id" : qtnrDocument._id, "creator_id": qtnrDocument.creator_id} , ( error , rptDocument ) => {
          // ==> Question object in questionnaire
          var index_question = _.findIndex(qtnrDocument.questions , {"id": question_id});
          var find_question  = _.find(qtnrDocument.questions , {"id": question_id});
          if(index_question == -1 ){ // Question
            return new Promise((resolve , reject)=>{
              res.send(notes.Errors.Error_Doesnt_exists("Question"));
            });
          }
          //------------------------------------------------
          var collected_answers = new Object();
          var answer_status = new Object () ;
            answer_status['true_value'] =0;
            answer_status['false_value']=0;
          try { // Answers
            for(var i=0; i < answer_ids.length ; i++ ){
              var answer_id =  answer_ids[i];
              var index_answer = _.findIndex(find_question.answers_format , {"_id":ObjectID(answer_id)});
              var find_answer = _.find(find_question.answers_format , {"_id":ObjectID(answer_id)});
              if(index_answer == -1){
                return new Promise((resolve , reject)=>{
                  res.send(notes.Errors.Error_Doesnt_exists("Answer in index ("+i+")"));
                });
              }else {
                  // #=> Casing 0 - 1
                  collected_answers['answer_id_'+answer_id] = new Object();
                  collected_answers['answer_id_'+answer_id]['answer_id']  = answer_id;
                  if ( find_question.question_type == 0 ||  find_question.question_type == 1 ){
                      collected_answers['answer_id_'+answer_id]['answer_body']  = find_answer ;
                      collected_answers['answer_id_'+answer_id]['is_correct'] = find_answer.is_correct;
                      if(find_answer.is_correct == true)
                      answer_status['true_value']   = answer_status['true_value'] + 1 ;
                      else
                      answer_status['false_value']  = answer_status['false_value'] + 1;
                      collected_answers['is_correct'] = (answer_status['false_value'] == 0 && answer_status['true_value'] != 0) ? true : false ;
                  } else if (find_question.question_type == 2 ) {
                    if (req.body.true_false_value == null) {
                      return new Promise((resolve, reject) => {
                          res.send(notes.Messages.Required_Message("true_false_value"));
                      });
                    }
                    collected_answers['answer_id_'+answer_id]['answer_body']  = {
                        _id:find_answer._id ,
                      true_false_value : req.body.true_false_value ,
                      boolean_type: find_answer.boolean_type,
                      boolean_value:find_answer.boolean_value,
                      is_correct:find_answer.is_correct
                    };
                    collected_answers['is_correct'] = ( req.body.true_false_value == ( (find_answer.boolean_value == "True" && find_answer.boolean_type =="true/false") || (find_answer.boolean_value == "Yes" && find_answer.boolean_type =="yes/no") ) ) ? true : false ;
                  }else if (find_question.question_type == 3 ){
                    if(req.body.rating_scale_value == null ){
                      return new Promise((resolve, reject) => {
                          res.send(notes.Messages.Required_Message("rating_scale_value"));
                      });
                    }
                    collected_answers['answer_id_'+answer_id]['answer_body']  = new Object()
                    collected_answers['answer_id_'+answer_id]['answer_body']['_id'] = find_answer._id ;
                    collected_answers['answer_id_'+answer_id]['answer_body']['step_numbers']=find_answer.step_numbers;
                    collected_answers['answer_id_'+answer_id]['answer_body']['ratscal_type']=find_answer.ratscal_type;
                    if(req.body.rating_scale_value > find_answer.step_numbers ){
                      return new Promise((resolve, reject) => {
                          res.send("'rating_scale_value' should be less than or equal 'step_numbers'");
                      });
                    }
                    collected_answers['answer_id_'+answer_id]['answer_body']['rating_scale_value']=req.body.rating_scale_value;
                    if( find_answer.ratscal_type == 0 ){
                      if ( find_answer.started_at != null )
                      collected_answers['answer_id_'+answer_id]['answer_body']['started_at']=  find_answer.started_at;
                      if ( find_answer.centered_at != null )
                      collected_answers['answer_id_'+answer_id]['answer_body']['centered_at']=   find_answer.centered_at;
                      if ( find_answer.ended_at != null )
                      collected_answers['answer_id_'+answer_id]['answer_body']['ended_at']=  find_answer.ended_at;
                    }


                  }else if (find_question.question_type == 4 ){
                    if(req.body.free_text_value == null ){
                      return new Promise((resolve, reject) => {
                          res.send(notes.Messages.Required_Message("free_text_value"));
                      });
                    }
                    collected_answers['answer_id_'+answer_id]['answer_body']  = new Object();
                    collected_answers['answer_id_'+answer_id]['answer_body']['_id'] = find_answer._id ;
                    collected_answers['answer_id_'+answer_id]['answer_body']['free_text_value'] = req.body.free_text_value ;
                  }

               }
            }

          } catch (e) {
            return new Promise((resolve , reject)=>{
              res.send(notes.Errors.Error_Doesnt_exists("Answer"));
            });
          }

          // ==> Attendee Object
          var attendee_object = new Object();
          attendee_object['_id'] = mongoose.Types.ObjectId();
          attendee_object['attendee_id'] = attendee_id;
          if(qtnrDocument.app_type == 1)
          attendee_object['is_completed'] = false;
          if(qtnrDocument.app_type == 1)
          attendee_object['passed_the_grade'] = false;
          attendee_object['results'] = new Object();
          attendee_object['results']['wrong_answers'] = 0 ;
          attendee_object['results']['correct_answers'] = 0 ;
          attendee_object['results']['count_of_questions'] = 0 ;
          attendee_object['results']['result'] = new Object();
          attendee_object['results']['result']['percentage_value'] = 0 ;
          attendee_object['results']['result']['raw_value'] = 0 ;
          attendee_object['survey_quiz_answers'] = new Array() ;
          attendee_object['created_at'] = new Date();
          attendee_object['updated_at'] = new Date();
          attendee_object['user_information'] = attendee_id;

          // ==> Question & Answer Objects
          var question_answers_object = new Object();
          question_answers_object["question_id"] = question_id ;
          question_answers_object["questions"] = new Object();
          question_answers_object["questions"]["question_id"] = question_id ;
          question_answers_object["questions"]["question_body"] = find_question.question_body ;
          question_answers_object["questions"]["question_type"] = find_question.question_type;
          question_answers_object["answers"] = new Object();
          question_answers_object["answers"]["answer_id"] = answer_ids ;
          question_answers_object["answers"]["answer_body"] = collected_answers;
          if(qtnrDocument.app_type == 1 )
          question_answers_object["is_correct"] = collected_answers.is_correct;

          // => helper object
          var helper = new Object();
          helper['attendee_id'] = attendee_id ;
          // res.send(question_answers_object)
          // return false ;
        if(!rptDocument){
           // create new
           // ==> Main Information
           var report_object = new Object();
           report_object['questionnaire_id']= qtnrDocument._id;
           report_object['questionnaire_info']= qtnrDocument._id;
           report_object['app_type'] = qtnrDocument.app_type;
           report_object['creator_id'] = qtnrDocument.creator_id;
           report_object['attendees'] = new Array();
           report_object['history'] = new Array();
           if(qtnrDocument.app_type == 0)
           report_object['statistics'] = new Array();
           report_object['created_at'] = new Date();
           report_object['updated_at'] = new Date();

           var reporting = new rpt(report_object);
           reporting.save().then((reports)=>{
              // #1 Create Attendees
             return reporting.create_attendees(attendee_object );
           }).then((attendee_arguments)=>{
             // #2 Create Questions and answers
             return reporting.create_survey_quiz_answers(question_answers_object , helper);
           }).then((attendee_user)=>{
             // #3 Calculation Part
             if(qtnrDocument.app_type == 1)
             return reporting.quiz_calculation(attendee_user,qtnrDocument);
           }).then(()=>{
             if(find_question.answer_settings != null ){
               res.send({"Answer_Settings":find_question.answer_settings});
             }else {
               res.send(notes.Errors.Not_Available('answer_settings'))
             }
            //  res.send(answer_settings);
           }).catch((err)=>{
             return new Promise((resolve , reject)=>{
               res.send({
                 error : notes.Errors.General_Error.error ,
                 details : err
               });
             });
           });
        }else {
          // update the exisiting
          rptDocument.updated_at = new Date();
          rptDocument.save().then(() => {
            // create attendee
            return rptDocument.create_attendees(attendee_object);
          }).then((attendee_arguments) => {
            // Questions and answers
            return rptDocument.create_survey_quiz_answers(question_answers_object , helper);
          }).then((attendee_user) => {
            // Calculation
            if(qtnrDocument.app_type == 1)
            return rptDocument.quiz_calculation(attendee_user,qtnrDocument);
          }).then(()=>{
            // return answer setting each time
            if(find_question.answer_settings != null ){
              res.send({"Answer_Settings":find_question.answer_settings});
            }else {
              res.send(notes.Errors.Not_Available('answer_settings'))
            }
          }).catch((err) => {
            return new Promise((resolve, reject) => {
              res.send({
                error : notes.Errors.General_Error.error ,
                details : err
              });
            });
          });
        }

      });
    });

});
