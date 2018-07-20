const express = require("express");
const hbs = require("hbs");
// const bodyParser = require('body-parser');
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
const striptags = require('striptags');

var rptRouters = express.Router();

var date_made = function() {
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    return newdate = year + "/" + month + "/" + day;
};
Array.prototype.find_reported_attendees = function (attendee_draft) {
    return this.filter(function (i) {
      return attendee_draft.findIndex(x => x.attendee_id == i.user_id) === -1;
    });
};

Array.prototype.find_reported_attendees_objec = function (attendee_draft) {
    return this.filter(function (i) {
      return attendee_draft.findIndex( x => x.attendee_id == i.user_id ) === -1;
    });
};

// rptRouters.use(bodyParser.json());
// rptRouters.use(bodyParser.urlencoded({
//     extended: false
// }));


rptRouters.use(build_session);

// => Get a report for only one attendee
rptRouters.get("/:app_id/retrieve/:attendee_id/quiz/details" , api_key_report_auth , (req , res)=>{

    if(req.params.attendee_id == null ) return false ;
    if(req.params.app_id == null ) return false ;

    var application_id = req.params.app_id;
    var attendee_id = req.params.attendee_id
    // console.log(attendee_id);
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

      // // console.log(qtnrDocument.questions);
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
          // // console.log(find_question.answer_settings);
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
            // console.log('#1 Create Attendees');
            // #1 Create Attendees
           return reporting.create_attendees(attendee_object );
        }).then((attendee_arguments)=>{
          // console.log('#2 Create Questions and answers');
           // #2 Create Questions and answers
           return reporting.create_survey_quiz_answers(question_answers_object , helper);
        }).then((attendee_user)=>{
           // #3 Calculation Part
           // console.log('#3 Calculation Part');
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


// rptRouters.post(["/:creator_id/brief/report","/:creator_id/brief/:app_type/report"] , api_key_report_auth , ( req , res )=>{
//   var creator_id = req.params.creator_id;
//   var report_type = req.params.report_type;
//   var queries = new Object();
//   // Sorting By Creator
//   queries["creator_id"] = creator_id;
//
//     // sorting if it by pagination
//     if(req.body.pagination == null || ! req.body.pagination) {
//       return new Promise((resolve,reject) => {
//          res.status(400).send(notes.Messages.Required_Message("`pagination` Object"));
//       });
//     }
//    var obj_pagination = new Array();
//    if(req.body.pagination.page_number == null )
//       obj_pagination[obj_pagination.length]='page_number';
//    if(req.body.pagination.records_per_page == null )
//       obj_pagination[obj_pagination.length]='records_per_page';
//    if(obj_pagination.length != 0 ){
//       return new Promise((resolve,reject) => {
//         res.status(400).send(notes.Messages.Required_Message(obj_pagination));
//       });
//    }
//
//     // Sorting By Date
//     if (req.body.date) {
//       if (req.body.date.date_from != null && req.body.date.date_to != null) {
//             var query_range = new Object();
//                 query_range = {
//                         "$gte": new Date(req.body.date.date_from),
//                         "$lt": new Date(req.body.date.date_to)
//                 }
//                 queries["created_at"] = query_range;
//          }
//      }
//
//     // Sorting if it by app_type
//     if (req.params.app_type) {
//         if(req.params.app_type != 'quiz' && req.params.app_type != 'survey'){
//           return new Promise((resolve,reject)=>{
//             res.status(400).send({"Error":"This app is wrong it should be `quiz` Or `survey`"});
//           });
//         }
//
//         queries["app_type"] = (req.params.app_type == 'quiz') ? 1 : 0;
//     }
//
//    var page_number = req.body.pagination.page_number;
//    var pages = req.body.pagination.records_per_page;
//
//    rpt.find(queries).populate("questionnaire_info").populate("attendees.user_information").exec((error, reportDocument) => {
//      // Creator doesn't exists
//      if(reportDocument.length == 0 ){
//        return new Promise((resolve , reject)=>{
//
//          var creator_id = queries.creator_id ;
//          var sendList = new Array();
//          qtnr.find({ "creator_id" : creator_id } , (er,questionnaireResult)=>{
//              if(er || !questionnaireResult || questionnaireResult.length == 0)
//                {
//                  return new Promise((resolve , reject)=>{
//                    res.send({
//                      Error : "This creator has no applications !"
//                    });
//                  });
//                }
//
//             var quesApplication  = questionnaireResult ;
//
//             for (var i = 0; i < quesApplication.length; i++) {
//               var objQuestionnaire = new Object();
//               objQuestionnaire['app_id'] = quesApplication[i]._id;
//               objQuestionnaire['app_name'] = quesApplication[i].questionnaire_title;
//               objQuestionnaire['app_type'] = (quesApplication[i].app_type == 1) ? 'Quiz':'Survey';
//               objQuestionnaire['total_questions'] = quesApplication[i].questions.length ;
//               objQuestionnaire['total_attendees'] = 0 ;
//               objQuestionnaire['total_completed'] = 0 ;
//               objQuestionnaire['history'] = "No histories meet your selected criteria"
//               sendList.push(objQuestionnaire) ;
//             }
//             res.status(404).send(sendList);
//          });
//
//
//           // res.status(404).send({"Error":notes.Errors.Error_Doesnt_exists("Application")});
//        });
//      }
//
//      // Build and detect pagination values
//      if (!_.isNumber(page_number)) page_number = 0;
//      if(!_.isNumber(pages)) pages = config.default_records_per_page ;
//
//      if(page_number == 1 || page_number < 0) page_number = 0 ;
//      if(page_number != 0 ) page_number = page_number - 1 ;
//      if(pages == 0 || pages < 0 ) pages = config.default_records_per_page;
//
//      var document_reports = _.chunk(reportDocument, pages);
//      if(page_number > (document_reports.length - 1)) page_number = document_reports.length - 1;
//
//      var breif = new Array();
//
//      var current_page = document_reports[page_number] ;
//
//      for (var i = 0; i < current_page.length; i++) {
//          var brief_object = new Object();
//
//          var total_passed = _.countBy(current_page[i].attendees, {'passed_the_grade': true});
//          var total_is_completed = _.countBy(current_page[i].attendees, {'is_completed': true});
//          var total_is_completed_count = _.countBy(current_page[i].attendees, 'results.correct_answers');
//
//          brief_object['app_id'] = current_page[i].questionnaire_info.id;
//          brief_object['app_name'] =current_page[i].questionnaire_info.questionnaire_title;
//          brief_object['app_type'] = (current_page[i].app_type == 1) ? "Quiz" : "Survey";
//          brief_object['total_questions'] = current_page[i].questionnaire_info.questions.length
//          brief_object['total_attendees'] = current_page[i].attendees.length;
//         //  // console.log(current_page[i].questionnaire_info.app_type);
//         if(current_page[i].questionnaire_info.app_type == 1)
//          brief_object["total_passed"] =     (total_passed.true != null )? total_passed.true : 0 ;
//          if(current_page[i].questionnaire_info.app_type == 1)
//          brief_object["total_completed"] =  (total_is_completed.true != null )? total_is_completed.true : 0 ;
//          brief_object['history'] =current_page[i].history;
//         //  // console.log(brief_object);
//          breif.push(brief_object);
//      }
//
//      res.send(breif);
//    }) ;
//
// });


rptRouters.post([ "/:creator_id/brief/report/v1.1" , "/:creator_id/brief/:app_type/report/v1.1" ] , api_key_report_auth , ( req , res ) => {
  var creator_id = req.params.creator_id;
  var report_type = req.params.report_type;
  var queries = new Object();
  queries["creator_id"] = creator_id;
  if(req.body.pagination != null ){
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
   }

  // Sorting By Date
  if (req.body.date) {
    if (req.body.date.date_from != null && req.body.date.date_to != null) {
       var query_range = new Object();
           query_range = {
                   "$gte": new Date(req.body.date.date_from),
                   "$lt": new Date(req.body.date.date_to)
           }
          queries["createdAt"] = query_range;
      }
  }

   // Sorting if it by app_type
  if ( req.params.app_type ){
     if(req.params.app_type != 'quiz' && req.params.app_type != 'survey'){
       return new Promise((resolve,reject)=>{
         res.status(404).send(notes.notifications.show_app_types());
      //  res.status(400).send({"Error":"This app is wrong it should be `quiz` Or `survey`"});
     });
   }
      queries["app_type"] = (req.params.app_type == 'quiz') ? 1 : 0;
  }
  if(req.body.pagination != null ){
    var page_number = req.body.pagination.page_number;
    var pages = req.body.pagination.records_per_page;
  }
    qtnr.find(queries).populate('app_report').exec(function(error, creatorQuestionnaires) {
      if( error || ! creatorQuestionnaires || creatorQuestionnaires.length == 0) {
        return new Promise((resolve , reject)=>{
          res.status(404).send(notes.notifications.show_app_access());
        });
      }
       // ==> Build brief report
       var reports = creatorQuestionnaires ;
       var brief_reports = new Array();
       for (var i = 0; i < reports.length; i++) {
         var brfReport = new Object();
         var documentObject  = reports[i];
         // ==> Calculations
         var total_passed , total_is_completed , total_is_completed_count ;
         if(documentObject.app_report != null )
         total_passed = _.countBy(documentObject.app_report.attendees, {'passed_the_grade': true});
         else     total_passed = 0

         if(documentObject.app_report != null )
          total_is_completed = _.countBy(documentObject.app_report.attendees, {'is_completed': true});
          else total_is_completed = 0;

         if(documentObject.app_report != null )
           total_is_completed_count = _.countBy(documentObject.app_report.attendees, 'results.correct_answers');
           else total_is_completed_count = 0


         brfReport['app_id'] = documentObject._id ;
         brfReport['app_name'] = documentObject.questionnaire_title ;
         brfReport['app_type']= ( documentObject.app_type  == 1) ? "Quiz" : "Survey";
         brfReport['total_questions'] = documentObject.questions.length
          if(documentObject.app_report != null )
         brfReport['total_attendees'] = documentObject.app_report.attendees.length;
         else  brfReport['total_attendees'] =  0

         if(documentObject.app_type == 1)
         brfReport['total_passed']= (total_passed.true != null )? total_passed.true : 0 ;
         if(documentObject.app_type == 1)
         brfReport['total_completed']= (total_is_completed.true != null )? total_is_completed.true : 0 ;
          if(documentObject.app_report != null )
         brfReport['history']= documentObject.app_report.history;
         else
         brfReport['history'] = "No histories meet your selected criteria !" ;
         brief_reports.push(brfReport);
       }

       if(req.body.pagination != null ){
           // ==> Build Paginations and anther options
           if (!_.isNumber(page_number)) page_number = 0;
           if(!_.isNumber(pages)) pages = config.default_records_per_page ;

           if(page_number == 1 || page_number < 0) page_number = 0 ;
           if(page_number != 0 ) page_number = page_number - 1 ;
           if(pages == 0 || pages < 0 ) pages = config.default_records_per_page;

           var brief_reports = _.chunk(brief_reports, pages);
           if(page_number > (brief_reports.length - 1)) page_number = brief_reports.length - 1;
           brf_rports = brief_reports[page_number] ;
      }

      if(req.body.pagination == null )
        brf_rports = brief_reports ;

        // ==> Send list right now
       res.send(notes.notifications.success_calling(brf_rports));
    });

});
rptRouters.post("/:app_id/detailed/report/v1.1", api_key_report_auth ,( req , res ) => {
  var app_id = req.params.app_id ;
  qtnr.findOne({_id : app_id}).populate('app_report').exec(function(error, creatorQuestionnaires) {

    usr.find().then((usrDoc) => {
      if(!usrDoc) return false ;
      var usrObject = usrDoc ; // ==> All users array

      if(error || ! creatorQuestionnaires ){
        return new Promise((resolve, reject) => {
          res.send("Application doesn't exists !");
        });
      }
      var detailed_report = creatorQuestionnaires ;

      var dtls_rpt = new Object();
      dtls_rpt['app_name'] = detailed_report.questionnaire_title;
      dtls_rpt['app_id'] = detailed_report._id;
      dtls_rpt['total_questions'] = detailed_report.questions.length ;



      if(req.body.attendee_id == null ){

              if(dtls_rpt.attendees == undefined )
              dtls_rpt['attendees'] = new Array() ;

              var rptAttendee =  detailed_report.app_report.attendees;

              for (var i = 0; i < rptAttendee.length; i++) {
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

                              // // console.log(question_object);
                              attendee_object['questions'].push(question_object);
                          }


                      }
                    // ==> Sorting From To date
                    if( req.body.date != null ){
                      if( req.body.date.date_from == null  || req.body.date.date_to == null  ){
                        return  new Promise((resolve, reject) => {
                            res.send({
                                error : "`date_from` && `date_to` are required ! in side date object"
                            })
                        });
                        return false ;
                      }

                      // ==> Sorting by date
                      var from = new Date(req.body.date.date_from);
                      var to = new Date(req.body.date.date_to);
                      var date_passed = new Date(attendee_object.completed_date);
                      if (date_passed >= from && date_passed <= to) {
                        dtls_rpt['attendees'].push(attendee_object);
                      }
                    }
                    else
                    dtls_rpt['attendees'].push(attendee_object);


              }
      }else {

          dtls_rpt['attendees'] = new Object();
          var attendee_id = req.body.attendee_id ;
          var rptAttendee =  detailed_report.app_report.attendees;
          var rptAttendeeDetails =  detailed_report.app_report.attendee_details;
          if(rptAttendee.findIndex(x => x.attendee_id == attendee_id) != -1 ){
              this_attendee = rptAttendee.find(x => x.attendee_id == attendee_id);
              this_attendee_details = rptAttendeeDetails.find(x => x.attendee_id == attendee_id);

              dtls_rpt['attendees'] = {
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
                    dtls_rpt['attendees']['questions'] = new Array();
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

                        // // console.log(question_object);
                        dtls_rpt['attendees']['questions'].push(question_object)
                    }
                  }

          }
      }


      // ==> Pagination (options)
      if( req.body.pagination != null && req.body.attendee_id == null  ) {
          if( req.body.pagination.page_number == null || req.body.pagination.records_per_page == null ){
            return new  Promise( (resolve, reject) => {
                res.send({
                  error : "`page_number` && `records_per_page` are required !"
                });
                return false ;
            });
          }

          var all_attendees = dtls_rpt.attendees ;
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
          brf_rports = detail_reports[page_number] ;
          dtls_rpt.attendees = brf_rports
      }

      res.send( dtls_rpt );
    }).catch((err)=>{ // => end usr catch
      res.send(err)
    });
  });
});
rptRouters.post("/:app_id/statistics/report/v1.1" , api_key_report_auth , (req , res)=>{
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

  if(req.body.attendee_draft == null){
    res.send({err:"Unfound attendee_draft"})
    return false ;
  }
  var app_id = req.params.app_id;
  var user_id = req.params.user_id;
  var attendee_draft = req.body.attendee_draft;

  rpt.findOne({questionnaire_id : app_id} , ( error , reptDoc) => {
    var attendee_object_index = attendee_draft.att_draft.findIndex( x => x.user_id == user_id );
    if(attendee_object_index != -1){
        var attendee_obka = attendee_draft.att_draft.find( x => x.user_id == user_id );
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
  });

});


//===========================================|
//=======>>> Deprecated reports
//===========================================|
rptRouters.post(["/:creator_id/brief/report/deprecated","/:creator_id/brief/:app_type/report/deprecated"]
                          , api_key_report_auth , ( req , res )=>{
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
        //  // console.log(current_page[i].questionnaire_info.app_type);
        if(current_page[i].questionnaire_info.app_type == 1)
         brief_object["total_passed"] =     (total_passed.true != null )? total_passed.true : 0 ;
         if(current_page[i].questionnaire_info.app_type == 1)
         brief_object["total_completed"] =  (total_is_completed.true != null )? total_is_completed.true : 0 ;
         brief_object['history'] =current_page[i].history;
        //  // console.log(brief_object);
         breif.push(brief_object);
     }

     res.send(breif);
   }) ;

});


