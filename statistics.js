rptRouters.post("/:app_id/statistics/report" , api_key_report_auth , (req , res)=>{
  var app_id = req.params.app_id;
  drft.findOne({"application_id":app_id}).populate("questionnaire_info").then((reportDocument)=>{
    rpt.findOne({'questionnaire_id': app_id }).then((rbt_document)=>{
      var offline_report = rbt_document;


      if(!reportDocument ){
        return new Promise((resolve,reject)=>{
          res.send(notes.notifications.catch_doesnt_existing_data("Application"));
        });
      }

      if(reportDocument.questionnaire_info.app_type != 0 ){
        return new Promise((resolve,reject)=>{
          res.send(notes.notifications.survey_failed());
        });
      }

      var statistics_report = new Object();

      if(statistics_report.app_nfo == undefined)  statistics_report.app_nfo = new Object();
      if(statistics_report.overview  == undefined) statistics_report.overview = new Object();
      if(statistics_report.questions  == undefined) statistics_report.questions = new Array();



      statistics_report.app_nfo["survey_id"] = reportDocument.questionnaire_info._id;
      statistics_report.app_nfo["survey_name"] = reportDocument.questionnaire_info.questionnaire_title;
      statistics_report.app_nfo["total_questions"] = reportDocument.questionnaire_info.questions.length;

      var an_offline_report = offline_report.attendees;
      var an_online_report = reportDocument.att_draft;
      var unreported = an_online_report.find_reported_attendees(an_offline_report);

      var started_and_not = _.countBy( unreported , { report_attendees : Object() });

      var total_attendee_objects = an_online_report.length ;
      var started_attendees = (started_and_not.true == undefined ) ? 0 :  started_and_not.true; ;
      var not_started_attendees = ( started_and_not.false == undefined ) ? 0 :  started_and_not.false;
      var completed_quiz = an_offline_report.length ;

      statistics_report.overview["total_attendees"] = reportDocument.att_draft.length;
      statistics_report.overview["started"] = started_attendees;
      statistics_report.overview["not_started"] = not_started_attendees // => this prop is inProgress
      statistics_report.overview["completed"] = completed_quiz;

      var statistics = reportDocument.statistics;
      /*
      template will not take time
      */

      for ( var i = 0; i < statistics.length; i++ ){
        var qs_object = new Object();
        qs_object['question_id'] = statistics[i].question_id;
        qs_object['question'] = statistics[i].question_body;
        qs_object['count_of_attendees'] = statistics[i].attendee_count;
        qs_object['answers'] =  _.map( statistics[i].question_answers , _.partialRight(_.pick, ['answer_id','answer_body','attendee_percentage_count','attendee_raw_count']));
        statistics_report.questions.push(qs_object);
      }

      res.send(statistics_report);

    });
  });
});


































































