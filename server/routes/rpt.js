const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const {helper} = require("../helpers");
// const {drft} = require("../../models/attendee_draft");
// const equals = require('array-equal');
// const Moment = require('moment');
// const MomentRange = require('moment-range');
// const moment = MomentRange.extendMoment(Moment);


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
    build_session ,
    api_key_report_auth ,
    verify_api_keys_user_apis
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

const {drft} = require("../../models/attendee_draft");

var rptRouters = express.Router();

var date_made = function() {
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    return newdate = year + "/" + month + "/" + day;
};
rptRouters.use(bodyParser.json());
rptRouters.use(bodyParser.urlencoded({
    extended: false
}));
rptRouters.use(build_session);

// => Get a report for only one attendee
rptRouters.get("/:app_id/retrieve/:attendee_id/quiz/details" , api_key_report_auth , (req , res)=>{

    if(req.params.attendee_id == null ) return false ;
    if(req.params.app_id == null ) return false ;

    var application_id = req.params.app_id;
    var attendee_id = req.params.attendee_id
    console.log(attendee_id);
    rpt.findOne({"questionnaire_id":application_id} , (error , qtnrDocument)=>{

        if(error , !qtnrDocument) {
          res.send({error:"application doesn't exists !"})
          return false ;
        }
        var attendee_report_index = qtnrDocument.attendee_details.findIndex(x => x.attendee_id == attendee_id );
        if(attendee_report_index != -1 ){
          var attendee_report = qtnrDocument.attendee_details.find(x => x.attendee_id == attendee_id );
          res.send(attendee_report);
        }else {
          res.send({error:"This attendee not found !"});
        }
    });
});
// ==> Add report ( all questions )
rptRouters.post("/:app_id/add/attended/quiz" ,api_key_report_auth , (req , res)=>{
    var application_id = req.params.app_id;
    if(!req.body.attendee_object || req.body.attendee_object == null )
      {
          return new Promise((resolve , reject)=>{
            res.send({
              error : "attendee_object is required !"
            });
          });
      }

    var attendee_object = req.body.attendee_object;


    qtnr.findOne({_id:application_id} , (error , qtnrDocument)=>{
        if (!qtnrDocument || error){
           return new Promise((resolve , reject )=>{
             res.status(404).send(notes.Errors.Error_Doesnt_exists("Application"));
           });

           return false;
        }
    });

    // building +++++++++++++++++++++++++++++++++++++++++++
    rpt.findOne({"questionnaire_id":application_id} , (error , rptDocument)=>{
      var report = rptDocument ;
      var reportObject


      if(error || !report){


        reportObject = new Object();
        // => Add New Report
        reportObject['attendees'] = new Array ();
        reportObject['history'] = new Array ();
        reportObject['statistics'] = new Array ();
        reportObject['attendee_details'] = new Array ();
        reportObject['questionnaire_id'] = application_id;
        reportObject['questionnaire_info'] = application_id;
        reportObject['app_type'] = attendee_object.impr_application_object.app_type;
        reportObject['creator_id']= attendee_object.impr_application_object.creator_id;;
        reportObject['created_at'] = new Date();
        reportObject['updated_at'] = new Date();




        /*  Building ....  *///attendee_object
        // ========================================>>>>>

          // ==> [A] Attendees --------------------------------
              // Givens
              var quiz_results = {
                right_answers : 0 ,
                wrong_answers  : 0
              }
              // 1 ) - questions
              var questions = new Array();
              var is_correct_val = true ;
              for (var i = 0; i < attendee_object.questions_data.length; i++) {
                var question_data = attendee_object.questions_data[i];
                // ==> I - question data
                var question_object = new Object();
                question_object['_id'] = mongoose.Types.ObjectId() ;
                question_object['question_id'] = question_data.question_id;
                question_object['questions'] = new Object();
                    question_object['questions']['question_id'] = question_data.question_id ;
                    question_object['questions']['question_body'] = question_data.question_text ;
                    question_object['questions']['question_type'] =question_data.question_type ;
                question_object['answers'] = new Object();
                    question_object['answers']['answer_id'] = new Array(); // fill it right now
                    question_object['answers']['answer_body'] = new Object();  // fill it
                question_object['is_correct'] = true ; // fill it

                // ==> II - Answer data
                var answer_obj = question_data.answer_ids;
                for (var ix = 0; ix < answer_obj.length; ix++) {
                  var attendee_answers = answer_obj[ix];
                  // push attendee answers into qustion data in report
                  question_object.answers.answer_id.push(attendee_answers.answer_id);
                  question_object.answers.answer_body['answer_id_'+attendee_answers.answer_id] = new Object();
                  question_object.answers.answer_body['answer_id_'+attendee_answers.answer_id]['answer_id'] = attendee_answers.answer_id;
                  question_object.answers.answer_body['answer_id_'+attendee_answers.answer_id]['answer_body'] = attendee_answers.answer_object;
                  question_object.answers.answer_body['answer_id_'+attendee_answers.answer_id]['is_correct']  = attendee_answers.is_correct;
                }

                // ==> III - Calculate correct Answers

                if( question_data.answer_ids.length != question_data.correct_answers.length ){
                  // wrong answer
                  quiz_results.wrong_answers = quiz_results.wrong_answers + 1;
                  question_object['is_correct'] = false ;
                }else {
                  var correct_answers = question_data.correct_answers;
                  for (var iv = 0; iv < correct_answers.length; iv++) {
                      var right_answer = correct_answers[iv];
                      var is_right = question_data.answer_ids.findIndex(x => x.answer_id == right_answer);
                      if(is_right == -1){
                        question_object['is_correct'] = false ;
                        quiz_results.wrong_answers = quiz_results.wrong_answers + 1;
                        break;
                      }
                  }
                }

                // => calculate the right answers
                quiz_results.right_answers = Math.round(attendee_object.questions_data.length - quiz_results.wrong_answers) ;
                // ==> IV register it into questions argument
                questions.push(question_object);
              }


            // ==> Main  Calculation
            var right_question_counts = quiz_results.right_answers;
            var quiz_question_counts =parseInt(attendee_object.impr_application_object.questions.length);
            var grade_setting_value =  parseInt(attendee_object.impr_application_object.settings.grade_settings.value);
            var attendee_grade_perc = Math.round(right_question_counts * 100 / quiz_question_counts);

            // 2 ) - Build attendees
            var this_attendee = reportObject.attendees.find(x => x.attendee_id == attendee_object.user_id);
            var this_attendee_index = reportObject.attendees.findIndex(x => x.attendee_id == attendee_object.user_id);
            if(this_attendee_index == -1 ){
              // Add New Attendee
              // ==> [A] Attendee -------------------------------------
              reportObject.attendees.push({
                _id : mongoose.Types.ObjectId() ,
                survey_quiz_answers : questions ,
                attendee_id : attendee_object.user_id ,
                user_information : attendee_object.user_id ,
                is_completed : true  ,
                passed_the_grade : ( attendee_grade_perc >= grade_setting_value ) ? true : false ,
                results : {
                    wrong_answers : quiz_results.wrong_answers,
                    correct_answers : quiz_results.right_answers,
                    count_of_questions : quiz_question_counts ,
                    result : {
                      percentage_value :attendee_grade_perc ,
                      raw_value : quiz_results.right_answers
                    }
                } ,
                created_at : new Date () ,
                updated_at : new Date ()
              });


              // ==> [B] History --------------------------------
              var histor_object = reportObject.history.findIndex(x => x.date_made == date_made().toString());
              if(histor_object == -1 ){
                  reportObject.history.push({
                    date_made : date_made().toString() ,attendee_counts : 1  , _id : mongoose.Types.ObjectId()
                  })
              }else {
                reportObject.history[histor_object].attendee_counts =  reportObject.history[histor_object].attendee_counts + 1 ;
              }



            }else {
              // Update The-Existing Attendee
              this_attendee.survey_quiz_answers = questions ;
              this_attendee.is_completed = true ;
              this_attendee.passed_the_grade = ( attendee_grade_perc >= grade_setting_value ) ? true : false ;
              this_attendee.results.wrong_answers = quiz_results.wrong_answers;
              this_attendee.results.correct_answers = quiz_results.right_answers;
              this_attendee.results.count_of_questions = quiz_question_counts;
              this_attendee.results.result.percentage_value = attendee_grade_perc ;
              this_attendee.results.result.raw_value = quiz_results.right_answers ;
              this_attendee.user_information = attendee_object.user_id ;
              this_attendee.updated_at = new Date();

            }







            // ==> Main  Calculation
            var right_question_counts = quiz_results.right_answers;
            var quiz_question_counts =parseInt(attendee_object.impr_application_object.questions.length);
            var grade_setting_value =  parseInt(attendee_object.impr_application_object.settings.grade_settings.value);
            var attendee_grade_perc = Math.round(right_question_counts * 100 / quiz_question_counts);

            // ==> [D] Attendee_details --------------------------------
            var attendeeDetIndex = reportObject.attendee_details.findIndex(x => x.attendee_id == attendee_object.user_id);
            if(attendeeDetIndex == -1 ){
              // add new
              reportObject.attendee_details.push({
                _id : mongoose.Types.ObjectId()    ,
                attendee_id :attendee_object.user_id ,
                attendee_information : attendee_object.user_id,
                total_questions : quiz_question_counts ,
                pass_mark : ( attendee_grade_perc >= grade_setting_value ) ? true : false ,
                correct_answers : quiz_results.right_answers,
                wrong_answers : quiz_results.wrong_answers,
                status : ( attendee_grade_perc >= grade_setting_value ) ? "Passed" : "Failed",
                score : attendee_grade_perc,
                completed_status : true ,
                created_at : new Date (),
                completed_date : new Date ()
              });
            }else {
              // update
              reportObject.attendee_details[attendeeDetIndex].total_questions = quiz_question_counts ;
              reportObject.attendee_details[attendeeDetIndex].pass_mark = ( attendee_grade_perc >= grade_setting_value ) ? true : false ;
              reportObject.attendee_details[attendeeDetIndex].correct_answers = quiz_results.right_answers ;
              reportObject.attendee_details[attendeeDetIndex].wrong_answers = quiz_results.wrong_answers
              reportObject.attendeattendee_objecte_details[attendeeDetIndex].status = ( attendee_grade_perc >= grade_setting_value ) ? "Passed" : "Failed" ;
              reportObject.attendee_details[attendeeDetIndex].score = attendee_grade_perc;
              reportObject.attendee_details[attendeeDetIndex].completed_date = new Date() ;
            }



            drft.findOne({'application_id':application_id} , (err , raft_document) => {
              if(err && !raft_document) return false ;
              var target_user_index = raft_document.att_draft.findIndex(x => x.user_id == req.body.attendee_object.user_id);
              if(target_user_index != -1){
                var attendee_object = raft_document.att_draft.find(x => x.user_id == req.body.attendee_object.user_id);
                attendee_object.is_completed = true ;
                raft_document.markModified('attendees');
                raft_document.save();
              }
            });
            var rpting = new rpt(reportObject);
            rpting.save().then(()=>{
              res.send("Successed !")
            });
          // res.send({quiz_results: quiz_results , questions : questions  });
        // ========================================>>>>>
      }else  {
        reportObject = report;
        reportObject.updated_at = new Date();




        /*  Building ....  *///attendee_object
        // ========================================>>>>>

          // ==> [A] Attendees --------------------------------
              // Givens
              var quiz_results = {
                right_answers : 0 ,
                wrong_answers  : 0
              }
              // 1 ) - questions
              var questions = new Array();
              var is_correct_val = true ;
              for (var i = 0; i < attendee_object.questions_data.length; i++) {
                var question_data = attendee_object.questions_data[i];
                // ==> I - question data
                var question_object = new Object();
                question_object['_id'] = mongoose.Types.ObjectId() ;
                question_object['question_id'] = question_data.question_id;
                question_object['questions'] = new Object();
                    question_object['questions']['question_id'] = question_data.question_id ;
                    question_object['questions']['question_body'] = question_data.question_text ;
                    question_object['questions']['question_type'] =question_data.question_type ;
                question_object['answers'] = new Object();
                    question_object['answers']['answer_id'] = new Array(); // fill it right now
                    question_object['answers']['answer_body'] = new Object();  // fill it
                question_object['is_correct'] = true ; // fill it

                // ==> II - Answer data
                var answer_obj = question_data.answer_ids;
                for (var ix = 0; ix < answer_obj.length; ix++) {
                  var attendee_answers = answer_obj[ix];
                  // push attendee answers into qustion data in report
                  question_object.answers.answer_id.push(attendee_answers.answer_id);
                  question_object.answers.answer_body['answer_id_'+attendee_answers.answer_id] = new Object();
                  question_object.answers.answer_body['answer_id_'+attendee_answers.answer_id]['answer_id'] = attendee_answers.answer_id;
                  question_object.answers.answer_body['answer_id_'+attendee_answers.answer_id]['answer_body'] = attendee_answers.answer_object;
                  question_object.answers.answer_body['answer_id_'+attendee_answers.answer_id]['is_correct']  = attendee_answers.is_correct;
                }

                 // ==> III - Calculate correct Answers

                if( question_data.answer_ids.length != question_data.correct_answers.length ){
                  // wrong answer
                  quiz_results.wrong_answers = quiz_results.wrong_answers + 1;
                  question_object['is_correct'] = false ;
                }else {
                  var correct_answers = question_data.correct_answers;
                  for (var iv = 0; iv < correct_answers.length; iv++) {
                      var right_answer = correct_answers[iv];
                      var is_right = question_data.answer_ids.findIndex(x => x.answer_id == right_answer);
                      if(is_right == -1){
                        question_object['is_correct'] = false ;
                        quiz_results.wrong_answers = quiz_results.wrong_answers + 1;
                        break;
                      }
                  }
                }

                // => calculate the right answers
                quiz_results.right_answers = Math.round(attendee_object.questions_data.length - quiz_results.wrong_answers) ;
                // ==> IV register it into questions argument
                questions.push(question_object);
              }


            // ==> Main  Calculation
            var right_question_counts = quiz_results.right_answers;
            var quiz_question_counts =parseInt(attendee_object.impr_application_object.questions.length);
            var grade_setting_value =  parseInt(attendee_object.impr_application_object.settings.grade_settings.value);
            var attendee_grade_perc = Math.round(right_question_counts * 100 / quiz_question_counts);



            // 2 ) - Build attendees
            var this_attendee = reportObject.attendees.find(x => x.attendee_id == attendee_object.user_id);
            var this_attendee_index = reportObject.attendees.findIndex(x => x.attendee_id == attendee_object.user_id);
            if(this_attendee_index == -1 ){
              // Add New Attendee
              // ==> [A] Attendee -------------------------------------
              reportObject.attendees.push({
                _id : mongoose.Types.ObjectId() ,
                survey_quiz_answers : questions ,
                attendee_id : attendee_object.user_id ,
                user_information : attendee_object.user_id ,
                is_completed : true  ,
                passed_the_grade : ( attendee_grade_perc >= grade_setting_value ) ? true : false ,
                results : {
                    wrong_answers : quiz_results.wrong_answers,
                    correct_answers : quiz_results.right_answers,
                    count_of_questions : quiz_question_counts ,
                    result : {
                      percentage_value :attendee_grade_perc ,
                      raw_value : quiz_results.right_answers
                    }
                } ,
                created_at : new Date () ,
                updated_at : new Date ()
              });


              // ==> [B] History --------------------------------
              var histor_object = reportObject.history.findIndex(x => x.date_made == date_made().toString());
              if(histor_object == -1 ){
                  reportObject.history.push({
                    date_made : date_made().toString() ,attendee_counts : 1  , _id : mongoose.Types.ObjectId()
                  })
              }else {
                reportObject.history[histor_object].attendee_counts =  reportObject.history[histor_object].attendee_counts + 1 ;
              }



            }else {
              // Update The-Existing Attendee
              this_attendee.survey_quiz_answers = questions ;
              this_attendee.is_completed = true ;
              this_attendee.passed_the_grade = ( attendee_grade_perc >= grade_setting_value ) ? true : false ;
              this_attendee.results.wrong_answers = quiz_results.wrong_answers;
              this_attendee.results.correct_answers = quiz_results.right_answers;
              this_attendee.results.count_of_questions = quiz_question_counts;
              this_attendee.results.result.percentage_value = attendee_grade_perc ;
              this_attendee.results.result.raw_value = quiz_results.right_answers ;
              this_attendee.user_information = attendee_object.user_id ;
              this_attendee.updated_at = new Date();

            }







            // ==> Main  Calculation
            var right_question_counts = quiz_results.right_answers;
            var quiz_question_counts =parseInt(attendee_object.impr_application_object.questions.length);
            var grade_setting_value =  parseInt(attendee_object.impr_application_object.settings.grade_settings.value);
            var attendee_grade_perc = Math.round(right_question_counts * 100 / quiz_question_counts);

            // ==> [D] Attendee_details --------------------------------
            var attendeeDetIndex = reportObject.attendee_details.findIndex(x => x.attendee_id == attendee_object.user_id);
            if(attendeeDetIndex == -1 ){
              // add new
              reportObject.attendee_details.push({
                _id : mongoose.Types.ObjectId()    ,
                attendee_id :attendee_object.user_id ,
                attendee_information : attendee_object.user_id,
                total_questions : quiz_question_counts ,
                pass_mark : ( attendee_grade_perc >= grade_setting_value ) ? true : false ,
                correct_answers : quiz_results.right_answers,
                wrong_answers : quiz_results.wrong_answers,
                status : ( attendee_grade_perc >= grade_setting_value ) ? "Passed" : "Failed",
                score : attendee_grade_perc,
                completed_status : true ,
                created_at : new Date (),
                completed_date : new Date ()
              });
            }else {
              // update
              reportObject.attendee_details[attendeeDetIndex].total_questions = quiz_question_counts ;
              reportObject.attendee_details[attendeeDetIndex].pass_mark = ( attendee_grade_perc >= grade_setting_value ) ? true : false ;
              reportObject.attendee_details[attendeeDetIndex].correct_answers = quiz_results.right_answers ;
              reportObject.attendee_details[attendeeDetIndex].wrong_answers = quiz_results.wrong_answers
              reportObject.attendee_details[attendeeDetIndex].status = ( attendee_grade_perc >= grade_setting_value ) ? "Passed" : "Failed" ;
              reportObject.attendee_details[attendeeDetIndex].score = attendee_grade_perc;
              reportObject.attendee_details[attendeeDetIndex].completed_date = new Date() ;
            }




            drft.findOne({'application_id':application_id} , (err , raft_document) => {
              if(err && !raft_document) return false ;

              var target_user_index = raft_document.att_draft.findIndex(x => x.user_id == req.body.attendee_object.user_id);
              if(target_user_index != -1){
                var attendee_object = raft_document.att_draft.find(x => x.user_id == req.body.attendee_object.user_id);
                attendee_object.is_completed = true ;
                raft_document.markModified('attendees');
                raft_document.save();
              }
            });

          reportObject.markModified('attendees');
          reportObject.save().then((reData)=>{
              res.send("successed");
          });

      } ;


    }); // end report object
}); // end api
//==> ADd answer by answer
rptRouters.post("/:app_id/report/add" , api_key_report_auth , helper , ( req , res ) => {
  // => attendee id | questions id | answer ids |
  var required_fields = new Array();
  if(req.body.attendee_id == null)
    required_fields[required_fields.length] = "attendee_id";
  if(req.body.question_id == null)
    required_fields[required_fields.length] = "question_id";
  if(req.body.answer_ids == null)
    required_fields[required_fields.length] = "answer_ids";

  if(required_fields != 0 ){
    return new Promise((resolve , reject)=>{
      res.send(notes.Messages.Required_Message(required_fields) );
    });
  }

  if(!_.isArray(req.body.answer_ids)){
    return new Promise( (resolve , reject) => {
      res.send({"Warning":"This field 'answer_ids' should be an array !"});
    });
  }

  var attendee_info = req.attendee_info ; // => { id , user_type , full_name , email }
  var answer_ids = req.body.answer_ids ; // => []
  var question_id = req.body.question_id ;
  var application_id = req.params.app_id ;




  qtnr.findOne({_id:application_id} , (error , qtnrDocument)=>{

    if (!qtnrDocument || error){
        return new Promise((resolve , reject )=>{
          res.status(404).send(notes.Errors.Error_Doesnt_exists("Application"));
        });
    }


    if(qtnrDocument.length == 0 ){
      return new Promise((resolve , reject )=>{
        res.status(404).send(notes.Errors.Error_Doesnt_exists("Application"));
      });
    }


   rpt.findOne({"questionnaire_id":qtnrDocument._id , "creator_id": qtnrDocument.creator_id}).then((rptDocument)=>{

     // ========> report object
      var report = rptDocument ;

      // console.log(qtnrDocument.questions);
      // ========> Get question information from ..
      var index_question = _.findIndex(qtnrDocument.questions , {"id": question_id});
      var find_question  = _.find(qtnrDocument.questions , {"id": question_id});

      if(index_question == -1 ){ // Question
        return new Promise((resolve , reject)=>{
          res.send(notes.Errors.Error_Doesnt_exists("Question"));
        });
      }

      // ========> Calculate answer status
      var answers_doesnt_exists = new Array();
      var userAnswers = new Array();
      for( var ans =0; ans < answer_ids.length ; ans++ ){

          var answer_id = answer_ids[ans]  ;
          var ans_index , find_answer ;



          try {
            // ans_index = _.findIndex(find_question.answers_format , {"_id":ObjectID( answer_id ) });
            // find_answer = _.find(find_question.answers_format , {"_id":ObjectID(answer_id)});
            ans_index = find_question.answers_format.findIndex(x => x._id == answer_id );
            ans_index = find_question.answers_format.find(x => x._id == answer_id );
           } catch (e) {
               answers_doesnt_exists[answers_doesnt_exists.length] = ans ;
           }
           userAnswers[userAnswers.length]= {"id":answer_ids[ans]}
           if(ans_index == -1)
             answers_doesnt_exists[answers_doesnt_exists.length] = ans ;

       }


        if(answers_doesnt_exists.length != 0 ){
            var indexes = "[";
            for (var i = 0; i < answers_doesnt_exists.length; i++) {
              indexes = indexes + answers_doesnt_exists[i] ;
              if(i != (answers_doesnt_exists.length - 1 ) ) indexes = indexes + " , " ;
            }
            indexes = indexes + "]";
            return new Promise((resolve, reject) => {
                res.status(404).send({"Error" : "These answers in indexes " + indexes + " doesn't exists !!"});
            });
        }


      var collected_answers = new Object();

      for( var i =0; i < answer_ids.length ; i++ ){
        var answer_id =  answer_ids[i];
        // var ans_index = _.findIndex(find_question.answers_format , {"_id":ObjectID( answer_id ) });
        // var find_answer = _.find(find_question.answers_format , {"_id":ObjectID(answer_id)});
        var ans_index = find_question.answers_format.findIndex( x => x._id == answer_id);
        var find_answer = find_question.answers_format.find( x => x._id == answer_id);


        collected_answers['answer_id_'+answer_id] = new Object();
        collected_answers['answer_id_'+answer_id]['answer_id']  = answer_id;
        if( find_question.question_type == 0 ||  find_question.question_type == 1 ){ // => 0 or 1 question type
          collected_answers['answer_id_'+answer_id]['answer_body']  = find_answer ;


          if(qtnrDocument.app_type == 1 )
            collected_answers['answer_id_'+answer_id]['is_correct'] = find_answer.is_correct; /* @Deprecated in v1.2.0 */

          // ===> correction answer ( in progression ) // Stopped here
          // console.log(find_question.answer_settings);
          // collected_answers['is_correct'] = true ;



          if(qtnrDocument.app_type == 1 ){
              var is_multiple_choice = false ;
              if(find_question.answer_settings != null){
                if(find_question.answer_settings.single_choice != null){
                  if(find_question.answer_settings.single_choice == false)
                    is_multiple_choice = true ;
                }
              }

              if(is_multiple_choice == true ){ // => Many Answer choices
               var qs_answers = find_question.answers_format;
                // sorting all answers and get true ids
               var right_answers = new Array();
               collected_answers['quiz_correct_answers'] = new Object() ;
               for(var qs=0; qs < qs_answers.length ; qs++){
                 if (qs_answers[qs].is_correct == true ){
                   collected_answers['quiz_correct_answers']['answer_'+qs_answers[qs]._id] = qs_answers[qs]
                   right_answers[right_answers.length] = {"id":qs_answers[qs]._id}
                 }
               }

               if ( right_answers.length != answer_ids.length )
                  collected_answers['is_correct'] = false ;
                  else {
                    var ans_is_right = new Array();
                    for(var xhr=0; xhr < right_answers.length ; xhr++){
                      var quiz_right_answer = right_answers[xhr].id.toString();
                      for (var ixr = 0; ixr < userAnswers.length; ixr++) {
                        var userAns = userAnswers[ixr].id.toString();
                        if(userAns == quiz_right_answer){
                          ans_is_right[ans_is_right.length] = true ;
                        }
                      }
                    }
                    if(ans_is_right.length == right_answers.length){
                      collected_answers['is_correct'] = true ;
                    }else
                      collected_answers['is_correct'] = false ;
                  }


                // store the correct answers in quiz app with an array if it array
                // collected_answers['answer_id_'+answer_id]['quiz_correct_answers'] = right_answers ;
              }else { // Single Answer Choice
                if( answer_ids.length > 1 )
                {
                  return new Promise((resolve , reject)=>{
                    res.send({"Message":"This Answer should be one choice , you've many answer ids in 'answer_ids'"});
                  });
                }

                collected_answers['is_correct'] = find_answer.is_correct;
                // store the correct answers in quiz app with an array if it array

              }
          }

        }
        if (find_question.question_type == 2 ) {// => 2 question type
          if (req.body.true_false_value == null) {
             return new Promise((resolve, reject) => {
               res.send(notes.Messages.Required_Message("true_false_value"));
             });
          }
          collected_answers['answer_id_'+answer_id]['answer_body'] = {
            _id                 : find_answer._id ,
            true_false_value    : req.body.true_false_value ,
            boolean_type        : find_answer.boolean_type,
            boolean_value       : find_answer.boolean_value,
            is_correct          : find_answer.is_correct
          };
          collected_answers['is_correct'] = ( req.body.true_false_value == ( (find_answer.boolean_value == "True" && find_answer.boolean_type =="true/false") || (find_answer.boolean_value == "Yes" && find_answer.boolean_type =="yes/no") ) ) ? true : false ;
        }
        if (find_question.question_type == 3 ){ // => 3 question type
          if(req.body.rating_scale_value == null ){
              return new Promise((resolve, reject) => {
                  res.send(notes.Messages.Required_Message("rating_scale_value"));
              });
          }
          if(req.body.rating_scale_value > find_answer.step_numbers ){
              return new Promise((resolve, reject) => {
                res.send("'rating_scale_value' should be less than or equal 'step_numbers'");
              });
          }
          collected_answers['answer_id_'+answer_id]['answer_body']  = new Object()
          collected_answers['answer_id_'+answer_id]['answer_body']['_id'] = find_answer._id ;
          collected_answers['answer_id_'+answer_id]['answer_body']['step_numbers']=find_answer.step_numbers;
          collected_answers['answer_id_'+answer_id]['answer_body']['ratscal_type']=find_answer.ratscal_type;
          collected_answers['answer_id_'+answer_id]['answer_body']['rating_scale_value']=req.body.rating_scale_value;
          if( find_answer.ratscal_type == 0 ){
            if ( find_answer.started_at != null )
              collected_answers['answer_id_'+answer_id]['answer_body']['started_at']=  find_answer.started_at;
            if ( find_answer.centered_at != null )
              collected_answers['answer_id_'+answer_id]['answer_body']['centered_at']=   find_answer.centered_at;
            if ( find_answer.ended_at != null )
              collected_answers['answer_id_'+answer_id]['answer_body']['ended_at']=  find_answer.ended_at;
          }
        }
        if (find_question.question_type == 4 ){
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




      // ==> Attendee Object
      var attendee_object = new Object();
      attendee_object['_id'] = mongoose.Types.ObjectId();
      attendee_object['attendee_id'] = attendee_info.id;
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
      attendee_object['user_information'] = attendee_info.id;

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

      //=> Helper object
      var helper = new Object();
      helper['attendee_id'] = attendee_info.id;


      if(!report){
        var report_object = new Object();
        report_object['questionnaire_id']= qtnrDocument._id;
        report_object['questionnaire_info']= qtnrDocument._id;
        report_object['app_type'] = qtnrDocument.app_type;
        report_object['creator_id'] = qtnrDocument.creator_id;
        report_object['attendees'] = new Array();

        report_object['history'] = new Array();
        if(qtnrDocument.app_type == 0)
        report_object['statistics'] = new Array();
        report_object['attendee_details'] = new Array();
        report_object['created_at'] = new Date();
        report_object['updated_at'] = new Date();


        var reporting = new rpt(report_object);
        reporting.save().then((reports)=>{
            console.log('#1 Create Attendees');
            // #1 Create Attendees
           return reporting.create_attendees(attendee_object );
        }).then((attendee_arguments)=>{
          console.log('#2 Create Questions and answers');
           // #2 Create Questions and answers
           return reporting.create_survey_quiz_answers(question_answers_object , helper);
        }).then((attendee_user)=>{
           // #3 Calculation Part
           console.log('#3 Calculation Part');
           if(qtnrDocument.app_type == 1)
           return reporting.quiz_calculation(attendee_user,qtnrDocument);
        }).then(()=>{
          return reporting.detailed_report ( req.body.attendee_id  , req.params.app_id , qtnrDocument );
        }).then(()=>{

        if(find_question.answer_settings != null ){
           res.send({"Answer_Settings":find_question.answer_settings});
        }else {
           res.send(notes.Errors.Not_Available('answer_settings'))
        }
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
            return rptDocument.detailed_report( req.body.attendee_id  , req.params.app_id , qtnrDocument );
          }).then(()=>{

            // return answer setting each time
            if(find_question.answer_settings != null ){
              res.send({"Answer_Settings":find_question.answer_settings});
            }else {
              res.send(notes.Errors.Not_Available('answer_settings'))
            }
          }).catch((err) => {
            res.send(err);
          });
      }



   }).catch((error)=>{
     return new Promise((resolve, reject) => {
         res.send(error);
     });
   });

 }) ;

});
rptRouters.delete("/:app_id/report/clear" , api_key_report_auth , (req , res) => {

  if( req.body.attendee_id == null ) {
    return new Promise ((resolve , reject)=>{
      res.send(notes.Messages.Required_Message("'attendee_id'")) ;
    });
  }
  var application_id = req.params.app_id ;
  var attendee_id = req.body.attendee_id ;
  rpt.findOne({ questionnaire_id : application_id}, (error, rptDocument) => {

      if (!rptDocument){
            return new Promise((resolve , reject )=>{
              res.send(notes.Errors.Error_Doesnt_exists("Application"));
            });
      }

      var allAttendees = rptDocument.attendees ;
      var attendeeIndex = _.findIndex(rptDocument.attendees , { attendee_id : attendee_id }) ;
      if(attendeeIndex == -1){
        return new Promise((resolve , reject )=>{
          res.send(notes.Errors.Error_Doesnt_exists("Attendee"));
        });
      }
      var users = _.pull(allAttendees , allAttendees[attendeeIndex] );
      rptDocument.markModified('attendees');
      rptDocument.save().then(()=>{
        res.send({"Message": `You're ready to retake this  ${(rptDocument.app_type == 1 ) ? "Quiz !" : "Survey !"}` });
      });
  });

});
rptRouters.post("/:app_id/statistics/report" , api_key_report_auth , (req , res)=>{
  var report_type = req.params.app_id;
  rpt.findOne({"questionnaire_id":report_type}).populate("questionnaire_info").populate("attendees.user_information").exec((error, reportDocument) => {

    if( error || !reportDocument ){
      return new Promise((resolve,reject)=>{
        res.send({"Error":notes.Errors.Error_Doesnt_exists("Application")});
      });
    }
    if(reportDocument.questionnaire_info.app_type != 0 ){
      return new Promise((resolve,reject)=>{
        res.send({"Warning":"This App should be a survey type to show you statistics data"});
      });
    }
    var statistics_report = new Object();
    statistics_report["survey_id"] = reportDocument.questionnaire_info._id;
    statistics_report["survey_name"] = reportDocument.questionnaire_info.questionnaire_title;
    statistics_report["total_attendees"] = reportDocument.attendees.length;
    var statistics = reportDocument.statistics;
    var questions_answers = new Array();
    for (var i = 0; i < statistics.length; i++) {
         var qs_object = new Object();
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

    res.send(statistics_report);
  });
});
rptRouters.post("/:app_id/detailed/report", api_key_report_auth ,( req , res ) => {
  var applicationId = req.params.app_id;
  rpt.findOne({questionnaire_id:applicationId })
  .populate("attendee_details.attendee_information")
  .populate("questionnaire_info")
  .exec((err , rptDocs) => {

    if( err || !rptDocs ){
      return new Promise((resolve,reject)=>{
        res.send({"Error":notes.Errors.Error_Doesnt_exists("Application")});
      });
    }

    // Get Spesific User
    // Get All Users for this app by date
    if(req.body.attendee_id != null){
      var attendee_id = req.body.attendee_id;
      var attendeeIndex = _.findIndex(rptDocs.attendee_details , {attendee_id:attendee_id} );
      var attendeeIndexObj = _.findIndex(rptDocs.attendees , {attendee_id:attendee_id} );
      var attendeeQs = _.find (rptDocs.attendees , {attendee_id:attendee_id} );
      if(attendeeIndex == -1 || attendeeIndexObj == -1 ){
        return new Promise((resolve , reject)=>{
          res.send(notes.Errors.Error_Doesnt_exists("Attendee"));
        });
      }
      var attendee_reportDetails = _.find (rptDocs.attendee_details , {attendee_id:attendee_id} );
      var attendee_igi = _.pick( attendee_reportDetails , ["attendee_information.id","attendee_information.name","attendee_information.email","total_questions","pass_mark","correct_answers","wrong_answers","status","score","completed_status","created_at","completed_date" , "questions"]) ;

      var attend = new Object();
      attend['application_info'] = {
        "app_name":rptDocs.questionnaire_info.questionnaire_title,
        "app_id":rptDocs.questionnaire_info._id ,
        "question_counts":rptDocs.questionnaire_info.questions.length + " Questions"
      };
      attend['application_info'] = attendee_igi ;
      if(req.body.questions != null ){
        var question_flag = attendeeQs.survey_quiz_answers;
        if(req.body.questions == true ){
          attendee_igi['questions'] = new Array();
          for(var iqs = 0; iqs < question_flag.length ; iqs++){
            var qsObject = {
              quesion_id : question_flag[iqs].question_id ,
              question : question_flag[iqs].questions.question_body ,
              question_type : question_flag[iqs].questions.question_type,
              answer : question_flag[iqs].answers
            }
            attendee_igi['questions'].push(qsObject);
          }
        }
      }




      res.send(attend );
      return false;
    }else { // Get all by date and Pagination ( PAGINATION + DATE )
      var attendee_objects = rptDocs.attendee_details;
      // ["attendee_information.id","attendee_information.name","attendee_information.email","total_questions","pass_mark","correct_answers","wrong_answers","status","score","completed_status","created_at","completed_date"]
      var attendee_datax ;
      if(req.body.date != null ){
        var date_required = [];
        if(req.body.date.date_from == null )
        date_required[date_required.length] = "date_from";
        if(req.body.date.date_to == null )
        date_required[date_required.length] = "date_to";

        if(date_required.length !=0){
          res.send({"Error":notes.Messages.Required_Message(date_required)});
          return false ;
        }

        attendee_datax = new Array();
        var from = new Date(req.body.date.date_from);
        var to = new Date(req.body.date.date_to);

        // Specify data according to date --
        for (var i = 0; i < attendee_objects.length; i++) {
          var date_passed = new Date(attendee_objects[i].completed_date);
          if (date_passed >= from && date_passed <= to) {
            var picked = _.pick(attendee_objects[i] , ["attendee_information.id","attendee_information.name","attendee_information.email","total_questions","pass_mark","correct_answers","wrong_answers","status","score","completed_status","created_at","completed_date" , "questions"]);
            if(req.body.questions != null ){
                if(req.body.questions == true ){
                   picked['questions'] = new Array();
                   var indeAtten = _.findIndex(rptDocs.attendees , {attendee_id:picked.attendee_information.id});
                   if(indeAtten == -1 )
                   break ;

                   var attenFinder = _.find(rptDocs.attendees , {attendee_id:picked.attendee_information.id});
                   var qsAllObj = attenFinder.survey_quiz_answers;
                   for ( var isd = 0; isd < qsAllObj.length; isd++ ) {
                      qsw_obj = {
                          question_id : qsAllObj[isd].question_id ,
                          question : qsAllObj[isd].questions.question_body ,
                          question_type : qsAllObj[isd].questions.question_type,
                          answer : qsAllObj[isd].answers
                      };
                      picked['questions'].push(qsw_obj);
                   }
                }
            }
            attendee_datax.push(picked);
          }
        }
      }else{
         attendee_datax = attendee_objects ;
      }


        // attendee_datax = _.pick(attendee_objects , ["attendee_information.id","attendee_information.name","attendee_information.email","total_questions","pass_mark","correct_answers","wrong_answers","status","score","completed_status","created_at","completed_date"]);

      // sorting if it by pagination
      if(req.body.pagination == null || ! req.body.pagination) {
        return new Promise((resolve,reject) => {
           res.status(400).send(notes.Messages.Required_Message("`pagination` Object"));
        });
      }
     var obj_pagination = new Array();
     if(req.body.pagination.page_number == null )
        obj_pagination[obj_pagination.length]='page_number';
     if(req.body.pagination.records_per_page == null )
        obj_pagination[obj_pagination.length]='records_per_page';
     if(obj_pagination.length != 0 ){
        return new Promise((resolve,reject) => {
          res.status(400).send(notes.Messages.Required_Message(obj_pagination));
        });
     }

      var pageNumber = req.body.pagination.page_number;
      var recordsPerPage = req.body.pagination.records_per_page;



      if (!_.isNumber(pageNumber)) pageNumber = 0;
      if(!_.isNumber(recordsPerPage)) recordsPerPage = config.default_records_per_page ;

      if(pageNumber == 1 || pageNumber < 0) pageNumber = 0 ;
      if(pageNumber != 0 ) pageNumber = pageNumber - 1 ;
      if(recordsPerPage == 0 || recordsPerPage < 0 ) recordsPerPage = config.default_records_per_page;

      var attendee_datax = _.chunk(attendee_datax, recordsPerPage);
      if(pageNumber > (attendee_datax.length - 1)) pageNumber = attendee_datax.length - 1;

      // Get All Data
      res.send({ application_info:{
        "app_name":rptDocs.questionnaire_info.questionnaire_title,
        "app_id":rptDocs.questionnaire_info._id ,
        "question_counts":rptDocs.questionnaire_info.questions.length + " Questions"
      } , attendees : attendee_datax[pageNumber] });
      return false ;
    }
  });
});
rptRouters.post(["/:creator_id/brief/report","/:creator_id/brief/:app_type/report"] , api_key_report_auth , ( req , res )=>{
  var creator_id = req.params.creator_id;
  var report_type = req.params.report_type;
  var queries = new Object();
  // Sorting By Creator
  queries["creator_id"] = creator_id;

    // sorting if it by pagination
    if(req.body.pagination == null || ! req.body.pagination) {
      return new Promise((resolve,reject) => {
         res.status(400).send(notes.Messages.Required_Message("`pagination` Object"));
      });
    }
   var obj_pagination = new Array();
   if(req.body.pagination.page_number == null )
      obj_pagination[obj_pagination.length]='page_number';
   if(req.body.pagination.records_per_page == null )
      obj_pagination[obj_pagination.length]='records_per_page';
   if(obj_pagination.length != 0 ){
      return new Promise((resolve,reject) => {
        res.status(400).send(notes.Messages.Required_Message(obj_pagination));
      });
   }

    // Sorting By Date
    if (req.body.date) {
      if (req.body.date.date_from != null && req.body.date.date_to != null) {
            var query_range = new Object();
                query_range = {
                        "$gte": new Date(req.body.date.date_from),
                        "$lt": new Date(req.body.date.date_to)
                }
                queries["created_at"] = query_range;
         }
     }

    // Sorting if it by app_type
    if (req.params.app_type) {
        if(req.params.app_type != 'quiz' && req.params.app_type != 'survey'){
          return new Promise((resolve,reject)=>{
            res.status(400).send({"Error":"This app is wrong it should be `quiz` Or `survey`"});
          });
        }

        queries["app_type"] = (req.params.app_type == 'quiz') ? 1 : 0;
    }



   var page_number = req.body.pagination.page_number;
   var pages = req.body.pagination.records_per_page;

   rpt.find(queries).populate("questionnaire_info").populate("attendees.user_information").exec((error, reportDocument) => {
     // Creator doesn't exists
     if(reportDocument.length == 0 ){
       return new Promise((resolve , reject)=>{

         var creator_id = queries.creator_id ;
         var sendList = new Array();
         qtnr.find({ "creator_id" : creator_id } , (er,questionnaireResult)=>{
             if(er || !questionnaireResult || questionnaireResult.length == 0)
               {
                 return new Promise((resolve , reject)=>{
                   res.send({
                     Error : "This creator has no applications !"
                   });
                 });
               }

            var quesApplication  = questionnaireResult ;

            for (var i = 0; i < quesApplication.length; i++) {
              var objQuestionnaire = new Object();
              objQuestionnaire['app_id'] = quesApplication[i]._id;
              objQuestionnaire['app_name'] = quesApplication[i].questionnaire_title;
              objQuestionnaire['app_type'] = (quesApplication[i].app_type == 1) ? 'Quiz':'Survey';
              objQuestionnaire['total_questions'] = quesApplication[i].questions.length ;
              objQuestionnaire['total_attendees'] = 0 ;
              objQuestionnaire['total_completed'] = 0 ;
              objQuestionnaire['history'] = "No histories meet your selected criteria"
              sendList.push(objQuestionnaire) ;

            }
            res.status(404).send(sendList);
         });


          // res.status(404).send({"Error":notes.Errors.Error_Doesnt_exists("Application")});
       });
     }

     // Build and detect pagination values
     if (!_.isNumber(page_number)) page_number = 0;
     if(!_.isNumber(pages)) pages = config.default_records_per_page ;

     if(page_number == 1 || page_number < 0) page_number = 0 ;
     if(page_number != 0 ) page_number = page_number - 1 ;
     if(pages == 0 || pages < 0 ) pages = config.default_records_per_page;

     var document_reports = _.chunk(reportDocument, pages);
     if(page_number > (document_reports.length - 1)) page_number = document_reports.length - 1;

     var breif = new Array();


     var current_page = document_reports[page_number] ;

     for (var i = 0; i < current_page.length; i++) {
         var brief_object = new Object();

         var total_passed = _.countBy(current_page[i].attendees, {'passed_the_grade': true});
         var total_is_completed = _.countBy(current_page[i].attendees, {'is_completed': true});
         var total_is_completed_count = _.countBy(current_page[i].attendees, 'results.correct_answers');

         brief_object['app_id'] = current_page[i].questionnaire_info.id;
         brief_object['app_name'] =current_page[i].questionnaire_info.questionnaire_title;
         brief_object['app_type'] = (current_page[i].app_type == 1) ? "Quiz" : "Survey";
         brief_object['total_questions'] = current_page[i].questionnaire_info.questions.length
         brief_object['total_attendees'] = current_page[i].attendees.length;
        //  console.log(current_page[i].questionnaire_info.app_type);
        if(current_page[i].questionnaire_info.app_type == 1)
         brief_object["total_passed"] =     (total_passed.true != null )? total_passed.true : 0 ;
         if(current_page[i].questionnaire_info.app_type == 1)
         brief_object["total_completed"] =  (total_is_completed.true != null )? total_is_completed.true : 0 ;
         brief_object['history'] =current_page[i].history;
        //  console.log(brief_object);
         breif.push(brief_object);
     }

     res.send(breif);
   }) ;

});













rptRouters.patch("/:app_id/clear/report/:attendee_id" , (req,res) => {

  var app_id = req.params.app_id ;
  var attendee_id = req.params.attendee_id ;
  // =================================
  // ==> Report
  // =================================
  rpt.findOne({questionnaire_id : app_id} , (error , reptDoc) => {
    if(reptDoc && reptDoc.length != 0 && !error)  {
    var attendee_object = reptDoc.attendees.findIndex(x => x.attendee_id == attendee_id );
    if(attendee_object != -1 ){
      reptDoc.attendees.splice(attendee_object , 1);
    }
    var attendee_details_object = reptDoc.attendee_details.findIndex(x => x.attendee_id == attendee_id );
    if(attendee_details_object != -1 ){
      reptDoc.attendee_details.splice(attendee_details_object , 1);
    }
    reptDoc.markModified('attendees');
    reptDoc.save();
    }
  });

  drft.findOne({application_id : app_id} , (error , attDraftDoc) => {
    if(attDraftDoc && attDraftDoc.length != 0 && !error) {
      var attendee_draft = attDraftDoc.att_draft.findIndex(x => x.user_id == attendee_id );
      if(attendee_draft != -1 ){
        attDraftDoc.att_draft.splice(attendee_draft , 1);
      }
    }
    attDraftDoc.markModified('att_draft')
    attDraftDoc.save();
  });

  res.send({is_cleared : true , message : "You can retake this quiz now"});
});




rptRouters.post("/:app_id/report_collection/:user_id" , (req , res) => {
  var attendee_draft = req.body.attendee_draft;

  res.send({
    Report_Collection : attendee_draft
  });
});


module.exports = {
    rptRouters
};
