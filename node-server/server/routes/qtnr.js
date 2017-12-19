const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path') ;
const _ = require('lodash');
const jwt = require('jsonwebtoken');
var formidable = require('formidable');
const {
    ObjectID
} = require("mongodb");
const {
    apis,
    config,
    application ,
    notes
} = require("../../database/config");
const {
    authByToken,
    verify_token_user_type,
    verify_session,
    build_session
} = require("../../middlewares/authenticate");
const {
    authByTokenWCreatorType ,
    can_i_access_that
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
            res.status(401).send(notes.Warnings.Permission_Warning);
        });
    }

    if(req.body.app_type == null   )
    {
      return new Promise((resolve , reject)=>{
         res.status(201).send( `${notes.Messages.Required_Message('app_type')}`  );
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
          return new Promise((resolve , reject)=>{
             res.status(204).send( `${notes.Errors.General_Error}`  );
          });
        }

        res.send(respQtnr);
    }).catch((error) => {
        return new Promise((resolve, reject) => {
            res.status(401).send(notes.Warnings.Permission_Warning);
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
            res.status(401).send(notes.Warnings.Permission_Warning);
        });
    }

    var required = new Array()
    if(req.body.app_type == null  )
       required[required.length]='app_type';
    if(req.body.questionnaire_title == null || !req.body.questionnaire_title )
      required[required.length]='questionnaire_title';
    if(req.body.description == null || !req.body.description )
      required[required.length]='description';
    if(required.length != 0 )
    {
      return new Promise((resolve , reject)=>{
        console.log(required);
        res.status(201).send(notes.Messages.Required_Message(required));
      });
    }
    // Builde And Init Default !
    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();
    req.body.settings = {};
    req.body.questions = [];
    req.body.creator_id = user.id;
    req.body.theme_style = [];

    var body = _.pick(req.body, ['creator_id', 'app_type', 'questionnaire_title', 'description', 'createdAt', 'updatedAt', 'settings', 'questions','theme_style']);

    var qtnrs = new qtnr(body);
    qtnrs.save().then((qtner) => {

        if (!qtner) {
            return new Promise((resolve, reject) => {
                 res.status(204).send( `${notes.Errors.General_Error}`  );
            });
        }

        res.send(qtner);
    }).catch((e) => {

        return new Promise((resolve, reject) => {
            res.status(401).send(  e );
        });
    });

});

