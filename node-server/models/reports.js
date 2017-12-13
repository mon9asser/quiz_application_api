
const { mongoose  } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { reportDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config");

const _ = require("lodash");
const jwt = require("jsonwebtoken");


var reportSchema = mongoose.Schema(reportDataTypes );


// {
//     "__v": 1,
//     "questionnaire_id": "5a1f8f4fb6b309195a38c1fa",
//     "creator_id": "5a1efb401826bd398ecd4dec",
//     "_id": "5a20eaa7ecac5863c483d505",
//     "attendees": [
//         {
//             "_id": "5a20eaa7ecac5863c483d504",
//             "attendee_id": "5a20116b15ad560f287008b6",
//             "is_completed": true,
//             "passed_the_grade": true,
//             "survey_quiz_answers": [
//                 {
//                     "questions": {
//                         "question_body": "What is angularJS ? ",
//                         "question_id": "5a1f906a071d691bdd850690",
//                         "question_type": 2
//                     },
//                     "_id": "5a20eaa7ecac5863c483d506"
//                 }
//             ]
//         }
//     ]
// }
/*
name": "MongoError",
  "message": "E11000 duplicate key error collection: quiz-application.reports
  index: attendees.attendee_id_1 dup key: { : \"5a2303c5684f8a44eacf5145\" }",
  "driver": true,
  "index": 0,
  "code": 11000,
  "errmsg": "E11000 duplicate key error collection: quiz-application.reports
  index: attendees.attendee_id_1 dup key: { : \"5a2303c5684f8a44eacf5145\" }"
*/
reportSchema.methods.create_attendees = function ( attendee_args  ){
    var thisReport = this ;
    var attendee_arguments = this ;
     var attendee = _.findIndex(thisReport.attendees, { 'attendee_id': attendee_args.attendee_id  });
    //  var attendee_arguments = _.find(thisReport.attendees, { 'attendee_id': attendee_args.attendee_id  });
     if(attendee == -1 ){

         thisReport.attendees.push(attendee_args);

         return thisReport.save().then((attendee_arguments)=>{
            var attendeeIndex = _.findIndex(attendee_arguments.attendees, { 'attendee_id': attendee_args.attendee_id  });
            return attendee_arguments.attendees[attendeeIndex];
         });
     }else {
         return attendee_arguments.attendees[attendee];
     }

 };

reportSchema.methods.create_survey_quiz_answers = function (helper , survey_quiz_answers_args ){
     var thisReport = this ;
     var attendee_user = new Object();
     var attendeeIndex = _.findIndex(thisReport.attendees , {'attendee_id':helper.attendee_id} );

     if(attendeeIndex != -1){
       var attendeeApp = _.find(thisReport.attendees , {'attendee_id':helper.attendee_id} );

          var question_exists = _.findIndex(thisReport.attendees[attendeeIndex].survey_quiz_answers , { "question_id": survey_quiz_answers_args.question_id})

         if(question_exists == -1 ){
           /*
            Saving statistic report
            =============================== >> Here
           */

            if(thisReport.app_type == 0 ){
                var statisticIndex = _.findIndex(thisReport.statistics , { "question_id": survey_quiz_answers_args.question_id});
                console.log(" Is this qs here : " + statisticIndex);
                if(statisticIndex == -1 ){
                  // Add new Question
                  var question_status = new Object();
                      question_status['question_id']        =   survey_quiz_answers_args.question_id;
                      question_status['question_body']      =   survey_quiz_answers_args.questions.question_body.question_body;
                      question_status['question_answers']   =   new Array();
                      question_status['attendee_count']     =   1 ;

                  switch (survey_quiz_answers_args.questions.question_type) {

                      case 0:
                        question_status['question_answers'].push({
                            "answer_id" : survey_quiz_answers_args.answers.answer_body._id      ,
                            "answer_body" : survey_quiz_answers_args.answers.answer_body.value  ,
                            "statistics_in_percentage": 100 ,
                            "statistics_in_raw":1,
                        });
                      break;

                      case 1:
                      question_status['question_answers'].push({
                          "answer_id" : survey_quiz_answers_args.answers.answer_body._id      ,
                          "answer_body" : survey_quiz_answers_args.answers.answer_body.media_dir  ,
                          "statistics_in_percentage": 100,
                          "statistics_in_raw":1,
                      });
                      break;

                      case 2:
                      question_status['question_answers'].push({
                          "answer_id" : survey_quiz_answers_args.answers.answer_body._id      ,
                          "answer_body" : survey_quiz_answers_args.answers.answer_body.true_false_value  ,
                          "statistics_in_percentage":100,
                          "statistics_in_raw":1,
                      });
                      break;

                      case 3:
                      question_status['question_answers'].push({
                          "answer_id" : survey_quiz_answers_args.answers.answer_body._id      ,
                          "answer_body" : survey_quiz_answers_args.answers.answer_body.rating_scale_value  ,
                          "statistics_in_percentage":100,
                          "statistics_in_raw":1,
                      });
                      break;

                      case 4:
                      question_status['question_answers'].push({
                          "answer_id" : survey_quiz_answers_args.answers.answer_body._id      ,
                          "statistics_in_percentage": 100,
                          "statistics_in_raw":1,
                      });
                      break;

                  }

                  thisReport.statistics.push(question_status);
                } else {
                  // update the-existing Question > answer
                  var answers = thisReport.statistics[statisticIndex].question_answers ;

                  switch (survey_quiz_answers_args.questions.question_type) {

                      case 0:
                        var questionAnsIndex = _.findIndex(answers , { "answer_body" : survey_quiz_answers_args.answers.answer_body.value });
                        var questionAnswers = _.find(answers , { "answer_body" : survey_quiz_answers_args.answers.answer_body.value });
                         if(questionAnsIndex == -1){
                              var question_status = {
                                  "answer_id" : survey_quiz_answers_args.answers.answer_body._id      ,
                                  "answer_body" : survey_quiz_answers_args.answers.answer_body.value  ,
                                  "statistics_in_percentage": ( 1  * 100 / (thisReport.attendees.length) ),
                                  "statistics_in_raw":1,
                              };
                              answers.push(question_status);
                        }else {
                            answers[questionAnsIndex].statistics_in_raw = answers[questionAnsIndex].statistics_in_raw + 1 ;
                            answers[questionAnsIndex].statistics_in_percentage = ((answers[questionAnsIndex].statistics_in_raw) * 100 ) / thisReport.attendees.length
                        }
                       break;


                      case 1:
                        var questionAnsIndex = _.findIndex(answers , { "answer_body" : survey_quiz_answers_args.answers.answer_body.media_dir });
                        var questionAnswers = _.find(answers , { "answer_body" : survey_quiz_answers_args.answers.answer_body.media_dir });
                         if(questionAnsIndex == -1){
                              var question_status = {
                                  "answer_id" : survey_quiz_answers_args.answers.answer_body._id      ,
                                  "answer_body" : survey_quiz_answers_args.answers.answer_body.media_dir  ,
                                  "statistics_in_percentage": ( 1  * 100 / (thisReport.attendees.length) ),
                                  "statistics_in_raw":1,
                              };
                              answers.push(question_status);
                        }else {
                            answers[questionAnsIndex].statistics_in_raw = answers[questionAnsIndex].statistics_in_raw + 1 ;
                            answers[questionAnsIndex].statistics_in_percentage = ((answers[questionAnsIndex].statistics_in_raw) * 100 ) / thisReport.attendees.length
                        }
                      break;


                      case 2:
                        var questionAnsIndex = _.findIndex(answers , { "answer_body" : survey_quiz_answers_args.answers.answer_body.true_false_value });
                        var questionAnswers = _.find(answers , { "answer_body" : survey_quiz_answers_args.answers.answer_body.true_false_value });
                         if(questionAnsIndex == -1){
                              var question_status = {
                                  "answer_id" : survey_quiz_answers_args.answers.answer_body._id      ,
                                  "answer_body" : survey_quiz_answers_args.answers.answer_body.true_false_value  ,
                                  "statistics_in_percentage": ( 1  * 100 / (thisReport.attendees.length) ),
                                  "statistics_in_raw":1,
                              };
                              answers.push(question_status);
                        }else {
                            answers[questionAnsIndex].statistics_in_raw = answers[questionAnsIndex].statistics_in_raw + 1 ;
                            answers[questionAnsIndex].statistics_in_percentage = ((answers[questionAnsIndex].statistics_in_raw) * 100 ) / thisReport.attendees.length
                        }
                      break;


                      case 3:
                      var questionAnsIndex = _.findIndex(answers , { "answer_body" : survey_quiz_answers_args.answers.answer_body.rating_scale_value });
                      var questionAnswers = _.find(answers , { "answer_body" : survey_quiz_answers_args.answers.answer_body.rating_scale_value });
                       if(questionAnsIndex == -1){
                            var question_status = {
                                "answer_id" : survey_quiz_answers_args.answers.answer_body._id      ,
                                "answer_body" : survey_quiz_answers_args.answers.answer_body.rating_scale_value  ,
                                "statistics_in_percentage": ( 1  * 100 / (thisReport.attendees.length) ),
                                "statistics_in_raw":1,
                            };
                            answers.push(question_status);
                      }else {
                          answers[questionAnsIndex].statistics_in_raw = answers[questionAnsIndex].statistics_in_raw + 1 ;
                          answers[questionAnsIndex].statistics_in_percentage = ((answers[questionAnsIndex].statistics_in_raw) * 100 ) / thisReport.attendees.length
                      }
                      break;


                      case 4:
                      var questionAnsIndex = _.findIndex(answers , { "answer_id" : survey_quiz_answers_args.answers.answer_body._id });
                      var questionAnswers = _.find(answers , { "answer_id" : survey_quiz_answers_args.answers.answer_body._id });
                       if(questionAnsIndex == -1){
                            var question_status = {
                                "answer_id" : survey_quiz_answers_args.answers.answer_body._id      ,
                                "statistics_in_percentage": ( 1  * 100 / (thisReport.attendees.length) ),
                                "statistics_in_raw":1,
                            };
                            answers.push(question_status);
                      }else {
                          answers[questionAnsIndex].statistics_in_raw = answers[questionAnsIndex].statistics_in_raw + 1 ;
                          answers[questionAnsIndex].statistics_in_percentage = ((answers[questionAnsIndex].statistics_in_raw) * 100 ) / thisReport.attendees.length
                      }
                      break;
                   }

                    var attendee_counts = thisReport.attendees.length ;
                    var att_counts = 0 ;

                    for(var i=0; i < answers.length ;i++){
                      var rawStatistics = answers[i].statistics_in_raw;
                      att_counts = att_counts + answers[i].statistics_in_raw ;
                    }

                    for (var i = 0; i < answers.length; i++) {
                       var rawStatistics = answers[i].statistics_in_raw;
                      answers[i].statistics_in_percentage = (rawStatistics * 100 ) / att_counts ;
                      // console.log(i + " - " + (rawStatistics * 100 ) + "/"+ att_counts + " percentage |:===> " + answers[i].statistics_in_percentage);
                    }
                    thisReport.statistics[statisticIndex].attendee_count = att_counts ;

                 }


            }

           /* ------------------------------ */
           thisReport.attendees[attendeeIndex].survey_quiz_answers.push(survey_quiz_answers_args);
           thisReport.attendees[attendeeIndex].updated_at = new Date();
           thisReport.markModified('statistics');
           return thisReport.save().then(()=>{
               attendee_user =  {
                 body   : thisReport.attendees[attendeeIndex] ,
                 index : attendeeIndex
              };
             return attendee_user ;
           });
         }else {
           attendee_user = {
             body   : "This Question is already exists",
             index : -1
           };
           return attendee_user ;
         }
      }
};

reportSchema.methods.quiz_calculation = function (attendee_user , questionnaire){
  var thisReport = this ;
  /*
  results:
      { wrong_answers: 0,
        correct_answers: 0,
        count_of_questions: 0,
        result: [Object] },
     passed_the_grade: false,
     is_completed: false,
   */
  if(attendee_user.index != -1){
      var qsItem = attendee_user.body.survey_quiz_answers ;

      // ====> Results
      var wrongs = 0 ;
      var right = 0 ;
      for (var i=0; i < qsItem.length ; i++){
         //thisReport.attendees[attendee_user.index].results.wrong_answers=+1;
         if ((qsItem[i].is_correct == true )) {
           right++;
         }

         if ((qsItem[i].is_correct != true )) {
           wrongs++;
         }
       }

      thisReport.attendees[attendee_user.index].results.wrong_answers = wrongs ;
      thisReport.attendees[attendee_user.index].results.correct_answers = right ;
      thisReport.attendees[attendee_user.index].results.count_of_questions =  thisReport.attendees[attendee_user.index].survey_quiz_answers.length ;
       if(questionnaire.questions.length == thisReport.attendees[attendee_user.index].survey_quiz_answers.length)
       thisReport.attendees[attendee_user.index].is_completed = true ;
        else
          thisReport.attendees[attendee_user.index].is_completed = false  ;

      // Calculations
      var correct_ans_count = thisReport.attendees[attendee_user.index].results.correct_answers ;
      var total_question = thisReport.attendees[attendee_user.index].results.count_of_questions;
      var graded_settings = questionnaire.settings.grade_settings.value ;

        thisReport.attendees[attendee_user.index].passed_the_grade = true ;


        var graded_attendee =  correct_ans_count * 100 / questionnaire.questions.length ;
        if( graded_attendee >= graded_settings)
        thisReport.attendees[attendee_user.index].passed_the_grade = true ;
        else
        thisReport.attendees[attendee_user.index].passed_the_grade = false ;

        thisReport.attendees[attendee_user.index].results.result.raw_value =    correct_ans_count ;
        thisReport.attendees[attendee_user.index].results.result.percentage_value = graded_attendee ;
      // =====> Save
       thisReport.markModified('attendees');
      thisReport.save();
  }else {

      var attendee_user = {
        body   : "This Question is already exists",
        index : -1
      };

      return attendee_user ;
  }
};
// --------------------------
// Add Default Settings
// --------------------------
var rpt = mongoose.model("reports" , reportSchema );



module.exports = {rpt};