rptRouters.post("/:app_id/detailed/report/deprecated", api_key_report_auth ,( req , res ) => {
  var applicationId = req.params.app_id;
  rpt.findOne({ questionnaire_id : applicationId })
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

//===========================================|
// ==> Updates
//===========================================|
// , "/:creator_id/brief/:app_type/report"

var is_passed = (value) => {
  return value.passed_the_grade == true ;
};
var is_failed = (value) => {
  return value.passed_the_grade == false ;
};


rptRouters.post("/:app_id/detailed/report", api_key_report_auth ,( req , res ) => {

  var app_id = req.params.app_id ;
  qtnr.findOne({_id : app_id}).populate('app_report').populate('att__draft').exec(function(error, creatorQuestionnaires) {

    // ==> Callback issues
    if(error){
      return new Promise((resolve, reject) => {
        res.send(notes.notifications.catch_errors("An error occurred ! , try later"));
      });
    }else if (!creatorQuestionnaires){
      return new Promise((resolve, reject) => {
        res.send(notes.notifications.catch_doesnt_existing_data("Application"));
       });
    }


    // ==> Get All Users

    usr.find().then((usrDoc) => {
        var usrDoc = usrDoc ;

          var detailed_report = creatorQuestionnaires ;
          var detailes_report = new Object() ;
          // => Some Givens
          var online_report  = ( detailed_report.att__draft == null) ? new Array() : detailed_report.att__draft.att_draft;
          var offline_report = ( detailed_report.app_report == null ) ? new Array() : detailed_report.app_report.attendees;
          var questionnaire  = creatorQuestionnaires;

          var unreported = online_report.find_reported_attendees(offline_report);
          // console.log(unreported.length);
          var started_not_started = _.countBy( unreported , { report_attendees : Object() });

          var total_attendee_objects = online_report.length ;
          var started_attendees = (started_not_started.true == undefined ) ? 0 :  started_not_started.true;

          var not_started_attendees = (started_not_started.false == undefined ) ? 0 :  started_not_started.false;
          var completed_apps = offline_report.length ;

          detailes_report['overview'] = new Object();

          detailes_report.overview['total_attendees'] = total_attendee_objects ;
          detailes_report.overview['started'] = started_attendees;
          detailes_report.overview['not_started'] = not_started_attendees;
          detailes_report.overview['completed'] = completed_apps ;

          if(req.body.pagination != null )
          detailes_report['paging'] = new Object();

          // var is_passed = _.countBy( online_report , { 'report_attendees.passed_the_grade': true  }) ;
          var is_passed = _ .countBy( offline_report , ( e ) => {
                if( e.passed_the_grade != undefined )
                  return e.passed_the_grade;
          });

          if(questionnaire.app_type == 1)
            detailes_report.overview['passed'] = ( is_passed.true != undefined ) ? is_passed.true : 0 ;
          if(questionnaire.app_type == 1)
            detailes_report.overview['failed'] = ( is_passed.false != undefined ) ? is_passed.false : 0  ;

          detailes_report['app_info'] = new Object();
          detailes_report['items'] = new Object();



          if( req.body.attendee_id == null ) detailes_report.items = new Array();
          else detailes_report.items = new Object();

          var attendee_lists = new Array();
          detailes_report.app_info['app_id']             = questionnaire._id ;
          detailes_report.app_info['app_name']           = questionnaire.questionnaire_title;
          detailes_report.app_info['total_questions']    = questionnaire.questions.length;
          if ( questionnaire.app_type == 1 )
          detailes_report.app_info['pass_grade']         = questionnaire.settings.grade_settings.value;


          // ==> Case attendee id found
          if ( req.body.attendee_id != null ) {
              var an_online_report_index = online_report.findIndex(x => x.user_id ==  req.body.attendee_id );
              var an_online_report = online_report.find(x => x.user_id ==  req.body.attendee_id );
              if( an_online_report_index == -1  )
                {
                  return new  Promise((resolve, reject) => {
                    res.send(notes.notifications.catch_doesnt_existing_data("Attendee"));
                  });
                  return false;
                }

              var this_user = usrDoc.find(x => x._id == req.body.attendee_id );
              var is_completed_or = offline_report.findIndex(x => x.attendee_id == req.body.attendee_id) ;
              var an_offline = offline_report.findIndex(x => x.attendee_id == req.body.attendee_id )
              var status_cases ;

              if ( questionnaire.app_type == 1 ){
                if ( an_online_report.report_attendee_details == undefined ) status_cases = "Enrolled";
                else if ( an_offline == -1 && an_online_report.report_attendee_details != undefined ) status_cases = "Uncompleted";
                else if ( an_offline != -1 ) {
                var offline_rpt_dtl = detailed_report.app_report.attendee_details.find(x => x.attendee_id == req.body.attendee_id );
                if(offline_rpt_dtl != undefined )
                  status_cases =  offline_rpt_dtl.status;
                }
              }

              detailes_report.items['attendee_id'] = an_online_report.user_id;
              detailes_report.items['email'] = this_user.email ;
              detailes_report.items['name'] = this_user.name;

              if( questionnaire.app_type == 1 )
              detailes_report.items['correct_answers'] = ( an_online_report.report_attendee_details != undefined ) ? an_online_report.report_attendee_details.wrong_answers : 0;
              if( questionnaire.app_type == 1 )
              detailes_report.items['wrong_answers'] = ( an_online_report.report_attendee_details != undefined ) ? an_online_report.report_attendee_details.wrong_answers : 0;
              if( questionnaire.app_type == 1 )
              detailes_report.items['status'] = status_cases;
              if ( questionnaire.app_type == 1 )
              detailes_report.items['score']= ( an_online_report.report_attendee_details != undefined ) ?  an_online_report.report_attendee_details.score : 0;
              detailes_report.items['completed_status']=  ( is_completed_or == -1 ) ? false : true ;
              detailes_report.items['created_at'] = ( an_online_report.report_attendee_details != undefined ) ?  an_online_report.report_attendee_details.created_at : "unkonwn date";
              detailes_report.items['completed_date'] =  ( an_online_report.report_attendee_details != undefined ) ? an_online_report.report_attendee_details.completed_date : "unkonwn date";


               if( req.body.questions != null && req.body.questions == true ){
                    if( an_online_report.attendee_questions != undefined  ){
                      if(an_online_report.attendee_questions.length != 0 )
                      detailes_report.items['questions'] = an_online_report.attendee_questions
                      else
                      detailes_report.items['questions'] ="No questions meet your selected criteria" ;
                    }else detailes_report.items['questions'] ="No questions meet your selected criteria"
               }
                // => End questions

          } // => End Attednee Id not found




          // ==> Case All Attendees
          if ( req.body.attendee_id == null ) {
            for (var i = 0; i < online_report.length; i++) {
                var an_online_rpt = online_report[i];

                var attendee_object = new Object ();
                var status_cases ;
                var user_index = usrDoc.findIndex( x => x._id == an_online_rpt.user_id );
                if(user_index != -1)
                var user_info = usrDoc.find( x => x._id == an_online_rpt.user_id );
                var detailed_online_report = an_online_rpt.report_attendee_details;
                var an_offline = offline_report.findIndex(x => x.attendee_id == an_online_rpt.user_id )
                if ( questionnaire.app_type == 1 ){
                  if ( an_online_rpt.report_attendee_details == undefined ) status_cases = "Enrolled";
                  else if ( an_offline == -1 && an_online_rpt.report_attendee_details != undefined ) status_cases = "Uncompleted";
                  else if ( an_offline != -1 ) {
                    var offline_rpt_dtl = detailed_report.app_report.attendee_details.find(x => x.attendee_id == an_online_rpt.user_id );
                     if(offline_rpt_dtl != undefined )
                      status_cases =  offline_rpt_dtl.status;
                  }
                }






                var is_completed_or = offline_report.findIndex(x => x.attendee_id == an_online_rpt.user_id) ;
                attendee_object['attendee_id'] =  an_online_rpt.user_id ;
                attendee_object['name'] = (user_index != -1) ? user_info.name: 'unkonwn';
                attendee_object['email'] = (user_index != -1) ? user_info.email : 'unkonwn';
                if( questionnaire.app_type == 1 )
                attendee_object['correct_answers'] = ( detailed_online_report == undefined ) ? 0 : detailed_online_report.correct_answers ;
                if( questionnaire.app_type == 1 )
                attendee_object['wrong_answers'] = ( detailed_online_report == undefined ) ? 0 : detailed_online_report.wrong_answers ;
                if( questionnaire.app_type == 1 )
                attendee_object['status'] = status_cases
                if( questionnaire.app_type == 1 )
                attendee_object['score'] = ( detailed_online_report == undefined ) ? 0: detailed_online_report.score;
                attendee_object['completed_status'] = ( is_completed_or == -1 ) ? false : true ;
                attendee_object['created_at'] = ( detailed_online_report != undefined ) ?  detailed_online_report.created_at : "unkonwn date";
                attendee_object['completed_date'] = ( detailed_online_report != undefined ) ?  detailed_online_report.completed_date : "unkonwn date";

                 if( req.body.questions != null && req.body.questions == true ){
                      if( an_online_rpt.attendee_questions != undefined ){
                        if ( an_online_rpt.attendee_questions.length != 0 )
                        attendee_object['questions'] = an_online_rpt.attendee_questions;
                        else
                        attendee_object['questions'] = "No questions meet your selected criteria"
                      }else
                       attendee_object['questions'] = "No questions meet your selected criteria"
                 }




                 if( req.body.date != null ){
                   if( req.body.date.date_from == null  || req.body.date.date_to == null  ){
                     return  new Promise((resolve, reject) => {
                         res.send(notes.notifications.catch_fields("`date_from` && `date_to` are required ! in side date object"));
                     });
                         return false ;
                    }

                    var from = new Date(req.body.date.date_from);
                    var to = new Date(req.body.date.date_to);

                   var date_passed = new Date(attendee_object.completed_date);
                   if (date_passed >= from && date_passed <= to) {
                          detailes_report.items.push(attendee_object);
                          // dtls_rpt['items']['attendees'].push(attendee_object);
                        }
                 }else
                detailes_report.items.push(attendee_object);


                //detailes_report.items
            }

            // ==============================>>> Time And Paging


             if ( req.body.pagination != null && req.body.attendee_id == undefined  ) {
                 if( req.body.pagination.page_number == null || req.body.pagination.records_per_page == null ){
                    return new  Promise( (resolve, reject) => {
                        res.send(notes.notifications.catch_fields ("`page_number` && `records_per_page` are required !"))
                        return false ;
                    });
                  }

                var all_attendees = detailes_report.items ;
                var page_number = req.body.pagination.page_number ;
                var pages = req.body.pagination.records_per_page ;

                if (!_.isNumber(page_number)) page_number = 0;
                if(!_.isNumber(pages)) pages = config.default_records_per_page ;
                if(page_number == 1 || page_number < 0) page_number = 0 ;
                if(page_number != 0 ) page_number = page_number - 1 ;
                if(pages == 0 || pages < 0 ) pages = config.default_records_per_page;

                var detail_rpts ;
                var detail_reports = _.chunk(all_attendees, pages);
                if(page_number > (detail_reports.length - 1)) page_number = detail_reports.length - 1;

                detail_rpts = detail_reports[page_number] ;


                detailes_report.paging['items_count']    = detail_rpts.length ;
                detailes_report.paging['item_per_page']  = pages ;
                detailes_report.paging['total_items']    = all_attendees.length
                detailes_report.paging['page_index']     = page_number
                detailes_report.paging['total_pages']    = detail_reports.length ;

                detailes_report.items = detail_rpts ;
              }
            // ==============================>>>

          } // =>> End all atendees
            res.send({ status_code : 1 , message: 'success'  ,  data : detailes_report });
    }).catch((er)=>{
      return new Promise((resolve, reject) => {
          res.send(notes.notifications.catch_errors("An error occurred ! , try later"));
      });
    });


  });// => End Populate calling
});

rptRouters.post("/:app_id/detailed/report/v0", api_key_report_auth ,( req , res ) => {
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

                              // // console.log(question_object);
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

                        // // console.log(question_object);
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
          dtls_rpt.paging['items_count'] = detail_reports.length; // detail_reports.length ;
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



rptRouters.post("/:app_id/statistics/report" , api_key_report_auth , (req , res) => {
  var app_id = req.params.app_id;
  var queries = { _id : app_id };
  qtnr.findOne(queries).populate('att__draft').populate('app_report').exec( (  _error_ , _document_  ) => {
    var get_all_attendee_questions = ()=> {
      var _pure_questions_ = new Array();
      var pure_all_questions = (XC) => {
        var question_data = XC.questions_data;
        var store_questions = (QS) => {
          if(QS['attendee_id'] == undefined )
             QS['attendee_id'] = XC.user_id ;
          _pure_questions_.push(QS)
        }
          question_data.map(store_questions) ;
          return _pure_questions_ ;
      }
      _online_report_.map(pure_all_questions);
      // console.log(_pure_questions_);
      return _pure_questions_
    }
    if( _error_ || !_document_  ) {
      return new Promise((resolve , reject)=>{
        res.status(404).send({
          message : "failed" ,
          status_code : 0 ,
          error : {
            message : "This Survey does not exists !"
          }
        });
      });
    }

    if( _document_.app_type != 0 ){
      return new Promise((resolve , reject)=>{
        res.status(404).send(notes.notifications.error_app_type());
      });
    }


    var _online_report_ , _questions_ , _offline_report_ ;

    _questions_  = _document_.questions ;
    _offline_report_ = new Array();
    _online_report_ = new Array();

    if(req.body.date != undefined){
      // ==> Search by date
      var show_attendee_with_times_offline = ( AT ) => {
        var completed_date = new Date ( AT.completed_date );
        var date_from = new Date (req.body.date.date_from);
        var date_to = new Date (req.body.date.date_to);
        // console.log(completed_date >= date_from && completed_date <= date_to);
        if( completed_date >= date_from && completed_date <= date_to )
          {
            _offline_report_.push(AT);
          }
      };
      var show_attendee_with_times = ( AT ) => {
        var completed_date = new Date ( AT.report_attendee_details.completed_date );
        var date_from = new Date (req.body.date.date_from);
        var date_to = new Date (req.body.date.date_to);
        // // console.log(completed_date >= date_from && completed_date <= date_to);
        if( completed_date >= date_from && completed_date <= date_to )
          _online_report_.push(AT);

      };
      if(_document_.att__draft != undefined)
       _document_.att__draft.att_draft.map(show_attendee_with_times);
       if(_document_.app_report != undefined)
       _document_.app_report.attendee_details.map(show_attendee_with_times_offline);
    }else {
      _online_report_  =  ( _document_.att__draft == null ) ? [] : _document_.att__draft.att_draft ;
      _offline_report_ =  ( _document_.app_report == null ) ? [] : _document_.app_report.attendee_details;
    }



    var question_access = [];
    var all_counts = 0 ;
    var _attendee_questions_ = get_all_attendee_questions();
    var build_attendee_list = (QS) => {
      if( QS.question_type == 0 || QS.question_type == 1 ||  QS.question_type == 2 ){
        var question__id = QS.question_id ;
        var question_index = question_access.findIndex(x => x.question_id == question__id )
        var zoom_in_answers = ( ANS ) => {
          var qs_data = question_access.find(x => x.question_id == question__id)
          var answer_exists = qs_data.answers.find( x => x.answer_id == ANS.answer_id );
          if(answer_exists != undefined ){
            var attExists = answer_exists.attendees.indexOf(QS.attendee_id)
            if(attExists == -1 ){
              answer_exists.attendees.push(QS.attendee_id);
            }
          }else {
            qs_data.answers.push({
              answer_id : ANS.answer_id ,
              attendees : [QS.attendee_id]
            });
          }
        };

        if( question_index == -1 ){
           question_access.push({
                    question_id: question__id ,
                    attendees: [ QS.attendee_id ] ,
                    answers :  new Array()
            });
           var qs_data = question_access.find(x => x.question_id == question__id)
           if( qs_data != undefined ){
             QS.answer_ids.map(zoom_in_answers)
           }
        }else{
          var attendee_exsits = question_access[question_index].attendees.indexOf(QS.attendee_id);
          // ==> Store attendees
          if( attendee_exsits == -1 ){
            question_access[question_index].attendees.push(QS.attendee_id);
          }
          // ==> store answers
          QS.answer_ids.map(zoom_in_answers);
        }
      }else if( QS.question_type == 3 ){

        var qs_id = QS.question_id ;
        var attendee_answer_value = QS.answer_ids[0].answer_object.answer_value ;
        var attendee_idx = QS.attendee_id ;

        var question_acc = question_access.find(x => x.question_id == qs_id);
        if( question_acc == undefined ){

          question_access.push({
                   question_id: qs_id ,
                   attendees: [ attendee_idx] ,
                   answers :  [
                     {
                       answer_id : attendee_answer_value ,
                       attendees : [attendee_idx]
                     }
                   ]
           });

        }else {

          var att_id = question_acc.attendees.indexOf( attendee_idx );
          // Push to attendee questions

          if(att_id == -1 ){
            question_acc.attendees.push(attendee_idx);
          }
          // push to answers
          var ans_dt = question_acc.answers.find(x => x.answer_id == attendee_answer_value );
          if(ans_dt != undefined ){
            var atdaas = ans_dt.attendees.indexOf(attendee_idx);
            if(atdaas == -1 ){
              ans_dt.attendees.push(attendee_idx);
            }
          }else {
            question_acc.answers.push({
              answer_id: attendee_answer_value ,
              attendees : [attendee_idx]
            })
          }
        }

      }
    }
    _attendee_questions_.map(build_attendee_list)


    var get_answer_count_percentage_values = ( question_id , answer_id ) => {
      var count_percent  = 0 ;
      var question_data = question_access.find(x => x.question_id == question_id );
      if(question_data != undefined){

        var answer_finder = question_data.answers.find(x => x.answer_id == answer_id );
        if( answer_finder != undefined ){
          var get_all_attendees = ( ATO ) => {
            return ATO.attendees.length;
          };
          var all_answer_counts = question_data.answers.map(get_all_attendees).reduce(( x , y ) =>  x +y )
          var perc_calc = 100 / all_answer_counts ;
          count_percent = perc_calc * answer_finder.attendees.length;
          if(count_percent.toString().length >= 5 )
          count_percent =parseFloat( count_percent.toString().substring(0 , 5))
        }
      }
      return count_percent ;
    }



    var get_rat_scale_percentage_attendee_counts = (question_id , rat_scale_val ) => {
      var rat_counts = 0;
       var get_question_data = question_access.find(x => x.question_id == question_id );
       if(get_question_data != undefined ){
        var leng_attendees = get_question_data.answers.find(x => x.answer_id == rat_scale_val ) ;
         var count_it_right_now = ( xAnswer ) => {
           return xAnswer.attendees.length;
         };
         var count_all_answers = get_question_data.answers.map(count_it_right_now)
         var count_all_values = count_all_answers.reduce((x , y ) => x + y) ;
         var percentage_vvl = 100 / count_all_values ;
         if(leng_attendees == undefined )
         rat_counts = 0 ;
         else
           rat_counts = leng_attendees.attendees.length * percentage_vvl
       }


       if(rat_counts.toString().length >= 5 )
       rat_counts = rat_counts.toString().substring(0 , 5 )
       rat_counts = parseFloat(rat_counts);
       return rat_counts ;
    }

    var get_rat_scale_attendee_counts = (question_id , rat_scale_val ) => {
      var rat_counts = 0;
       var get_question_data = question_access.find(x => x.question_id == question_id );
       if(get_question_data != undefined ){
         var clength = get_question_data.answers.find(x => x.answer_id == rat_scale_val ) ;
         if(clength == undefined ) rat_counts = 0 ;
         else
          rat_counts = clength.attendees.length;
       }
       return rat_counts ;
    }
    var get_answer_count_values = ( question_id , answer_id ) => {
      var counts  = 0 ;
      var question_data = question_access.find(x => x.question_id == question_id );
      if(question_data != undefined){
        var answer_finder = question_data.answers.find(x => x.answer_id == answer_id );
        if( answer_finder != undefined ){
           counts = answer_finder.attendees.length ;
        }
      }
      return counts ;
    }

    var get_answers_percentage_free_text_answers = ( question_id , report , question_attendee_counts ) => {
      var question_finder = _questions_.find(x => x._id == question_id );
      var answer_arguments = new Array() ;
      if( question_finder != undefined ){
        var anwer_id = question_finder.answers_format[0]._id ;
        var get_all_free_text_questions = (QS) => {
           if( QS.question_id == question_id ){
             var user_answer = QS.answer_ids[0].answer_object.answer_value;
             var detect_if_qs_found_before = answer_arguments.findIndex( x => x.answer_body == user_answer );
             if(detect_if_qs_found_before == -1 ){
               var bdAnswer = {
                  _id : anwer_id ,
                  answer_body :user_answer ,
                  attendee_raw_count:1
                }
                answer_arguments.push(bdAnswer);
             }else{
               answer_arguments[detect_if_qs_found_before].attendee_raw_count =  answer_arguments[detect_if_qs_found_before].attendee_raw_count + 1 ;
             }
           }
        }
          _attendee_questions_.map(get_all_free_text_questions);

      }
      return answer_arguments ;
    };
    var get_answers_percentage_rating_scale_free_texts = ( question_id , report , question_attendee_counts )=>{
      var question_finder = _questions_.find(x => x._id == question_id );
      var answer_arguments = new Array() ;
      if( question_finder != undefined ){
         var sorting_rating_scale_answers = ( ANS ) => {

          answer_arguments.push({
             _id : ( ('undefined' + '_'+ANS.rat_scl_value) != ANS._id ) ? ANS._id : 'd1f4e5r4erer5w5d5er54_'+ ANS.rat_scl_value,
             answer_body :ANS.rat_scl_value,
             attendee_percentage_count: get_rat_scale_percentage_attendee_counts(question_id , ANS.rat_scl_value) ,
             attendee_raw_count: get_rat_scale_attendee_counts(question_id , ANS.rat_scl_value)
           });
           return answer_arguments ;
         }
         question_finder.answers_format[0].rating_scale_answers.map(sorting_rating_scale_answers);
      }
      return answer_arguments ;
    };
    var get_answers_percentage = ( question_id , report ) => {
      var question_finder = _questions_.find(x => x._id == question_id );
      var answer_lists = new Array ();
      if( question_finder != undefined ){
        var get_all_answers = ( ANS ) => {
          var answer_values = new Object() ;
          if( question_finder.question_type == 0 ){

            answer_values['_id'] = ANS._id ;
            answer_values['answer_body'] = ANS.value ;
            answer_values['attendee_raw_count'] = get_answer_count_values( question_id , ANS._id );
            answer_values['attendee_percentage_count'] = get_answer_count_percentage_values( question_id , ANS._id );
          }
          if(question_finder.question_type == 1 ){
            answer_values['_id'] = ANS._id ;
            var no_media_here = config.server_ip + 'img/media-icon.png' ;
             if(ANS.media_src != undefined && no_media_here == ANS.media_src )
                 answer_values['answer_body'] = "No Media Here !";
              else    answer_values['answer_body'] = ANS.Media_directory;

            answer_values['attendee_raw_count'] =   get_answer_count_values( question_id , ANS._id );
            answer_values['attendee_percentage_count']   = get_answer_count_percentage_values( question_id , ANS._id );;
          }
          if(question_finder.question_type == 2 ){
            console.log();
            answer_values['_id'] = ANS._id ;
            answer_values['answer_body'] = ANS.boolean_value;
            answer_values['attendee_raw_count'] =   get_answer_count_values( question_id , ANS._id );
            answer_values['attendee_percentage_count']   = get_answer_count_percentage_values( question_id , ANS._id );;
          }
          return answer_values ;
        };
        return question_finder.answers_format.map( get_all_answers );
      }else return [];
    }
    var get_question_attendee_counts = ( qustion_id ) => {
        var attendee_question_ata = [] ;
        var map_one_by_one = (AT) => {
          var all_questions = AT.questions_data;
          var question_index = all_questions.findIndex(x => x.question_id == qustion_id );
          if(question_index != -1){
            var question_object_dt = all_questions.find(x => x.question_id == qustion_id );
            attendee_question_ata.push(question_object_dt);
          }
        };
        _online_report_.map(map_one_by_one);
        return attendee_question_ata.length;
     };
    var show_all_questions = ( questions , reports ) => {
       var question_lists = new Array() ;

       // ==> Questions
       var question_invocation = ( QS ) => {
         var question_object = {
             question_id : QS._id ,
             question : striptags(QS.question_body).replace("&nbsp;",'')  ,
             question_type : QS.question_type ,
             count_of_attendees : get_question_attendee_counts( QS._id )
         };


         if( QS.question_type == 0 || QS.question_type == 1 || QS.question_type == 2  )
          question_object['answers'] = get_answers_percentage( QS._id , _online_report_) ;

          if(QS.question_type == 3 )
           question_object['answers'] = get_answers_percentage_rating_scale_free_texts ( QS._id , _online_report_ , get_question_attendee_counts( QS._id )) ;

          if(QS.question_type == 4 )
           question_object['answers'] = get_answers_percentage_free_text_answers( QS._id , _online_report_ , get_question_attendee_counts( QS._id ));

         question_lists.push(question_object);
       };
       questions.map(question_invocation);
       return question_lists ;
     };

     var app_manager = new Object();
     app_manager['app_info'] = new Object();
     app_manager['overview'] = new Object();
     app_manager['questions'] =  show_all_questions ( _questions_ , _online_report_ );

     // Calculations
     var unreported = _online_report_.find_reported_attendees(_offline_report_);
     var started_and_not = _.countBy( unreported , { "report_attendees" : Object() });
     var started_attendees = (started_and_not.true == undefined ) ? 0 :  started_and_not.true; ;
     var not_started_attendees = ( started_and_not.false == undefined ) ? 0 :  started_and_not.false;

     // App info.
     app_manager.app_info['survey_id'] = _document_._id ;
     app_manager.app_info['survey_name'] = _document_.questionnaire_title ;
     app_manager.app_info['total_questions'] = _questions_.length ;

     // Overview
     app_manager.overview['total_attendees'] =  _online_report_.length
     app_manager.overview['started'] = started_attendees;
     app_manager.overview['not_started']= not_started_attendees ;
     app_manager.overview['completed']= _offline_report_.length;

    res.send({
      status_code : 1 ,
      message :"success" ,
      data : app_manager
    });
  });
});

rptRouters.post(
  [
    "/:creator_id/brief/report" ,
    "/:creator_id/brief/:app_type/report"
  ]
   , api_key_report_auth , ( req , res ) => {

    // ==> Sorting by Params
    var creator_id = req.params.creator_id;
    var app_type = req.params.app_type ;
    var app_manager = new Object();
    var queries = new Object();

    // ==> Sorting by specific data
    if ( creator_id != null )
      queries['creator_id'] = creator_id ;

    if ( app_type != null )
      queries['app_type'] = ( app_type.toLowerCase() == 'quiz') ? 1 : 0 ;



    // ==> Sorting it by pagination
    if( req.body.pagination != null ){
          if(req.body.pagination == null || ! req.body.pagination) {
              return new Promise((resolve,reject) => {
                 res.status(400).send(notes.notifications.catch_fields(notes.Messages.Required_Message("`pagination` Object")));
              });
            }
          var obj_pagination = new Array();
          if(req.body.pagination.page_number == null )
              obj_pagination[obj_pagination.length]='page_number';
          if(req.body.pagination.records_per_page == null )
              obj_pagination[obj_pagination.length]='records_per_page';
          if(obj_pagination.length != 0 ){
              return new Promise((resolve,reject) => {
                res.status(400).send(notes.notifications.catch_fields(notes.Messages.Required_Message(obj_pagination)));
              });
           }

         var page_number = req.body.pagination.page_number;
         var pages = req.body.pagination.records_per_page;
     }
     var application_args_info = (object) => {
       var applications = {
         quizzes : new Array() ,
         surveys : new Array()
       };
       var zoom_in_apps = (objx) => {
         if ( objx.app_type == 1 ) applications.quizzes.push(objx)
         else applications.surveys.push(objx)
       }
       object.map(zoom_in_apps);
       return applications ;
     };
    var attendee_structure_counts = function ( object  , from = null , to = null ){
      /* report_attendee_details - att_draft []*/
      var all_attendees = {
        quizzes : new Array(),
        surveys : new Array()
      };
      var attendee_counts = {
        quizzes : 0 ,
        surveys : 0
      } ;


      var zoom_in_this_date_object = (date_object) => {
         var attendee_atgs = {
           quizzes : new Array() ,
           surveys : new Array()
         }
         var completed_date = new Date (date_object.report_attendee_details.completed_date) ;
         var date_from = new Date (from);
         var date_to = new Date (to);

         if(completed_date >= date_from && completed_date <= date_to ){
           if(date_object.impr_application_object.app_type == 1 ){
             attendee_atgs.quizzes.push(date_object);
             all_attendees.quizzes.push(attendee_atgs.quizzes.length);
            }else {
             attendee_atgs.surveys.push(date_object);
             all_attendees.surveys.push(attendee_atgs.surveys.length);
           }
         }


      };
      var atendee_searched_by_date = (object) => {
          if(from != null && to != null ) {
            object.att__draft.att_draft.map(zoom_in_this_date_object)
          }
      }
      var attendee_draft_arguments = ( object ) => {
          if(from == null && to == null){
            if(object.app_type == 1 )
              all_attendees.quizzes.push(object.att__draft.att_draft.length);
            else
              all_attendees.surveys.push(object.att__draft.att_draft.length);

          }


      }


      // ==> Proccess

      if ( from == null && to == null ) {
        object.map(attendee_draft_arguments); ;
        attendee_counts.quizzes = ( all_attendees.quizzes.length != 0 ) ? all_attendees.quizzes.reduce((x , y) => x + y) : 0 ;
        attendee_counts.surveys = ( all_attendees.surveys.length != 0 ) ? all_attendees.surveys.reduce((x , y) => x + y) : 0 ;
      } else if( from != null && to != null ) {
        object.map(atendee_searched_by_date); ;
        attendee_counts.quizzes = ( all_attendees.quizzes.length != 0 ) ? all_attendees.quizzes.reduce((x , y) => x + y) : 0 ;
        attendee_counts.surveys = ( all_attendees.surveys.length != 0 ) ? all_attendees.surveys.reduce((x , y) => x + y) : 0 ;
      }

      return attendee_counts ;
    };
    // ==> Start the query here !
    qtnr.find(queries).populate('app_report').populate('att__draft').exec(function(error, creatorQuestionnaires){
      if( error || ! creatorQuestionnaires || creatorQuestionnaires.length == 0) {
        return new Promise((resolve , reject)=>{
          res.status(404).send(notes.notifications.show_app_access());
        });
      }

      _offline_report_ =  ( creatorQuestionnaires.app_report == null || creatorQuestionnaires.app_report == undefined ) ? [] : creatorQuestionnaires.app_report.attendee_details;

      var applications_atendee_through_date_range = (apps) => {
        var counts = 0 ;
        var atts_x = new Array ();
        var zoome_in_quiz_students = (current_object) => {
          var completed_date_in_one =  new Date (current_object.report_attendee_details.completed_date) ;
          var started_at_date = new Date(req.body.date.date_from);
          var ended_at_date = new Date(req.body.date.date_to);
          if(completed_date_in_one >= started_at_date && completed_date_in_one <= ended_at_date )
            atts_x.push(current_object);
        }
        apps.att__draft.att_draft.map(zoome_in_quiz_students);
        counts = atts_x.length ;
        return counts ;
      }
      var storing_items = ( questionnaires  , app_manager , pagination = null , date = null ) => {

        var organize_questionnaire_info = (applications) => {
          var total_passed = 0 , total_completed = 0 ;
          if(applications.app_report != undefined)
          total_passed =   _.countBy(applications.app_report.attendees , {'passed_the_grade': true}) ;

          if(applications.app_report != undefined)
          total_completed = _.countBy(applications.app_report.attendees , {'is_completed': true})   ;


          var all_items = {
              app_id : applications._id,
              app_name: applications.questionnaire_title,
              app_type: applications.app_type,
              total_questions: applications.questions.length,
              total_attendees: 0,
              total_completed: _offline_report_.length
              // history : applications.app_report.history
          }
          console.log(total_completed);
          if( applications.app_type == 1 )
          all_items['total_passed'] = (total_passed.true != null )? total_passed.true : 0
          // => Attendee counts without date range
          if( applications.att__draft != undefined && applications.att__draft.att_draft != null )
          all_items.total_attendees = applications.att__draft.att_draft.length ;
          // ==> Attendee counts if we have date range
          if( date != null )
           all_items.total_attendees = applications_atendee_through_date_range(applications);

          return app_manager.items.push(all_items);
        }
        var app_items = questionnaires.map(organize_questionnaire_info);
        if( pagination != null ){
          // => some givens
          var page_number = req.body.pagination.page_number ;
          var pages = req.body.pagination.records_per_page
          var all_record_counts  = app_manager.items.length ;
          var all_posts = app_manager.items ;
          // => some exceptions
          if (!_.isNumber(page_number)) page_number = 0;
          if(!_.isNumber(pages)) pages = config.default_records_per_page ;
          if(page_number == 1 || page_number < 0) page_number = 0 ;
          if(page_number != 0 ) page_number = page_number - 1 ;
          if(pages == 0 || pages < 0 ) pages = config.default_records_per_page;

          var paging = _.chunk(app_manager.items, pages);
          if(page_number > (all_record_counts - 1)) page_number = all_record_counts - 1;
          // console.log("page_number == " + page_number);
          app_manager.items = paging[page_number] ;
          app_manager.paging = {
            item_per_page : pages ,
            total_items : all_record_counts ,
            page_index : page_number ,
            total_pages : paging.length
          }


          return app_manager ;
        }

      };
      // ==> Date [ filter ]
      if( req.body.date != null ){
          var obj_date = new Array();
          if( req.body.date.date_from == null )
              obj_date[obj_date.length]='date_from';
          if( req.body.date.date_to == null )
              obj_date[obj_date.length]='date_to';
          if( obj_date.length != 0 ){
              return new Promise((resolve,reject) => {
                res.status(400).send(notes.notifications.catch_fields(notes.Messages.Required_Message(obj_date)));
              });
           }
      }


      // ==> Pagination




      var total_quizzes = 0 ;
      var total_surveys = 0 ;
      var date_fields = {
        date_from : null ,
        date_to : null
      } ;

      if( req.body.date != null ){
        date_fields.date_from = req.body.date.date_from
        date_fields.date_to = req.body.date.date_to
      }

      var attendee_counts = attendee_structure_counts(creatorQuestionnaires  , date_fields.date_from , date_fields.date_to ) ;
      var app_type = application_args_info(creatorQuestionnaires);

    // ==> Build structure
      if( req.params.app_type != null ){
        if( req.params.app_type.toLowerCase() == 'quiz' ){
          app_manager['quiz'] = new Object();
          app_manager['quiz']['total'] = app_type.quizzes.length;
          app_manager['quiz']['total_attendees'] = attendee_counts.quizzes;
        }
        if( req.params.app_type.toLowerCase() == 'survey' ){
          app_manager['survey'] = new Object();
          app_manager['survey']['total'] = app_type.surveys.length;
          app_manager['survey']['total_attendees'] = attendee_counts.surveys;
        }
      }else {
        app_manager['quiz'] = new Object();
        app_manager['quiz']['total'] = app_type.quizzes.length;
        app_manager['quiz']['total_attendees'] = attendee_counts.quizzes;

        app_manager['survey'] = new Object();
        app_manager['survey']['total'] = app_type.surveys.length;
        app_manager['survey']['total_attendees'] = attendee_counts.surveys;
      }

      // ==> case excuted paging
      app_manager['items'] = new Array();
      if(req.body.pagination != null )
      app_manager['paging'] = new Object();

      storing_items( creatorQuestionnaires  , app_manager , req.body.pagination , req.body.date );
      res.send(notes.notifications.success_calling(app_manager));
    });
});

module.exports = {
    rptRouters
};