// => can_i_access_that
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
            res.status(401).send(notes.Warnings.Permission_Warning);
        });
    }

    qtnr.findById(app_id).then((qtnr_results) => {
        if (!qtnr_results) {
             return new Promise((resolve, reject) => {
                res.status(401).send(notes.Errors.Error_Doesnt_exists("Application"));
            });
        }

        // Detection about the current user if he not the creator of this app
        if (qtnr_results.creator_id.toString() != user.id) {
             return new Promise((resolve, reject) => {
                res.status(401).send(notes.Warnings.Permission_Warning);
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


        if (req.body.step_type != null )
            $settings["settings.step_type"] = req.body.step_type;


        if (req.body.grade_settings) {
            if (req.body.grade_settings.is_graded != null )
                $settings["settings.grade_settings.is_graded"] = req.body.grade_settings.is_graded;

            if (req.body.grade_settings.value)
                $settings["settings.grade_settings.value"] = req.body.grade_settings.value;
        }


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
            if (req.body.time_settings.timer_layout !=null)
                $settings["settings.time_settings.timer_layout"] = req.body.time_settings.timer_layout;
        }
        if (req.body.progression_bar) {
            if (req.body.progression_bar.is_available != null)
                $settings["settings.progression_bar.is_available"] = req.body.progression_bar.is_available;
            if (req.body.progression_bar.progression_bar_layout != null)
                $settings["settings.progression_bar.progression_bar_layout"] = req.body.progression_bar.progression_bar_layout;
        }


        qtnr.findByIdAndUpdate(app_id, $settings, {
            new: true
        }).then((results) => {
          if(results.settings != null )
            {
              res.send({
                "Application_id" : app_id,
                "Settings" : results.settings
              });
            }else {
              res.send({
                "Application_id" : app_id,
                  "Message" : notes.Messages.Update_Message_Not_completed("Setting")});
            }
        }).catch((err) => {

              return new Promise((resolve, reject) => {
                  res.status(401).send(notes.Errors.General_Error);
              });

        });

    }).catch((err) => {
        return new Promise((resolve, reject) => {
            res.status(401).send(notes.Errors.General_Error);
        });
    });

});
// Stylesheet Settings ( process => edit / create) this mesthod required id of class name via req
qtnrRouters.patch("/:app_id/settings/style/:process", verify_token_user_type, (req, res) => {
    // Stylesheet
    var user = req.verified_user;
    var userType = req.verified_user_type;
    var token = req.verified_token;
    var processType = req.params.process;
    var application_id = req.body.app_id ;

    // this user should be a creator user !
    if (userType != 1) {
         return new Promise((resolve, reject) => {
            res.status(401).send(notes.Warnings.Permission_Warning);
        });
    }



    if(processType == "create"){
      //mongoose.Types.ObjectId()
        var stylesheet = new Object();
        stylesheet['_id'] = mongoose.Types.ObjectId();
        stylesheet['file_name'] = "styletheme_"+stylesheet['_id']+".css";
        stylesheet['is_active'] = false ;
        stylesheet['source_code'] = new Array();
        var for_stylesheet_file ='';
        if(req.body.source_codes != null){
            var sourceCodes = req.body.source_codes ;

             for(var i=0; i < sourceCodes.length;  i++){
               if(i == 10 ){
                 return new Promise((resolve , reject)=>{
                   res.send(notes.Messages.Stylesheet_Enough);
                 });
                 break ;
               }
               if(sourceCodes[i].class_name == null || sourceCodes[i].class_attributes == null )
               {
                 return new Promise((resolve , reject)=>{
                     var required = ["class_name","class_attributes"];
                     res.send(notes.Messages.Required_Message(required)+" in Index Number " + i);
                  });
                 break ;
               }

                 var classes = new Object ;
                   classes["_id"] = mongoose.Types.ObjectId() ;
                   classes["class_name"] = sourceCodes[i].class_name;
                   classes["class_attributes"] = sourceCodes[i].class_attributes;
                   stylesheet['source_code'].push(classes);
                      for_stylesheet_file +=   "."+sourceCodes[i].class_name+"{"   ;
                    if(sourceCodes[i].class_attributes.background != null)
                      for_stylesheet_file +=  "background:" + sourceCodes[i].class_attributes.background + ";";

                    if(sourceCodes[i].class_attributes.color != null)
                      for_stylesheet_file += "color:" + sourceCodes[i].class_attributes.color+ ";";

                    if(sourceCodes[i].class_attributes.border != null)
                      for_stylesheet_file +=  "border:" +sourceCodes[i].class_attributes.border+ ";";

                    if(sourceCodes[i].class_attributes.boxShadow != null)
                      for_stylesheet_file += "box-shadow:" + sourceCodes[i].class_attributes.boxShadow+ ";";

                    if(sourceCodes[i].class_attributes.fontFamily != null)
                      for_stylesheet_file +=  "font-family:" +sourceCodes[i].class_attributes.fontFamily+ ";";

                   for_stylesheet_file += "} \n" ;

            }
        }

        qtnr.findOne(application_id).then((qtnrsx)=>{


          if(!qtnrsx)
          {
            return new Promise((resolve , reject)=>{
              res.send(notes.Errors.Error_Doesnt_exists("Application"));
            });
          }

          if(user.id != qtnrsx.creator_id ){
           return new Promise((resolve , reject)=>{
             res.send(notes.Warnings.Permission_Warning);
           });
         }
          qtnrsx.updatedAt = new Date();
          qtnrsx.theme_style.push(stylesheet);
          qtnrsx.markModified('theme_style');
          qtnrsx.save((error , stylesheets)=>{

            if(error)
              {
                return new Promise((resolve , reject)=>{
                  res.send(notes.Errors.General_Error);
                });
              }

            // ==> Create File in server
            // Creating file theme
            fs.appendFile("public/themes/"+stylesheet['file_name'],for_stylesheet_file, (err) => {
                if (err) throw err;
                  console.log('The "data to append" was appended to file!');
            });

            var style_codes = _.find(stylesheets.theme_style , {'file_name':stylesheet['file_name']} );
            res.send({ "File_directory" : "public/themes/"+style_codes.file_name , "Stylesheet_code":style_codes})
           }).catch((err)=>{
            return new Promise((resolve, reject) => {
                res.status(401).send(notes.Errors.General_Error);
            });
          });
        }).catch((err)=>{
          console.log(err);
          return new Promise((resolve, reject) => {
              res.status(401).send(notes.Errors.General_Error);
          });
        });
    }
    else if (processType == "edit"){
      if(req.body.theme_style_id == null )
        {
          return new Promise((resolve , reject)=>{
            res.send(notes.Messages.Required_Message("theme_style_id"));
          });
        }

        qtnr.findOne(application_id).then((qtnrsx)=>{

          if(!qtnrsx)
          {
            return new Promise((resolve , reject)=>{
              res.send(notes.Errors.Error_Doesnt_exists("Application"));
            });
          }
           if(user.id != qtnrsx.creator_id ){
            return new Promise((resolve , reject)=>{
              res.send(notes.Warnings.Permission_Warning);
            });
          }
            var stylefile_id = req.body.theme_style_id ;

            qtnrsx.updatedAt = new Date();
            var Stylecodes_Index = _.findIndex( qtnrsx.theme_style , {"file_name":"styletheme_"+stylefile_id+".css"} );

            // update available status
            if(req.body.is_active != null ){
              for (var i = 0; i < qtnrsx.theme_style.length; i++) {
                qtnrsx.theme_style[i].is_active = false ;
              }
              qtnrsx.theme_style[Stylecodes_Index].is_active = req.body.is_active;
            }

            // Update in source code
            if(req.body.source_codes){
              // *****************************************************

              if(req.body.source_codes != null){
                    var sourceCodes = req.body.source_codes ;
                    var stylesheet = new Object();
                    var for_stylesheet_file ='';
                      stylesheet['source_code'] = new Array();
                     for(var i=0; i < sourceCodes.length;  i++){
                       if(i == 10 ){
                         return new Promise((resolve , reject)=>{
                           res.send(notes.Messages.Stylesheet_Enough);
                         });
                         break ;
                       }
                       if(sourceCodes[i].class_name == null || sourceCodes[i].class_attributes == null )
                       {
                         return new Promise((resolve , reject)=>{
                             var required = ["class_name","class_attributes"];
                             res.send(notes.Messages.Required_Message(required)+" in Index Number " + i);
                          });
                         break ;
                       }

                         var classes = new Object ;
                           classes["_id"] = mongoose.Types.ObjectId() ;
                           classes["class_name"] = sourceCodes[i].class_name;
                           classes["class_attributes"] = sourceCodes[i].class_attributes;
                           stylesheet['source_code'].push(classes);
                              for_stylesheet_file +=   "."+sourceCodes[i].class_name+"{"   ;
                            if(sourceCodes[i].class_attributes.background != null)
                              for_stylesheet_file +=  "background:" + sourceCodes[i].class_attributes.background + ";";

                            if(sourceCodes[i].class_attributes.color != null)
                              for_stylesheet_file += "color:" + sourceCodes[i].class_attributes.color+ ";";

                            if(sourceCodes[i].class_attributes.border != null)
                              for_stylesheet_file +=  "border:" +sourceCodes[i].class_attributes.border+ ";";

                            if(sourceCodes[i].class_attributes.boxShadow != null)
                              for_stylesheet_file += "box-shadow:" + sourceCodes[i].class_attributes.boxShadow+ ";";

                            if(sourceCodes[i].class_attributes.fontFamily != null)
                              for_stylesheet_file +=  "font-family:" +sourceCodes[i].class_attributes.fontFamily+ ";";

                           for_stylesheet_file += "} \n" ;

                    }
                }

            }

            qtnrsx.markModified("theme_style");
            qtnrsx.save().then((theme_stylish)=>{
              var stylesheetPath = "public/themes/"+"styletheme_"+stylefile_id+".css" ;

              if (fs.existsSync(stylesheetPath)) {
                fs.appendFile(stylesheetPath ,for_stylesheet_file, (err) => {
                    if (err) throw err;
                      console.log('The "data to append" was appended to file!');
                });
              }
               var Stylecodes_Find = _.find( theme_stylish.theme_style , {"file_name":"styletheme_"+stylefile_id+".css"} );
               res.send({ "File_directory" : "public/themes/"+"styletheme_"+stylefile_id+".css" , "Stylesheet_code":Stylecodes_Find})

            }).catch();


        }).catch();

    }
    else if (processType == "delete"){

      if(req.body.theme_style_id == null )
        {
          return new Promise((resolve , reject)=>{
            res.send(notes.Messages.Required_Message("theme_style_id"));
          });
        }

      qtnr.findOne(application_id).then((qtnrsx)=>{

          if(!qtnrsx)
          {
            return new Promise((resolve , reject)=>{
              res.send(notes.Errors.Error_Doesnt_exists("Application"));
            });
          }
           if(user.id != qtnrsx.creator_id ){
            return new Promise((resolve , reject)=>{
              res.send(notes.Warnings.Permission_Warning);
            });
          }

          var stylefile_id = req.body.theme_style_id;
          qtnrsx.updatedAt = new Date();
          if(qtnrsx.theme_style.length == 0 ){
            return new Promise((resplve , reject)=>{
              res.send(notes.Errors.Error_Doesnt_exists("Stylesheet"));
            });
          }

          var Stylecodes_Index = _.findIndex( qtnrsx.theme_style , {"file_name":"styletheme_"+stylefile_id+".css"} );
           var stylesheet_object = qtnrsx.theme_style ;

           if(Stylecodes_Index == -1 ){
             return new Promise((resplve , reject)=>{
               res.send(notes.Errors.Error_Doesnt_exists("Stylesheet"));
             });
           }
           file_styletheme = "public/themes/"+"styletheme_"+ stylesheet_object[Stylecodes_Index]._id  +".css"

          if(Stylecodes_Index != -1 )
            _.pull(stylesheet_object , stylesheet_object[Stylecodes_Index] ) ;
            else {
              return new Promise((resplve , reject)=>{
                res.send(notes.Errors.Error_Doesnt_exists("Stylesheet"));
              });
            }

          qtnrsx.markModified('theme_style');
          qtnrsx.save().then((results)=>{
            if(results){
              if (fs.existsSync(file_styletheme)) {
                  fs.unlink(file_styletheme, (err) => {
                    if (err) throw err;
                    res.send('successfully deleted '+file_styletheme);
                  });
                }
              // Delete the path

            }
          }).catch((err)=>{});

      });
    }


});

