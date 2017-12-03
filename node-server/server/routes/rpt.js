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
    apis,
    config,
    application
} = require("../../database/config");
const {
    authByToken,
    verify_token_user_type,
    verify_session,
    build_session
} = require("../../middlewares/authenticate");
const {
    authByTokenWCreatorType
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

// localhost:3000/5a1f8f4fb6b309195a38c1fa/5a1efb401826bd398ecd4dec/5a1f9095ea9ea31c149f5306/report/edit
rptRouters.post(
  "/:app_id/:attendee_id/create/:question_id/:answer_id"
 ,verify_token_user_type , (req,res)=>{

   var appliation_id =   req.params.app_id;
   var attendee_id   =   req.params.attendee_id;
   var question_id   =   req.params.question_id;
   var answer_id     =   req.params.answer_id;
   var proccessType  =   req.params.proccess;
   var user_id = req.verified_user._id ;
   var token = req.verified_token;
   var userType = req.verified_user_type

   if(user_id != attendee_id){
      return new Promise((resolve , reject)=>{
        res.status(401).send({"Message" : apis.permission_denied });
      });
    }

    // Detect User type should be user attendee
      if(userType != 0){
        return new Promise((resolve , reject)=>{
          res.status(401).send({"Message" : "This is should be user attendee !" });
        });
      }


    qtnr.findById(appliation_id , (error , qtnrDocument )=>{
        if(!qtnrDocument)
         {
           return new Promise((resolve , reject)=>{
             res.status(401).send({"Message" : "This Questionnaire doesn't exists !" });
           });
         }

        var updatedAt = new Date ();
        // get current reattendees
         rpt.findOne( {"questionnaire_id" :qtnrDocument._id , "creator_id":qtnrDocument.creator_id} , (error , rptDocument)=>{
           if(!rptDocument){
             // +++++++++++++++++++++++++++++++++++++++++++++++ Add New
                 // Basics
                 var reportObject = {
                   "questionnaire_id" : qtnrDocument._id,
                   "creator_id" : qtnrDocument.creator_id,
                   "created_at": new Date (),
                   "updated_at": new Date () ,
                   "attendees": []
                 };
                 var attendees = new Object();
                 var attendeed_survey_quiz_answers = new Object();

                 attendees["_id"] =  mongoose.Types.ObjectId();

                 attendees["attendee_id"] = attendee_id ;
                 attendees["is_completed"] =  false  ;
                 attendees["passed_the_grade"] = false ;
                 attendees["results"] = new Object();
                 attendees["survey_quiz_answers"] = new Array();
                 //var wrong_ans =
                 // specify question with id and answer

                 var question_tags = qtnrDocument.questions ;
                 for(var i =0 ; i < question_tags.length; i++){
                  if(question_tags[i]._id == question_id){
                    var answer_format = question_tags[i].answers_format ;
                      for(var x = 0 ; x < answer_format.length; x++){
                        if(answer_format[x]._id == answer_id ){
                            var answer_object = answer_format[x] ;

                            attendees["results"]["correct_answers"] = ( answer_object.is_correct == true) ? 1 : 0 ;
                            attendees["results"]["wrong_answers"] = ( answer_object.is_correct == false ) ? 1 : 0 ;
                            attendees["results"]["count_of_questions"] = 1
                            attendees["results"]["result"] = new Object();
                            attendees["results"]["result"]['percentage_value'] = (attendees["results"]["correct_answers"] * 100 / attendees["results"]["count_of_questions"] )
                            attendees["results"]["result"]['row_value'] = ( answer_object.is_correct ) ? 1 : 0  ;

                            attendeed_survey_quiz_answers["questions"] = new Object();
                            attendeed_survey_quiz_answers["question_id"] = question_tags[i]._id ;
                            attendeed_survey_quiz_answers["questions"]['question_type'] = question_tags[i].question_type;
                            attendeed_survey_quiz_answers["questions"]['question_id'] = question_id ;
                            attendeed_survey_quiz_answers["questions"]['question_body'] = question_tags[i].question_body;
                            attendeed_survey_quiz_answers["answers"] = new Object();
                            attendeed_survey_quiz_answers["answers"]["answer_id"] = answer_id ;
                            attendeed_survey_quiz_answers["answers"]["answer_body"] = answer_format[x] ;
                            attendeed_survey_quiz_answers["is_correct"] = answer_format[x].is_correct  ;
                        }
                      }
                   }
                 }

                 // Build an attendee array list after promise returned
                 var reporting = new rpt(reportObject);
                  reporting.save().then(()=>{
                     return reporting.create_attendees( null , attendees , null);
                  }).then((attendee_arguments)=>{
                      reporting.create_survey_quiz_answers(attendeed_survey_quiz_answers , attendee_arguments);
                   }).then(()=>{
                      res.send(reporting);
                  }).catch((err)=>{
                    res.send(err);
                  });


           }else {
              // +++++++++++++++++++++++++++++++++++++++++++++++ Update
              var question_tags = qtnrDocument.questions ;
              for(var i =0 ; i < question_tags.length; i++){
               if(question_tags[i]._id == question_id){
                 var answer_format = question_tags[i].answers_format ;
                   for(var x = 0 ; x < answer_format.length; x++){
                     if(answer_format[x]._id == answer_id ){
                        rptDocument.updated_at = new Date();
                      //  console.log(answer_format[x]._id +"-----"+ answer_id +"-----" + x);
                        var xvalue = x ;
                        var ivalue = i ;
                        rptDocument.save().then(()=>{

                          var send_first_time = {
                              attendee_id : attendee_id ,
                              is_completed : false ,
                              passed_the_grade : false ,
                              survey_quiz_answers : [] ,
                              results : {
                                wrong_answers : 0 ,
                                correct_answers : 0 ,
                                count_of_questions : 1 ,
                                result : {percentage_value : 50 , row_value : 50 }
                              }
                          };

                        return rptDocument.create_attendees( {
                            count_of_question :  qtnrDocument.questions.length ,
                            is_passed_the_grade : qtnrDocument.settings.grade_settings.value ,
                            is_correct_answer : answer_format[xvalue].is_correct
                          } , {
                              attendee_id : attendee_id
                          } ,
                          send_first_time
                        )
                      }).then((attendee_arguments)=>{
                           var answer_atten = {
                            question_id: question_id ,
                            questions :{ question_type :question_tags[ivalue].question_type , question_id: question_id ,question_body : question_tags[ivalue].question_body } ,
                            answers : { answer_id : answer_format[xvalue]._id , answer_body : answer_format[xvalue]  } ,
                            is_correct : answer_format[xvalue].is_correct
                          }
                            return rptDocument.create_survey_quiz_answers(answer_atten , {_id : attendee_arguments._id});
                        }).then((report_data)=>{

                          res.send(rptDocument);
                        });
                     }
                   }
                 }
               }
           }

         })

    }).catch();


});


module.exports ={
  rptRouters
};
