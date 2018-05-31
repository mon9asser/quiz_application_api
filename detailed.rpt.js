
rptRouters.post("/:app_id/detailed/report", api_key_report_auth ,( req , res ) => {
  var app_id = req.params.app_id ;


  qtnr.findOne({_id : app_id}).populate('app_report').populate('att__draft').exec(function(error, creatorQuestionnaires) {

    usr.find().then((usrDoc) => {
      if(!usrDoc) return false ;
      var usrObject = usrDoc ; // ==> All users array

      if(error || ! creatorQuestionnaires ){
        return new Promise((resolve, reject) => {
          res.send(notes.notifications.catch_doesnt_existing_data("Application"));
        });
      }
      var detailed_report = creatorQuestionnaires ;




      // var unreported = online_report.find_reported_attendees(rptAttendee);
      //
      // var started_and_not = _.countBy( unreported , { report_attendees : Object() });
      //
      // var total_attendee_objects = online_report.length ;
      // var started_attendees = (started_and_not.true == undefined ) ? 0 :  started_and_not.true; ;
      // var not_started_attendees = (started_and_not.false == undefined ) ? 0 :  started_and_not.false;
      // var completed_quiz = rptAttendee.length ;



      var dtls_rpt = new Object();
      if(dtls_rpt.overview == undefined )
        dtls_rpt.overview =  new Object()

      if(dtls_rpt.app_nfo == undefined )
      dtls_rpt.app_nfo = new Object();
      dtls_rpt['app_nfo']['app_name'] = detailed_report.questionnaire_title;
      dtls_rpt['app_nfo']['app_id'] = detailed_report._id;
      dtls_rpt['app_nfo']['total_questions'] = detailed_report.questions.length ;
      dtls_rpt['app_nfo']['pass_grade'] = detailed_report.settings.grade_settings.value;

      if( req.body.pagination != null && req.body.attendee_id == null  ) {
        if(dtls_rpt['paging'] == undefined )
           dtls_rpt['paging'] = new Object ();
      }


      if(dtls_rpt.items == undefined)
      dtls_rpt.items = new Array();
      // dtls_rpt.items = new Object();

      if(req.body.attendee_id == null ){

          // if(dtls_rpt.app_nfo.attendees == undefined )
          // dtls_rpt['items']['attendees'] = new Array() ;

          var rptAttendee =  detailed_report.app_report.attendees;
          var online_report =  detailed_report.att__draft.att_draft;
          var unreported = online_report.find_reported_attendees(rptAttendee);

          var started_and_not = _.countBy( unreported , { report_attendees : Object() });

          var total_attendee_objects = online_report.length ;
          var started_attendees = (started_and_not.true == undefined ) ? 0 :  started_and_not.true; ;
          var not_started_attendees = (started_and_not.false == undefined ) ? 0 :  started_and_not.false;
          var completed_quiz = rptAttendee.length ;



          dtls_rpt.overview.total_attendees = total_attendee_objects
          dtls_rpt.overview.started = started_attendees
          dtls_rpt.overview.not_started = not_started_attendees
          dtls_rpt.overview.completed = completed_quiz

          var count_passed = _.countBy(creatorQuestionnaires.att__draft.att_draft , {'report_attendees.passed_the_grade': true} )

          if(creatorQuestionnaires.app_type == 1 ){
            dtls_rpt.overview.passed = ( count_passed.true == undefined) ? 0 : count_passed.true ;
            dtls_rpt.overview.failed = ( count_passed.false == undefined) ? 0 : count_passed.false ;
          }
          /// =====> Get All attendees
          for (var i = 0; i < rptAttendee.length; i++){
                var attedee_repo = rptAttendee[i];
                var attendee_object = new Object ();
                  // ==> Build questions
                    attendee_object['attendee_id']      = attedee_repo.attendee_id
                    attendee_object['email']            = (usrObject.find(x => x._id == attedee_repo.attendee_id ) != undefined ) ? usrObject.find(x => x._id == attedee_repo.attendee_id ).email : 0 ;
                    attendee_object['name']             = (usrObject.find(x => x._id == attedee_repo.attendee_id ) != undefined ) ? usrObject.find(x => x._id == attedee_repo.attendee_id ).name : 0 ;
                    // attendee_object['total_questions']  = detailed_report.questions.length
                    // attendee_object['pass_mark']     =

                    if(creatorQuestionnaires.app_type == 1)
                    attendee_object['correct_answers']  = attedee_repo.results.correct_answers
                    if(creatorQuestionnaires.app_type == 1)
                    attendee_object['wrong_answers']    = attedee_repo.results.wrong_answers
                    if(creatorQuestionnaires.app_type == 1)
                    attendee_object['status']           = detailed_report.app_report.attendee_details.find(x => x.attendee_id == attedee_repo.attendee_id).status ;
                    if(creatorQuestionnaires.app_type == 1)
                    attendee_object['score']            = detailed_report.app_report.attendee_details.find(x => x.attendee_id == attedee_repo.attendee_id).score ;
                    attendee_object['completed_status'] = detailed_report.app_report.attendee_details.find(x => x.attendee_id == attedee_repo.attendee_id).completed_status ;
                    attendee_object['created_at']       = detailed_report.app_report.attendee_details.find(x => x.attendee_id == attedee_repo.attendee_id).created_at ;
                    attendee_object['completed_date']   =  detailed_report.app_report.attendee_details.find(x => x.attendee_id == attedee_repo.attendee_id).completed_date ;


                    // ==> Question Flag
                    if( req.body.questions && req.body.questions == true )
                      {
                          attendee_object['questions'] = new Array();
                          var attendee_id = attedee_repo.attendee_id ;
                          var rptAttendee =  detailed_report.app_report.attendees;
                          var rptAttendeeDetails =  detailed_report.app_report.attendee_details;

                          var this_attendee = rptAttendee.find(x => x.attendee_id == attendee_id);
                          var this_attendee_details = rptAttendeeDetails.find(x => x.attendee_id == attendee_id);
                          var questions_list = this_attendee.survey_quiz_answers ;



                          for ( var iqs = 0; iqs < questions_list.length; iqs++ ){
                              var obj_ques = questions_list[iqs];
                              var question_id = obj_ques.questions.question_id;;
                              var question_document = creatorQuestionnaires.questions.find(x => x._id == question_id);
                              // res.send(creatorQuestionnaires.questions[req.body.index]);
                              // return false ;


                              var question_object = new Object();
                              // ==> Question data
                              // => 1 - media type if found it
                              if( question_document.media_question != undefined && question_document.media_question != null ) {
                                 question_object['question_media'] = new Object();
                                 if(question_document.media_question.media_type == 0 ) { // => Images
                                   question_object['question_media']['media_type_string'] = 'image';
                                   question_object['question_media']['media_type'] =  question_document.media_question.media_type ;
                                   question_object['question_media']['media_field'] =  question_document.media_question.media_field ;
                                   question_object['question_media']['media_name'] = question_document.media_question.media_name ;

                                  }
                                 if(question_document.media_question.media_type == 1 ){ //=> Videos

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
                              }
                              // => 2 question data
                              question_object['question_id']  = obj_ques.questions.question_id
                              question_object['question_type'] = obj_ques.questions.question_type ;
                              question_object['question_body'] = striptags(question_document.question_body).replace("&nbsp;",'');
                              question_object['attendee_answers'] = new Array();
                              // question_object['is_correct'] = '';

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
                                      // ==> Case media is found
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
                                  }
                                  if(obj_ques.questions.question_type == 2 ){
                                    answers_object['boolean_type'] = answer_document.boolean_type
                                    answers_object['boolean_value'] = answer_document.boolean_value
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
                                question_object['attendee_answers'].push(answers_object)
                              }

                              // console.log(question_object);
                              attendee_object['questions'].push(question_object);
                          }


                      }




                    // ==> Sorting From To date
                    if( req.body.date != null ){
                      if( req.body.date.date_from == null  || req.body.date.date_to == null  ){
                        return  new Promise((resolve, reject) => {
                            res.send(notes.notifications.catch_fields("`date_from` && `date_to` are required ! in side date object"));
                        });
                        return false ;
                      }

                      // ==> Sorting by date
                      var from = new Date(req.body.date.date_from);
                      var to = new Date(req.body.date.date_to);
                      var date_passed = new Date(attendee_object.completed_date);
                      if (date_passed >= from && date_passed <= to) {
                        dtls_rpt['items'].push(attendee_object);
                        // dtls_rpt['items']['attendees'].push(attendee_object);
                      }
                    }
                    else
                    dtls_rpt['items'].push(attendee_object);

                    // dtls_rpt['items']['attendees'].push(attendee_object);
              }

      }else {

        var rptAttendee =  detailed_report.app_report.attendees;
        var online_report =  detailed_report.att__draft.att_draft;
        var unreported = online_report.find_reported_attendees(rptAttendee);

        var started_and_not = _.countBy( unreported , { report_attendees : Object() });

        var total_attendee_objects = online_report.length ;
        var started_attendees = (started_and_not.true == undefined ) ? 0 :  started_and_not.true; ;
        var not_started_attendees = (started_and_not.false == undefined ) ? 0 :  started_and_not.false;
        var completed_quiz = rptAttendee.length ;



        dtls_rpt.overview.total_attendees = total_attendee_objects
        dtls_rpt.overview.started = started_attendees
        dtls_rpt.overview.not_started = not_started_attendees
        dtls_rpt.overview.completed = completed_quiz

        var count_passed = _.countBy(creatorQuestionnaires.att__draft.att_draft , {'report_attendees.passed_the_grade': true} )

        if(creatorQuestionnaires.app_type == 1 ){
          dtls_rpt.overview.passed = ( count_passed.true == undefined) ? 0 : count_passed.true ;
          dtls_rpt.overview.failed = ( count_passed.false == undefined) ? 0 : count_passed.false ;
        }




          dtls_rpt['items'] = new Object();
          // dtls_rpt['items']['attendees'] = new Object();
          var attendee_id = req.body.attendee_id ;
          var rptAttendee =  detailed_report.app_report.attendees;
          var rptAttendeeDetails =  detailed_report.app_report.attendee_details;
          if(rptAttendee.findIndex(x => x.attendee_id == attendee_id) != -1 ){
              this_attendee = rptAttendee.find(x => x.attendee_id == attendee_id);
              this_attendee_details = rptAttendeeDetails.find(x => x.attendee_id == attendee_id);

              // dtls_rpt['items']['attendees'] = {
              //    'attendee_id'      :  attendee_id ,
              //    'email'            :  (usrObject.find(x => x._id == attendee_id ) != undefined ) ? usrObject.find(x => x._id == attendee_id ).email : 0  ,
              //    'name'             :  (usrObject.find(x => x._id == attendee_id ) != undefined ) ? usrObject.find(x => x._id == attendee_id ).name : 0  ,
              //    'correct_answers'  :  this_attendee.results.correct_answers ,
              //    'wrong_answers'    :  this_attendee.results.wrong_answers ,
              //    'status'           :  this_attendee_details.status ,
              //    'created_at'       :  this_attendee_details.created_at ,
              //    'completed_date'   :  this_attendee_details.completed_date
              // };

              dtls_rpt['items'] = {
                 'attendee_id'      :  attendee_id ,
                 'email'            :  (usrObject.find(x => x._id == attendee_id ) != undefined ) ? usrObject.find(x => x._id == attendee_id ).email : 0  ,
                 'name'             :  (usrObject.find(x => x._id == attendee_id ) != undefined ) ? usrObject.find(x => x._id == attendee_id ).name : 0  ,
                 'correct_answers'  :  this_attendee.results.correct_answers ,
                 'wrong_answers'    :  this_attendee.results.wrong_answers ,
                 'status'           :  this_attendee_details.status ,
                 'created_at'       :  this_attendee_details.created_at ,
                 'completed_date'   :  this_attendee_details.completed_date
              };

              // ==> Question flag
              if( req.body.questions && req.body.questions == true )
                  {
                    dtls_rpt['items']['questions'] = new Array();
                    // dtls_rpt['items']['attendees']['questions'] = new Array();
                    var questions_list = this_attendee.survey_quiz_answers ;
                    for (var iqs = 0; iqs < questions_list.length; iqs++){
                        var obj_ques = questions_list[iqs];
                        var question_id = obj_ques.questions.question_id;;
                        var question_document = creatorQuestionnaires.questions.find(x => x._id == question_id);
                        // res.send(creatorQuestionnaires.questions[req.body.index]);
                        // return false ;
                        var question_object = new Object();
                        // ==> Question data
                        // => 1 - media type if found it
                        if( question_document.media_question != undefined && question_document.media_question != null ) {
                           question_object['question_media'] = new Object();
                           if(question_document.media_question.media_type == 0 ) { // => Images
                             question_object['question_media']['media_type_string'] = 'image';
                             question_object['question_media']['media_type'] =  question_document.media_question.media_type ;
                             question_object['question_media']['media_field'] =  question_document.media_question.media_field ;
                             question_object['question_media']['media_name'] = question_document.media_question.media_name ;
                           }
                           if(question_document.media_question.media_type == 1 ){ //=> Videos
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
                        }
                        // => 2 question data
                        question_object['question_id']  = obj_ques.questions.question_id
                        question_object['question_type'] = obj_ques.questions.question_type ;
                        question_object['question_body'] = striptags(question_document.question_body).replace("&nbsp;",'');
                        question_object['attendee_answers'] = new Array();
                        // question_object['is_correct'] = '';

                        var answerIds = obj_ques.answers.answer_id // => arrays
                        for (var i = 0; i < answerIds.length; i++) {

                          var answer_id = answerIds[i];
                          var answer_document = question_document.answers_format.find( x => x._id == answer_id );
                          if(answer_document != undefined){
                            var answers_object = new Object();
                            answers_object['answer_id'] = answer_document._id ;
                            if(creatorQuestionnaires.app_type == 1)
                            answers_object['is_correct'] = answer_document.is_correct ;
                            if(obj_ques.questions.question_type == 0 ){
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

                              // ==> Case answer object
                              answers_object['answer_value'] = striptags( answer_document.value ).replace("&nbsp;",'');

                            }


                            if(obj_ques.questions.question_type == 1 ){
                                // ==> Case media is found
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


                            }
                            if(obj_ques.questions.question_type == 2 ){
                              answers_object['boolean_type'] = answer_document.boolean_type
                              answers_object['boolean_value'] = answer_document.boolean_value
                            }
                            if(obj_ques.questions.question_type == 3 ){}
                            if(obj_ques.questions.question_type == 4 ){}
                          }
                          question_object['attendee_answers'].push(answers_object)
                        }

                        // console.log(question_object);
                        dtls_rpt.items['questions'].push(question_object)
                        // dtls_rpt.items['attendees']['questions'].push(question_object)
                    }
                  }
          }
      }

      // ==> Pagination (options)

      if( req.body.pagination != null && req.body.attendee_id == undefined  ) {

          if( req.body.pagination.page_number == null || req.body.pagination.records_per_page == null ){
            return new  Promise( (resolve, reject) => {
                res.send(notes.notifications.catch_fields ("`page_number` && `records_per_page` are required !"))
                return false ;
            });
          }

          var all_attendees = dtls_rpt.items ;

          // var all_attendees = dtls_rpt.items.attendees ;
          var page_number = req.body.pagination.page_number ;
          var pages = req.body.pagination.records_per_page ;
          // ==> Build Paginations and anther options
          if (!_.isNumber(page_number)) page_number = 0;
          if(!_.isNumber(pages)) pages = config.default_records_per_page ;

          if(page_number == 1 || page_number < 0) page_number = 0 ;
          if(page_number != 0 ) page_number = page_number - 1 ;
          if(pages == 0 || pages < 0 ) pages = config.default_records_per_page;

          var detail_reports = _.chunk(all_attendees, pages);
          if(page_number > (detail_reports.length - 1)) page_number = detail_reports.length - 1;
          delts_rports = detail_reports[page_number] ;

          // dtls_rpt.items.attendees = detail_reports;

          dtls_rpt.items = detail_reports;
          dtls_rpt.paging['items'] = detail_reports; // detail_reports.length ;
          dtls_rpt.paging['item_per_page'] = pages ;
          dtls_rpt.paging['total_items'] =all_attendees.length;
          dtls_rpt.paging['page_index'] = page_number ;
          dtls_rpt.paging['total_pages'] = detail_reports.length ;

          // ==> Stored Items with page number
        dtls_rpt.items = delts_rports
      }

      res.send(notes.notifications.success_calling( dtls_rpt) );

    }).catch((err)=>{ // => end usr catch
      res.send(notes.notifications.catch_errors(err))
    });
  });
});
