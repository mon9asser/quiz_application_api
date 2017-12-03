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

           var attendee_object = new Object();
           attendee_object['_id'] = mongoose.Types.ObjectId();
           attendee_object['attendee_id'] = attendee_id;
           attendee_object['is_completed'] = false ;
           attendee_object['passed_the_grade'] = false ;
           attendee_object['results'] = {
             wrong_answers : 0,
             correct_answers : 0,
             count_of_questions : 0,
             result : { percentage_value : 0 , row_value : 0}
           };
           attendee_object['survey_quiz_answers'] = [] ;

           // Detect if question is exists or not
           var target_questionIndex = _.findIndex(qtnrDocument.questions , { "id" :question_id });
           if(target_questionIndex == -1){
             return new Promise((resolve , reject)=>{
                 res.send("This Question id doesn't exists");
             });
           }
           // Detect if Answer is exists or not
           var target_question =_.find(qtnrDocument.questions , { "id" : question_id });
           var all_answer_body = function  (object) {
                 return object._id == answer_id;
             }
           var target_answer = target_question.answers_format.find(all_answer_body);
             if(!target_answer)
             {
               return new Promise((resolve , reject)=>{
                   res.send("This Answer id doesn't exists");
               });
             }

             var reportObject = {
                    "questionnaire_id" : qtnrDocument._id,
                    "creator_id" : qtnrDocument.creator_id,
                    "created_at": new Date (),
                    "updated_at": new Date () ,
                    "attendees": []
                  };

            var survey_and_answers = new Object()
            survey_and_answers["_id"] = mongoose.Types.ObjectId();
            survey_and_answers["question_id"] = target_question._id;
            survey_and_answers["questions"] = new Object();
              survey_and_answers["questions"]["question_type"] = target_question.question_type;
              survey_and_answers["questions"]["question_id"] = target_question._id;
              survey_and_answers["questions"]["question_body"] = target_question ;
            survey_and_answers["answers"] = new Object();
              survey_and_answers["answers"]["answer_id"] = target_answer._id;
              survey_and_answers["answers"]["answer_body"] = target_answer ;
            survey_and_answers["is_correct"] = target_answer.is_correct;

            var helper = new Object();
            helper["attendee_id"] = attendee_id ;

           if(!rptDocument){
             // +++++++++++++++++++++++++++++++++++++++++++++++ Add New
                 // Basics
              var reporting = new rpt (reportObject);
              reporting.save()
              .then((reports)=>{
                // Saving the attendees
                return reporting.create_attendees(attendee_object);
              })
              .then((attendee_arguments)=>{
                // Saving the answers and question
                return reporting.create_survey_quiz_answers(helper , survey_and_answers);
              }).then((attendee_user)=>{
                // Calculation
                  return reporting.quiz_calculation(attendee_user , qtnrDocument );
              }).then((returned)=>{
                  res.send(returned);
              })
              .catch((err)=>{
                return new Promise((resolve , reject)=>{
                    res.send(err);
                });
              });
           }else {
              // +++++++++++++++++++++++++++++++++++++++++++++++ Update
               rptDocument.updated_at = new Date();
               rptDocument.save().then(()=>{
                 // create attendee
                 return rptDocument.create_attendees(attendee_object) ;
               }).then((attendee_arguments)=>{
                 // Questions and answers
                  return rptDocument.create_survey_quiz_answers(helper , survey_and_answers);
              }).then((attendee_user)=>{

                // Calculation
                  return rptDocument.quiz_calculation(attendee_user , qtnrDocument );
              }).then((returned)=>{
                  res.send(returned);
              });

            }




         })

    }).catch();


});


module.exports ={
  rptRouters
};
