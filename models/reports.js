
const { mongoose  } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { reportDataTypes } = require("../database/schema");
const { config , apis , notes } = require("../database/config");
const { usr } = require("../models/users");

const _ = require("lodash");
const jwt = require("jsonwebtoken");
var reportSchema = mongoose.Schema(reportDataTypes );

reportSchema.methods.create_attendees = function ( attendee_args  ){
    var thisReport = this ;
    var attendee_arguments = this ;
     var attendee = _.findIndex(thisReport.attendees, { 'attendee_id': attendee_args.attendee_id.toString() });
      //  var attendee_arguments = _.find(thisReport.attendees, { 'attendee_id': attendee_args.attendee_id  });

     if(attendee == -1 ){

          thisReport.attendees.push(attendee_args);
          var object_attendees = { date_made : date_made().toString() , attendee_counts : 1 };
          var dayExist = _.findIndex(thisReport.history , { date_made : date_made().toString() });
          if(dayExist == -1 ){ // add new
              thisReport.history.push(object_attendees);
          }else { // update counts
            thisReport.history[dayExist].attendee_counts =  thisReport.history[dayExist].attendee_counts + 1
          }

          return thisReport.save().then((attendee_arguments)=>{
            var attendeeIndex = _.findIndex(attendee_arguments.attendees, { 'attendee_id': attendee_args.attendee_id  });
            return attendee_arguments.attendees[attendeeIndex];
         });
     }else {

         return attendee_arguments.attendees[attendee];
     }
 };

 var date_made = function() {
     var dateObj = new Date();
     var month = dateObj.getUTCMonth() + 1; //months from 1-12
     var day = dateObj.getUTCDate();
     var year = dateObj.getUTCFullYear();
     return newdate = year + "/" + month + "/" + day;
 };
