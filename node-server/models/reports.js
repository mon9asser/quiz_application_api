
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
reportSchema.methods.create_attendees = function (helper ,  attendee_args , send_first_time ){
  var thisReport = this ;
  if(thisReport.attendees.length == 0){
    console.log(attendee_args);
    thisReport.attendees.push(attendee_args);

    return thisReport.save().then((attendee_arguments)=>{
      console.log("Firs time saving the attendee and questionnire !! ");
       return attendee_arguments.attendees[0];
    });
  }else {
    var detect_insearted_value = false ;
      var attendeeId ;
    for (var i = 0; i < thisReport.attendees.length; i++) {

      if(thisReport.attendees[i].attendee_id == attendee_args.attendee_id){
        attendeeId = attendee_args.attendee_id ;
        console.log( thisReport.attendees[i].attendee_id +"{----}"+ attendee_args.attendee_id );
          //if(_.isMatch(thisReport.attendees[i] , { attendee_id : attendee_args.attendee_id })){
        detect_insearted_value = true ;
         console.log("Add to old user ");
        console.log(detect_insearted_value + " ------------------ ");
        thisReport.attendees[i].results =  new Object ();
            thisReport.attendees[i].results.count_of_questions = thisReport.attendees[i].results.count_of_questions+1;
            thisReport.attendees[i].results.wrong_answers = (helper.is_correct_answer == false ) ? thisReport.attendees[i].results.wrong_answers+1 : thisReport.attendees[i].results.wrong_answers+0 ;
            thisReport.attendees[i].results.correct_answers = (helper.is_correct_answer == true ) ? thisReport.attendees[i].results.wrong_answers+1 : thisReport.attendees[i].results.wrong_answers+0 ;;

            thisReport.attendees[i].results.result = {
              row_value  : thisReport.attendees[i].results.correct_answers ,
              percentage_value : thisReport.attendees[i].results.correct_answers * 100 / thisReport.attendees[i].results.count_of_questions
            }

        // Need updates here after done the update records for report
        thisReport.attendees[i].is_completed =
          (helper.count_of_question == thisReport.attendees[i].survey_quiz_answers.length );
        thisReport.attendees[i].passed_the_grade =
         ( helper.is_passed_the_grade >= ( thisReport.attendees[i].results.correct_answers * 100 / thisReport.attendees[i].results.count_of_questions ) )
         console.log("(***************************<<<<<<<1>>>>>>>" + i);
        return thisReport.save().then((attendee_arguments)=>{
           return attendee_arguments.attendees[i];
        });

      }else if( i == (thisReport.attendees.length - 1) && thisReport.attendees[i].attendee_id != attendee_args.attendee_id) {
          var atteddd = thisReport.attendees ;
          console.log(send_first_time);
          //thisReport.update({_id: thisReport._id}, {$addToSet: {atteddd: send_first_time}});

      }
    }



  }



 };

reportSchema.methods.create_survey_quiz_answers = function ( survey_quiz_answers_args , attendee_arguments){
 var thisReport = this ;



  for(var i=0; i < thisReport.attendees.length ; i ++ ){
      if(thisReport.attendees[i]._id == attendee_arguments._id){

          thisReport.attendees[i].survey_quiz_answers.push(survey_quiz_answers_args);
         thisReport.save();
       }
   }


   // console.log(survey_quiz_answers_args);
  // console.log("================================");
  // console.log(attendee_arguments);
  // console.log("================================");
};

// --------------------------
// Add Default Settings
// --------------------------
var rpt = mongoose.model("reports" , reportSchema );



module.exports = {rpt};
