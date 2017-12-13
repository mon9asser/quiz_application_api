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

//**************************************************************
/* ****************/ // For Testing only
//**************************************************************

// ==============================================> End the test

var qtnrRouters = express.Router();

qtnrRouters.use(bodyParser.json());
qtnrRouters.use(bodyParser.urlencoded({
    extended: false
}));
qtnrRouters.use(build_session);




//========================================
// =========> /api/init => post|get ( Quiz or Survey App )
//  /api/init
//========================================
// Detect Get Request
// qtnrRouters.get([
//   "/init",
//   "/create",
//   "/:app_id/settings/create",
//   "/:app_id/settings/style/:process",
//   "/:app_id/question/:question_id/answer/:process",
//   "/:app_id/question/:process"
//   ], verify_token_user_type, (req, res) => {
//     var user = req.verified_user;
//     var userType = req.verified_user_type;
//     var token = req.verified_token;
//
//     // this user should be a creator user !
//     if (userType != 1) {
//         return new Promise((resolve, reject) => {
//             res.status(401).send({
//                 "error": apis.permission_denied
//             });
//         });
//     }
//     res.send(apis.authorize_success);
// });
// Initialization
qtnrRouters.post("/init", verify_token_user_type, (req, res) => {

    var user = req.verified_user;
    var userType = req.verified_user_type;
    var token = req.verified_token;

    // this user should be a creator user !
    if (userType != 1) {
        return new Promise((resolve, reject) => {
            res.status(401).send({
                "error": apis.permission_denied
            });
        });
    }

    // => Fill Default data for title and description
    application.questionnaire.creator_id = user.id
    application.questionnaire.app_type = req.body.app_type;
    application.questionnaire.questionnaire_title = (req.body.app_type === 1) ? 'Quiz 1' : 'Survey 1';
    application.questionnaire.description = "Write description for this " + (req.body.app_type == 1) ? 'Quiz 1' : 'Survey 1';
    application.questionnaire.createdAt = new Date();
    application.questionnaire.updatedAt = new Date();
    // Build bodyParser with data
    var body = _.pick(application.questionnaire, ['creator_id', 'app_type', 'questionnaire_title', 'description', 'createdAt', 'updatedAt', 'settings', 'questions']);
    var app = new qtnr(body);
    app.save().then((respQtnr) => {
        if (!respQtnr) {
            return new Promise((resolve, reject) => {
                res.status(404).send({
                    error: apis.general_error
                })
            });
        }

        res.send(respQtnr);
    }).catch((error) => {
        return new Promise((resolve, reject) => {
            res.status(401).send({
                error: apis.permission_denied
            });
        });
    });

});
// creating
qtnrRouters.post("/create", verify_token_user_type, (req, res) => {

    var user = req.verified_user;
    var userType = req.verified_user_type;
    var token = req.verified_token;
    // this user should be a creator user !

    if (userType != 1) {
        return new Promise((resolve, reject) => {
            res.status(401).send({
                "error": apis.permission_denied
            });
        });
    }
    // Builde And Init Default !
    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();
    req.body.settings = {};
    req.body.questions = [];
    req.body.creator_id = user.id;
    var body = _.pick(req.body, ['creator_id', 'app_type', 'questionnaire_title', 'description', 'createdAt', 'updatedAt', 'settings', 'questions']);

    var qtnrs = new qtnr(body);
    qtnrs.save().then((qtner) => {

        if (!qtner) {
            return new Promise((resolve, reject) => {
                res.status(404).send({
                    error: apis.general_error
                })
            });
        }

        res.send(qtner);
    }).catch((e) => {

        return new Promise((resolve, reject) => {
            res.status(401).send(  e );
        });
    });

});
// Create settings for quiz or survey ( remember this part => surv/quiz for used with /init route)
qtnrRouters.patch("/:app_id/settings/create", verify_token_user_type, (req, res) => {
    var user = req.verified_user;
    var userType = req.verified_user_type;
    var token = req.verified_token;
    var app_id = req.params.app_id;
    var update_type = req.body.updateType;
    // this user should be a creator user !
    if (userType != 1) {
         return new Promise((resolve, reject) => {
            res.status(401).send({
                "error": apis.permission_denied
            });
        });
    }

    qtnr.findById(app_id).then((qtnr_results) => {
        if (!qtnr_results) {

            return new Promise((resolve, reject) => {
                res.status(401).send({
                    "error": apis.notfound_message
                });
            });
        }

        // Detection about the current user if he not the creator of this app
        if (qtnr_results.creator_id.toString() != user.id) {

            return new Promise((resolve, reject) => {
                res.status(401).send({
                    "error": apis.permission_denied
                });
            });
        }

        req.body.updatedAt = new Date();

        var $settings = new Object();

        if (req.body.titles) {

            if (req.body.titles.title_start_with)
                $settings["settings.titles.title_start_with"] = req.body.titles.title_start_with;

            if (req.body.titles.title_end_with)
                $settings["settings.titles.title_end_with"] = req.body.titles.title_end_with;

            if (req.body.titles.title_success_with)
                $settings["settings.titles.title_success_with"] = req.body.titles.title_success_with;

            if (req.body.titles.title_faild_with)
                $settings["settings.titles.title_faild_with"] = req.body.titles.title_faild_with;
         }


        if (req.body.step_type)
            $settings["settings.step_type"] = req.body.step_type;


        if (req.body.grade_settings) {
            if (req.body.grade_settings.is_graded)
                $settings["settings.grade_settings.is_graded"] = req.body.grade_settings.is_graded;

            if (req.body.grade_settings.value)
                $settings["settings.grade_settings.value"] = req.body.grade_settings.value;
        }


        // if (req.body.quiz_status) {
        //     if (req.body.quiz_status.attendee_id)
        //         $settings["settings.quiz_status.attendee_id"] = req.body.quiz_status.attendee_id;
        //
        //     if (req.body.quiz_status.report_id)
        //         $settings["settings.quiz_status.report_id"] = req.body.quiz_status.report_id;
        //
        //     if (req.body.quiz_status.stopped_at_time)
        //         $settings["settings.quiz_status.stopped_at_time"] = req.body.quiz_status.stopped_at_time;
        //
        //     if (req.body.quiz_status.at_question_id)
        //         $settings["settings.quiz_status.at_question_id"] = req.body.quiz_status.at_question_id;
        //
        // }

        if (req.body.review_setting != null)
            $settings["settings.review_setting"] = req.body.review_setting;


        if (req.body.retake_setting != null  )
            $settings["settings.retake_setting"] = req.body.retake_setting;

        if (req.body.navigation_btns != null )
            $settings["settings.navigation_btns"] = req.body.navigation_btns;

        if (req.body.label_btns) {
            if (req.body.label_btns.lbl_start_with)
                $settings["settings.label_btns.start_with"] = req.body.label_btns.lbl_start_with;
            if (req.body.label_btns.lbl_continue_with)
                $settings["settings.label_btns.continue_with"] = req.body.label_btns.lbl_continue_with;
            if (req.body.label_btns.lbl_retake_with)
                $settings["settings.label_btns.retake_with"] = req.body.label_btns.lbl_retake_with;
            if (req.body.label_btns.lbl_review_with)
                $settings["settings.label_btns.review_with"] = req.body.label_btns.lbl_review_with;
        }
        if (req.body.randomize_settings != null) {
            $settings["settings.randomize_settings"] = req.body.randomize_settings;
        }
        if (req.body.time_settings) {
            if (req.body.time_settings.is_with_time != null)
                $settings["settings.time_settings.is_with_time"] = req.body.time_settings.is_with_time;
            if (req.body.time_settings.value)
                $settings["settings.time_settings.value"] = req.body.time_settings.value;
            if (req.body.time_settings.timer_type)
                $settings["settings.time_settings.timer_type"] = req.body.time_settings.timer_type;
            if (req.body.time_settings.timer_layout)
                $settings["settings.time_settings.timer_layout"] = req.body.time_settings.timer_layout;
        }
        if (req.body.progression_bar) {
            if (req.body.progression_bar.is_available != null)
                $settings["settings.progression_bar.is_available"] = req.body.progression_bar.is_available;
            if (req.body.progression_bar.progression_bar_layout)
                $settings["settings.progression_bar.progression_bar_layout"] = req.body.progression_bar.progression_bar_layout;
        }


        qtnr.findByIdAndUpdate(app_id, $settings, {
            new: true
        }).then((results) => {
            res.send(results);
        }).catch((err) => {

            return new Promise((resolve, reject) => {
                res.status(401).send({
                    "error": apis.general_error
                });
            });
        });

    }).catch((err) => {

        return new Promise((resolve, reject) => {

            res.status(401).send({
                "error": apis.general_error
            });
        });
    });

});
// Stylesheet Settings ( process => edit / create) this mesthod required id of class name via req
qtnrRouters.patch("/:app_id/settings/style/:process", verify_token_user_type, (req, res) => {
    // Stylesheet

    var user = req.verified_user;
    var userType = req.verified_user_type;
    var token = req.verified_token;


    // this user should be a creator user !
    if (userType != 1) {

        return new Promise((resolve, reject) => {
            res.status(401).send({
                "error": apis.permission_denied
            });
        });
    }




    var $settings = new Object();



    if (req.params.process == "create") {

        // here we dont need any id ( use it for pushing an object to array )
        if (req.body.quiz_theme_style.source_code) {
            var $settings;
            // pushing New field into array
            req.body.quiz_theme_style.source_code._id = mongoose.Types.ObjectId();

            $settings = {
                $push: {
                    "settings.quiz_theme_style.source_code": req.body.quiz_theme_style.source_code
                }
            }
        }

        qtnr.findByIdAndUpdate(req.params.app_id, $settings, {
            new: true
        }).then((data) => {
            res.send(data);
        });
    }


    if (req.params.process == 'edit') {
        if (req.body.quiz_theme_style && req.body.attr_id) {
            qtnr.findById(req.params.app_id).then((qtnr_results) => {

                if (!qtnr_results) {

                    return new Promise((resolve, reject) => {
                        res.status(401).send({
                            "error": apis.notfound_message
                        });
                    });
                }

                //  req.body.quiz_theme_style.updatedAt = new Date();
                if (req.body.attr_id) { // this id is required
                    if (req.body.quiz_theme_style.source_code) {
                        var sourceCode = qtnr_results.settings.quiz_theme_style.source_code;
                        for (var i = 0; i < sourceCode.length; i++) {
                            if (sourceCode[i]._id.toString() == req.body.attr_id.toString()) {

                                if (req.body.quiz_theme_style.source_code.class_name)
                                    $settings["settings.quiz_theme_style.source_code." + [i] + ".class_name"] = req.body.quiz_theme_style.source_code.class_name;
                                // ===> All Attributes Here ( stylesheet colors )

                                if (req.body.quiz_theme_style.source_code.attributes.border)
                                    $settings["settings.quiz_theme_style.source_code." + [i] + ".attributes.border"] = req.body.quiz_theme_style.source_code.attributes.border;

                                if (req.body.quiz_theme_style.source_code.attributes.background)
                                    $settings["settings.quiz_theme_style.source_code." + [i] + ".attributes.background"] = req.body.quiz_theme_style.source_code.attributes.background;
                                if (req.body.quiz_theme_style.source_code.attributes.backgroundPoisition)
                                    $settings["settings.quiz_theme_style.source_code." + [i] + ".attributes.backgroundPoisition"] = req.body.quiz_theme_style.source_code.attributes.backgroundPoisition;
                                if (req.body.quiz_theme_style.source_code.attributes.backgroundAttachment)
                                    $settings["settings.quiz_theme_style.source_code." + [i] + ".attributes.backgroundAttachment"] = req.body.quiz_theme_style.source_code.attributes.backgroundAttachment;
                                if (req.body.quiz_theme_style.source_code.attributes.color)
                                    $settings["settings.quiz_theme_style.source_code." + [i] + ".attributes.color"] = req.body.quiz_theme_style.source_code.attributes.color;
                                if (req.body.quiz_theme_style.source_code.attributes.border)
                                    $settings["settings.quiz_theme_style.source_code." + [i] + ".attributes.border"] = req.body.quiz_theme_style.source_code.attributes.border;
                                if (req.body.quiz_theme_style.source_code.attributes.fontsType)
                                    $settings["settings.quiz_theme_style.source_code." + [i] + ".attributes.fontsType"] = req.body.quiz_theme_style.source_code.attributes.fontsType;
                            }
                        }


                    }

                }


                qtnr.findByIdAndUpdate(req.params.app_id, $settings, {
                    new: true
                }).then((data) => {
                    res.send(data);
                }).catch((err) => {
                    return new Promise((resolve, reject) => {
                        res.status(401).send({
                            "error": apis.notfound_message
                        });
                    });
                });
            }).catch((err) => {
                return new Promise((resolve, reject) => {
                    res.status(401).send({
                        "error": apis.notfound_message
                    });
                });
            });


        } else {
            res.send({
                "warning": "please Set the parent of object beside id of class element ex: { attr_id:{...} , quiz_theme_style:{....} }"
            });
        }

    }




});
// question ( process => edit question / create => add new qs to array / delete => unset array of question)
  qtnrRouters.patch("/:app_id/question/:process", verify_token_user_type, (req, res) =>{
  var app_id = req.params.app_id ;
  var processType= req.params.process ;
  var user = req.verified_user;
  var userType = req.verified_user_type;
  var token = req.verified_token;


  // this user should be a creator user !
  if (userType != 1) {
       return new Promise((resolve, reject) => {
          res.status(401).send({
              "error": apis.permission_denied
          });
      });
  }
   qtnr.findOne({ _id:app_id }, function (err, document){


         if(err){
           return new Promise ((resolve , reject)=>{
             res.status(404).send(apis.notfound_message);
           });
         }

        if(processType == 'edit'){
            if(! req.body.question_id){
                   return new Promise((resolve, reject)=>{
                     res.status(404).send("Please insert question_id field with existing id");
                   });
            }

            var questions = document.questions;

            for(var i=0; i<questions.length;i++){

                if( questions[i]._id == req.body.question_id ){
                    if(req.body.question_body != null)
                        document.questions[i].question_body = req.body.question_body ;
                    if(req.body.question_is_required != null)
                         document.questions[i].question_is_required = req.body.question_is_required;
                    if(req.body.question_type != null)
                        document.questions[i].question_type = req.body.question_type ;

                    if(req.body.answer_settings != null ){

                        if(!questions[i].answer_settings)
                           questions[i].answer_settings = {} ;
                        if(req.body.answer_settings.is_randomized || !document.questions[i].answer_settings.is_randomized )
                            document.questions[i].answer_settings.is_randomized = req.body.answer_settings.is_randomized;
                        if( req.body.answer_settings.super_size || !document.questions[i].answer_settings.super_size)
                            document.questions[i].answer_settings.super_size = req.body.answer_settings.super_size ;
                        if(req.body.answer_settings.single_choice || !document.questions[i].answer_settings.single_choice )
                            document.questions[i].answer_settings.single_choice = req.body.answer_settings.single_choice ;
                        if(req.body.answer_settings.choice_style || !document.questions[i].answer_settings.choice_style)
                            document.questions[i].answer_settings.choice_style = req.body.answer_settings.choice_style ;
                        if(req.body.answer_settings.answer_char_max || !document.questions[i].answer_settings.answer_char_max)
                            document.questions[i].answer_settings.answer_char_max = req.body.answer_settings.answer_char_max ;
                     }


                    if(req.body.media_question) {
                      // ==> This part under inprogression
                      // => this part will be with design
                        console.log("Media Choices part");
                    }
                }
            }
        }else if(processType == 'create'){
          if(!document.questions){
            res.send("This id not found");
          }
            //=============================> push
            if(!req.body.question_body)
                {
                  return new Promise((resolve, reject)=>{
                    res.status(404).send("Question body not found ! , please insert question body !");
                  });
                }
                $question_tag = new Object();
                $question_tag["_id"] =  mongoose.Types.ObjectId();
                $question_tag["created_at"] = new Date();
                $question_tag["question_body"] = req.body.question_body ;
                $question_tag["answers_body"] = [] ;
                if(req.body.question_type  != null )
                $question_tag ["question_type"] = req.body.question_type;
                if(req.body.media_question){
                    if(req.body.media_question.media_type)
                    $question_tag["media_question.media_type"] = req.body.media_question.media_type;
                    if(req.body.media_question.media_name)
                      $question_tag["media_question.media_name"] = req.body.media_question.media_name;
                    if(req.body.media_question.media_field)
                      $question_tag["media_question.media_field"] = req.body.media_question.media_field;
                }
               if(req.body.question_is_required)
                $question_tag["question_is_required"] = req.body.question_is_required;

                if(req.body.answer_settings != null ){
                     if(req.body.answer_settings.is_randomized)
                      $question_tag["answer_settings.is_randomized"] = req.body.answer_settings.is_randomized;
                    if(req.body.answer_settings.super_size != null)
                      $question_tag["answer_settings.super_size"] = req.body.answer_settings.super_size;
                    if(req.body.answer_settings.single_choice != null)
                      $question_tag["answer_settings.single_choice"] = req.body.answer_settings.single_choice;
                    if(req.body.answer_settings.choice_style != null)
                      $question_tag["answer_settings.choice_style"] = req.body.answer_settings.choice_style;
                    if(req.body.answer_settings.answer_char_max != null)
                      $question_tag["answer_settings.answer_char_max"] = req.body.answer_settings.answer_char_max;
                }


                document.questions.push($question_tag);
        }else if (processType == 'delete'){
          if(! req.body.question_id){
                 return new Promise((resolve, reject)=>{
                   res.status(404).send("Please insert question_id field with existing id");
                 });
          }
          var questions = document.questions;
          for(var i=0; i<questions.length;i++){
              if( questions[i]._id == req.body.question_id ){
                   _.pull(questions , questions[i]);
              }
            }
        }

         try{
            document.markModified('questions');
            document.save().then((results)=>{
               res.send(results);
             })
         }catch(err){
            return new Promise( ( resolve , reject ) => {
                res.status(404).send(err);
            });
         }

    });



});
// => question answers ( Default answer for attendee , made by admin user ) => process ( delete - edit - create )
qtnrRouters.patch("/:app_id/question/:question_id/answer/:process" , verify_token_user_type , (req , res)=>{
  ///localhost:3000/api/5a1efcc61826bd398ecd4dee/question/5a1f0c5c0b6a6843735020b2/answer/create
  var processType= req.params.process ;
  var question_id = req.params.question_id;
  var user = req.verified_user;
  var userType = req.verified_user_type;
  var token = req.verified_token;
  var app_id = req.params.app_id ;



  // this user should be a creator user !
  if (userType != 1) {
       return new Promise((resolve, reject) => {
          res.status(401).send({
              "error": apis.permission_denied
          });
      });
  }
   qtnr.findOne({ _id:app_id }, function (err, document){
         if(err){
           return new Promise ((resolve , reject)=>{
             res.status(404).send(apis.notfound_message);
           });
         }


         var questions = document.questions;
         for(var i=0; i<questions.length;i++){
           // document.app_type
             if( questions[i]._id == question_id ){
               // Detect api process type
               // Set answers type
               var question_type = (questions[i].question_type) ;
               /*
                0 =>  choices
                1 =>  media_choices
                2 =>  boolean_choices
                3 =>  rating_scales
                4 => free texts
               */
               var question_answers = new Object ();
               switch (question_type) {
                   case 0:

                     question_answers["_id"] = mongoose.Types.ObjectId();
                     question_answers["indexer"] = null ;
                     if(req.body.choices_value != null )
                     question_answers["value"] = req.body.choices_value ;
                     else
                     question_answers["value"] = "Write answer here !" ;

                    if(req.body.media_optional != null ){
                      question_answers["media_optional"] = {
                        "media_type" : (req.body.media_optional.media_type != null ) ? req.body.media_optional.media_type : null ,
                        "media_name" : (req.body.media_optional.media_name != null ) ? req.body.media_optional.media_name : null ,
                        "media_src" : (req.body.media_optional.media_src != null ) ? req.body.media_optional.media_src : null ,
                      } ;
                    }

                    if(document.app_type == 1 ){
                      if(req.body.is_correct != null )
                        question_answers["is_correct"] = req.body.is_correct ;
                    }

                   break;

                   case 1:

                     question_answers["_id"] = mongoose.Types.ObjectId();
                     question_answers["indexer"] = null ;
                     if(req.body.media_name != null)
                     question_answers["media_name"] = req.body.media_name
                     else
                     question_answers["media_name"] = "Write answer here !" ;
                     if(req.body.media_dir != null )
                     question_answers["media_dir"] =  req.body.media_dir ;

                     if(document.app_type == 1 ){
                       if(req.body.is_correct != null )
                        question_answers["is_correct"] = req.body.is_correct ;
                     }

                   break;

                   case 2:

                     question_answers["_id"] = mongoose.Types.ObjectId();
                     if (req.body.boolean_type != null )
                     question_answers["boolean_type"] = req.body.boolean_type ;
                             if(document.app_type != 0 ){
                                     if(req.body.boolean_value != null ){

                                       if(req.body.boolean_type == "true/false")
                                       {
                                         if(req.body.boolean_value == true)
                                         question_answers["boolean_value"] = "True";
                                          else
                                         question_answers["boolean_value"] = "False";
                                        }

                                        if(req.body.boolean_type == "yes/no")
                                        {
                                          if(req.body.boolean_value == true)
                                            question_answers["boolean_value"] =  "Yes";
                                          else
                                            question_answers["boolean_value"] =  "No";
                                        }

                                     }
                             }

                       if(document.app_type == 1 ){
                         if(req.body.is_correct != null )
                          question_answers["is_correct"] = req.body.is_correct ;
                       }


                    break;

                   case 3:

                   if(document.app_type != 0 ){
                     return new Promise((resolve , reject)=>{
                       res.send({"Message":"That's not Survey !"});
                     });
                   }

                    question_answers["_id"] = mongoose.Types.ObjectId();
                      if(req.body.ratscal_type != null )
                          question_answers["ratscal_type"] = req.body.ratscal_type;
                      if(req.body.step_numbers != null )
                          question_answers["step_numbers"] = req.body.step_numbers ;
                      if(req.body.ratscal_type != null && req.body.ratscal_type == 0) // => means that is scale type
                        {
                          if(req.body.started_at != null )
                              question_answers["started_at"] = req.body.started_at ;
                          if(req.body.centered_at != null )
                             question_answers["centered_at"] = req.body.centered_at
                          if(req.body.ended_at != null )
                            question_answers["ended_at"] = req.body.ended_at;
                        }
                    break;

                    case 4 : // Free Texts
                        if(document.app_type != 0 ){
                          return new Promise((resolve , reject)=>{
                            res.send({"Message":"That's not Survey !"});
                          });
                        }

                        question_answers["_id"] = mongoose.Types.ObjectId();
                     break ;
                 }

               if(processType == "create") // Push
                  questions[i].answers_format.push(question_answers);
                else if (processType == "edit") // Update
                 {
                   // get id of answer
                   if(!req.body.answer_id){
                     res.status(404).send("answer_id field is required with existing value !");
                   }
                   var $answer_id = req.body.answer_id ;
                   var answers_list = questions[i].answers_format ;
                   for(var x=0; x<answers_list.length;x++){
                     console.log(answers_list[x]._id == $answer_id   );
                     if(answers_list[x]._id == $answer_id){
                       // update here
                       if(req.body.value != null || !answers_list[x].value)
                          answers_list[x].value = req.body.value;

                       if(req.body.media_optional)
                        {
                          if(req.body.media_optional.media_type)
                          answers_list[x].media_optional.media_type = req.body.media_optional.media_type;
                          if(req.body.media_optional.media_name)
                          answers_list[x].media_optional.media_name = req.body.media_optional.media_name;
                          if(req.body.media_optional.media_src)
                          answers_list[x].media_optional.media_src = req.body.media_optional.media_src;
                        }

                       if(req.body.media_name)
                          answers_list[x].media_name = req.body.media_name;
                       if(req.body.media_dir)
                          answers_list[x].media_dir = req.body.media_dir;
                       if(req.body.is_correct)
                          answers_list[x].is_correct = req.body.is_correct;
                       if(req.body.boolean_type)
                          answers_list[x].boolean_type = req.body.boolean_type;
                       if(req.body.ratscal_type)
                          answers_list[x].ratscal_type = req.body.ratscal_type;
                       if(req.body.step_numbers)
                          answers_list[x].step_numbers = req.body.step_numbers;
                       if(req.body.started_at)
                          answers_list[x].started_at = req.body.started_at;
                       if(req.body.ended_at)
                          answers_list[x].ended_at = req.body.ended_at;
                      }
                     }
                  }
               else if (processType == "delete") // Pull
                 {
                   // get id of answer
                   if(!req.body.answer_id){
                     res.status(404).send("answer_id field is required with existing value !");
                   }
                   var $answer_id = req.body.answer_id ;
                   var answers_list = questions[i].answers_format ;
                   for(var x=0; x<answers_list.length;x++){
                     console.log(answers_list[x]._id == $answer_id   );
                     if(answers_list[x]._id == $answer_id){
                        _.pull(answers_list , answers_list[x]) ;
                      }
                     }
                 }
             }
          }

          document.markModified("questions");
          document.save().then((results)=>{
             res.send(results);
           }).catch((err)=>{

           });

    });
});




module.exports = {
    qtnrRouters
};