reportSchema.methods.detailed_report = function (attendeeId , app_id , qtnrObj){
  var report = this ;
  var attendee_id =  attendeeId ;
  var app_object = qtnrObj ;

  // Attendee Object
  var userAttendeeIndex = _.findIndex(report.attendees , {attendee_id:attendee_id} );
  var attendeeInfo = _.find ( report.attendees , { attendee_id:attendee_id });
  if(userAttendeeIndex == -1 )
  {
    return new Promise((resolve , reject)=>{
      reject("this attendee doesn't exists");
      console.log("this attendee doesn't exists");
      return false ;
    });
  }




    if(app_object.app_type == 1){
        var exam_status ;
        if(attendeeInfo.results.result.percentage_value   >= app_object.settings.grade_settings.value)
          exam_status = "Passed";
        else
          exam_status = "Failed";
    }

    var detailed_report_object = new Object();
    detailed_report_object["_id"] = mongoose.Types.ObjectId();

    detailed_report_object["attendee_id"] = attendee_id ;
    detailed_report_object["attendee_information"] = attendee_id;

    detailed_report_object["total_questions"] = attendeeInfo.survey_quiz_answers.length;
    if(app_object.app_type == 1)
    detailed_report_object["pass_mark"] = attendeeInfo.passed_the_grade;
    if(app_object.app_type == 1)
    detailed_report_object["correct_answers"]  = attendeeInfo.results.correct_answers;
    if(app_object.app_type == 1)
    detailed_report_object["wrong_answers"]  = attendeeInfo.results.wrong_answers;
    if(app_object.app_type == 1)
    detailed_report_object["status"] = exam_status ;
    if(app_object.app_type == 1)
    detailed_report_object["score"] = attendeeInfo.results.result.percentage_value;
    detailed_report_object["completed_status"] = attendeeInfo.is_completed;
    detailed_report_object["created_at"] = attendeeInfo.created_at;
    detailed_report_object["completed_date"] = new Date();

    var userDetailedIndex = _.findIndex(report.attendee_details , {attendee_id:attendee_id } );
    if(userDetailedIndex == -1){ // Add New Attendee
      report.attendee_details.push(detailed_report_object)
    }else { // Update The-existing attendee
      var detailed_data_rpt = report.attendee_details[userDetailedIndex];

      if(app_object.app_type == 1){
          var exam_status ;
          if(attendeeInfo.results.result.percentage_value   >= app_object.settings.grade_settings.value)
            exam_status = "Passed";
          else
            exam_status = "Failed";
      }

      detailed_data_rpt["total_questions"] = attendeeInfo.survey_quiz_answers.length;
      if(app_object.app_type == 1)
      detailed_data_rpt["pass_mark"] = attendeeInfo.passed_the_grade;
      if(app_object.app_type == 1)
      detailed_data_rpt["correct_answers"]  = attendeeInfo.results.correct_answers;
      if(app_object.app_type == 1)
      detailed_data_rpt["wrong_answers"]  = attendeeInfo.results.wrong_answers;
      if(app_object.app_type == 1)
      detailed_data_rpt["status"] = exam_status ;
      if(app_object.app_type == 1)
      detailed_data_rpt["score"] = attendeeInfo.results.result.percentage_value;
      detailed_data_rpt["completed_status"] = attendeeInfo.is_completed;
      detailed_data_rpt["created_at"] = attendeeInfo.created_at;
      detailed_data_rpt["completed_date"] = new Date();
    }


  report.markModified('attendee_details');
  return report.save();

}
reportSchema.methods.quiz_calculation = function(attendee_user, questionnaire) {
     var thisReport = this;

     if (attendee_user.index != -1) {
         var qsItem = attendee_user.body.survey_quiz_answers;

         // ====> Results
         var wrongs = 0;
         var right = 0;
         for (var i = 0; i < qsItem.length; i++) {
             //thisReport.attendees[attendee_user.index].results.wrong_answers=+1;
             if ((qsItem[i].is_correct == true)) {
                 right++;
             }

             if ((qsItem[i].is_correct != true)) {
                 wrongs++;
             }
         }

         thisReport.attendees[attendee_user.index].results.wrong_answers = wrongs;
         thisReport.attendees[attendee_user.index].results.correct_answers = right;
         thisReport.attendees[attendee_user.index].results.count_of_questions = thisReport.attendees[attendee_user.index].survey_quiz_answers.length;
         if (questionnaire.questions.length == thisReport.attendees[attendee_user.index].survey_quiz_answers.length)
             thisReport.attendees[attendee_user.index].is_completed = true;
         else
             thisReport.attendees[attendee_user.index].is_completed = false;

         // Calculations
         var correct_ans_count = thisReport.attendees[attendee_user.index].results.correct_answers;
         var total_question = thisReport.attendees[attendee_user.index].results.count_of_questions;
         var graded_settings = questionnaire.settings.grade_settings.value;

         thisReport.attendees[attendee_user.index].passed_the_grade = true;


         var graded_attendee = correct_ans_count * 100 / questionnaire.questions.length;
         if (graded_attendee >= graded_settings)
             thisReport.attendees[attendee_user.index].passed_the_grade = true;
         else
             thisReport.attendees[attendee_user.index].passed_the_grade = false;

         thisReport.attendees[attendee_user.index].results.result.raw_value = correct_ans_count;
         thisReport.attendees[attendee_user.index].results.result.percentage_value = graded_attendee;
         // =====> Save
         thisReport.markModified('attendees');
         thisReport.save();
     } else {

         var attendee_user = {
             body: "This Question is already exists",
             index: -1
         };

         return attendee_user;
     }
 };


