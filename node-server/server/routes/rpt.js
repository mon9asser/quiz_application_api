const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const {
    ObjectID
} = require("mongodb");
const {
    attendee_data
} = require("../../models/publics");
const {
    apis,
    config,
    notes ,
    application
} = require("../../database/config");
const {
    authByToken,
    verify_token_user_type,
    verify_session,
    build_session
} = require("../../middlewares/authenticate");
const {
    authByTokenWCreatorType,
    can_i_access_that
} = require("../../middlewares/authorization");
const {
    qtnr
} = require("../../models/questionnaires");
const {
    usr
} = require("../../models/users");
const {
    rpt
} = require("../../models/reports");


var rptRouters = express.Router();

rptRouters.use(bodyParser.json());
rptRouters.use(bodyParser.urlencoded({
    extended: false
}));
rptRouters.use(build_session);

rptRouters.post("/:app_id/report/add", verify_token_user_type , (req , res) => {
  var requests = new Object();
  var required_fields = new Array();
  if(req.body.attendee_id  == null )
    required_fields[required_fields.length]= "attendee_id";
  if(req.body.question_id == null )
    required_fields[required_fields.length] = "question_id";
  if(req.body.answer_ids == null )
    required_fields[required_fields.length]= "`answer_ids` Array"
    var user_id = req.verified_user._id;
  var token = req.verified_token;
  var userType = req.verified_user_type;
  var appliation_id = req.params.app_id;
  var attendee_id = req.body.attendee_id;
  if (userType != 0) {
    return new Promise( (resolve , reject) => {
      res.send(notes.Warnings.Permission_Warning);
    });
  }
  if(required_fields.length != 0)
  {
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
    qtnr.findById(appliation_id, (error, qtnrDocument) => {
      if (!qtnrDocument){
            return new Promise((resolve , reject )=>{
              res.send(notes.Errors.Error_Doesnt_exists("Application"));
            });
        }
      var updatedAt = new Date();
      rpt.findOne({"questionnaire_id": qtnrDocument._id, "creator_id": qtnrDocument.creator_id} , (error, rptDocument)=>{

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
// ----------------------->>>>> Clear results
rptRouters.delete("/:app_id/report/clear", verify_token_user_type , (req , res) => {

  if( req.body.attendee_id == null ) {
    return new Promise ((resolve , reject)=>{
      res.send(notes.Messages.Required_Message("'attendee_id'")) ;
    });
  }
  var appliation_id = req.params.app_id ;
  var attendee_id = req.body.attendee_id ;
  rpt.findOne({ questionnaire_id : appliation_id}, (error, rptDocument) => {

      if (!rptDocument){
            return new Promise((resolve , reject )=>{
              res.send(notes.Errors.Error_Doesnt_exists("Application"));
            });
      }

      var allAttendees = rptDocument.attendees ;
      var attendeeIndex = _.findIndex(rptDocument.attendees , { attendee_id : attendee_id }) ;
      var users = _.pull(allAttendees , allAttendees[attendeeIndex] );
      rptDocument.markModified('attendees');
      rptDocument.save().then(()=>{
        res.send({"Message": `You're ready to retake this  ${(rptDocument.app_type == 1 ) ? "Quiz !" : "Survey !"}` });
      });
  });

});

// ----------------------->>>>> Reports


rptRouters.post([
        // filters => attendee_id , question_id || array contained some specified indexes
        // report_type => brief  ( quiz - survey ) | detailed  ( quiz - survey ) | statistics ( survey only )
        "/:creator_id/:report_type/report", // => all questionnaires
        "/:creator_id/:app_type/:report_type/report"
], can_i_access_that, (req, res) => {

     var creator_id = req.params.creator_id;
     var report_type = req.params.report_type;
     var queries = new Object();
     queries["creator_id"] = creator_id;

     if (req.body.date) {
        if (req.body.date.date_from != null && req.body.date.date_to != null) {
            var query_range = new Object();
                if (report_type == 'brief') {
                      query_range = {
                            "created_at": {
                                  "$gte": new Date(req.body.date.date_from),
                                  "$lt": new Date(req.body.date.date_to)
                                }
                        }
                  queries = query_range;
                  }
         }
     }

    if (req.params.app_type) {
       queries["app_type"] = (req.params.app_type == 'quiz') ? 1 : 0;
       if (report_type == "statistics") queries["app_type"] = 0; // survey type
    }
    if (req.body.filters) {
       if (req.body.filters.application_id) {
          queries["questionnaire_id"] = req.body.filters.application_id;
       }
    }
    rpt.find(queries).
    populate("questionnaire_id").
    populate("attendees.user_information").
    exec((error, reportDocument) => {

      if (!reportDocument) {
        return new Promise((resolve , reject)=>{
          res.status(404).send(notes.Errors.Error_Doesnt_exists("report"));
        });
      }


     var appviews,
     attendee_curr_page,
     attendee_records_inpu,
     current_result,
     applications,
     applicationPageNumber,
     object_user_attent;
     var user_attensees_lists = new Array();
     /*
      +++++++++++++++++++++++++++++++++++++++++++++++
        Detailed Report
      +++++++++++++++++++++++++++++++++++++++++++++++
     */
     if (req.body.filters != null && report_type == "detailed") {

       if (req.body.filters.paginations == null && req.body.filters.attendee_id == null) {
            return new Promise((resolve, reject) => {
                 res.status(404).send(notes.Messages.Required_Message("filters.paginations"))
            });
       }
       var pagin_is_found = false;
       if (req.body.filters.paginations != null) {
         if (req.body.filters.paginations.attendees != null && req.body.filters.attendee_id != null) pagin_is_found = true;
         else pagin_is_found = false;
       }else {
          if (req.body.filters.attendee_id != null) pagin_is_found = false;
       }
       if (pagin_is_found == true) {
         return new Promise((resolve, reject) =>{
           res.status(404).send({"Message": "That's a specified user ! you can't use pagination option with !"});
         });
       }
       current_result = reportDocument;
       for (var i = 0; i < current_result.length; i++) {
         if (req.body.filters.attendee_id != null){
            var attendee = _.find(current_result[i].attendees, { "attendee_id": req.body.filters.attendee_id }) ;
            var attendeeIndex = _.findIndex(current_result[i].attendees, { "attendee_id": req.body.filters.attendee_id });
            object_user_attent = new Object();
            object_user_attent['attendee_information'] = {
              "id": current_result[i].attendees[attendeeIndex].user_information._id,
              "name": current_result[i].attendees[attendeeIndex].user_information.name,
              "email": current_result[i].attendees[attendeeIndex].user_information.email
            };
            object_user_attent['app_name'] = current_result[i].questionnaire_id.questionnaire_title;
            object_user_attent['app_id'] = current_result[i].questionnaire_id._id;
            object_user_attent['total_questions'] = current_result[i].attendees[attendeeIndex].survey_quiz_answers.length
            object_user_attent['completed_date'] = current_result[i].attendees[attendeeIndex].updated_at;
            if (current_result[i].questionnaire_id.app_type != 0) {
                object_user_attent['pass_mark'] = current_result[i].attendees[attendeeIndex].passed_the_grade;
                object_user_attent['correct_answers'] = current_result[i].attendees[attendeeIndex].results.correct_answers;
                object_user_attent['score'] = current_result[i].attendees[attendeeIndex].results.result.percentage_value + "%";
                if (current_result[i].questionnaire_id.settings.grade_settings.is_graded == true) {
                    if (current_result[i].attendees[attendeeIndex].results.result.percentage_value >= current_result[i].questionnaire_id.settings.grade_settings.value) object_user_attent['status'] = "Passed";
                    else object_user_attent['status'] = "Failed";
                    if (req.body.filters.questions == true) {
                        object_user_attent['question'] = new Array();
                        var survey_questions = attendee.survey_quiz_answers
                        for (var i = 0; i < survey_questions.length; i++) {
                          var question_obj_arg = {
                             "question": survey_questions[i].questions.question_body.question_body,
                             "is_correct": survey_questions[i].is_correct,
                             "answer": survey_questions[i].answers.answer_body
                          };
                          object_user_attent['question'].push(question_obj_arg);
                        }
                    }
                }
            }

         }
       } // End For Loop


      if (req.body.filters.attendee_id != null) appviews = object_user_attent;
       else if (req.body.filters.paginations.attendees != null || req.body.filters.attendee_id == null) {
         if (req.body.filters.paginations.attendees == null) {
             return new Promise( (resolve , reject )=>{
             res.status(404).send({ "Message": "Pagination of attendees is required !"});
             });
             if (req.body.filters.paginations.attendees.page_number == null || req.body.filters.paginations.attendees.records_per_page == null) {
               return new Promise((resolve , reject )=>{
                 res.status(404).send({"Message": "These fields 'page_number' and 'records_per_page' are required inside attendees pagination !" });
               });
             }
         }
         attendee_records_inpu = req.body.filters.paginations.attendees.records_per_page;
         var attendee_curr_page = req.body.filters.paginations.attendees.page_number;
         for (var i = 0; i < current_result.length; i++) {
           var curr_attendee = current_result[i].attendees;
           var attendee_records = _.chunk(curr_attendee, attendee_records_inpu);
           if (attendee_curr_page < 0 || !_.isNumber(attendee_curr_page) || attendee_curr_page == 1) attendee_curr_page = 0;
           else if (attendee_curr_page != 0) attendee_curr_page = attendee_curr_page - 1;
           var record_current_page = attendee_records[attendee_curr_page];
           if (!record_current_page) {
             return new Promise((resolve , reject )=>{
               res.status(404).send({"Message": "There are no attendees else !"});
             });
           }
           for (var x = 0; x < record_current_page.length; x++) {
             var user_attensees = new Object();
             user_attensees["attendee_information"] = {
                "name": record_current_page[x].user_information.name,
                "email": record_current_page[x].user_information.email,
                "_id": record_current_page[x].user_information._id
             };
             user_attensees["total_questions"] = record_current_page[x].survey_quiz_answers.length;
             user_attensees["completed_date"] = record_current_page[x].updated_at;
             if (current_result[i].questionnaire_id.app_type != 0) {
               user_attensees['pass_mark'] = record_current_page[x].passed_the_grade;
               user_attensees['correct_answers'] = record_current_page[x].results.correct_answers;
               user_attensees['score'] = record_current_page[x].results.result.percentage_value + "%";
               if (current_result[i].questionnaire_id.settings.grade_settings.is_graded) {
                 if (record_current_page[x].results.result.percentage_value >= current_result[i].questionnaire_id.settings.grade_settings.value) {
                   user_attensees['status'] = "Passed";
                 }
                 else user_attensees['status'] = "Failed";
                 if (req.body.filters.questions == true) {
                   user_attensees['question'] = new Array();
                   var survey_questions = record_current_page[x].survey_quiz_answers;
                   for (var w = 0; w < survey_questions.length; w++) {
                     user_attensees['question'].push({
                       "question": survey_questions[w].questions.question_body.question_body,
                       "is_correct": survey_questions[w].is_correct,
                       "answer": survey_questions[w].answers.answer_body
                     });
                   } // End forloop w
                 }
               }
             }
             if (req.body.date != null) {
               if (req.body.date.date_from != null && req.body.date.date_to != null) {
                 var from = new Date(req.body.date.date_from);
                 var to = new Date(req.body.date.date_to);
                 var date_passed = new Date(record_current_page[x].created_at);
                 if (date_passed >= from && date_passed <= to) {
                   user_attensees_lists.push(user_attensees);
                  }
               } else user_attensees_lists.push(user_attensees);
             }else user_attensees_lists.push(user_attensees);
           } // end foloop x
           var detailed_report_object = new Object();
           detailed_report_object["app_name"] = current_result[i].questionnaire_id.questionnaire_title;
           detailed_report_object["app_id"] = current_result[i].questionnaire_id._id;
           detailed_report_object["attendees"] = user_attensees_lists;
           appviews = detailed_report_object;
         } // end forloop i
       }
     } // End Detailed Report
     if( report_type == 'brief' ) {
        var brief_array = new Array();
        if (req.body.filters.paginations.application == null) {
          return new Promise((resolve , reject)=>{
            res.send({"Message": "pagination.application fields are required"});
          });
          if (!req.body.filters.paginations.application.page_number || !req.body.filters.paginations.application.records_per_page) {
            res.send({"Message": "Make sure application.page_number and application.records_per_page are available !"});
          }
        }
        var pages = req.body.filters.paginations.application.records_per_page;
        var page_number = req.body.filters.paginations.application.page_number;
        if (!_.isNumber(page_number)) page_number = 0;
        var document_reports = _.chunk(reportDocument, pages);
        if (page_number == 1)
         if (page_number < 0 || !_.isNumber(page_number) || page_number == 1) page_number = 0;
         else if (page_number != 0) page_number = page_number - 1;
         if (page_number >= document_reports.length) {
            page_number = (document_reports.length - 1);
          }
          var document_brief = document_reports[page_number];
          for (var brief = 0; brief < document_brief.length; brief++) {
            var brief_object = new Object();
            var total_passed = _.countBy(document_brief[brief].attendees, {'passed_the_grade': true});
            var total_is_completed = _.countBy(document_brief[brief].attendees, {'is_completed': true});
            var total_is_completed = _.countBy(document_brief[brief].attendees, {'is_completed': true});
            var total_is_completed_count = _.countBy(document_brief[brief].attendees, 'results.correct_answers');
            brief_object["app_name"] = document_brief[brief].questionnaire_id.questionnaire_title;
            brief_object["app_id"] = document_brief[brief].questionnaire_id._id;
            brief_object["app_type"] = (document_brief[brief].app_type == 1) ? "Quiz" : "Survey";
            brief_object["total_questions"] = document_brief[brief].questionnaire_id.questions.length;
            brief_object["total_attendees"] = document_brief[brief].attendees.length;
            brief_object["total_passed"] = total_passed.true;
            brief_object["total_completed"] = total_is_completed.true;
            brief_array.push(brief_object);
          } // end forlopp
          appviews = brief_array;
     }
     if( report_type == 'statistics' ) {
       if (req.body.filters.application_id == null) {
         return new Promise((resolve , reject)=>{
           res.send({ "Message": "filters.appliation_id required !"});
         });
       }
       var statistics_report = new Object();
       statistics_report["survey_id"] = reportDocument[0].questionnaire_id._id;
       statistics_report["survey_name"] = reportDocument[0].questionnaire_id.questionnaire_title;
       statistics_report["total_attendees"] = reportDocument[0].attendees.length;
       var statistics = reportDocument[0].statistics;
       var questions_answers = new Array();
       for (var i = 0; i < statistics.length; i++) {
          qs_object['question_id'] = statistics[i].question_id;
          qs_object['question'] = statistics[i].question_body;
          qs_object['count_of_attendees'] = statistics[i].attendee_info.length;
          qs_object['answers'] = new Array();
          var answer_args = statistics[i].question_answers
          for (var xi = 0; xi < answer_args.length; xi++) {
            var answer_argument = new Object();
            answer_argument['answer_id'] = answer_args[xi].answer_id;
            answer_argument['answer_body'] = answer_args[xi].answer_body;
            answer_argument['attendee_raw_count'] = answer_args[xi].attendee_raw_count ;
            answer_argument['attendee_percentage_count'] = answer_args[xi].attendee_percentage_count ;
            qs_object['answers'].push(answer_argument);
          } // end forloop xi
          questions_answers.push(qs_object);
       } // end forloop
       statistics_report["questions"] = questions_answers;
       appviews = statistics_report
     }
     res.send(appviews);
  });
});

module.exports = {
    rptRouters
};