// Question
qtnrRouters.patch("/:app_id/question/:process", verify_token_user_type, (req, res) =>{
  var app_id = req.params.app_id ;
  var processType= req.params.process ;
  var user = req.verified_user;
  var userType = req.verified_user_type;
  var token = req.verified_token;

  // this user should be a creator user !
  if (userType != 1) {
       return new Promise((resolve, reject) => {
          res.status(401).send(notes.Warnings.Permission_Warning);
      });
  }
  qtnr.findOne({ _id:app_id }, function (err, qtnairsDocument){

      if (!qtnairsDocument){
        return new Promise((resolve, reject)=>{
           res.status(404).send(notes.Errors.Error_Doesnt_exists("Application"));
        });
      }

      if(qtnairsDocument.creator_id != user.id){
        return new Promise((resolve , reject)=>{
          res.send(notes.Warnings.Permission_Warning);
        });
      }

      if(processType == "create")
        {
          if(!qtnairsDocument.questions){
              return new Promise((resolve , reject)=>{
              res.status(404).send(notes.Errors.Error_Doesnt_exists("questions Array"))
              });
          }
          var required = new Array();
          if(req.body.question_type == null){
              required[required.length] = 'question_type';
          }
          if(req.body.question_body == null){
              required[required.length] = 'question_body';
          }
          if(required.length != 0 ){
              return new Promise((resolve, reject)=>{
                 res.status(404).send(notes.Messages.Required_Message(required));
              });
          }
          var question_tag = new Object();
          question_tag["_id"] =  mongoose.Types.ObjectId();
          question_tag["created_at"] = new Date();
          question_tag["question_body"] = req.body.question_body ;
          question_tag["answers_body"] = [] ;
          question_tag ["question_type"] = req.body.question_type;
          if(req.body.question_is_required != null )
          question_tag ["question_is_required"] = req.body.question_is_required ;



          if(req.body.answer_settings != null){
              question_tag ["answer_settings"] = new Object();
              if(req.body.answer_settings.is_randomized != null )
              question_tag ["answer_settings"]['is_randomized'] = req.body.answer_settings.is_randomized ;
              if(req.body.answer_settings.super_size != null )
              question_tag ["answer_settings"]['super_size'] = req.body.answer_settings.super_size ;
              if(req.body.answer_settings.single_choice != null )
                question_tag ["answer_settings"]['single_choice '] = req.body.answer_settings.single_choice ;
              if(req.body.answer_settings.choice_style != null )
              question_tag ["answer_settings"]['choice_style'] = req.body.answer_settings.choice_style ;
              if(req.body.answer_settings.answer_char_max != null )
              question_tag ["answer_settings"]['answer_char_max'] = req.body.answer_settings.answer_char_max ;
          }



          if(req.body.media_question != null){

              var required_media = [] ;

              if(req.body.media_question.media_type == null )
              required_media[required_media.length] = "media_type" ;
              if(req.body.media_question.media_name == null )
              required_media[required_media.length] = "media_name" ;
              if(req.body.media_question.media_field == null )
              required_media[required_media.length] = "media_field" ;

              if(required_media.length != 0){
                return new Promise((resolve , reject )=>{
                  res.send(notes.Messages.Required_Message(required_media));
                });
              }

              if( ! _.isInteger(req.body.media_question.media_type)  || req.body.media_question.media_type  > 1 ) {
                   return new Promise((resolve , reject)=>{
                     res.send({"Message" : "This Value should be integer (0 or 1) 0 => for image type , 1 => for video type"});
                   });
              }



              question_tag ["media_question"] = new Object();

              if( req.body.media_question.media_type != 1 ){ // Image Type
                        // Uplad Image in dir first then save
                        var imagePath =  req.body.media_question.media_field ;
                        var fileExtension = path.extname(imagePath);
                        var isExists =  _.findIndex([{image : ".JPG"},{image :".PNG"},{image :".JPEG"} , {image :".jpg"},{image :".jpeg"},{image :".png"}] , {image:fileExtension} );
                        var targetExtension =  _.find ([{image : ".JPG"},{image :".PNG"},{image :".JPEG"} , {image :".jpg"},{image :".jpeg"},{image :".png"}] , {image:fileExtension} );

                        if(isExists == -1 )
                          {
                            return new Promise((resolve , reject)=>{
                              res.send(notes.Errors.Error_file_extension);
                            });
                          }
                        var new_filename = "question_"+question_tag["_id"]+targetExtension.image.toLowerCase();
                        var targetPath =__dirname + "/../../public/themeimages/"+new_filename ;
                        var tempPath = req.body.media_question.media_field ;
                        if(! fs.existsSync(tempPath)){
                          return new Promise((resolve , reject )=>{
                            res.send(notes.Errors.Error_Doesnt_exists("Image"));
                          });
                        }



                       question_tag ["media_question"]["media_field"] = new_filename ;
                       fs.rename( imagePath , targetPath , function (err) {
                           if (err) throw err;
                       });
              }
              else {
                 question_tag ["media_question"]["media_field"] = req.body.media_question.media_field ;
              }
              question_tag ["media_question"]["media_type"] = req.body.media_question.media_type;
              question_tag ["media_question"]["media_name"] = req.body.media_question.media_name ;

          }

           // Save data after saving image in server directory
            qtnairsDocument.questions.push(question_tag);
            qtnairsDocument.markModified("questions");
            qtnairsDocument.save().then((qsResults)=>{
              if(!qsResults){
                if( fs.existsSync(tempPath)){
                  fs.unlink(tempPath, (err) => {
                   if (err) throw err;
                   console.log('successfully deleted');
                  });
                }
              }
            }).then(()=>{
              res.send({
                Media_directory : targetPath ,
                Question_details : question_tag
              });
            }).catch((err)=>{
                return new Promise((resolve , reject)=>{
                  res.status(404).send(notes.Errors.General_Error);
                });
            });
           }
      if (processType == "edit"){
            if(!qtnairsDocument.questions){
                return new Promise((resolve , reject)=>{
                res.status(404).send(notes.Errors.Error_Doesnt_exists("questions Array"))
                });
            }
            var required = new Array();
            if(req.body.question_id == null){
                required[required.length] = 'question_id';
            }

            if(required.length != 0 ){
                return new Promise((resolve, reject)=>{
                   res.status(404).send(notes.Messages.Required_Message(required));
                });
            }


            var question_id = req.body.question_id ;
            var application_questions = qtnairsDocument.questions ;
            var findIndex_this_qs = _.findIndex(application_questions , {"id":question_id} );

            if(findIndex_this_qs == -1 ){
              return new Promise((resolve, reject)=>{
                 res.status(404).send(notes.Errors.Error_Doesnt_exists("Question"));
              });
            }

            var find_this_qs = _.find(application_questions , {"id":question_id} ) ;



            if(req.body.media_question != null){
               if(qtnairsDocument.questions[findIndex_this_qs].media_question == null)
                  qtnairsDocument.questions[findIndex_this_qs].media_question = new Object();

               if(req.body.media_question.media_type != null )
                  qtnairsDocument.questions[findIndex_this_qs].media_question["media_type"] = req.body.media_question.media_type;
               if(req.body.media_question.media_name != null )
                  qtnairsDocument.questions[findIndex_this_qs].media_question["media_name"] = req.body.media_question.media_name ;
               if(req.body.media_question.media_field != null )
                    {

                        if( ! _.isInteger(req.body.media_question.media_type)  || req.body.media_question.media_type  > 1 ) {
                           return new Promise((resolve , reject)=>{
                             res.send({"Message" : "This Value should be integer (0 or 1) 0 => for image type , 1 => for video type"});
                           });
                         }

                        if( ( req.body.media_question.media_type == null &&  qtnairsDocument.questions[findIndex_this_qs].media_question["media_type"] != 1 ) || ( req.body.media_question.media_type != 1 &&  (qtnairsDocument.questions[findIndex_this_qs].media_question["media_type"] == null || qtnairsDocument.questions[findIndex_this_qs].media_question["media_type"] != 1) ) ){


                          var imagePath =  req.body.media_question.media_field ;
                          var fileExtension = path.extname(imagePath);
                          var isExists =  _.findIndex([{image : ".JPG"},{image :".PNG"},{image :".JPEG"} , {image :".jpg"},{image :".jpeg"},{image :".png"}] , {image:fileExtension} );
                          var targetExtension =  _.find ([{image : ".JPG"},{image :".PNG"},{image :".JPEG"} , {image :".jpg"},{image :".jpeg"},{image :".png"}] , {image:fileExtension} );


                          if(isExists == -1 )
                            {
                              return new Promise((resolve , reject)=>{
                                res.send(notes.Errors.Error_file_extension);
                              });
                            }


                            var new_filename = "question_"+question_id+targetExtension.image.toLowerCase();
                            var targetPath =__dirname + "/../../public/themeimages/"+new_filename ;
                            var tempPath = req.body.media_question.media_field ;
                            if(! fs.existsSync(tempPath)){
                              return new Promise((resolve , reject )=>{
                                res.send(notes.Errors.Error_Doesnt_exists("Image"));
                              });
                            }

                            var current_image = __dirname + "/../../public/themeimages/" + "question_"+question_id+targetExtension.image.toLowerCase()  ;
                            if( fs.existsSync(current_image)){
                              fs.rename( imagePath , targetPath , function (err) {
                                  console.log(err);
                              });
                            }

                            qtnairsDocument.questions[findIndex_this_qs].media_question["media_field"] = "question_"+question_id+targetExtension.image.toLowerCase() ;
                        }else
                        qtnairsDocument.questions[findIndex_this_qs].media_question["media_field"] =  req.body.media_question.media_field;


                    }
            }


            if(req.body.question_body != null)
              qtnairsDocument.questions[findIndex_this_qs].question_body = req.body.question_body ;
            if(req.body.question_is_required != null)
              qtnairsDocument.questions[findIndex_this_qs].question_is_required  = req.body.question_is_required ;
            if(req.body.question_type != null)
              qtnairsDocument.questions[findIndex_this_qs].question_type = req.body.question_type ;

            if(req.body.answer_settings != null ){
                if(qtnairsDocument.questions[findIndex_this_qs].answer_settings == null)
                  qtnairsDocument.questions[findIndex_this_qs].answer_settings = new Object();

                  if(req.body.answer_settings.is_randomized != null  ){
                      qtnairsDocument.questions[findIndex_this_qs].answer_settings.is_randomized = req.body.answer_settings.is_randomized ;
                  }

                  if(req.body.answer_settings.super_size != null  ){
                      qtnairsDocument.questions[findIndex_this_qs].answer_settings.super_size = req.body.answer_settings.super_size ;
                  }

                  if(req.body.answer_settings.single_choice != null){
                      qtnairsDocument.questions[findIndex_this_qs].answer_settings.single_choice = req.body.answer_settings.single_choice ;
                  }

                  if(req.body.answer_settings.choice_style != null){
                      qtnairsDocument.questions[findIndex_this_qs].answer_settings.choice_style = req.body.answer_settings.choice_style ;
                  }

                  if(req.body.answer_settings.answer_char_max != null){
                      qtnairsDocument.questions[findIndex_this_qs].answer_settings.answer_char_max = req.body.answer_settings.answer_char_max ;
                  }

            }

            qtnairsDocument.markModified("questions");
            qtnairsDocument.save().then((qsResults)=>{
              res.send({
                  Media_directory : current_image ,
                  Question_details : qsResults.questions[findIndex_this_qs]
                });
            }).catch((err)=>{
                return new Promise((resolve , reject)=>{
                  res.status(404).send(notes.Errors.General_Error);
                });
            });


       }
      if (processType =="delete"){
        if(!qtnairsDocument.questions){
            return new Promise((resolve , reject)=>{
            res.status(404).send(notes.Errors.Error_Doesnt_exists("questions Array"))
            });
        }
        var required = new Array();
        if(req.body.question_id == null){
            required[required.length] = 'question_id';
        }

        if(required.length != 0 ){
            return new Promise((resolve, reject)=>{
               res.status(404).send(notes.Messages.Required_Message(required));
            });
        }


        var question_id = req.body.question_id ;
        var application_questions = qtnairsDocument.questions ;
        var findIndex_this_qs = _.findIndex(application_questions , {"id":question_id} );

        if(findIndex_this_qs == -1 ){
          return new Promise((resolve, reject)=>{
             res.status(404).send(notes.Errors.Error_Doesnt_exists("Question"));
          });
        }

        var target_question = qtnairsDocument.questions;
        var image_root = __dirname + "/../../public/themeimages/" +target_question[findIndex_this_qs].media_question.media_field;
        if( fs.existsSync(image_root)){
          fs.unlink(image_root , function (err) {
              console.log("Deleted Image !!");
          });
        }

        var deleting_pull = _.pull(target_question , target_question[findIndex_this_qs]);

        qtnairsDocument.markModified("questions");
        qtnairsDocument.save().then((qsResults)=>{
          if(deleting_pull){

            res.send({"Message":"This Question "+question_id + " Is Deleted"});
          }

          else
          res.status(404).send(notes.Errors.General_Error);
        }).catch((err)=>{
            return new Promise((resolve , reject)=>{
              res.status(404).send(notes.Errors.General_Error);
            });
        });
      }

  });

});