// reportSchema.statics.attendee_details = function (attended_info){
//   console.log(attended_info);
// };
reportSchema.methods.create_survey_quiz_answers = function (questions_answers , helper ){
  var thisReport = this ;

  // thisReport.attendee_details("Detailed is Perfect now !! =====================================> ");

  var attendee_user = new Object();

  var attendeeIndex = _.findIndex(thisReport.attendees , {'attendee_id':helper.attendee_id.toString()} );
   // console.log("Attendee Index ::- " + attendeeIndex);
  if(attendeeIndex != -1) { // attendee already exists

    var attendeeApp = _.find(thisReport.attendees , {'attendee_id':helper.attendee_id} );
    var question_exists = _.findIndex(thisReport.attendees[attendeeIndex].survey_quiz_answers , { 'question_id': ObjectID(questions_answers.question_id.toString())})

    if (question_exists == -1) { // Pushing the new Question and answers
      // => statistics report
      if(thisReport.app_type == 0)
      {

      // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++>>>>> Start statistics
         var questions_statistics = new Object();
         var question = _.findIndex(thisReport.statistics , { "question_id": questions_answers.question_id });
         if(question == -1 ){ // question does not exists
           // => Saving first time answer to object
           questions_statistics['question_id'] = questions_answers.question_id ;
           questions_statistics['question_body'] = questions_answers.questions.question_body;
           questions_statistics['attendee_count'] = 1
           questions_statistics['question_answers'] = new Array();
           questions_statistics['attendee_info'] = new Array();
           // looping answers in array and detect each one as alone
           questions_statistics['attendee_info'].push({attendee_id:helper.attendee_id});
          var answers_array = questions_answers.answers.answer_id ;
           for(var i =0; i < answers_array.length ;i++){

             var answer_key = "answer_id_"+ answers_array[i];
             // detect answer is found in this array or not
             var answer_id_index = _.findIndex(questions_statistics['question_answers'] ,{ 'answer_id' : answers_array[i] });

             if(answer_id_index == -1 ){
               // pushing this answer now !
               var answer_boject = new Object() ;
               answer_boject["attendee_info"] = new Array();
               var attendeeExists = _.findIndex(answer_boject["attendee_info"] , { attendee_id : helper.attendee_id} );
               if( attendeeExists == -1 )
               answer_boject["attendee_info"].push({ attendee_id : helper.attendee_id});

               answer_boject["answer_id"] = answers_array[i] ;
               var question_type = questions_answers.questions.question_type ;
               // Detect about answer type
               if(question_type == 0 )
                {answer_boject["answer_body"] = questions_answers.answers.answer_body[answer_key].answer_body.value;}
               else if (question_type == 1 )
                {answer_boject["answer_body"] = questions_answers.answers.answer_body[answer_key].answer_body.media_name; }
               else if (question_type == 2 )
                {answer_boject["answer_body"] = questions_answers.answers.answer_body[answer_key].answer_body.true_false_value ;}
               else if (question_type == 3 )
                {answer_boject["answer_body"] = questions_answers.answers.answer_body[answer_key].answer_body.rating_scale_value;}

               answer_boject["attendee_percentage_count"] = 100;
               answer_boject["attendee_raw_count"] = 1 ;
               questions_statistics['question_answers'].push(answer_boject);
             }else {
               return Promise.reject(notes.Errors.duplication("'"+answers_array[i]+"'") ) ;
             }
           }



           thisReport.statistics.push(questions_statistics);
         }else {
           /*
           questions_statistics['attendee_count'] = 1
           questions_statistics['question_answers'] = new Array();
           */
           // update the existing question
           var exisiting_question = thisReport.statistics[question];

           var existAttendees = _.findIndex(exisiting_question.attendee_info , {attendee_id:helper.attendee_id} );
           if(existAttendees == -1)
           exisiting_question.attendee_info.push({attendee_id:helper.attendee_id});

           var answers_array = questions_answers.answers.answer_id ;
           for(var i=0; i < answers_array.length; i++ ){

             var answer_key = "answer_id_"+ answers_array[i];
             // detect answer is found in this array or not
             var answer_id_index = _.findIndex( exisiting_question.question_answers ,{ 'answer_id' : answers_array[i] });
             if(answer_id_index == -1 ){
                 var answer_boject = new Object() ;
                 answer_boject["answer_id"] = answers_array[i] ;
                 var question_type = questions_answers.questions.question_type ;
                 // Detect about answer type
                 if(question_type == 0 )
                  {answer_boject["answer_body"] = questions_answers.answers.answer_body[answer_key].answer_body.value;}
                 else if (question_type == 1 )
                  {answer_boject["answer_body"] = questions_answers.answers.answer_body[answer_key].answer_body.media_name; }
                 else if (question_type == 2 )
                  {answer_boject["answer_body"] = questions_answers.answers.answer_body[answer_key].answer_body.true_false_value ;}
                 else if (question_type == 3 )
                  {answer_boject["answer_body"] = questions_answers.answers.answer_body[answer_key].answer_body.rating_scale_value;}

                 answer_boject["attendee_percentage_count"] = 500;
                 answer_boject["attendee_raw_count"] = 1 ;

                 answer_boject["attendee_info"] = new Array();
                 answer_boject["attendee_info"].push({ attendee_id : helper.attendee_id});


                 thisReport.statistics[question].question_answers.push(answer_boject);
             }
             else {
               // index : answer_id_index
                var exsisting_answer = thisReport.statistics[question].question_answers[answer_id_index] ;
                exsisting_answer.attendee_raw_count = exsisting_answer.attendee_raw_count + 1;
                exsisting_answer.attendee_percentage_count = exsisting_answer.attendee_percentage_count + 1;
                var attendee = thisReport.statistics[question].question_answers[answer_id_index].attendee_info ;
                 var existing_attendee = _.findIndex(attendee , {attendee_id : helper.attendee_id});
                 if(existing_attendee == -1 )
                thisReport.statistics[question].question_answers[answer_id_index].attendee_info.push({ attendee_id : helper.attendee_id});
                // Calculation part
                // ==> ( Attendee counts in question )
                thisReport.statistics[question].attendee_count = thisReport.statistics[question].attendee_info.length;
                // ==> ( Attendee counts in Answer )
                thisReport.statistics[question].question_answers[answer_id_index].attendee_raw_count = thisReport.statistics[question].question_answers[answer_id_index].attendee_info.length;
                thisReport.statistics[question].question_answers[answer_id_index].attendee_percentage_count = (  thisReport.statistics[question].question_answers[answer_id_index].attendee_raw_count) * 100 / (thisReport.statistics[question].attendee_count)
             }
           }

         }

         ///=====> Making A calc fo all questions
         var questions = thisReport.statistics;
         if(questions.length != 0 ){
           for( var i=0; i < questions.length ; i++ ){
              var qs = questions[i] ;
              // Attendee counts for each question
              qs.attendee_count = questions[i].attendee_info.length;
              // statistics for each answers
              var answers = qs.question_answers ;
              for(var x=0; x < answers.length ; x++ ){
                  var ans = answers[x];

                  var answer_attent_calc_ =  (ans.attendee_info.length * 100 ) /  qs.attendee_count ;
                  var calcu = answer_attent_calc_.toString().substring(0, 5);
                  ans.attendee_raw_count = ans.attendee_info.length ;// ans.attendee_info.length;
                  ans.attendee_percentage_count = calcu ;  //(ans.attendee_raw_count) * 100 / qs.attendee_count;
              }
           }
         }

      // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ End statistics report
    }


      // Pushing the questions to array
        thisReport.attendees[attendeeIndex].survey_quiz_answers.push(questions_answers);
        thisReport.attendees[attendeeIndex].updated_at = new Date();
        thisReport.markModified('statistics');
        return thisReport.save().then(() => {
        attendee_user = {
            body: thisReport.attendees[attendeeIndex],
            index: attendeeIndex
          };
        return attendee_user;
      });
    }else { // update the exisiting question and answer
        attendee_user = {
                body: "This Question is already exists",
                index: -1
            };
      return attendee_user;
    }
  }
};

var rpt = mongoose.model("reports" , reportSchema );
module.exports = {rpt};