if( req.body.questions != null && req.body.questions == true ){
                     var an_online_report = online_report.find(x => x.user_id ==  an_online_rpt.user_id );


                      var survey_quiz_answers
                     if( an_online_report.report_attendees != undefined ){

                       var user_attendee_index = an_online_report.report_attendees.findIndex(x => x.attendee_id ==  an_online_rpt.user_id );

                     var question_lists = new Array();

                    if(an_online_report.report_attendees != undefined && user_attendee_index != -1){
                      survey_quiz_answers = an_online_report.report_attendees[user_attendee_index].survey_quiz_answers;
                     for ( var iqs = 0; iqs < survey_quiz_answers.length; iqs++ ){

                         var obj_ques = survey_quiz_answers[iqs];
                         var question_id = obj_ques.questions.question_id;
                         var question_document = creatorQuestionnaires.questions.find(x => x._id == question_id);
                         var question_object = new Object();

                          // => 1 - media type if found it
                          if( question_document.media_question != undefined && question_document.media_question != null ) {
                             question_object['question_media'] = new Object();
                             if(question_document.media_question.media_type == 0 ) { // => Images
                                question_object['question_media']['media_type_string'] = 'image';
                                question_object['question_media']['media_type'] =  question_document.media_question.media_type ;
                                question_object['question_media']['media_field'] =  question_document.media_question.media_field ;
                                question_object['question_media']['media_name'] = question_document.media_question.media_name ;
                              }
                              if(question_document.media_question.media_type == 1 ){
                                 if(question_document.media_question.video_type == 0 ) // => youtube
                                     {
                                           question_object['question_media']['media_type_string'] = 'youtube';
                                           question_object['question_media']['media_type'] =  question_document.media_question.media_type ;
                                           question_object['question_media']['media_field'] =  question_document.media_question.media_field ;
                                           question_object['question_media']['video_type']  =  question_document.media_question.video_type ;
                                           question_object['question_media']['video_id']  =  question_document.media_question.video_id ;
                                           question_object['question_media']['video_embed_url']  =  question_document.media_question.video_source ;
                                       }
                                  if(question_document.media_question.video_type == 1 ) // => vimeo
                                       {
                                           question_object['question_media']['media_type_string'] = 'vimeo';
                                           question_object['question_media']['media_type'] =  question_document.media_question.media_type ;
                                           question_object['question_media']['media_field'] =  question_document.media_question.media_field ;
                                           question_object['question_media']['video_type']  =  question_document.media_question.video_type ;
                                           question_object['question_media']['video_id']  =  question_document.media_question.video_id ;
                                           question_object['question_media']['video_embed_url']  =  question_document.media_question.video_source ;
                                       }
                                  if(question_document.media_question.video_type == 2 ) // => mp4
                                       {
                                           question_object['question_media']['media_type_string'] = 'mp4';
                                           question_object['question_media']['media_type'] =  question_document.media_question.media_type ;
                                           question_object['question_media']['video_embed_url'] = {
                                             mp4 :  question_document.media_question.media_field + '.mp4' ,
                                             ogg :  question_document.media_question.media_field + '.ogg'
                                           }
                                           question_object['question_media']['video_type']  =  question_document.media_question.video_type ;
                                       }
                               }
                          } // => End Media

                          // => 2 question data
                          question_object['question_id']  = obj_ques.questions.question_id
                          question_object['question_type'] = obj_ques.questions.question_type ;
                          question_object['question_body'] = striptags(question_document.question_body).replace("&nbsp;",'');
                          question_object['attendee_answers'] = new Array();

                          var answerIds = obj_ques.answers.answer_id // => arrays
                          for (var ians = 0; ians < answerIds.length; ians++) {

                            var answer_id = answerIds[ians];

                            var answer_document = question_document.answers_format.find( x => x._id == answer_id );

                            if(answer_document != undefined){
                              var answers_object = new Object();
                              answers_object['answer_id'] = answer_document._id ;
                              if(creatorQuestionnaires.app_type == 1)
                              answers_object['is_correct'] = answer_document.is_correct ;

                              if( obj_ques.questions.question_type == 0 ){
                                // 1 => Media
                                if(answer_document.media_optional != undefined ){
                                  media_object = answer_document.media_optional ;

                                  if(answers_object.answer_media == undefined )
                                    answers_object.answer_media = new Object();

                                  if(media_object.media_type == 0 ){
                                    answers_object['answer_media']['media_type_string'] =  "image" ;
                                    answers_object['answer_media']['media_type']        = media_object.media_type
                                    answers_object['answer_media']['media_field']       = media_object.media_src
                                    answers_object['answer_media']['media_name']        = media_object.media_name
                                  }


                                  if(media_object.media_type == 1 ){

                                      if(media_object.video_type == 0 ){
                                          answers_object['answer_media']['media_type'] =  media_object.media_type
                                          answers_object['answer_media']['media_field'] = media_object.media_src
                                          answers_object['answer_media']['media_type_string']="youtube" ;
                                          answers_object['answer_media']['video_type'] = media_object.video_type
                                          answers_object['answer_media']['video_id'] = media_object.video_id;
                                          answers_object['answer_media']['video_embed_url'] = media_object.embed_path;
                                      }

                                      if(media_object.video_type == 1 ){
                                        answers_object['answer_media']['media_type'] =  media_object.media_type
                                        answers_object['answer_media']['media_field'] = media_object.media_src
                                        answers_object['answer_media']['media_type_string']="youtube" ;
                                        answers_object['answer_media']['video_type'] = media_object.video_type
                                        answers_object['answer_media']['video_id'] = media_object.video_id;
                                        answers_object['answer_media']['video_embed_url'] = media_object.embed_path;
                                      }

                                      if(media_object.video_type == 2 ){
                                        answers_object['media_type'] =  media_object.media_type ;
                                        answers_object['video_embed_url'] = {
                                              mp4 :  media_object.mp4_option.mp4_url ,
                                              ogg :  media_object.mp4_option.ogg_url
                                        }
                                        answers_object['media_type_string'] = 'mp4';
                                        answers_object['video_type']  =  media_object.video_type ;
                                      }
                                  }
                                }
                                // 2 => Texts
                                // ==> Case answer object
                                answers_object['answer_value'] =striptags( answer_document.value ).replace("&nbsp;",'');

                              }


                              if(obj_ques.questions.question_type == 1 ){
                                  // ==> Case media is found media_src
                                  if ( answer_document.media_type != undefined ){ // answer_document.media_type
                                      if( answer_document.media_type == 0 ){ // => Images
                                        answers_object['media_type_string'] = "image" ;
                                        answers_object['media_type'] = answer_document.media_type
                                        answers_object['media_field'] = answer_document.media_src;
                                        answers_object['media_name'] = answer_document.media_name; ;
                                      }
                                      if( answer_document.media_type == 1 ) { // => Video
                                          if(answer_document.video_type == 0 ){ // => yt
                                            answers_object['media_type'] = answer_document.media_type
                                            answers_object['media_field'] = answer_document.media_src;
                                            answers_object['media_type_string'] = "vimeo" ;
                                            answers_object['video_type'] = answer_document.video_type;
                                            answers_object['video_id']= answer_document.video_id;
                                            answers_object['video_embed_url']= answer_document.embed_path
                                          }
                                          if(answer_document.video_type == 1 ){ // vim
                                            answers_object['media_type'] = answer_document.media_type
                                            answers_object['media_field'] = answer_document.media_src;
                                            answers_object['media_type_string'] = "vimeo" ;
                                            answers_object['video_type'] = answer_document.video_type;
                                            answers_object['video_id']= answer_document.video_id;
                                            answers_object['video_embed_url']= answer_document.embed_path;
                                          }
                                          if(answer_document.video_type == 2 ){ // mp4
                                            answers_object['media_type'] =  answer_document.media_type ;
                                            answers_object['video_embed_url'] = {
                                              mp4 :  answer_document.mp4_option.mp4_url ,
                                              ogg :  answer_document.mp4_option.ogg_url
                                            }
                                            answers_object['media_type_string'] = 'mp4';
                                            answers_object['video_type']  =  answer_document.video_type ;
                                          }
                                      }

                                  }

                                  if(answer_document.media_src != undefined && answer_document.media_src.includes('img/media-icon.png')){
                                     answers_object['answer_value'] = "No Media here !";
                                  }
                              }
                              if(obj_ques.questions.question_type == 2 ){
                                answers_object['boolean_type'] = answer_document.boolean_type
                                answers_object['answer_value'] = answer_document.boolean_value
                              }
                              if(obj_ques.questions.question_type == 3 ){
                                    if(answer_document.ratscal_type == 0 ) // => scale value
                                    {
                                      answers_object['question_type_string'] = "scale";
                                      answers_object['started_at']   =  answer_document.started_at;
                                      answers_object['ended_at']     =  answer_document.ended_at;
                                      answers_object['show_labels']  =  answer_document.show_labels;
                                      answers_object['centered_at']  =  answer_document.centered_at;
                                    }else { // => rating value
                                      answers_object['question_type_string'] = "rating";
                                    }
                                    answers_object['answer_value']   =  answer_document.step_numbers;
                                    answers_object['question_type'] =  answer_document.ratscal_type;
                              }
                              if(obj_ques.questions.question_type == 4 ){
                                var report_answer_object = obj_ques.answers.answer_body['answer_id_'+ answerIds ];
                                answers_object['answer_value'] = report_answer_object.answer_body.free_text_value ;
                              }

                            }
                            question_object['attendee_answers'].push(answers_object);

                          }

                          question_lists.push(question_object);
                     }
                   }
                   question_lists.push(question_object);
                  }else {
                    question_lists ="No questions meet your selected criteria"
                  }
                 }






























































































    var attendee_object_index = attendee_draft.att_draft.findIndex( x => x.user_id == user_id );
    if(attendee_object_index != -1 ){
      var attendee_obka = attendee_draft.att_draft.find ( x => x.user_id == user_id );
      var rptObject = new Object();



      if(!reptDoc){ // Add new Report



        rptObject['attendees'] = attendee_obka.report_attendees;
        rptObject['history'] = new Array({
          date_made :  date_made().toString()  ,
          attendee_counts : 1
        });
        rptObject['statistics'] = new Array();
        rptObject['attendee_details']  = attendee_obka.report_attendee_details;
        rptObject['questionnaire_id'] = app_id;
        rptObject['questionnaire_info'] = app_id;
        rptObject['app_type'] =  attendee_obka.impr_application_object.app_type ;
        rptObject['creator_id'] = attendee_obka.impr_application_object.creator_id ;
        rptObject['created_at'] = new Date();
        rptObject['updated_at'] = new Date();

        // ==> Statistics Arrays
        if(req.body.statistics != null ){
            rptObject.statistics = req.body.statistics;
        }

        var reporting = new rpt(rptObject);
        reporting.save().then((rptgObject)=>{
          // ==> Update questionnaire with report
          qtnr.findOne({_id : app_id }).then((questionnaireApp)=>{
            questionnaireApp.app_report = rptgObject._id ;
            questionnaireApp.markModified('app_report');
            questionnaireApp.save();
          });
          res.send(rptgObject);
        }).catch((err)=>{
          res.send(err);
        });
      }else { // Update the current report

        // ==> Attendee
          var AttendeeDocument = reptDoc.attendees.findIndex(x => x.attendee_id == user_id);
          if(AttendeeDocument == -1 )  // => push new
            reptDoc.attendees.push(attendee_obka.report_attendees);
           else   // update the current
            reptDoc.attendees[AttendeeDocument] =  attendee_obka.report_attendees;

        // ==> Details
          var AttendeeDetails = reptDoc.attendee_details.findIndex(x => x.attendee_id == user_id);
          if(AttendeeDetails == -1 )  // => push new
            reptDoc.attendee_details.push(attendee_obka.report_attendee_details);
           else   // update the current
            reptDoc.attendee_details[AttendeeDetails] = attendee_obka.report_attendee_details ;

        // ==> History object
        var dateMadeHistory = reptDoc.history.findIndex(x => x.date_made == date_made().toString() );
        if(dateMadeHistory != -1 )
          reptDoc.history[dateMadeHistory].attendee_counts =  reptDoc.history[dateMadeHistory].attendee_counts + 1 ;
        else
          reptDoc.history.push({
            date_made :  date_made().toString()  ,
            attendee_counts : 1
          });

          // ==> Statistics Arrays
          if(req.body.statistics != null ){
            if( reptDoc.statistics == undefined )
            reptDoc.statistics = [];
            reptDoc.statistics = req.body.statistics;
          }

         reptDoc.markModified("attendees");
         reptDoc.save().then((rptgObject)=>{
           // ==> Update questionnaire with report
           qtnr.findOne({_id : app_id }).then((questionnaireApp)=>{
             questionnaireApp.app_report = rptgObject._id ;
             questionnaireApp.markModified('app_report');
             questionnaireApp.save();
           });
           res.send(rptgObject);
         }).catch((err)=>{
           res.send(err);
         });

      }
    }
    