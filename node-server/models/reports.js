
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
           thisReport.attendees[attendeeIndex].survey_quiz_answers.push(survey_quiz_answers_args);
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
      for (var i=0; i < qsItem.length ; i++){

        thisReport.attendees[attendee_user.index].results.wrong_answers =   (qsItem[i].is_correct != true ) ?  +1 : thisReport.attendees[attendee_user.index].results.wrong_answers ;
        thisReport.attendees[attendee_user.index].results.correct_answers = (qsItem[i].is_correct == true ) ?  +1 : thisReport.attendees[attendee_user.index].results.wrong_answers ; 
      }
      thisReport.attendees[attendee_user.index].results.count_of_questions = thisReport.attendees[attendee_user.index].survey_quiz_answers.length ;

      // ===> Is completed status
      if(questionnaire.questions.length == thisReport.attendees[attendee_user.index].survey_quiz_answers.length )
        thisReport.attendees[attendee_user.index].is_completed = true ;
      // ===> Grade Calculation
      var correct_answers = thisReport.attendees[attendee_user.index].results.correct_answers ;
      var total_question = thisReport.attendees[attendee_user.index].results.count_of_questions;
      var graded_settings = questionnaire.settings.grade_settings.value ;
      var graded_calc = (correct_answers * 100) / total_question ;
      if(graded_calc >= graded_settings)
        hisReport.attendees[attendee_user.index].passed_the_grade = true ;
      // =====> Results
      thisReport.attendees[attendee_user.index].results.result.row_value = correct_answers ;
      thisReport.attendees[attendee_user.index].results.result.percentage_value = graded_calc ;

      // =====> Save
      thisReport.markModified('attendees');
      thisReport.save();
  }
};
// --------------------------
// Add Default Settings
// --------------------------
var rpt = mongoose.model("reports" , reportSchema );



module.exports = {rpt};