// Answers
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
         res.status(401).send(notes.Warnings.Permission_Warning);
     });
 }

   qtnr.findOne({ _id:app_id }).then( ( qtnairsDocument) => {

       if (!qtnairsDocument){
         return new Promise((resolve, reject)=>{
            res.status(404).send(notes.Errors.Error_Doesnt_exists("Application"));
         });
       }

       if(qtnairsDocument.creator_id != user.id){
         return new Promise((resolve , reject)=>{
           res.send(notes.Warnings.Permission_Warning);
         });
       }

       var questionIndex = _.findIndex(qtnairsDocument.questions , {"id":question_id});
       if(questionIndex == -1 ){
         return new Promise((resolve, reject)=>{
            res.status(404).send(notes.Errors.Error_Doesnt_exists("Question"));
         });
       }


       var question_type =  qtnairsDocument.questions[questionIndex].question_type  ;
       var question_answers = new Object ();

       switch (question_type) {
          case 0:
               question_answers["_id"] = mongoose.Types.ObjectId();
                 question_answers["indexer"] = null ;
                 console.log("QUESION");
                if(req.body.choices_value != null )
                     question_answers["value"] = req.body.choices_value ;
                else
                     question_answers["value"] = "Write answer here !" ;

                if(req.body.media_optional != null ){
                    question_answers["media_optional"] = new Object();
                    var exists_array = new Array();

                    if(req.body.media_optional.media_type == null) {
                      exists_array[exists_array.length] = "media_type";
                    }

                    if(req.body.media_optional.media_name == null) {
                      exists_array[exists_array.length] = "media_name";
                    }

                    if(req.body.media_optional.media_src == null) {
                      exists_array[exists_array.length] = "media_src";
                    }

                    if(exists_array.length != 0 ){
                        return new Promise((resolve , reject) => {
                          res.send(notes.Messages.Required_Message(exists_array));
                        });
                    }

                    if( ! _.isInteger(req.body.media_optional.media_type)  || req.body.media_optional.media_type  > 1 ){
                       return new Promise((resolve , reject)=>{
                         res.send({"Message" : "This Value should be integer (0 or 1) 0 => for image type , 1 => for video type"});
                       });
                    }

                    if(  req.body.media_optional.media_type != 1  ){
                      var imagePath =  req.body.media_optional.media_src ;
                      var fileExtension = path.extname(imagePath);
                      var isExists =  _.findIndex([{image : ".JPG"},{image :".PNG"},{image :".JPEG"} , {image :".jpg"},{image :".jpeg"},{image :".png"}] , {image:fileExtension} );
                      var targetExtension =  _.find ([{image : ".JPG"},{image :".PNG"},{image :".JPEG"} , {image :".jpg"},{image :".jpeg"},{image :".png"}] , {image:fileExtension} );
                      if(isExists == -1 )
                        {
                            return new Promise((resolve , reject)=>{
                                res.send(notes.Errors.Error_file_extension);
                            });
                        }
                       var new_filename = "answer_text_"+question_answers["_id"]+targetExtension.image.toLowerCase();
                       var targetPath =__dirname + "/../../public/themeimages/"+new_filename ;

                       question_answers["media_optional"]["media_type"] = req.body.media_optional.media_type
                       question_answers["media_optional"]["media_name"] = new_filename ;
                       question_answers["media_optional"]["media_src"] = new_filename

                       if( fs.existsSync(imagePath)){
                         fs.rename( imagePath , targetPath , function (err) {
                             console.log(err);
                         });
                       }

                    }

                }

                if(qtnairsDocument.app_type == 1 ){
                      if(req.body.is_correct != null )
                          question_answers["is_correct"] = req.body.is_correct ;
                }
          break ;
          // --------------------------------------------------------------
          case 1:


              // question_answers["indexer"] = null ;
              // if(req.body.media_name != null)
              //  question_answers["media_name"] = req.body.media_name
              //  else
              //  question_answers["media_name"] = "Write answer here !" ;
              // if(req.body.media_dir != null )
              //  question_answers["media_src"] =  req.body.media_dir ;

               var exists_array = new Array();
               if(req.body.media_type == null) {
                 exists_array[exists_array.length] = "media_type";
               }

               if(req.body.media_name == null) {
                 exists_array[exists_array.length] = "media_name";
               }
                
               if(req.body.media_src == null) {
                 exists_array[exists_array.length] = "media_src";
               }

               if(exists_array.length != 0 ){
                   return new Promise((resolve , reject) => {
                     res.send(notes.Messages.Required_Message(exists_array));
                   });
               }

               if( ! _.isInteger(req.body.media_type)  || req.body.media_type  > 1 ){
                  return new Promise((resolve , reject)=>{
                    res.send({"Message" : "This Value should be integer (0 or 1) 0 => for image type , 1 => for video type"});
                  });
               }
                 question_answers["_id"] = mongoose.Types.ObjectId();

               if(  req.body.media_type != 1  ){

                 var imagePath =  req.body.media_src ;
                 var fileExtension = path.extname(imagePath);
                 var isExists =  _.findIndex([{image : ".JPG"},{image :".PNG"},{image :".JPEG"} , {image :".jpg"},{image :".jpeg"},{image :".png"}] , {image:fileExtension} );
                 var targetExtension =  _.find ([{image : ".JPG"},{image :".PNG"},{image :".JPEG"} , {image :".jpg"},{image :".jpeg"},{image :".png"}] , {image:fileExtension} );
                 if(isExists == -1 )
                   {
                       return new Promise((resolve , reject)=>{
                           res.send(notes.Errors.Error_file_extension);
                       });
                   }

                  var new_filename = "answer_media_"+question_answers["_id"]+targetExtension.image.toLowerCase();
                  var targetPath =__dirname + "/../../public/themeimages/"+new_filename ;


                  question_answers["media_src"] = new_filename

                  if( fs.existsSync(imagePath)){
                    fs.rename( imagePath , targetPath , function (err) {
                        console.log(err);
                    });
                  }

               }else {
                  question_answers["media_src"] = req.body.media_src;
                  question_answers["media_type"] = req.body.media_type;
                  question_answers["media_name"] = req.body.media_name   ;
               }


              if(qtnairsDocument.app_type == 1 ){
                  if(req.body.is_correct != null )
                  question_answers["is_correct"] = req.body.is_correct ;
              }
          break;
          // --------------------------------------------------------------
          case 2:

          // ===> first time

            question_answers["_id"] = mongoose.Types.ObjectId();
            if (req.body.boolean_type != null )
             question_answers["boolean_type"] = req.body.boolean_type ;

             //if(qtnairsDocument.app_type != 0 ){

                   if(req.body.boolean_value != null ){

                           if(req.body.boolean_type == "true/false")
                                 {
                                     if(req.body.boolean_value == true)
                                       {
                                        question_answers["boolean_value"] = "True";


                                       }else {
                                          question_answers["boolean_value"] = "False";

                                       }


                                  }
                            if(req.body.boolean_type == "yes/no")
                                  {
                                      if(req.body.boolean_value == true)
                                        {
                                          question_answers["boolean_value"] =  "Yes";

                                        }
                                        else
                                        {
                                          question_answers["boolean_value"] =  "No";

                                        }
                                  }
                              }else {
                                return new Promise((resolve , reject )=>{
                                    res.send(notes.Messages.Required_Message("boolean_value"));
                                });
                              }
                    //}
                    console.log(question_answers);

                     if(qtnairsDocument.app_type == 1 ){
                       if(req.body.is_correct != null )
                        question_answers["is_correct"] = req.body.is_correct ;
                     }


          break;
          // --------------------------------------------------------------
          case 3:

                   if(qtnairsDocument.app_type != 0 ){
                     return new Promise((resolve , reject)=>{
                       res.send({"Message":"That's not Survey !"});
                     });
                   }
                   var required_scale = new Array();

                    if(req.body.step_numbers == null )
                        required_scale[required_scale.length] = "step_numbers";
                    if(req.body.ratscal_type == null )
                         required_scale[required_scale.length] = "ratscal_type";

                    if(required_scale.length != 0 )
                    {
                        return new Promise((resolve , reject)=>{
                            res.send(notes.Messages.Required_Message(required_scale));
                        })
                    }
                        question_answers["_id"] = mongoose.Types.ObjectId();
                        question_answers["ratscal_type"] = req.body.ratscal_type;
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
            // --------------------------------------------------------------
          case 4 :
                        if(qtnairsDocument.app_type != 0 ){
                          return new Promise((resolve , reject)=>{
                            res.send({"Message":"That's not Survey !"});
                          });
                        }

                        question_answers["_id"] = mongoose.Types.ObjectId();
          break ; // Free Texts
       }
       var questionnaire_results ;
      if(processType == 'create')
         {
           // Specificaiton for each answer
           if(qtnairsDocument.app_type == 1 ){

               if(req.body.is_correct == null )
               {
                   return new Promise(( resolve , reject ) => {
                     res.send(notes.Messages.Required_Message("is_correct"));
                   });
               }
            }



           qtnairsDocument.questions[questionIndex].answers_format.push(question_answers);
           //console.log(qtnairsDocument.questions[questionIndex].answers_format);
            questionnaire_results = question_answers ;
         }
      if(processType == 'edit')
        {
              if(!req.body.answer_id || req.body.answer_id == null ){
                return new Promise((resolve , reject)=>{
                    res.send(notes.Messages.Required_Message("answer_id"))
                });
              }
              var answer_id = req.body.answer_id ;
              var question_answers = qtnairsDocument.questions[questionIndex].answers_format;
              //var answerss = _.filter(question_answers ,  x => x._id == answer_id)
              var answerArgs = qtnairsDocument.questions[questionIndex].answers_format;
              var foundAnswer = false ;
              var answerIndex = '';
              for(var i = 0 ; i < answerArgs.length ; i++ ){
                if(answer_id == answerArgs[i]._id){
                  foundAnswer = true ;
                  answerIndex = i ;
                }
              }
              if(foundAnswer == false){
                return new Promise((resolve , reject)=>{
                    res.send(notes.Errors.Error_Doesnt_exists("Answer"));
                });
              }

              var question_type = qtnairsDocument.questions[questionIndex].question_type;



              if(req.body.is_correct != null )
              answerArgs[answerIndex].is_correct = req.body.is_correct;



              // => choices text
              if(question_type == 0) {
                if(req.body.choices_value != null || !answerArgs[answerIndex].value)
                      answerArgs[answerIndex].value = req.body.choices_value;

                if(req.body.media_optional)
                  {
                      if(!answerArgs[answerIndex].media_optional)
                      answerArgs[answerIndex].media_optional = new Object();

                      if(req.body.media_optional.media_type || !answerArgs[answerIndex].media_optional.media_type)
                          answerArgs[answerIndex].media_optional.media_type = req.body.media_optional.media_type;
                      if(req.body.media_optional.media_name || !answerArgs[answerIndex].media_optional.media_name)
                          answerArgs[answerIndex].media_optional.media_name = req.body.media_optional.media_name;
                      if(req.body.media_optional.media_src || !answerArgs[answerIndex].media_optional.media_src)
                          answerArgs[answerIndex].media_optional.media_src = req.body.media_optional.media_src;
                  }
              }
              // => media_choices
              if(question_type == 1) {

                if(req.body.media_name)
                  answerArgs[answerIndex].media_name = req.body.media_name;

                if(req.body.media_dir)
                  answerArgs[answerIndex].media_dir = req.body.media_dir;

              }
              // => boolean_choices
              if(question_type == 2) {
                if(req.body.boolean_type)
                  answerArgs[answerIndex].boolean_type = req.body.boolean_type;
              }
              // => rating_scales
              if(question_type == 3) {
                if(req.body.ratscal_type)
                    answerArgs[answerIndex].ratscal_type = req.body.ratscal_type;
                if(req.body.step_numbers)
                    answerArgs[answerIndex].step_numbers = req.body.step_numbers;
                if(req.body.started_at)
                    answerArgs[answerIndex].started_at = req.body.started_at;
                if(req.body.ended_at)
                    answerArgs[answerIndex].ended_at = req.body.ended_at;
              }
              // => free texts
              if(question_type == 4) {
                // Nothing here :D
              }

                questionnaire_results = answerArgs[answerIndex] ;
         }
      if(processType == 'delete')
        {
              if(!req.body.answer_id || req.body.answer_id == null ){
                return new Promise((resolve , reject)=>{
                    res.send(notes.Messages.Required_Message("answer_id"))
                });
              }
              var answer_id = req.body.answer_id ;
              var question_answers = qtnairsDocument.questions[questionIndex].answers_format;
              //var answerss = _.filter(question_answers ,  x => x._id == answer_id)
              var answerArgs = qtnairsDocument.questions[questionIndex].answers_format;
              var foundAnswer = false ;
              var answerIndex = '';
              for(var i = 0 ; i < answerArgs.length ; i++ ){
                if(answer_id == answerArgs[i]._id){
                  foundAnswer = true ;
                  answerIndex = i ;
                }
              }

              if(foundAnswer == false){
                return new Promise((resolve , reject)=>{
                    res.send(notes.Errors.Error_Doesnt_exists("Answer"));
                });
              }

              var delete_completed = _.pull(answerArgs , answerArgs[answerIndex]);
              if(delete_completed){
                questionnaire_results = "This Answer ( "+answer_id+" ) is deleted successfully !";
              }

        }


      qtnairsDocument.markModified("questions");
      qtnairsDocument.save().then(()=>{
        res.send(questionnaire_results);
      }).catch((err)=>{
        return new Promise((resolve , reject )=>{
          res.status(404).send({"error" :notes.Errors.General_Error.error , "details":err.message});
        });
      });

   }).catch((err)=>{
     return new Promise((resolve, reject)=>{
        res.status(404).send({"error" :notes.Errors.General_Error.error , "details":err.message});
     });
   });

});

// ==> retrieve data from questions
// objects => styles | questions | retrieve | settings |
qtnrRouters.post("/:app_id/application/:objects" , verify_token_user_type , (req ,res )=>{
      var objects= req.params.objects ;
      var user = req.verified_user;
      var userType = req.verified_user_type;
      var token = req.verified_token;
      var app_id = req.params.app_id ;

      if (userType != 1) {
           return new Promise((resolve, reject) => {
              res.status(401).send(notes.Warnings.Permission_Warning);
          });
      }


      qtnr.findOne({ _id:app_id }).then( ( qtnairsDocument) => {

         if (!qtnairsDocument){
           return new Promise((resolve, reject)=>{
              res.status(404).send(notes.Errors.Error_Doesnt_exists("Application"));
           });
         }

         if(qtnairsDocument.creator_id != user.id){
           return new Promise((resolve , reject)=>{
             res.send(notes.Warnings.Permission_Warning);
           });
         }
        var apps ;
        if( objects == 'retrieve'){
             apps = qtnairsDocument ;
        }
        if( objects == 'settings'){
             apps = qtnairsDocument.settings ;
        }
        if( objects == 'questions'){
          if(req.body.target_id != null ){
            var isexists = _.findIndex(qtnairsDocument.questions , {"id":req.body.target_id});
            if(isexists == -1 )
              {
                return new Promise((resolve , reject)=>{
                  res.send(notes.Errors.Error_Doesnt_exists("Question"));
                });
              }
            apps =  _.find(qtnairsDocument.questions , {"id":req.body.target_id});
          } else
            apps = qtnairsDocument.questions ;
        }
        if( objects == 'stylesheets'){
          if(req.body.target_id != null ){
            var isexists = _.findIndex(qtnairsDocument.theme_style , { "file_name":  "styletheme_"+req.body.target_id+".css" });
            console.log(isexists);
            if(isexists == -1 )
              {
                return new Promise((resolve , reject)=>{
                  res.send(notes.Errors.Error_Doesnt_exists("Stylesheet"));
                });
              }
            apps =  _.find(qtnairsDocument.theme_style , {"file_name":  "styletheme_"+req.body.target_id+".css"});
          } else
             apps = qtnairsDocument.theme_style ;
        }

       res.send(apps);
        }).catch((er)=>{
          return new Promise((resolve, reject)=>{
            res.status(404).send(notes.Errors.General_Error);
          });
       });
});




module.exports = {
    qtnrRouters
};
