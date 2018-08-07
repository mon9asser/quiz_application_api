const express = require("express");
const hbs = require("hbs");
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path') ;
const _ = require('lodash');
const jwt = require('jsonwebtoken');
var im = require('imagemagick');

// ==> updating [issue #114]
const multer = require('multer')
// const fileType = require('file-type')

// var formidable = require('formidable');
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
    build_session ,
    auth_verify_api_keys,
    auth_verify_api_keys_tokens,
    auth_verify_generated_tokens ,
    authenticate_keys_with_curr_status ,
    auth_api_keys_only
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


const diskStorage = multer.diskStorage({
   destination: 'ui-public/themeimages/' ,
   filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
});


const question_answer_images = multer({
  storage: diskStorage ,
  fileFilter: function (req, file, cb) {
    req.file_status = false ;
     var filetypes = /jpeg|jpg|png|gif/;
     var mimetype = filetypes.test(file.mimetype);
     var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

     if (mimetype && extname) {
       req.file_status = true ;
       return cb(null, true);
     }

      req.file_status = false ;
      return cb(null, false);
   }

  })

//**************************************************************
/* ****************/ // For Testing only
//**************************************************************

// ==============================================> End the test

var qtnrRouters = express.Router();

// qtnrRouters.use(bodyParser.json());
// qtnrRouters.use(bodyParser.urlencoded({
//     extended: false
// }));

// qtnrRouters.use(bodyParser.urlencoded());
// qtnrRouters.use(bodyParser.json());
qtnrRouters.use(build_session);





qtnrRouters.post("/upload/animage"  , question_answer_images.single("media_field") , (req, res) => {
    var file_path = 'ui-public/themeimages/';
    var fileIs = file_path + req.file.originalname
    setTimeout(function(){
      im.convert([ fileIs ,'-crop', "200x200+50+50" , file_path +  "____________________cropped_image.jpg" ], function( err, stdout ){
        console.log(err);

        if(err){
          return new Promise((resolve, reject) => {
              res.send( err );

          });
        }

          console.log(stdout);
          res.send(req.file);
      });
    } , 500 );
});



qtnrRouters.post("/create/v1.1", auth_verify_api_keys_tokens ,  (req, res) => {
  var user = req.verified_user;
  var userType = req.is_creator;
    if (userType != 1) {
        return new Promise((resolve, reject) => {
            res.status(401).send(notes.Warnings.Permission_Warning);
        });
    }

    var required = new Array()
    if(  req.body.app_settings== null  )
      required[required.length]='app_settings';

    if(req.body.app_type == null  )
       required[required.length]='app_type';
    if(req.body.questionnaire_title == null || !req.body.questionnaire_title )
      required[required.length]='questionnaire_title';
    if(req.body.description == null || !req.body.description )
      required[required.length]='description';
    if(required.length != 0 )
    {
      return new Promise((resolve , reject)=>{
        // //console.log(required);
        res.status(201).send(notes.Messages.Required_Message(required));
      });
    }
    var appt  = parseInt(req.body.app_type)
    if( appt >= 2  || appt < 0 ||  !_.isInteger(appt)){
       return new Promise((resolve , reject)=>{
        // //console.log(required);
        res.status(404).send(notes.Errors.Error_Doesnt_exists("Application Type"));
      });
    }
    // Builde And Init Default !
    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();
    req.body.settings = req.body.app_settings ;
    req.body.questions = [];
    req.body.creator_id = user.id;
    req.body.theme_style = [];
    req.body.att__draft = undefined ;
    var body = _.pick(req.body, ['creator_id', 'app_type', 'questionnaire_title', 'description', 'createdAt', 'updatedAt', 'settings', 'questions','theme_style' , 'att__draft']);

    var qtnrs = new qtnr(body);
    qtnrs.save().then((qtner) => {

        if (!qtner) {
            return new Promise((resolve, reject) => {
                 res.status(204).send( `${notes.Errors.General_Error}`  );
            });
        }
        // => Save id to set attendee_draft
        qtnrs.app_registry = qtner._id ;
        qtnrs.app_report =   qtner._id ;

        // themes/stylesheet_of_app_
        var file_stylesheet = "ui-public/themes/stylesheet_of_app_"+ qtner._id + '.css' ;
        if (! fs.existsSync(file_stylesheet)) {
          fs.appendFile( file_stylesheet , '' , ( err ) => {
            if(err) console.log(err);
          });
        }

        qtnrs.save();
        res.send(qtner);
    }).catch((e) => {

        return new Promise((resolve, reject) => {
            res.status(401).send(  e );
        });
    });

});
qtnrRouters.delete("/:app_id/delete", auth_verify_api_keys_tokens , (req, res)=>{
  var app_id = req.params.app_id;
  qtnr.findByIdAndRemove(app_id).then((appDoc)=>{
    if(!appDoc) {
      return new Promise((resolve , reject )=>{
        res.status(404).send(notes.notifications.catch_doesnt_existing_data("Application"));
      });
    }

    // themes/stylesheet_of_app_
    var file_stylesheet = "ui-public/themes/stylesheet_of_app_"+ app_id + '.css' ;
    if ( fs.existsSync(file_stylesheet)) {
      fs.unlink(file_stylesheet, (err) => {
        if (err) throw err;
      });
    }

    res.send({
      "status_code":1 ,
      "message" : "success" ,
      "data" : "application has been deleted successfully !"
    });
  });

});
qtnrRouters.post("/init", auth_verify_api_keys_tokens  , (req, res) => {

    var user = req.verified_user;
    var userType = req.is_creator;

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
    if(req.body.app_type >= 2  || req.body.app_type < 0  ||  !_.isInteger(req.body.app_type )){
       return new Promise( ( resolve , reject ) => {
        // //console.log(required);
        res.status(404).send(notes.Errors.Error_Doesnt_exists("Application Type"));
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
// Create settings for quiz or survey ( remember this part => surv/quiz for used with /init route)
qtnrRouters.patch("/:app_id/app/setup_settings", auth_verify_api_keys_tokens , (req,res)=>{
  var app_id = req.params.app_id;
  qtnr.findById(app_id , (err,d)=>{
    if(err || !d){
      return new Promise((resolve, reject) => {
         res.status(401).send(notes.Errors.Error_Doesnt_exists("Application"));
     });
    }
    d.settings = req.body.settings;
    d.questionnaire_title = req.body.questionnaire_title;
    d.markModified("settings");
    d.save().then((success)=>{
      if(success)
       {
         res.send({
           succ : success
         })
       }
    });
  });
});
// Create settings for quiz or survey ( remember this part => surv/quiz for used with /init route)
qtnrRouters.patch("/:app_id/app/edit", auth_verify_generated_tokens ,  (req, res) => {
    var user = req.verified_user;

    var userType = req.is_creator;

    var app_id = req.params.app_id;
    var update_type = req.body.updateType;
    // this user should be a creator user !

    if (userType != 1) {
          return new Promise((resolve, reject) => {
            res.status(401).send(notes.Warnings.Permission_Warning);
        });
    }

    qtnr.findById(app_id , (err,d)=>{
      if(err || !d){
        return new Promise((resolve, reject) => {
           res.status(401).send(notes.Errors.Error_Doesnt_exists("Application"));
       });
      }
    }).then((qtnr_results) => {
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
        if(req.body.questionnaire_title != null )
          $settings["questionnaire_title"] = req.body.questionnaire_title;
        if(req.body.description != null )
          $settings["description"] = req.body.description;
          $settings["updatedAt"] = new Date();

        // Edit and Create Settings
        if (req.body.titles) {

            if (req.body.titles.title_start_with)
                $settings["settings.titles.title_start_with"] = req.body.titles.title_start_with;

            if (req.body.titles.title_end_with)
                $settings["settings.titles.title_end_with"] = req.body.titles.title_end_with;

            if (req.body.titles.title_success_with)
                $settings["settings.titles.title_success_with"] = req.body.titles.title_success_with;

            if (req.body.titles.title_failed_with)
                $settings["settings.titles.title_failed_with"] = req.body.titles.title_failed_with;
         }


        if (req.body.step_type != null )
            $settings["settings.step_type"] = req.body.step_type;

        if(req.body.show_results_per_qs  != null)
        $settings["settings.show_results_per_qs"] = req.body.show_results_per_qs;

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
            if (req.body.time_settings.seconds !=null)
                $settings["settings.time_settings.seconds"] = req.body.time_settings.seconds;
            if (req.body.time_settings.minutes !=null)
                $settings["settings.time_settings.minutes"] = req.body.time_settings.minutes;
            if (req.body.time_settings.hours !=null)
                $settings["settings.time_settings.hours"] = req.body.time_settings.hours;
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
                "app_info" : _.pick(results , ["_id","creator_id","questionnaire_title","description","updatedAt"]),
                "settings" : results.settings
              });
            }else {
              res.send({
                "app_info" : app_id,
                "Warning" : notes.Messages.Update_Message_Not_completed("App")});
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
qtnrRouters.patch("/:app_id/settings/style/:process", auth_verify_api_keys , (req, res) => {
    // Stylesheet
    var user = req.verified_user;
    var userType = req.is_creator;

    var processType = req.params.process;
    var application_id = req.params.app_id ;

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



        qtnr.findOne({_id:application_id} , (er,d)=>{
          if(er || !d)
          {
            return new Promise((resolve , reject)=>{
              res.send(notes.Errors.Error_Doesnt_exists("Application"));
            });
          }
        }).then((qtnrsx)=>{


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



            fs.appendFile("ui-public/themes/"+stylesheet['file_name'],for_stylesheet_file, (err) => {
                if (err) throw err;
                  //console.log('The "data to append" was appended to file!');
            });

            var style_codes = _.find(stylesheets.theme_style , {'file_name':stylesheet['file_name']} );
            res.send({ "File_directory" : config.server_ip+"themes/"+style_codes.file_name , "Stylesheet_code":style_codes})
           }).catch((err)=>{
            return new Promise((resolve, reject) => {
                res.status(401).send(notes.Errors.General_Error);
            });
          });
        }).catch((err)=>{
          // //console.log(err);
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

        qtnr.findOne({_id:application_id} , (er,d)=>{
          if(er || !d)
          {
            return new Promise((resolve , reject)=>{
              res.send(notes.Errors.Error_Doesnt_exists("Application"));
            });
          }
        }).then((qtnrsx)=>{

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
            var Stylecodes_Index;
            try {
              Stylecodes_Index = _.findIndex( qtnrsx.theme_style , {"_id":ObjectID(stylefile_id) }/*"file_name":/*"styletheme_"+stylefile_id+".css"*/ );
            } catch (e) {
              return new Promise((resolve,reject)=>{
                res.send(notes.Errors.Error_Doesnt_exists("Stylesheet"));
              });
            }
            if(Stylecodes_Index == -1 ){
              return new Promise((resolve,reject)=>{
                res.send(notes.Errors.Error_Doesnt_exists("Stylesheet"));
              });
            }

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
              var stylesheetPath = "ui-public/themes/"+"styletheme_"+stylefile_id+".css" ;

              if(for_stylesheet_file ) {
                   if (fs.existsSync(stylesheetPath)) {
                    fs.appendFile(stylesheetPath ,for_stylesheet_file, (err) => {
                        if (err) throw err;
                          //console.log('Stylesheet codes is appended !');
                    });
                  }
                     var Stylecodes_Find  = _.find( theme_stylish.theme_style , {"file_name":"styletheme_"+stylefile_id+".css"} );
               }
                var Stylecodes_updated  = _.find( theme_stylish.theme_style , {"file_name":"styletheme_"+stylefile_id+".css"} );
               res.send({ "File_directory" : config.server_ip+"themes/"+"styletheme_"+stylefile_id+".css" , "Stylesheet_code":Stylecodes_updated})

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

      qtnr.findOne({_id:application_id}, (er,d)=>{
        if(er || !d)
        {
          return new Promise((resolve , reject)=>{
            res.send(notes.Errors.Error_Doesnt_exists("Application"));
          });
        }
      }).then((qtnrsx)=>{

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
          // res.send({"err":0 , "e":qtnrsx});
          // return false ;
          var stylefile_id = req.body.theme_style_id;
          qtnrsx.updatedAt = new Date();
          if(qtnrsx.theme_style.length == 0 ){
            return new Promise((resplve , reject)=>{
              res.send(notes.Errors.Error_Doesnt_exists("Stylesheet"));
            });
          }

          var Stylecodes_Index = _.findIndex( qtnrsx.theme_style , {"file_name":"styletheme_"+stylefile_id+".css"} );
           var stylesheet_object = qtnrsx.theme_style ;

          //  res.send({"err":1 , "e":Stylecodes_Index});
          //  return false ;
           if(Stylecodes_Index == -1 ){
             return new Promise((resplve , reject)=>{
               res.send(notes.Errors.Error_Doesnt_exists("Stylesheet"));
             });
           }
          //  res.send({"err":2 , "e":Stylecodes_Index});
          //  return false ;
           file_styletheme = "ui-public/themes/"+"styletheme_"+ stylesheet_object[Stylecodes_Index]._id  +".css"

          //  res.send({"err":3 , "e":file_styletheme});
          //  return false ;
          if(Stylecodes_Index != -1 )
            {

            var deleted_data =  _.pull(stylesheet_object , stylesheet_object[Stylecodes_Index] ) ;
              if(deleted_data){
                if (fs.existsSync(file_styletheme)) {
                    fs.unlink(file_styletheme, (err) => {
                      if (err) throw err;

                    });
                  }
                  // var file_for_delete = "styletheme_"+stylesheet_object[Stylecodes_Index]._id  +".css";
                    // var file_for_delete = "styletheme_"+stylesheet_object[Stylecodes_Index]._id  +".css";


                  qtnrsx.markModified('theme_style');
                  qtnrsx.save((error , succ)=>{
                    if(error){
                      return new Promise((resolve , reject)=>{
                        res.send({"error":"Error in delete file from server"});
                      });
                    }
                    res.send({
                      "Message":'successfully deleted data with css file !'
                    });
                  });

              }
            }
            else {
              return new Promise((resplve , reject)=>{
                res.send(notes.Errors.Error_Doesnt_exists("Stylesheet"));
              });
            }




      });
    }


});
// Save many questions with indexes in one time
qtnrRouters.patch("/:app_id/question/creation"  , auth_verify_api_keys , (req,res)=>{
  var app_id = req.params.app_id ;
  var user = req.verified_user;
  var userType = req.is_creator;

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

    qtnairsDocument.questions = req.body.sorted_question ;
    qtnairsDocument.markModified("questions");
    qtnairsDocument.save().then(function(sorted_qs){
      res.send (sorted_qs) ;
    });
  });
});
// Question => proccess ( create - edit or delete )
qtnrRouters.patch("/:app_id/question/:process" , question_answer_images.single("media_field") , auth_verify_api_keys , (req, res) =>{

  var app_id = req.params.app_id ;
  var processType= req.params.process ;
  var user = req.verified_user;
  var userType = req.is_creator;

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

          // question_description
          if(required.length != 0 ){
              return new Promise((resolve, reject)=>{
                 res.status(404).send(notes.Messages.Required_Message(required));
              });
          }

          if( !_.isInteger(parseInt(req.body.question_type)) ){
            return new Promise(( resolve , reject)=>{
              res.send({
                Message : "Question type should be an integer (Number) value "
              });
              return false;
            });
          }


          if( req.body.question_type >= 5    &&   qtnairsDocument.app_type == 0 &&   qtnairsDocument.app_type.length != 1 ){
            return new Promise(( resolve , reject)=>{
              res.send({
                Message : "This question type doesn't exists !!"
              });
              return false;
            });
          }

          if( req.body.question_type >= 3    &&   qtnairsDocument.app_type == 1 ){
            return new Promise(( resolve , reject)=>{
              res.send({
                Message : "Question type not supported in quiz application !!"
              });
              return false;
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
          if(req.body.question_description != null )
            question_tag ["question_description"] = req.body.question_description;

          if(req.body.enable_description != null )
            question_tag ["enable_description"] = req.body.enable_description;

          if(req.body.answer_settings == null) {
            question_tag ["answer_settings"] = new Object();
            question_tag ["answer_settings"]['is_randomized'] = false ;
            question_tag ["answer_settings"]['is_required'] = false ;
            question_tag ["answer_settings"]['super_size'] = false ;
            question_tag ["answer_settings"]['single_choice'] = true ;
            question_tag ["answer_settings"]['is_required'] = false ;
            question_tag ["answer_settings"]['choice_style'] = true;
            question_tag ["answer_settings"]['answer_char_max'] = 200;
          }else if(req.body.answer_settings != null){
              question_tag ["answer_settings"] = new Object();
              if(req.body.answer_settings.is_randomized != null )
              question_tag ["answer_settings"]['is_randomized'] = req.body.answer_settings.is_randomized ;
              if( req.body.answer_settings.is_required != null)
              question_tag ["answer_settings"]['is_required'] = req.body.answer_settings.is_required ;
              if(req.body.answer_settings.super_size != null )
              question_tag ["answer_settings"]['super_size'] = req.body.answer_settings.super_size ;

              if(req.body.answer_settings.single_choice!= null )
                question_tag ["answer_settings"]['single_choice'] = req.body.answer_settings.single_choice;

              if(req.body.answer_settings.choice_style != null )
              question_tag ["answer_settings"]['choice_style'] = req.body.answer_settings.choice_style ;

              if(req.body.answer_settings.answer_char_max != null )
              question_tag ["answer_settings"]['answer_char_max'] = req.body.answer_settings.answer_char_max ;

          }

          if(req.file_status != "undefine" && req.file_status == false){
              return new Promise((resolve , reject)=>{
                res.send(notes.Errors.Error_file_extension)
              });
          }
          // Upload Media part ============================
          if(req.body.media_field != null || req.file != null){
             // there is a medi image or video
             question_tag ["media_question"] = new Object();
              if(req.file != null ){  // => Image Type
                var imagePath =  req.file.path ;
                var fileExtension = path.extname(imagePath);
                var new_filename = "question_"+question_tag["_id"]+fileExtension.toLowerCase();
                var targetPath = "ui-public/themeimages/"+new_filename;
                var tempPath = req.file.path ;
                if(! fs.existsSync(tempPath)){
                    return new Promise((resolve , reject )=>{
                      res.send(notes.Errors.Error_Doesnt_exists("Image"));
                    });
                }
                question_tag ["media_question"]["media_type"]  = 0;
                question_tag ["media_question"]["media_name"]  = new_filename
                question_tag ["media_question"]["media_field"] = "themeimages/"+new_filename ;
                fs.rename( imagePath , targetPath , (err)=>{
                    if(err) throw err ;
                }) ;
              }else { // => Video Type
                question_tag ["media_question"]["media_type"] = 1;
                question_tag ["media_question"]["media_name"] = req.body.media_field;
                question_tag ["media_question"]["media_field"] = req.body.media_field;
                // detect video type

                var video = req.body.media_field ;
                var videoType = null ;
                var videoId = null ;
                var video_src_value = null;
                if( video.toLowerCase().includes("youtube")    == true   ) {
                  videoType = 0 ; // => youtube
                  var idWithLastSplit = video.lastIndexOf('?');
                  var videos = video.substr(idWithLastSplit + 1);
                  var lastId = videos.substr(0, videos.indexOf('&'));

                  if(lastId != '' || lastId )
                    videoId = lastId ;
                  else
                    videoId = videos ;


                  var afterEqualChar = videoId.lastIndexOf('=');
                  videoId = videoId.substring(afterEqualChar + 1);
                  video_src_value = "http://youtube.com/embed/"+ videoId ;
                }
                else if( video.includes("vimeo") == true   ) {
                  videoType = 1 ; // => vimeo
                  var n = video.lastIndexOf('/');
                  videoId = video.substring(n + 1);
                  video_src_value = "https://player.vimeo.com/video/"+ videoId;;
                }
                else if( video.includes(".mp4")  == true   ) {
                  videoType = 2 ;
                  videoId = null;

                  var media_mp4 = req.body.media_field.substring(0, req.body.media_field.lastIndexOf('.'));
                  question_tag ["media_question"]["media_field"] = media_mp4 ;

                }
                question_tag ["media_question"]["video_type"] = videoType;
                question_tag ["media_question"]["video_source"] = video_src_value;
                question_tag ["media_question"]["video_id"] = videoId;
              }

          }

          // Save data after saving image in server directory
            qtnairsDocument.questions.push(question_tag);
            qtnairsDocument.markModified("questions");
            qtnairsDocument.save().then((qsResults)=>{
              if(!qsResults){
                if( fs.existsSync(tempPath)){
                  fs.unlink(tempPath, (err) => {
                   if (err) throw err;
                    //console.log('successfully deleted');
                  });
                }
              }
            }).then(()=>{

              var send_requests = new Object();
              if(question_tag.media_question != null ){
                var media_part = ( question_tag.media_question.media_type == 0 ) ?
                config.server_ip+"themeimages/" +  new_filename :
                question_tag.media_question.media_field
                send_requests['Media_directory']=media_part;
              }
              send_requests['Question_details'] = question_tag ;
              res.send(send_requests);

            }).catch((err)=>{

                return new Promise((resolve , reject)=>{
                  res.status(404).send({
                    error : notes.Errors.General_Error.error ,
                    details :  err
                  });
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


            // => Edit Media
            /*----------------------------------------------*/
            if(req.file_status != "undefine" && req.file_status == false){
               return new Promise((resolve , reject)=>{
                 res.send(notes.Errors.Error_file_extension);
               });
            }
            if(req.body.media_field != null || req.file != null){
              if(qtnairsDocument.questions[findIndex_this_qs].media_question == null)
                  qtnairsDocument.questions[findIndex_this_qs].media_question = new Object();

              if(req.file != null ){
                var imagePath =  req.file.path ;
                var fileExtension = path.extname(imagePath);
                var new_filename = "question_"+question_id+fileExtension;
                var targetPath = "ui-public/themeimages/"+new_filename;
                var tempPath = req.file.path ;
                // if(! fs.existsSync(tempPath)){ ==> in thid case can add new image
                //     return new Promise((resolve , reject )=>{
                //       res.send(notes.Errors.Error_Doesnt_exists("Image"));
                //     });
                // }
                // res.send({
                //   'tempPath':tempPath ,
                //   'trPath':targetPath
                // });
                // return false;
                qtnairsDocument.questions[findIndex_this_qs].media_question["media_type"] = 0;
                qtnairsDocument.questions[findIndex_this_qs].media_question["media_name"] = new_filename
                qtnairsDocument.questions[findIndex_this_qs].media_question["media_field"] = "themeimages/"+new_filename ;
                fs.rename( imagePath , targetPath , (err) => {
                    if (err ) throw err;
                    fs.stat(targetPath,   (err, stats) => {
                       if (err) throw err;
                     });
                  });

              }else{ // => Video Type
                  qtnairsDocument.questions[findIndex_this_qs].media_question["media_type"] = 1 ;
                  qtnairsDocument.questions[findIndex_this_qs].media_question["media_name"] = req.body.media_field;
                  qtnairsDocument.questions[findIndex_this_qs].media_question["media_field"] = req.body.media_field;
                  // ================> Start Edit video
                  var video = req.body.media_field;
                  var videoType = null ;
                  var videoId = null ;
                  var video_src_value = null ;
                  if( video.toLowerCase().includes("youtube")    == true   ) {
                     videoType = 0 ; // => youtube
                     var idWithLastSplit = video.lastIndexOf('?');
                     var videos = video.substr(idWithLastSplit + 1);
                     var lastId = videos.substr(0, videos.indexOf('&'));
                     if(lastId != '' || lastId )
                    videoId = lastId ;
                    else
                    videoId = videos ;
                    var afterEqualChar = videoId.lastIndexOf('=');
                    videoId = videoId.substring(afterEqualChar + 1);
                    video_src_value = "http://youtube.com/embed/"+ videoId
                  }else if( video.includes("vimeo") == true   ) {
                    videoType = 1 ; // => vimeo
                    var n = video.lastIndexOf('/');
                    videoId = video.substring(n + 1);
                    video_src_value = "https://player.vimeo.com/video/"+ videoId;
                  } else if( video.includes(".mp4")  == true   ) {
                    videoType = 2 ;
                    videoId = null;
                    var media_mp4 = req.body.media_field.substring(0, req.body.media_field.lastIndexOf('.'));
                    qtnairsDocument.questions[findIndex_this_qs].media_question["media_field"] = media_mp4 ;
                  }
                  qtnairsDocument.questions[findIndex_this_qs].media_question["video_type"] = videoType ;
                  qtnairsDocument.questions[findIndex_this_qs].media_question["video_id"] = videoId ;
                  qtnairsDocument.questions[findIndex_this_qs].media_question["video_source"] = video_src_value  ;

              }
            }
            // res.send(qtnairsDocument.questions[findIndex_this_qs]);
            // return false ;
            /*----------------------------------------------*/


            if(req.body.question_body != null)
              qtnairsDocument.questions[findIndex_this_qs].question_body = req.body.question_body ;
            if(req.body.question_is_required != null)
             qtnairsDocument.questions[findIndex_this_qs].question_is_required  = req.body.question_is_required ;
            if(req.body.question_type != null)
              qtnairsDocument.questions[findIndex_this_qs].question_type = req.body.question_type ;

              if(req.body.question_description != null )
              {
                qtnairsDocument.questions[findIndex_this_qs].question_description = req.body.question_description;

              }
              if(req.body.enable_description != null )
              {
                qtnairsDocument.questions[findIndex_this_qs].enable_description = req.body.enable_description;

              }

            if(req.body.answer_settings != null ){
                if(qtnairsDocument.questions[findIndex_this_qs].answer_settings == null)
                  qtnairsDocument.questions[findIndex_this_qs].answer_settings = new Object();

                  if(req.body.answer_settings.is_randomized != null  ){
                      qtnairsDocument.questions[findIndex_this_qs].answer_settings.is_randomized = req.body.answer_settings.is_randomized ;
                  }
                  if(req.body.answer_settings.is_required != null  ){
                      qtnairsDocument.questions[findIndex_this_qs].answer_settings.is_required = req.body.answer_settings.is_required ;
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

              var send_requests = new Object();
             if(qsResults.questions[findIndex_this_qs].media_question != null ){

                var media_part = ( qsResults.questions[findIndex_this_qs].media_question.media_type == 0 ) ?
                config.server_ip+"themeimages/" + "question_"+question_id+fileExtension :
                qsResults.questions[findIndex_this_qs].media_question.media_field
                send_requests['Media_directory'] = media_part ;
              }
              send_requests["Question_details"] = qsResults.questions[findIndex_this_qs];
              res.send(send_requests);
            }).catch((err)=>{
                return new Promise((resolve , reject)=>{
                  res.status(404).send({error:notes.Errors.General_Error.error , details : err});
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
        if(target_question[findIndex_this_qs].media_question != null ){
          var image_root =/* __dirname + "/../../*/"ui-public/themeimages/" +target_question[findIndex_this_qs].media_question.media_field;
          if( fs.existsSync(image_root)){
            fs.unlink(image_root , function (err) {
                //console.log("Deleted Image !!");
            });
          }
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
// ==> Update answer
qtnrRouters.patch("/:app_id/question/:question_id/answer/media/edit" , question_answer_images.single("media_src") ,  auth_verify_api_keys , (req , res)=>{
  var question_id = req.params.question_id;
   var user = req.verified_user;
   var userType = req.is_creator;

   var app_id = req.params.app_id;

   // this user should be a creator user !
   if (userType != 1) {
       return new Promise((resolve, reject) => {
           res.status(401).send(notes.Warnings.Permission_Warning);
       });
   }

   qtnr.findOne({_id: app_id} , (err, docs)=>{
     if (!docs || err) {
        return new Promise((resolve, reject) => {
          res.status(404).send(notes.Errors.Error_Doesnt_exists("Application"));
        });
      }
   }).then((qtnairsDocument) => {
     var questionnaire_results;
     if (!qtnairsDocument) {
            return new Promise((resolve, reject) => {
                res.status(404).send(notes.Errors.Error_Doesnt_exists("Application"));
            });
        }

        if (qtnairsDocument.creator_id != user.id) {
            return new Promise((resolve, reject) => {
                res.send(notes.Warnings.Permission_Warning);
            });
        }

        var questionIndex = _.findIndex(qtnairsDocument.questions, {
            "id": question_id
        });
        if (questionIndex == -1) {
            return new Promise((resolve, reject) => {
                res.status(404).send(notes.Errors.Error_Doesnt_exists("Question"));
            });
        }

        var question_type = qtnairsDocument.questions[questionIndex].question_type;
        var question_answers = new Object();
        if (!req.body.answer_id || req.body.answer_id == null) {
                return new Promise((resolve, reject) => {
                    res.send(notes.Messages.Required_Message("answer_id"))
                });
            }
            var answer_id = req.body.answer_id;
            var question_answers = qtnairsDocument.questions[questionIndex].answers_format;
            //var answerss = _.filter(question_answers ,  x => x._id == answer_id)
            var answerArgs = qtnairsDocument.questions[questionIndex].answers_format;
            var foundAnswer = false;
            var answerIndex = '';
            for (var i = 0; i < answerArgs.length; i++) {
                if (answer_id == answerArgs[i]._id) {
                    foundAnswer = true;
                    answerIndex = i;
                }
            }
            if (foundAnswer == false) {
                return new Promise((resolve, reject) => {
                    res.send(notes.Errors.Error_Doesnt_exists("Answer"));
                });
            }

            var question_type = qtnairsDocument.questions[questionIndex].question_type;

            if (req.body.is_correct != null)
                answerArgs[answerIndex].is_correct = req.body.is_correct;



      // ==============> 1 choices text
       if (question_type == 0){
         if (req.body.choices_value != null || !answerArgs[answerIndex].value)
             answerArgs[answerIndex].value = req.body.choices_value;

         if (req.file_status != "undefine" && req.file_status == false) {
              return new Promise((resolve, reject) => {
                        res.send(notes.Errors.Error_file_extension)
              });
         }

         if (req.body.media_src != null || req.file != null) {

            if ( answerArgs[answerIndex].media_optional )
                answerArgs[answerIndex].media_optional = new Object();

            // ==> Media part here
            if (req.file != null) {
              var imagePath = req.file.path;
              var fileExtension = path.extname(req.file.filename);
              var new_filename = "answer_text_" + answerArgs[answerIndex]._id + fileExtension;

              var targetPath = "ui-public/themeimages/" + new_filename;
              answerArgs[answerIndex].media_optional.media_type = 0;
              answerArgs[answerIndex].media_optional.media_name = new_filename;
              answerArgs[answerIndex].media_optional.media_src = "themeimages/" + new_filename;
              answerArgs[answerIndex].media_optional.Media_directory = config.server_ip + "themeimages/" + new_filename;
              if (fs.existsSync(imagePath)) {
                  fs.rename(imagePath, targetPath, function(err) {
                      //console.log(err);
                  });
              }
            }else {

              var video = req.body.media_src;
              var videoType = null;
              var videoId = null;
              var video_src_value = null;
              if (video.toLowerCase().includes("youtube") == true) {
                  videoType = 0; // => youtube
                  var idWithLastSplit = video.lastIndexOf('?');
                  var videos = video.substr(idWithLastSplit + 1);
                  var lastId = videos.substr(0, videos.indexOf('&'));
                  if (lastId != '' || lastId)
                        videoId = lastId;
                  else
                        videoId = videos;

                  var afterEqualChar = videoId.lastIndexOf('=');
                  videoId = videoId.substring(afterEqualChar + 1);
                  video_src_value = "http://youtube.com/embed/" + videoId;
               } // end youtube
               else if (video.includes("vimeo") == true) {
                 videoType = 1; // => vimeo
                 var n = video.lastIndexOf('/');
                 videoId = video.substring(n + 1);
                 video_src_value = "https://player.vimeo.com/video/" + videoId;
               } // end vimeo
               else if (video.includes(".mp4") == true){
                 videoType = 2;
                 videoId = null;
                 var media_mp4 = req.body.media_src.substring(0, req.body.media_src.lastIndexOf('.'));
                 answerArgs[answerIndex].media_optional["mp4_option"] = new Object();
                 answerArgs[answerIndex].media_optional["mp4_option"]["mp4_url"] = media_mp4 + '.mp4';
                 answerArgs[answerIndex].media_optional["mp4_option"]["ogg_url"] = media_mp4 + '.ogg';
               }

               answerArgs[answerIndex].media_optional.video_id = videoId;
               answerArgs[answerIndex].media_optional.embed_path = video_src_value;
               answerArgs[answerIndex].media_optional.video_type = videoType;
            } // => End the video related text choices

         }
       }
      // ==============> 2 Media Choices
      if (question_type == 1){
        if (req.body.choices_value != null || !answerArgs[answerIndex].value)
                    answerArgs[answerIndex].value = req.body.choices_value;

                if (req.file_status != "undefine" && req.file_status == false) {
                    return new Promise((resolve, reject) => {
                        res.send(notes.Errors.Error_file_extension)
                    });
                }
                if (req.body.media_src != null || req.file != null) {
                    if (req.file != null) { // Image
                        var imagePath = req.file.path;
                        var fileExtension = path.extname(req.file.filename);
                        var new_filename = "answer_media_" + answerArgs[answerIndex]._id + fileExtension;

                        var targetPath = "ui-public/themeimages/" + new_filename;
                        answerArgs[answerIndex].media_type = 0;
                        answerArgs[answerIndex].media_name = new_filename;
                        answerArgs[answerIndex].media_src = "themeimages/" + new_filename;
                        answerArgs[answerIndex].Media_directory = config.server_ip + "themeimages/" + new_filename;


                        if (fs.existsSync(imagePath)) {
                            fs.rename(imagePath, targetPath, function(err) {
                                //console.log(err);
                            });
                        }
                    } else { // Video

                        var video = req.body.media_src; // heeer
                        var videoType = null;
                        var videoId = null;
                        var video_src_value = null;
                        if (video.toLowerCase().includes("youtube") == true) {
                            videoType = 0; // => youtube
                            var idWithLastSplit = video.lastIndexOf('?');
                            var videos = video.substr(idWithLastSplit + 1);
                            var lastId = videos.substr(0, videos.indexOf('&'));

                            if (lastId != '' || lastId)
                                videoId = lastId;
                            else
                                videoId = videos;


                            var afterEqualChar = videoId.lastIndexOf('=');
                            videoId = videoId.substring(afterEqualChar + 1);
                            video_src_value = "http://youtube.com/embed/" + videoId;

                        } else if (video.includes("vimeo") == true) {
                            videoType = 1; // => vimeo
                            var n = video.lastIndexOf('/');
                            videoId = video.substring(n + 1);
                            video_src_value = "https://player.vimeo.com/video/" + videoId;;

                        } else if (video.includes(".mp4") == true) {
                            videoType = 2;
                            videoId = null;

                            var media_mp4 = req.body.media_src.substring(0, req.body.media_src.lastIndexOf('.'));

                            // question_tag ["media_question"]["media_src"] = media_mp4 ;
                            if(answerArgs[answerIndex]["mp4_option"]  == null || answerArgs[answerIndex]["mp4_option"]  == undefined)
                            answerArgs[answerIndex]["mp4_option"] = new Object();

                            answerArgs[answerIndex]["mp4_option"]["mp4_url"] = media_mp4 + '.mp4'
                            answerArgs[answerIndex]["mp4_option"]["ogg_url"] = media_mp4 + '.ogg'
                        }


                        answerArgs[answerIndex]["Media_directory"] = req.body.media_src;
                        answerArgs[answerIndex]["media_type"] = 1;
                        answerArgs[answerIndex]["media_name"] = req.body.media_src;
                        answerArgs[answerIndex]["media_src"] = req.body.media_src;

                        // store new values
                        answerArgs[answerIndex].video_id = videoId;

                        answerArgs[answerIndex].embed_path = video_src_value;
                        answerArgs[answerIndex].video_type = videoType;


                    }
                }
      }
      // ==============> 3
      // ==============> 4
      // ==============> 5

      questionnaire_results = answerArgs[answerIndex];
      qtnairsDocument.markModified("questions");
        qtnairsDocument.save().then(() => {
            res.send(questionnaire_results);
        }).catch((err) => {
            return new Promise((resolve, reject) => {
                res.status(404).send({
                    "error": notes.Errors.General_Error.error,
                    "details": err.message
                });
            });
      });
   }); // end document here !
});
// Answers
qtnrRouters.patch("/:app_id/question/:question_id/answer/:process" , question_answer_images.single("media_src") ,  auth_verify_api_keys , (req , res) => {
  ///localhost:3000/api/5a1efcc61826bd398ecd4dee/question/5a1f0c5c0b6a6843735020b2/answer/create
  var processType= req.params.process ;
  var question_id = req.params.question_id;
  var user = req.verified_user;
  var userType = req.is_creator;
  var app_id = req.params.app_id ;

  // this user should be a creator user !
   if (userType != 1){
        return new Promise((resolve, reject) => {
           res.status(401).send(notes.Warnings.Permission_Warning);
       });
   }

   qtnr.findOne({ _id:app_id } , ( err , docs )=>{
     if(!docs || err ) {
       return new Promise((resolve, reject)=>{
          res.status(404).send(notes.Errors.Error_Doesnt_exists("Application"));
       });
     }
   }).then( ( qtnairsDocument) => {

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

       if(processType == 'create') {// Answer type creation
         switch (question_type) {
          case 0:
               question_answers["_id"] = mongoose.Types.ObjectId();
                 question_answers["indexer"] = null ;

                if(req.body.choices_value != null )
                     question_answers["value"] = req.body.choices_value ;
                else
                     question_answers["value"] = "Write answer here !" ;

                    // if(req.body.media_optional != null ){
                    // if(req.body.media_optional.media_type == null) {
                    //   exists_array[exists_array.length] = "media_type";
                    // }
                    //
                    // if(req.body.media_optional.media_name == null) {
                    //   exists_array[exists_array.length] = "media_name";
                    // }
                    //
                    // if(req.body.media_optional.media_src == null) {
                    //   exists_array[exists_array.length] = "media_src";
                    // }
                    //
                    // if(exists_array.length != 0 ){
                    //     return new Promise((resolve , reject) => {
                    //       res.send(notes.Messages.Required_Message(exists_array));
                    //     });
                    // }
                    //
                    // if( ! _.isInteger(req.body.media_optional.media_type)  || req.body.media_optional.media_type  > 1 ){
                    //    return new Promise((resolve , reject)=>{
                    //      res.send({"Message" : "This Value should be integer (0 or 1) 0 => for image type , 1 => for video type"});
                    //    });
                    // }

                    /*-------------------------------------------- Answer Media */


                     if(req.file_status != "undefine" && req.file_status == false){
                         return new Promise((resolve , reject)=>{
                           res.send(notes.Errors.Error_file_extension)
                         });
                     }
                     if(req.body.media_src != null || req.file != null){
                       question_answers["media_optional"] = new Object();

                       if(req.file != null ){
                         var imagePath =  req.file.path ;
                         var fileExtension = path.extname(imagePath);
                         var new_filename = "answer_text_"+question_answers["_id"]+fileExtension;
                         var targetPath ="ui-public/themeimages/"+new_filename ;
                         question_answers["media_optional"]["media_type"] = 0;
                         question_answers["media_optional"]["media_name"] = new_filename ;
                         question_answers["media_optional"]["media_src"] = "themeimages/"+new_filename;
                         question_answers["media_optional"]["Media_directory"] = config.server_ip + "themeimages/"+new_filename;
                         if( fs.existsSync(imagePath)){
                           fs.rename( imagePath , targetPath , function (err) {
                               //console.log(err);
                           });
                         }
                      }else {
                          question_answers["media_optional"]["Media_directory"] = req.body.media_src ;
                          question_answers["media_optional"]["media_type"] = 1;
                          question_answers["media_optional"]["media_name"] = req.body.media_src ;
                          question_answers["media_optional"]["media_src"] = req.body.media_src ;





                          /////////////////////>>>>
                          // detect video type
                          var video = req.body.media_src ;
                          var videoType = null ;
                          var videoId = null ;
                          var video_src_value = null  ;
                          if( video.toLowerCase().includes("youtube")    == true   ) {
                            videoType = 0 ; // => youtube
                            var idWithLastSplit = video.lastIndexOf('?');
                            var videos = video.substr(idWithLastSplit + 1);
                            var lastId = videos.substr(0, videos.indexOf('&'));

                            if(lastId != '' || lastId )
                              videoId = lastId ;
                            else
                              videoId = videos ;


                            var afterEqualChar = videoId.lastIndexOf('=');
                            videoId = videoId.substring(afterEqualChar + 1);

                            video_src_value = "http://youtube.com/embed/"+ videoId ;
                          }
                          else if( video.includes("vimeo") == true   ) {
                            videoType = 1 ; // => vimeo
                            var n = video.lastIndexOf('/');
                            videoId = video.substring(n + 1);
                            video_src_value = "https://player.vimeo.com/video/"+ videoId ;
                          }
                          else if( video.includes(".mp4")  == true   ) {
                            videoType = 2 ;
                            videoId = null;

                            var media_mp4 = req.body.media_src.substring(0, req.body.media_src.lastIndexOf('.'));
                            question_answers ["media_optional"]["media_src"] = media_mp4 ;

                          }
                          question_answers ["media_optional"]["video_type"] = videoType;
                          question_answers ["media_optional"]["video_id"] = videoId;
                          question_answers ["media_optional"]["video_source"] = video_src_value ;







                      }
                     }
                    /*--------------------------------------------------------- */
              //  }

                if(qtnairsDocument.app_type == 1 ){
                      if(req.body.is_correct != null )
                          question_answers["is_correct"] = req.body.is_correct ;
                }
          break ;
          // --------------------------------------------------------------
          case 1:

              //  var exists_array = new Array();
              //  if(req.body.media_type == null) {
              //    exists_array[exists_array.length] = "media_type";
              //  }
               //
              //  if(req.body.media_name == null) {
              //    exists_array[exists_array.length] = "media_name";
              //  }
               //
              //  if(req.body.media_src == null) {
              //    exists_array[exists_array.length] = "media_src";
              //  }
               //
              //  if(exists_array.length != 0 ){
              //      return new Promise((resolve , reject) => {
              //        res.send(notes.Messages.Required_Message(exists_array));
              //      });
              //  }

              //  if( ! _.isInteger(req.body.media_type)  || req.body.media_type  > 1 ){
              //     return new Promise((resolve , reject)=>{
              //       res.send({"Message" : "This Value should be an integer value (0 or 1) 0 => for image type , 1 => for video type"});
              //     });
              //  }
              question_answers["_id"] = mongoose.Types.ObjectId();
              /*---------------------------------------------- medi type upload */

              if(req.file_status != "undefine" && req.file_status == false){
                  return new Promise((resolve , reject)=>{
                     res.send(notes.Errors.Error_file_extension)
                  });
               }
               if((req.file == '' || req.file == null) && req.body.media_src == null ){
                    return new Promise((resolve , reject) => {
                      res.send(notes.Messages.Required_Message("media_src"));
                    });
                }
               if(req.body.media_src != null || req.file != null){

                 if(req.file != null ){
                     var imagePath =  req.file.path ;
                     var fileExtension = path.extname(imagePath);
                     var new_filename = "answer_media_"+question_answers["_id"]+fileExtension;
                     var targetPath = "ui-public/themeimages/"+new_filename ;
                     // rename this file
                     question_answers["media_src"] = "themeimages/"+new_filename ;
                     question_answers["media_type"] = 0 ;
                     question_answers["media_name"] = new_filename   ;
                     question_answers["Media_directory"] = config.server_ip + "themeimages/"+new_filename  ;


                     if( fs.existsSync(imagePath)){
                        fs.rename( imagePath , targetPath , function (err) {
                               //console.log(err);
                        });
                     }
                 }else {
                   question_answers["media_src"] = req.body.media_src ;
                   question_answers["media_type"] = 1 ;
                   question_answers["media_name"] = req.body.media_src   ;
                   question_answers["Media_directory"] =  req.body.media_src ;

                   // detect video type
                   var video = req.body.media_src
                   var videoType = null ;
                   var videoId = null ;
                   var video_src_value = null ;
                   if( video.toLowerCase().includes("youtube")    == true   ) {
                     videoType = 0 ; // => youtube
                     var idWithLastSplit = video.lastIndexOf('?');
                     var videos = video.substr(idWithLastSplit + 1);
                     var lastId = videos.substr(0, videos.indexOf('&'));

                     if(lastId != '' || lastId )
                       videoId = lastId ;
                     else
                       videoId = videos ;


                     var afterEqualChar = videoId.lastIndexOf('=');
                     videoId = videoId.substring(afterEqualChar + 1);
                     video_src_value = "http://youtube.com/embed/"+ videoId ;
                   }
                   else if( video.includes("vimeo") == true   ) {
                     videoType = 1 ; // => vimeo
                     var n = video.lastIndexOf('/');
                     videoId = video.substring(n + 1);
                     video_src_value = "https://player.vimeo.com/video/"+ videoId;
                   }
                   else if( video.includes(".mp4")  == true   ) {
                     videoType = 2 ;
                     videoId = null;

                     var media_mp4 = req.body.media_src.substring(0, req.body.media_src.lastIndexOf('.'));
                     question_answers["media_src"] = media_mp4 ;

                   }
                   question_answers["video_type"] = videoType;
                   question_answers["video_id"] = videoId;
                   question_answers["video_source"] = video_src_value;

                 }
               }
              /*---------------------------------------------- medi type upload */
              if(qtnairsDocument.app_type == 1 ){
                  if(req.body.is_correct != null )
                  question_answers["is_correct"] = req.body.is_correct ;
              }
          break;
          // --------------------------------------------------------------
          case 2:

          // ===> first time

          var required_fields = [] ;
            if(req.body.boolean_value == null)
                required_fields[boolean_value.length] = "boolean_value"
            if(req.body.boolean_type == null)
                required_fields[boolean_type.length] = "boolean_type"

              if(required_fields.length != 0){
                res.send(notes.Messages.Required_Message(required_fields));
              }


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
                                    res.send(notes.Messages.Required_Message(["boolean_value"]));
                                });
                              }
                    //}
                    // //console.log(question_answers);

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
                          if(req.body.show_labels != null )
                              question_answers["show_labels"] = req.body.show_labels ;
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
           ////console.log(qtnairsDocument.questions[questionIndex].answers_format);
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



              // ====> Upload Our new directory
              // it should be an image or video

              // => choices text
              if(question_type == 0) {
                //-------------------------------------> Updated part
                if(req.body.choices_value != null || !answerArgs[answerIndex].value)
                    answerArgs[answerIndex].value = req.body.choices_value;

                if(req.file_status != "undefine" && req.file_status == false){
                  return new Promise((resolve , reject)=>{
                   res.send(notes.Errors.Error_file_extension)
                  });
                }
                if(req.body.media_src != null || req.file != null){

                      if(!answerArgs[answerIndex].media_optional || answerArgs[answerIndex].media_optional == undefined )
                        answerArgs[answerIndex].media_optional = new Object();

                        if(req.file != null ){ // Image
                          var imagePath =  req.file.path ;
                          var fileExtension = path.extname(req.file.filename);
                          var new_filename = "answer_text_"+answerArgs[answerIndex]._id+fileExtension;

                          var targetPath ="ui-public/themeimages/"+new_filename ;
                          answerArgs[answerIndex].media_optional.media_type = 0;
                          answerArgs[answerIndex].media_optional.media_name  = new_filename ;
                          answerArgs[answerIndex].media_optional.media_src = "themeimages/"+new_filename;
                          answerArgs[answerIndex].media_optional.Media_directory  = config.server_ip + "themeimages/"+new_filename;

                          if( fs.existsSync(imagePath)){
                            fs.rename( imagePath , targetPath , function (err) {
                                //console.log(err);
                            });
                          }
                       }else { // Video

                         if( answerArgs[answerIndex].media_optional == null ||  answerArgs[answerIndex].media_optional == undefined )
                          answerArgs[answerIndex].media_optional = new Object();

                           answerArgs[answerIndex].media_optional["Media_directory"] = req.body.media_src ;
                           answerArgs[answerIndex].media_optional["media_type"] = 1;
                           answerArgs[answerIndex].media_optional["media_name"] = req.body.media_src ;
                           answerArgs[answerIndex].media_optional["media_src"] = req.body.media_src ;

                          var video =  req.body.media_src ; // heeer
                          var videoType = null ;
                          var videoId = null ;
                          var video_src_value = null;
                          if( video.toLowerCase().includes("youtube")    == true   ) {
                            videoType = 0 ; // => youtube
                            var idWithLastSplit = video.lastIndexOf('?');
                            var videos = video.substr(idWithLastSplit + 1);
                            var lastId = videos.substr(0, videos.indexOf('&'));

                            if(lastId != '' || lastId )
                              videoId = lastId ;
                            else
                              videoId = videos ;


                            var afterEqualChar = videoId.lastIndexOf('=');
                            videoId = videoId.substring(afterEqualChar + 1);
                            video_src_value = "http://youtube.com/embed/"+ videoId ;
                          } else if( video.includes("vimeo") == true   ) {
                            videoType = 1 ; // => vimeo
                            var n = video.lastIndexOf('/');
                            videoId = video.substring(n + 1);
                            video_src_value = "https://player.vimeo.com/video/"+ videoId;;
                          }else if( video.includes(".mp4")  == true   ) {
                            videoType = 2 ;
                            videoId = null;
                            video_src_value = null ;
                            var media_mp4 = req.body.media_src.substring(0, req.body.media_src.lastIndexOf('.'));

                              // question_tag ["media_question"]["media_src"] = media_mp4 ;
                            if(answerArgs[answerIndex].media_optional == undefined || answerArgs[answerIndex].media_optional == null )
                            answerArgs[answerIndex].media_optional = new Object();

                            answerArgs[answerIndex].media_optional["mp4_option"] = new Object() ;
                            answerArgs[answerIndex].media_optional["mp4_option"]["mp4_url"] = media_mp4 + '.mp4'
                            answerArgs[answerIndex].media_optional["mp4_option"]["ogg_url"] = media_mp4 + '.ogg'
                          }

                          if(answerArgs[answerIndex].media_optional == undefined || answerArgs[answerIndex].media_optional == null )
                          answerArgs[answerIndex].media_optional = new Object();


                           // store new values
                           answerArgs[answerIndex].media_optional["video_id"]   =  videoId ;
                           answerArgs[answerIndex].media_optional["embed_path"] =  video_src_value;
                           answerArgs[answerIndex].media_optional["video_type"] =  videoType ;



                       }


                }
                //-------------------------------------
              }
              // //console.log("+++>>>+++>>> {-----} <<<<+++<<<++++");
              // //console.log(answerArgs);
              // //console.log("+++>>>+++>>> {-----} <<<<+++<<<++++");

              // => media_choices
              if(question_type == 1) {
                //-------------------------------------> Updated part
                if(req.body.choices_value != null || !answerArgs[answerIndex].value)
                    answerArgs[answerIndex].value = req.body.choices_value;

                if(req.file_status != "undefine" && req.file_status == false){
                  return new Promise((resolve , reject)=>{
                   res.send(notes.Errors.Error_file_extension)
                  });
                }
                if(req.body.media_src != null || req.file != null){
                      if(req.file != null ){ // Image
                          var imagePath =  req.file.path ;
                          var fileExtension = path.extname(req.file.filename);
                          var new_filename = "answer_media_"+answerArgs[answerIndex]._id+fileExtension;

                          var targetPath ="ui-public/themeimages/"+new_filename ;
                          answerArgs[answerIndex].media_type = 0;
                          answerArgs[answerIndex].media_name  = new_filename ;
                          answerArgs[answerIndex].media_src = "themeimages/"+new_filename;
                          answerArgs[answerIndex].Media_directory  = config.server_ip + "themeimages/"+new_filename;


                          if( fs.existsSync(imagePath)){
                            fs.rename( imagePath , targetPath , function (err) {
                                //console.log(err);
                            });
                          }
                       }else { // Video

                          var video =  req.body.media_src ; // heeer
                          var videoType = null ;
                          var videoId = null ;
                          var video_src_value = null;

                          if( video.toLowerCase().includes("youtube")    == true   ) {
                            videoType = 0 ; // => youtube
                            var idWithLastSplit = video.lastIndexOf('?');
                            var videos = video.substr(idWithLastSplit + 1);
                            var lastId = videos.substr(0, videos.indexOf('&'));

                            if(lastId != '' || lastId )
                              videoId = lastId ;
                            else
                              videoId = videos ;


                            var afterEqualChar = videoId.lastIndexOf('=');
                            videoId = videoId.substring(afterEqualChar + 1);
                            video_src_value = "http://youtube.com/embed/"+ videoId ;
                          }
                          else if( video.includes("vimeo") == true   ) {

                            videoType = 1 ; // => vimeo
                            var n = video.lastIndexOf('/');
                            videoId = video.substring(n + 1);
                            video_src_value = "https://player.vimeo.com/video/"+ videoId;;
                          }
                          else if( video.includes(".mp4")  == true   ) {
                            videoType = 2 ;
                            videoId = null;
                            // //console.log("MP4 ++++");
                            var media_mp4 = req.body.media_src.substring(0, req.body.media_src.lastIndexOf('.'));

                            // question_tag ["media_question"]["media_src"] = media_mp4 ;
                            answerArgs[answerIndex].mp4_option = new Object() ;
                            answerArgs[answerIndex].mp4_option["mp4_url"] = media_mp4 + '.mp4';
                            answerArgs[answerIndex].mp4_option["ogg_url"] = media_mp4 + '.ogg';


                          }

                          answerArgs[answerIndex]["Media_directory"] = req.body.media_src ;
                           answerArgs[answerIndex]["media_type"] = 1;
                           answerArgs[answerIndex]["media_name"] = req.body.media_src ;
                           answerArgs[answerIndex]["media_src"] = req.body.media_src ;
                           answerArgs[answerIndex]["video_id"] = videoId ;
                           answerArgs[answerIndex]["video_type"] = videoType ;
                           answerArgs[answerIndex]["embed_path"] = video_src_value ;


                          //  //console.log("----------------------");
                          //  //console.log(answerArgs[answerIndex]);
                          //  //console.log("----------------------");
                       }
                }
                //-------------------------------------
              }











              // => boolean_choices
              if(question_type == 2) {
                if(req.body.boolean_type)
                  answerArgs[answerIndex].boolean_type = req.body.boolean_type;
              }
              // => rating_scales
              if(question_type == 3) {
                if(req.body.show_labels)
                  answerArgs[answerIndex].show_labels = req.body.show_labels ;
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
              // Delete image related this media part
              var answer_object = answerArgs[answerIndex];
              var question_item = qtnairsDocument.questions[questionIndex] ;
              if(question_item.question_type == 1 ){
                // Delete image
                var image_directory = __dirname + "/../../ui-public/themeimages/" + answer_object.media_src
                if( fs.existsSync(image_directory ) ) {
                  fs.unlink(image_directory , (err)=>{
                    if(err) throw err ;
                    //console.log("Deleted Image !");
                  });
                }
              }
              if( question_item.question_type == 0 ){
                // Delete image
                if(answer_object.media_optional != null ){
                    var image_directory = __dirname + "/../../ui-public/themeimages/" + answer_object.media_optional.media_src;
                    if( fs.existsSync(image_directory ) ) {
                      fs.unlink(image_directory , (err)=>{
                        if(err) throw err ;
                        //console.log("Deleted Image !");
                      });
                    }
                }
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
qtnrRouters.post("/:app_id/application/:objects" , auth_verify_api_keys , (req ,res )=>{
      var objects= req.params.objects ;
      var user = req.verified_user;
      var userType = req.is_creator;

      var app_id = req.params.app_id ;

      if (userType != 1) {
           return new Promise((resolve, reject) => {
              res.status(401).send(notes.Warnings.Permission_Warning);
          });
      }


      qtnr.findOne({ _id:app_id }).then( ( qtnairsDocument) => {


      /*
      if( qtnairsDocument.application_ids == undefined )
          qtnairsDocument['application_ids'] = new Object();

      var id_counts = 100;
      for ( var i = 0; i <= id_counts; i++) {
        qtnairsDocument['application_ids']['id_' + i ] = mongoose.Types.ObjectId();
      }
      */


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
            // //console.log(isexists);
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
// ==> populate for attendee draft
qtnrRouters.get("/:app_id/application/:objects" , auth_api_keys_only , (req ,res )=>{
      var objects= req.params.objects ;
      var app_id = req.params.app_id ;

    qtnr.findOne({ _id:app_id }).populate('app_registry').exec( (error , qtnairsDocument) => {

         if (!qtnairsDocument || error ){
           return new Promise((resolve, reject)=>{
              res.status(404).send(notes.Errors.Error_Doesnt_exists("Application"));
              return false ;
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
                  return false ;
                });
              }
            apps =  _.find(qtnairsDocument.questions , {"id":req.body.target_id});
          } else
            apps = qtnairsDocument.questions ;
        }
        if( objects == 'stylesheets'){
          if(req.body.target_id != null ){
            var isexists = _.findIndex(qtnairsDocument.theme_style , { "file_name":  "styletheme_"+req.body.target_id+".css" });
            // //console.log(isexists);
            if(isexists == -1 )
              {
                return new Promise((resolve , reject)=>{
                  res.send(notes.Errors.Error_Doesnt_exists("Stylesheet"));
                  return false ;
                });
              }
            apps =  _.find(qtnairsDocument.theme_style , {"file_name":  "styletheme_"+req.body.target_id+".css"});
          } else
             apps = qtnairsDocument.theme_style ;
        }

        // //console.log({
        //   'cacac' : apps
        // });
       res.send(apps);
       return false ;
     });
        /*
        .catch((er)=>{
          return new Promise((resolve, reject)=>{
            res.status(404).send(notes.Errors.General_Error);
          });
        });
        */
});
qtnrRouters.get("/:uid/applications" , authenticate_keys_with_curr_status ,  (req,res) => {

  var userId= req.params.uid ;
  // var user = req.verified_user;
  // var userType = req.is_creator;

  qtnr.find({  "creator_id": userId }).then((doc)=>{
    if(!doc ){
      return new Promise((resolve, reject) => {
         res.status(404).send("There are no any applications");
     });
    }
    res.send(doc);
  });

});
qtnrRouters.get("/applications/list" , auth_api_keys_only , (req , res )=>{
  qtnr.find().populate("creator_id").exec((error , doc)=>{
    if(!doc || error){
      return new Promise((resolve, reject) => {
         res.status(404).send("There are no any applications");
        });
    }
    //console.log(doc);
    res.send(doc);
  });

});

qtnrRouters.get("/:creator_id/applications/list"  , (req , res )=>{
  var creator_id = req.params.creator_id ;

  qtnr.find({ creator_id : creator_id }).populate("creator_id").exec((error , doc)=>{
    if(!doc || error){
      return new Promise((resolve, reject) => {
         res.status(404).send("There are no any applications");
        });
    }

    var applications =  {
      quizzes : new Array () ,
      surveys : new Array ()
    }

    var zoom_in_app_types = (APP) => {
      if(APP.app_type == 0 )
        applications.surveys.push(APP);
      else
        applications.quizzes.push(APP);
    }
    doc.map(zoom_in_app_types);

    res.send(applications);
  });

});


// ===========================================> New Versions
// /-*--------------------------------------------------------------------
qtnrRouters.post("/:app_id/stylesheet/add/files" , (req, res) => {

  var stylesheet = req.body.styles;
  qtnr.findOne({ _id :req.params.app_id }).then(( provider )=>{





    var properties ='' ;
    for ( var i = 0; i < stylesheet.length; i++ ){
      var classes = stylesheet[i] ;
      properties += classes.class_name + " { ";
      for (var ix = 0; ix < classes.properties.length; ix++) {
        var property = classes.properties[ix] ;
        properties += property.property_name + ":" + property.property_value + "; " ;
        // \n
      }
      properties += "}\n";
    }

    provider.theme_style = stylesheet ;
    if(provider.stylesheet_properties == undefined )
    provider.stylesheet_properties = '';

    provider.stylesheet_properties = properties



    var file_dir = "ui-public/themes/"+"stylesheet_of_app_" + provider._id + ".css" ;

    if (fs.existsSync(file_dir)) {
      fs.unlink(file_dir, (err) => {
        if (err) throw err;
      });
    }


    fs.appendFile(file_dir  , properties , (err) => {
        if (err) throw err;
          //console.log('The "data to append" was appended to file!');
    });

    // var style_codes = _.find(stylesheets.theme_style , {'file_name':stylesheet['file_name']} );
    // res.send({ "File_directory" : config.server_ip+"themes/"+style_codes.file_name , "Stylesheet_code":style_codes})




    provider.markModified('theme_style');
    provider.save().then((success)=>{
      res.send({ success : success });
    }).catch((error) => {
      res.send({ error : error })
    });

   }).catch((error)=>{
    return new Promise((resolve , reject )=>{
      res.send(error);
      return false ;
    })
  });

  // res.send ({
  //   style__sheet  : stylesheet
  // });

});
qtnrRouters.post("/create", auth_verify_api_keys_tokens ,  (req, res) => {
  var user = req.verified_user;
  var userType = req.is_creator;
    if (userType != 1) {
        return new Promise((resolve, reject) => {
          res.status(401).send(notes.notifications.permission_denied());
        });
    }

    var required = new Array()
    req.body.app_settings = new Object()
    req.body.app_settings = {
               titles :
                 {
                   title_start_with : "Write Starting Text"  ,
                   title_end_with: "Write Ending Text" ,
                   title_success_with : " Success quiz Text" ,
                   title_failed_with : "Quiz Failed Text"
                 } ,
               label_btns : {
                   lbl_start_with:"Start" ,
                   lbl_continue_with : "Continue" ,
                   lbl_retake_with : "Retake" ,
                   lbl_review_with : "Review" ,
                   lbl_back_with : "Back",
                   lbl_finish_with : "Finish",
                   lbl_submit_quiz_with : "Submit Quiz",
                   lbl_score_with :"Score",
                   lbl_grade_with :"Grade" ,
                   didnot_yet:"You didn't solve any question , click here to attend" ,
                   unsolved_question:"question(s) isn't attended click here to attend" ,
                   when_you_solve : "When you solve this question the next one will come directly after few moments",
                   there_are_many_options : "There're many correct choices , You've to select them  to pass this question"
                } ,
               enable_screens : true ,
               grade_settings : {
                 is_graded : false ,
                 value : 90
               } ,
               indexes : {
                 questions : 0 ,
                 answers : 1
               } ,
               time_settings : {
                 is_with_time:false ,
                 value : 1799 ,
                 timer_type : false ,
                 timer_layout : 0 ,
                 hours : 0 ,
                 minutes : 29 ,
                 seconds : 59
               },
               progression_bar : {
                 is_available:false ,
                 progression_bar_layout:0
               } ,
               expiration : {
                 is_set : false  ,
                 through_time : 3 , // => it will be per day
                 title : "This quiz will expire after"
               } ,
              //  theme_style : [] ,
               randomize_settings : false ,
               step_type : false ,
               auto_slide : false ,
               allow_touch_move : false ,
               show_results_per_qs : false ,
               retake_setting : false ,
               navigation_btns : true ,
               review_setting : false ,
               createdAt : new Date() ,
               updatedAt : new Date () ,
               indexes : {
                 questions : '0' ,
                 answers : '1'
               }
           }



    if(req.body.app_type == null  )
       required[required.length]='app_type';
    if(req.body.questionnaire_title == null || !req.body.questionnaire_title )
      required[required.length]='questionnaire_title';
    if(req.body.description == null || !req.body.description )
      required[required.length]='description';
    if(required.length != 0 )
    {
      return new Promise((resolve , reject)=>{
        // //console.log(required);
        res.status(201).send(notes.notifications.catch_fields(notes.Messages.Required_Message(required)));
      });
    }
    var appt  = parseInt(req.body.app_type)
    if( appt >= 2  || appt < 0 ||  !_.isInteger(appt)){
       return new Promise((resolve , reject)=>{
        // //console.log(required);
        res.status(404).send(notes.notifications.catch_doesnt_existing_data("Application Type"));
      });
    }
    // Builde And Init Default !
    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();
    req.body.settings = req.body.app_settings ;
    req.body.questions = [];
    req.body.creator_id = user.id;
    req.body.theme_style = [];
    req.body.att__draft = undefined ;
    var body = _.pick(req.body, ['creator_id', 'app_type', 'questionnaire_title', 'description', 'createdAt', 'updatedAt', 'settings', 'questions','theme_style','att__draft']);

    var qtnrs = new qtnr(body);
    qtnrs.save().then((qtner) => {

        if (!qtner) {
            return new Promise((resolve, reject) => {
                var error = "Something went wrong , please try again";
                res.status(204).send(notes.notifications.catch_errors(error));
            });
        }
        // => Save id to set attendee_draft
        qtnrs.app_registry = qtner._id ;
        qtnrs.app_report =   qtner._id ;


        // themes/stylesheet_of_app_
        var file_stylesheet = "ui-public/themes/stylesheet_of_app_"+ qtner._id + '.css' ;
        if (! fs.existsSync(file_stylesheet)) {
          fs.appendFile( file_stylesheet , '' , ( err ) => {
            if(err) console.log(err);
          });
        }

        qtnrs.save();
        res.send(notes.notifications.success_calling(qtner));
    }).catch((error) => {
        return new Promise((resolve, reject) => {
            res.send(notes.notifications.catch_errors(error));
        });
    });
});

// qtnrRouters.delete("/:app_id/delete", auth_verify_api_keys_tokens , (req, res)=>{
//   var app_id = req.params.app_id;
//   qtnr.findOne({_id : app_id}).then(( appDoc)=>{
//
//     if(!appDoc) {
//       return new Promise((resolve , reject )=>{
//         res.status(404).send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Application")));
//       });
//     }
//     qtnr.remove({_id:app_id}).then(()=>{
//       res.send(notes.notifications.success_calling("application has been deleted successfully !"));
//     }).catch((error)=>{
//       res.status(404).send(notes.notifications.catch_errors(error));
//     });
//
//   }).catch((error)=>{
//     res.status(404).send(notes.notifications.catch_errors(error));
//   });
// });
// qtnrRouters.post("/init", auth_verify_api_keys_tokens  , (req, res) => {
//
//     var user = req.verified_user;
//     var userType = req.is_creator;
//
//     if (userType != 1) {
//         return new Promise((resolve, reject) => {
//             res.send(notes.notifications.permission_denied());
//         });
//     }
//
//     if(req.body.app_type == null   )
//     {
//       return new Promise((resolve , reject)=>{
//          res.send(notes.notifications.catch_fields(notes.Messages.Required_Message('app_type')));
//       });
//     }
//     if(req.body.app_type >= 2  || req.body.app_type < 0  ||  !_.isInteger(req.body.app_type )){
//        return new Promise( ( resolve , reject ) => {
//         res.send(notes.notifications.catch_fields(notes.Messages.Required_Message('Application Type')));
//       });
//     }
//     // => Fill Default data for title and description
//     application.questionnaire.creator_id = user.id
//     application.questionnaire.app_type = req.body.app_type;
//     application.questionnaire.questionnaire_title = (req.body.app_type === 1) ? 'Quiz 1' : 'Survey 1';
//     application.questionnaire.description = "Write description for this " + (req.body.app_type == 1) ? 'Quiz 1' : 'Survey 1';
//     application.questionnaire.createdAt = new Date();
//     application.questionnaire.updatedAt = new Date();
//     // Build bodyParser with data
//     var body = _.pick(application.questionnaire, ['creator_id', 'app_type', 'questionnaire_title', 'description', 'createdAt', 'updatedAt', 'settings', 'questions']);
//     var app = new qtnr(body);
//     app.save().then((respQtnr) => {
//         if (!respQtnr) {
//           return new Promise((resolve , reject)=>{
//              res.send(notes.notifications.catch_errors(notes.Errors.General_Error));
//           });
//         }
//
//          res.send(notes.notifications.success_calling(respQtnr));
//     }).catch((error) => {
//         return new Promise((resolve, reject) => {
//             res.send(notes.notifications.permission_denied());
//         });
//     });
// });
// // Create settings for quiz or survey ( remember this part => surv/quiz for used with /init route)
// qtnrRouters.patch("/:app_id/app/setup_settings", auth_verify_api_keys_tokens , (req,res)=>{
//   var app_id = req.params.app_id;
//   qtnr.findById(app_id , (err,d)=>{
//     if(err || !d){
//       return new Promise((resolve, reject) => {
//           res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Application")));
//      });
//     }
//
//     if(req.body.settings == null ){
//       return new Promise((resolve, reject) => {
//         res.send(notes.notifications.catch_errors(notes.Messages.Required_Message(["settings , questionnaire_title"])));
//         });
//     }
//
//     d.settings = req.body.settings;
//     d.questionnaire_title = req.body.questionnaire_title;
//     d.markModified("settings");
//     d.save().then((success)=>{
//       if(success)
//        {
//          res.send(notes.notifications.success_calling(success));
//        }
//     }).catch((error)=>{
//         res.status(404).send(notes.notifications.catch_errors(error));
//     });
//   });
// });
// // Create settings for quiz or survey ( remember this part => surv/quiz for used with /init route)
// qtnrRouters.patch("/:app_id/app/edit", auth_verify_generated_tokens ,  (req, res) => {
//     var user = req.verified_user;
//
//     var userType = req.is_creator;
//
//     var app_id = req.params.app_id;
//     var update_type = req.body.updateType;
//     // this user should be a creator user !
//
//     if (userType != 1) {
//           return new Promise((resolve, reject) => {
//             res.send(notes.notifications.permission_denied());
//         });
//     }
//
//     qtnr.findById(app_id , (err,d)=>{
//       if(err || !d){
//         return new Promise((resolve, reject) => {
//            res.status(401).send(notes.notifications.permission_denied(notes.Errors.Error_Doesnt_exists("Application")));
//        });
//       }
//     }).then((qtnr_results) => {
//         if (!qtnr_results) {
//              return new Promise((resolve, reject) => {
//                 res.status(401).send(notes.notifications.permission_denied(notes.Errors.Error_Doesnt_exists("Application")));
//             });
//         }
//
//         // Detection about the current user if he not the creator of this app
//         if (qtnr_results.creator_id.toString() != user.id) {
//              return new Promise((resolve, reject) => {
//                 res.send(notes.notifications.permission_denied());
//             });
//         }
//
//
//
//         req.body.updatedAt = new Date();
//         var $settings = new Object();
//         if(req.body.questionnaire_title != null )
//           $settings["questionnaire_title"] = req.body.questionnaire_title;
//         if(req.body.description != null )
//           $settings["description"] = req.body.description;
//           $settings["updatedAt"] = new Date();
//
//         // Edit and Create Settings
//         if (req.body.titles) {
//
//             if (req.body.titles.title_start_with)
//                 $settings["settings.titles.title_start_with"] = req.body.titles.title_start_with;
//
//             if (req.body.titles.title_end_with)
//                 $settings["settings.titles.title_end_with"] = req.body.titles.title_end_with;
//
//             if (req.body.titles.title_success_with)
//                 $settings["settings.titles.title_success_with"] = req.body.titles.title_success_with;
//
//             if (req.body.titles.title_failed_with)
//                 $settings["settings.titles.title_failed_with"] = req.body.titles.title_failed_with;
//          }
//
//
//         if (req.body.step_type != null )
//             $settings["settings.step_type"] = req.body.step_type;
//
//         if(req.body.show_results_per_qs  != null)
//         $settings["settings.show_results_per_qs"] = req.body.show_results_per_qs;
//
//         if (req.body.grade_settings) {
//             if (req.body.grade_settings.is_graded != null )
//                 $settings["settings.grade_settings.is_graded"] = req.body.grade_settings.is_graded;
//
//             if (req.body.grade_settings.value)
//                 $settings["settings.grade_settings.value"] = req.body.grade_settings.value;
//         }
//
//
//         if (req.body.review_setting != null)
//             $settings["settings.review_setting"] = req.body.review_setting;
//
//
//         if (req.body.retake_setting != null  )
//             $settings["settings.retake_setting"] = req.body.retake_setting;
//
//         if (req.body.navigation_btns != null )
//             $settings["settings.navigation_btns"] = req.body.navigation_btns;
//
//         if (req.body.label_btns) {
//             if (req.body.label_btns.lbl_start_with)
//                 $settings["settings.label_btns.start_with"] = req.body.label_btns.lbl_start_with;
//             if (req.body.label_btns.lbl_continue_with)
//                 $settings["settings.label_btns.continue_with"] = req.body.label_btns.lbl_continue_with;
//             if (req.body.label_btns.lbl_retake_with)
//                 $settings["settings.label_btns.retake_with"] = req.body.label_btns.lbl_retake_with;
//             if (req.body.label_btns.lbl_review_with)
//                 $settings["settings.label_btns.review_with"] = req.body.label_btns.lbl_review_with;
//         }
//         if (req.body.randomize_settings != null) {
//             $settings["settings.randomize_settings"] = req.body.randomize_settings;
//         }
//         if (req.body.time_settings) {
//             if (req.body.time_settings.is_with_time != null)
//                 $settings["settings.time_settings.is_with_time"] = req.body.time_settings.is_with_time;
//             if (req.body.time_settings.value)
//                 $settings["settings.time_settings.value"] = req.body.time_settings.value;
//             if (req.body.time_settings.timer_type)
//                 $settings["settings.time_settings.timer_type"] = req.body.time_settings.timer_type;
//             if (req.body.time_settings.timer_layout !=null)
//                 $settings["settings.time_settings.timer_layout"] = req.body.time_settings.timer_layout;
//             if (req.body.time_settings.seconds !=null)
//                 $settings["settings.time_settings.seconds"] = req.body.time_settings.seconds;
//             if (req.body.time_settings.minutes !=null)
//                 $settings["settings.time_settings.minutes"] = req.body.time_settings.minutes;
//             if (req.body.time_settings.hours !=null)
//                 $settings["settings.time_settings.hours"] = req.body.time_settings.hours;
//         }
//         if (req.body.progression_bar) {
//             if (req.body.progression_bar.is_available != null)
//                 $settings["settings.progression_bar.is_available"] = req.body.progression_bar.is_available;
//             if (req.body.progression_bar.progression_bar_layout != null)
//                 $settings["settings.progression_bar.progression_bar_layout"] = req.body.progression_bar.progression_bar_layout;
//         }
//
//
//         qtnr.findByIdAndUpdate(app_id, $settings, {
//             new: true
//         }).then((results) => {
//           if(results.settings != null )
//             {
//               var succMessage = {
//                 "app_info" : _.pick(results , ["_id","creator_id","questionnaire_title","description","updatedAt"]),
//                 "settings" : results.settings
//               }
//               res.send(notes.notifications.success_calling(succMessage));
//             }else {
//               var succMessage = {
//                 "app_info" : app_id,
//                 "Warning" : notes.Messages.Update_Message_Not_completed("App")
//               };
//               res.send(notes.notifications.success_calling(succMessage));
//             }
//
//         }).catch((error) => {
//               return new Promise((resolve, reject) => {
//                   res.send(notes.notifications.catch_errors(error));
//               });
//         });
//
//     }).catch((error) => {
//         return new Promise((resolve, reject) => {
//             res.send(notes.notifications.catch_errors(error));
//         });
//     });
//
// });
// // Stylesheet Settings ( process => edit / create) this mesthod required id of class name via req
// qtnrRouters.patch("/:app_id/settings/style/:process", auth_verify_api_keys , (req, res) => {
//     // Stylesheet
//     var user = req.verified_user;
//     var userType = req.is_creator;
//
//     var processType = req.params.process;
//     var application_id = req.params.app_id ;
//
//     // this user should be a creator user !
//     if (userType != 1) {
//          return new Promise((resolve, reject) => {
//           res.send(notes.notifications.permission_denied());
//         });
//     }
//
//     if(processType == "create"){
//       //mongoose.Types.ObjectId()
//         var stylesheet = new Object();
//         stylesheet['_id'] = mongoose.Types.ObjectId();
//         stylesheet['file_name'] = "styletheme_"+stylesheet['_id']+".css";
//         stylesheet['is_active'] = false ;
//         stylesheet['source_code'] = new Array();
//         var for_stylesheet_file ='';
//         if(req.body.source_codes != null){
//             var sourceCodes = req.body.source_codes ;
//
//              for(var i=0; i < sourceCodes.length;  i++){
//                if(i == 10 ){
//                  return new Promise((resolve , reject)=>{
//                    res.send(notes.notifications.catch_errors(notes.Messages.Stylesheet_Enough));
//                  });
//                  break ;
//                }
//                if(sourceCodes[i].class_name == null || sourceCodes[i].class_attributes == null )
//                {
//                  return new Promise((resolve , reject)=>{
//                      var required = ["class_name","class_attributes"];
//                      res.send(notes.notifications.catch_fields(notes.Messages.Required_Message(required)+" in Index Number " + i));
//                   });
//                  break ;
//                }
//
//                  var classes = new Object ;
//                    classes["_id"] = mongoose.Types.ObjectId() ;
//                    classes["class_name"] = sourceCodes[i].class_name;
//                    classes["class_attributes"] = sourceCodes[i].class_attributes;
//                    stylesheet['source_code'].push(classes);
//                       for_stylesheet_file +=   "."+sourceCodes[i].class_name+"{"   ;
//                     if(sourceCodes[i].class_attributes.background != null)
//                       for_stylesheet_file +=  "background:" + sourceCodes[i].class_attributes.background + ";";
//
//                     if(sourceCodes[i].class_attributes.color != null)
//                       for_stylesheet_file += "color:" + sourceCodes[i].class_attributes.color+ ";";
//
//                     if(sourceCodes[i].class_attributes.border != null)
//                       for_stylesheet_file +=  "border:" +sourceCodes[i].class_attributes.border+ ";";
//
//                     if(sourceCodes[i].class_attributes.boxShadow != null)
//                       for_stylesheet_file += "box-shadow:" + sourceCodes[i].class_attributes.boxShadow+ ";";
//
//                     if(sourceCodes[i].class_attributes.fontFamily != null)
//                       for_stylesheet_file +=  "font-family:" +sourceCodes[i].class_attributes.fontFamily+ ";";
//
//                    for_stylesheet_file += "} \n" ;
//
//             }
//         }
//
//
//
//         qtnr.findOne({_id:application_id} , (er,d)=>{
//           if(er || !d)
//           {
//             return new Promise((resolve , reject)=>{
//               res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Application")));
//             });
//           }
//         }).then((qtnrsx)=>{
//
//
//           if(!qtnrsx)
//           {
//             return new Promise((resolve , reject)=>{
//               res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Application")));
//             });
//           }
//
//
//
//           if(user.id != qtnrsx.creator_id ){
//            return new Promise((resolve , reject)=>{
//              res.send(notes.notifications.permission_denied());
//            });
//          }
//           qtnrsx.updatedAt = new Date();
//           qtnrsx.theme_style.push(stylesheet);
//           qtnrsx.markModified('theme_style');
//           qtnrsx.save((error , stylesheets)=>{
//
//             if(error)
//               {
//                 return new Promise((resolve , reject)=>{
//                   res.send(notes.notifications.catch_errors(error));
//                 });
//               }
//
//
//
//             fs.appendFile("ui-public/themes/"+stylesheet['file_name'],for_stylesheet_file, (err) => {
//                 if (err) throw err;
//                   //console.log('The "data to append" was appended to file!');
//             });
//
//             var style_codes = _.find(stylesheets.theme_style , {'file_name':stylesheet['file_name']} );
//             var succ_message = { "File_directory" : config.server_ip+"themes/"+style_codes.file_name , "Stylesheet_code":style_codes} ;
//             res.send(notes.notifications.success_calling(succ_message));
//            }).catch((error)=>{
//             return new Promise((resolve, reject) => {
//                 res.send(notes.notifications.catch_errors(error));
//             });
//           });
//         }).catch((error)=>{
//           // //console.log(err);
//           return new Promise((resolve, reject) => {
//               res.send(notes.notifications.catch_errors(error));
//           });
//         });
//     }
//     else if (processType == "edit"){
//       if(req.body.theme_style_id == null )
//         {
//           return new Promise((resolve , reject)=>{
//             res.send(notes.notifications.catch_fields(notes.Messages.Required_Message("theme_style_id")));
//           });
//         }
//
//         qtnr.findOne({_id:application_id} , (er,d)=>{
//           if(er || !d)
//           {
//             return new Promise((resolve , reject)=>{
//               res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Application")));
//             });
//           }
//         }).then((qtnrsx)=>{
//
//           if(!qtnrsx)
//           {
//             return new Promise((resolve , reject)=>{
//               res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Application")));
//             });
//           }
//
//            if(user.id != qtnrsx.creator_id ){
//             return new Promise((resolve , reject)=>{
//               res.send(notes.Warnings.Permission_Warning);
//             });
//           }
//             var stylefile_id = req.body.theme_style_id ;
//
//             qtnrsx.updatedAt = new Date();
//             var Stylecodes_Index;
//             try {
//               Stylecodes_Index = _.findIndex( qtnrsx.theme_style , {"_id":ObjectID(stylefile_id) }/*"file_name":/*"styletheme_"+stylefile_id+".css"*/ );
//             } catch (e) {
//               return new Promise((resolve,reject)=>{
//                 res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Stylesheet")));
//               });
//             }
//             if(Stylecodes_Index == -1 ){
//               return new Promise((resolve,reject)=>{
//                 res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Stylesheet")));
//               });
//             }
//
//             // update available status
//             if(req.body.is_active != null ){
//               for (var i = 0; i < qtnrsx.theme_style.length; i++) {
//                 qtnrsx.theme_style[i].is_active = false ;
//               }
//               qtnrsx.theme_style[Stylecodes_Index].is_active = req.body.is_active;
//             }
//
//
//             // Update in source code
//             if(req.body.source_codes){
//               // *****************************************************
//
//               if(req.body.source_codes != null){
//                     var sourceCodes = req.body.source_codes ;
//                     var stylesheet = new Object();
//                     var for_stylesheet_file ='';
//
//                       stylesheet['source_code'] = new Array();
//                      for(var i=0; i < sourceCodes.length;  i++){
//                        if(i == 10 ){
//                          return new Promise((resolve , reject)=>{
//                            res.send(notes.notifications.catch_errors(notes.Messages.Stylesheet_Enough));
//                          });
//                          break ;
//                        }
//                        if(sourceCodes[i].class_name == null || sourceCodes[i].class_attributes == null )
//                        {
//                          return new Promise((resolve , reject)=>{
//                              var required = ["class_name","class_attributes"];
//                              res.send(notes.notifications.catch_fields(notes.Messages.Required_Message(required)+" in Index Number " + i));
//                           });
//                          break ;
//                        }
//
//                          var classes = new Object ;
//                            classes["_id"] = mongoose.Types.ObjectId() ;
//                            classes["class_name"] = sourceCodes[i].class_name;
//                            classes["class_attributes"] = sourceCodes[i].class_attributes;
//
//                            stylesheet['source_code'].push(classes);
//
//                               for_stylesheet_file +=   "."+sourceCodes[i].class_name+"{"   ;
//                             if(sourceCodes[i].class_attributes.background != null)
//                               for_stylesheet_file +=  "background:" + sourceCodes[i].class_attributes.background + ";";
//
//                             if(sourceCodes[i].class_attributes.color != null)
//                               for_stylesheet_file += "color:" + sourceCodes[i].class_attributes.color+ ";";
//
//                             if(sourceCodes[i].class_attributes.border != null)
//                               for_stylesheet_file +=  "border:" +sourceCodes[i].class_attributes.border+ ";";
//
//                             if(sourceCodes[i].class_attributes.boxShadow != null)
//                               for_stylesheet_file += "box-shadow:" + sourceCodes[i].class_attributes.boxShadow+ ";";
//
//                             if(sourceCodes[i].class_attributes.fontFamily != null)
//                               for_stylesheet_file +=  "font-family:" +sourceCodes[i].class_attributes.fontFamily+ ";";
//
//                            for_stylesheet_file += "} \n" ;
//
//                     }
//                 }
//
//             }
//
//             qtnrsx.markModified("theme_style");
//             qtnrsx.save().then((theme_stylish)=>{
//               var stylesheetPath = "ui-public/themes/"+"styletheme_"+stylefile_id+".css" ;
//
//               if(for_stylesheet_file ) {
//                    if (fs.existsSync(stylesheetPath)) {
//                     fs.appendFile(stylesheetPath ,for_stylesheet_file, (err) => {
//                         if (err) throw err;
//                           //console.log('Stylesheet codes is appended !');
//                     });
//                   }
//                      var Stylecodes_Find  = _.find( theme_stylish.theme_style , {"file_name":"styletheme_"+stylefile_id+".css"} );
//                }
//                 var Stylecodes_updated  = _.find( theme_stylish.theme_style , {"file_name":"styletheme_"+stylefile_id+".css"} );
//                res.send({ "File_directory" : config.server_ip+"themes/"+"styletheme_"+stylefile_id+".css" , "Stylesheet_code":Stylecodes_updated})
//
//             }).catch();
//
//
//         }).catch();
//
//     }
//     else if (processType == "delete"){
//
//       if(req.body.theme_style_id == null )
//         {
//           return new Promise((resolve , reject)=>{
//             res.send(notes.notifications.catch_fields(notes.Messages.Required_Message("theme_style_id")));
//           });
//         }
//
//       qtnr.findOne({_id:application_id}, (er,d)=>{
//         if(er || !d)
//         {
//           return new Promise((resolve , reject)=>{
//             res.send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Application")));
//           });
//         }
//       }).then((qtnrsx)=>{
//
//           if(!qtnrsx)
//           {
//             return new Promise((resolve , reject)=>{
//               res.send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Application")));
//             });
//           }
//            if(user.id != qtnrsx.creator_id ){
//             return new Promise((resolve , reject)=>{
//               res.send(notes.notifications.permission_denied());
//             });
//           }
//           // res.send({"err":0 , "e":qtnrsx});
//           // return false ;
//           var stylefile_id = req.body.theme_style_id;
//           qtnrsx.updatedAt = new Date();
//           if(qtnrsx.theme_style.length == 0 ){
//             return new Promise((resplve , reject)=>{
//               res.send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Stylesheet")));
//             });
//           }
//
//           var Stylecodes_Index = _.findIndex( qtnrsx.theme_style , {"file_name":"styletheme_"+stylefile_id+".css"} );
//            var stylesheet_object = qtnrsx.theme_style ;
//
//           //  res.send({"err":1 , "e":Stylecodes_Index});
//           //  return false ;
//            if(Stylecodes_Index == -1 ){
//              return new Promise((resplve , reject)=>{
//                res.send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Stylesheet")));
//              });
//            }
//           //  res.send({"err":2 , "e":Stylecodes_Index});
//           //  return false ;
//            file_styletheme = "ui-public/themes/"+"styletheme_"+ stylesheet_object[Stylecodes_Index]._id  +".css"
//
//           //  res.send({"err":3 , "e":file_styletheme});
//           //  return false ;
//           if(Stylecodes_Index != -1 )
//             {
//
//             var deleted_data =  _.pull(stylesheet_object , stylesheet_object[Stylecodes_Index] ) ;
//               if(deleted_data){
//                 if (fs.existsSync(file_styletheme)) {
//                     fs.unlink(file_styletheme, (err) => {
//                       if (err) throw err;
//
//                     });
//                   }
//                   // var file_for_delete = "styletheme_"+stylesheet_object[Stylecodes_Index]._id  +".css";
//                     // var file_for_delete = "styletheme_"+stylesheet_object[Stylecodes_Index]._id  +".css";
//
//
//                   qtnrsx.markModified('theme_style');
//                   qtnrsx.save((error , succ)=>{
//                     if(error){
//                       return new Promise((resolve , reject)=>{
//                         res.send(notes.notifications.catch_errors("Error in delete file from server"));
//                       });
//                     }
//
//                     res.send(notes.notifications.success_calling('successfully deleted data with css file !'));
//                   });
//
//               }
//             }
//             else {
//               return new Promise((resplve , reject)=>{
//                 res.send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Stylesheet")));
//               });
//             }
//       });
//     }
// });
// // Save many questions with indexes in one time
// qtnrRouters.patch("/:app_id/question/creation"  , auth_verify_api_keys , (req,res)=>{
//   var app_id = req.params.app_id ;
//   var user = req.verified_user;
//   var userType = req.is_creator;
//
//   // this user should be a creator user !
//   if (userType != 1) {
//        return new Promise((resolve, reject) => {
//         res.send(notes.notifications.permission_denied());
//       });
//   }
//   qtnr.findOne({ _id:app_id }, function (err, qtnairsDocument){
//     if (!qtnairsDocument){
//       return new Promise((resolve, reject)=>{
//          res.send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Application")));
//       });
//     }
//
//     if(qtnairsDocument.creator_id != user.id){
//       return new Promise((resolve , reject)=>{
//         res.send(notes.notifications.permission_denied());
//       });
//     }
//
//     qtnairsDocument.questions = req.body.sorted_question ;
//     qtnairsDocument.markModified("questions");
//     qtnairsDocument.save().then(function(sorted_qs){
//       res.send(notes.notifications.success_calling(sorted_qs));
//     });
//   });
// });
// // Question => proccess ( create - edit or delete )
// qtnrRouters.patch("/:app_id/question/:process" , question_answer_images.single("media_field") , auth_verify_api_keys , (req, res) =>{
//
//   var app_id = req.params.app_id ;
//   var processType= req.params.process ;
//   var user = req.verified_user;
//   var userType = req.is_creator;
//
//   // this user should be a creator user !
//   if (userType != 1) {
//        return new Promise((resolve, reject) => {
//           res.send(notes.notifications.permission_denied());
//       });
//   }
//   qtnr.findOne({ _id:app_id }, function (err, qtnairsDocument){
//
//       if (!qtnairsDocument){
//         return new Promise((resolve, reject)=>{
//            res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Application")));
//         });
//       }
//
//       if(qtnairsDocument.creator_id != user.id){
//         return new Promise((resolve , reject)=>{
//           res.send(notes.notifications.permission_denied());
//         });
//       }
//
//       if(processType == "create")
//         {
//           if(!qtnairsDocument.questions){
//               return new Promise((resolve , reject)=>{
//               res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("questions Array")));
//               });
//           }
//           var required = new Array();
//           if(req.body.question_type == null){
//               required[required.length] = 'question_type';
//           }
//           if(req.body.question_body == null){
//               required[required.length] = 'question_body';
//           }
//
//           // question_description
//           if(required.length != 0 ){
//               return new Promise((resolve, reject)=>{
//                  res.send(notes.notifications.catch_fields(notes.Messages.Required_Message(required)));
//               });
//           }
//
//           if( !_.isInteger(parseInt(req.body.question_type)) ){
//             return new Promise(( resolve , reject)=>{
//               res.send(notes.notifications.catch_errors("Question type should be an integer (Number) value "));
//               return false;
//             });
//           }
//
//
//           if( req.body.question_type >= 5    &&   qtnairsDocument.app_type == 0 &&   qtnairsDocument.app_type.length != 1 ){
//             return new Promise(( resolve , reject)=>{
//               res.send(notes.notifications.catch_errors( "This question type doesn't exists !!"));
//
//               return false;
//             });
//           }
//
//           if( req.body.question_type >= 3    &&   qtnairsDocument.app_type == 1 ){
//             return new Promise(( resolve , reject)=>{
//               res.send(notes.notifications.catch_errors( "Question type not supported in quiz application"));
//               return false;
//             });
//           }
//
//           var question_tag = new Object();
//           question_tag["_id"] =  mongoose.Types.ObjectId();
//           question_tag["created_at"] = new Date();
//           question_tag["question_body"] = req.body.question_body ;
//           question_tag["answers_body"] = [] ;
//           question_tag ["question_type"] = req.body.question_type;
//           if(req.body.question_is_required != null )
//           question_tag ["question_is_required"] = req.body.question_is_required ;
//           if(req.body.question_description != null )
//             question_tag ["question_description"] = req.body.question_description;
//
//           if(req.body.enable_description != null )
//             question_tag ["enable_description"] = req.body.enable_description;
//
//           if(req.body.answer_settings == null) {
//             question_tag ["answer_settings"] = new Object();
//             question_tag ["answer_settings"]['is_randomized'] = false ;
//             question_tag ["answer_settings"]['is_required'] = false ;
//             question_tag ["answer_settings"]['super_size'] = false ;
//             question_tag ["answer_settings"]['single_choice'] = true ;
//             question_tag ["answer_settings"]['is_required'] = false ;
//             question_tag ["answer_settings"]['choice_style'] = true;
//             question_tag ["answer_settings"]['answer_char_max'] = 200;
//           }else if(req.body.answer_settings != null){
//               question_tag ["answer_settings"] = new Object();
//               if(req.body.answer_settings.is_randomized != null )
//               question_tag ["answer_settings"]['is_randomized'] = req.body.answer_settings.is_randomized ;
//               if( req.body.answer_settings.is_required != null)
//               question_tag ["answer_settings"]['is_required'] = req.body.answer_settings.is_required ;
//               if(req.body.answer_settings.super_size != null )
//               question_tag ["answer_settings"]['super_size'] = req.body.answer_settings.super_size ;
//
//               if(req.body.answer_settings.single_choice!= null )
//                 question_tag ["answer_settings"]['single_choice'] = req.body.answer_settings.single_choice;
//
//               if(req.body.answer_settings.choice_style != null )
//               question_tag ["answer_settings"]['choice_style'] = req.body.answer_settings.choice_style ;
//
//               if(req.body.answer_settings.answer_char_max != null )
//               question_tag ["answer_settings"]['answer_char_max'] = req.body.answer_settings.answer_char_max ;
//
//           }
//
//           if(req.file_status != "undefine" && req.file_status == false){
//               return new Promise((resolve , reject)=>{
//                 res.send(notes.notifications.catch_errors(notes.Errors.Error_file_extension));
//               });
//           }
//           // Upload Media part ============================
//           if(req.body.media_field != null || req.file != null){
//              // there is a medi image or video
//              question_tag ["media_question"] = new Object();
//               if(req.file != null ){  // => Image Type
//                 var imagePath =  req.file.path ;
//                 var fileExtension = path.extname(imagePath);
//                 var new_filename = "question_"+question_tag["_id"]+fileExtension.toLowerCase();
//                 var targetPath = "ui-public/themeimages/"+new_filename;
//                 var tempPath = req.file.path ;
//                 if(! fs.existsSync(tempPath)){
//                     return new Promise((resolve , reject )=>{
//                         res.send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Image")));
//                     });
//                 }
//                 question_tag ["media_question"]["media_type"]  = 0;
//                 question_tag ["media_question"]["media_name"]  = new_filename
//                 question_tag ["media_question"]["media_field"] = "themeimages/"+new_filename ;
//                 fs.rename( imagePath , targetPath , (err)=>{
//                     if(err) throw err ;
//                 }) ;
//               }else { // => Video Type
//                 question_tag ["media_question"]["media_type"] = 1;
//                 question_tag ["media_question"]["media_name"] = req.body.media_field;
//                 question_tag ["media_question"]["media_field"] = req.body.media_field;
//                 // detect video type
//
//                 var video = req.body.media_field ;
//                 var videoType = null ;
//                 var videoId = null ;
//                 var video_src_value = null;
//                 if( video.toLowerCase().includes("youtube")    == true   ) {
//                   videoType = 0 ; // => youtube
//                   var idWithLastSplit = video.lastIndexOf('?');
//                   var videos = video.substr(idWithLastSplit + 1);
//                   var lastId = videos.substr(0, videos.indexOf('&'));
//
//                   if(lastId != '' || lastId )
//                     videoId = lastId ;
//                   else
//                     videoId = videos ;
//
//
//                   var afterEqualChar = videoId.lastIndexOf('=');
//                   videoId = videoId.substring(afterEqualChar + 1);
//                   video_src_value = "http://youtube.com/embed/"+ videoId ;
//                 }
//                 else if( video.includes("vimeo") == true   ) {
//                   videoType = 1 ; // => vimeo
//                   var n = video.lastIndexOf('/');
//                   videoId = video.substring(n + 1);
//                   video_src_value = "https://player.vimeo.com/video/"+ videoId;;
//                 }
//                 else if( video.includes(".mp4")  == true   ) {
//                   videoType = 2 ;
//                   videoId = null;
//
//                   var media_mp4 = req.body.media_field.substring(0, req.body.media_field.lastIndexOf('.'));
//                   question_tag ["media_question"]["media_field"] = media_mp4 ;
//
//                 }
//                 question_tag ["media_question"]["video_type"] = videoType;
//                 question_tag ["media_question"]["video_source"] = video_src_value;
//                 question_tag ["media_question"]["video_id"] = videoId;
//               }
//
//           }
//
//           // Save data after saving image in server directory
//             qtnairsDocument.questions.push(question_tag);
//             qtnairsDocument.markModified("questions");
//             qtnairsDocument.save().then((qsResults)=>{
//               if(!qsResults){
//                 if( fs.existsSync(tempPath)){
//                   fs.unlink(tempPath, (err) => {
//                    if (err) throw err;
//                     //console.log('successfully deleted');
//                   });
//                 }
//               }
//             }).then(()=>{
//
//               var send_requests = new Object();
//               if(question_tag.media_question != null ){
//                 var media_part = ( question_tag.media_question.media_type == 0 ) ?
//                 config.server_ip+"themeimages/" +  new_filename :
//                 question_tag.media_question.media_field
//                 send_requests['Media_directory']=media_part;
//               }
//               send_requests['Question_details'] = question_tag ;
//               res.send(notes.notifications.success_calling(send_requests));
//
//             }).catch((error)=>{
//                 return new Promise((resolve , reject)=>{
//                   res.send(notes.notifications.catch_errors(error));
//                 });
//             });
//            }
//       if (processType == "edit"){
//             if(!qtnairsDocument.questions){
//                 return new Promise((resolve , reject)=>{
//                 res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("questions Array")));
//                 });
//             }
//             var required = new Array();
//             if(req.body.question_id == null){
//                 required[required.length] = 'question_id';
//             }
//
//             if(required.length != 0 ){
//                 return new Promise((resolve, reject)=>{
//                    res.send(notes.notifications.catch_fields(notes.Errors.Required_Message(required)));
//                 });
//             }
//
//
//             var question_id = req.body.question_id ;
//             var application_questions = qtnairsDocument.questions ;
//             var findIndex_this_qs = _.findIndex(application_questions , {"id":question_id} );
//
//             if(findIndex_this_qs == -1 ){
//               return new Promise((resolve, reject)=>{
//                  res.send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Question")));
//               });
//             }
//
//             var find_this_qs = _.find(application_questions , {"id":question_id} ) ;
//
//
//             // => Edit Media
//             /*----------------------------------------------*/
//             if(req.file_status != "undefine" && req.file_status == false){
//                return new Promise((resolve , reject)=>{
//                  res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists(notes.Errors.Error_file_extension)));
//                });
//             }
//             if(req.body.media_field != null || req.file != null){
//               if(qtnairsDocument.questions[findIndex_this_qs].media_question == null)
//                   qtnairsDocument.questions[findIndex_this_qs].media_question = new Object();
//
//               if(req.file != null ){
//                 var imagePath =  req.file.path ;
//                 var fileExtension = path.extname(imagePath);
//                 var new_filename = "question_"+question_id+fileExtension;
//                 var targetPath = "ui-public/themeimages/"+new_filename;
//                 var tempPath = req.file.path ;
//                 // if(! fs.existsSync(tempPath)){ ==> in thid case can add new image
//                 //     return new Promise((resolve , reject )=>{
//                 //       res.send(notes.Errors.Error_Doesnt_exists("Image"));
//                 //     });
//                 // }
//                 // res.send({
//                 //   'tempPath':tempPath ,
//                 //   'trPath':targetPath
//                 // });
//                 // return false;
//                 qtnairsDocument.questions[findIndex_this_qs].media_question["media_type"] = 0;
//                 qtnairsDocument.questions[findIndex_this_qs].media_question["media_name"] = new_filename
//                 qtnairsDocument.questions[findIndex_this_qs].media_question["media_field"] = "themeimages/"+new_filename ;
//                 fs.rename( imagePath , targetPath , (err) => {
//                     if (err ) throw err;
//                     fs.stat(targetPath,   (err, stats) => {
//                        if (err) throw err;
//                      });
//                   });
//
//               }else{ // => Video Type
//                   qtnairsDocument.questions[findIndex_this_qs].media_question["media_type"] = 1 ;
//                   qtnairsDocument.questions[findIndex_this_qs].media_question["media_name"] = req.body.media_field;
//                   qtnairsDocument.questions[findIndex_this_qs].media_question["media_field"] = req.body.media_field;
//                   // ================> Start Edit video
//                   var video = req.body.media_field;
//                   var videoType = null ;
//                   var videoId = null ;
//                   var video_src_value = null ;
//                   if( video.toLowerCase().includes("youtube")    == true   ) {
//                      videoType = 0 ; // => youtube
//                      var idWithLastSplit = video.lastIndexOf('?');
//                      var videos = video.substr(idWithLastSplit + 1);
//                      var lastId = videos.substr(0, videos.indexOf('&'));
//                      if(lastId != '' || lastId )
//                     videoId = lastId ;
//                     else
//                     videoId = videos ;
//                     var afterEqualChar = videoId.lastIndexOf('=');
//                     videoId = videoId.substring(afterEqualChar + 1);
//                     video_src_value = "http://youtube.com/embed/"+ videoId
//                   }else if( video.includes("vimeo") == true   ) {
//                     videoType = 1 ; // => vimeo
//                     var n = video.lastIndexOf('/');
//                     videoId = video.substring(n + 1);
//                     video_src_value = "https://player.vimeo.com/video/"+ videoId;
//                   } else if( video.includes(".mp4")  == true   ) {
//                     videoType = 2 ;
//                     videoId = null;
//                     var media_mp4 = req.body.media_field.substring(0, req.body.media_field.lastIndexOf('.'));
//                     qtnairsDocument.questions[findIndex_this_qs].media_question["media_field"] = media_mp4 ;
//                   }
//                   qtnairsDocument.questions[findIndex_this_qs].media_question["video_type"] = videoType ;
//                   qtnairsDocument.questions[findIndex_this_qs].media_question["video_id"] = videoId ;
//                   qtnairsDocument.questions[findIndex_this_qs].media_question["video_source"] = video_src_value  ;
//
//               }
//             }
//             // res.send(qtnairsDocument.questions[findIndex_this_qs]);
//             // return false ;
//             /*----------------------------------------------*/
//
//
//             if(req.body.question_body != null)
//               qtnairsDocument.questions[findIndex_this_qs].question_body = req.body.question_body ;
//             if(req.body.question_is_required != null)
//              qtnairsDocument.questions[findIndex_this_qs].question_is_required  = req.body.question_is_required ;
//             if(req.body.question_type != null)
//               qtnairsDocument.questions[findIndex_this_qs].question_type = req.body.question_type ;
//
//               if(req.body.question_description != null )
//               {
//                 qtnairsDocument.questions[findIndex_this_qs].question_description = req.body.question_description;
//
//               }
//               if(req.body.enable_description != null )
//               {
//                 qtnairsDocument.questions[findIndex_this_qs].enable_description = req.body.enable_description;
//
//               }
//
//             if(req.body.answer_settings != null ){
//                 if(qtnairsDocument.questions[findIndex_this_qs].answer_settings == null)
//                   qtnairsDocument.questions[findIndex_this_qs].answer_settings = new Object();
//
//                   if(req.body.answer_settings.is_randomized != null  ){
//                       qtnairsDocument.questions[findIndex_this_qs].answer_settings.is_randomized = req.body.answer_settings.is_randomized ;
//                   }
//                   if(req.body.answer_settings.is_required != null  ){
//                       qtnairsDocument.questions[findIndex_this_qs].answer_settings.is_required = req.body.answer_settings.is_required ;
//                   }
//
//                   if(req.body.answer_settings.super_size != null  ){
//                       qtnairsDocument.questions[findIndex_this_qs].answer_settings.super_size = req.body.answer_settings.super_size ;
//                   }
//
//                   if(req.body.answer_settings.single_choice != null){
//                       qtnairsDocument.questions[findIndex_this_qs].answer_settings.single_choice = req.body.answer_settings.single_choice ;
//                   }
//
//                   if(req.body.answer_settings.choice_style != null){
//                       qtnairsDocument.questions[findIndex_this_qs].answer_settings.choice_style = req.body.answer_settings.choice_style ;
//                   }
//
//                   if(req.body.answer_settings.answer_char_max != null){
//                       qtnairsDocument.questions[findIndex_this_qs].answer_settings.answer_char_max = req.body.answer_settings.answer_char_max ;
//                   }
//
//             }
//
//
//             qtnairsDocument.markModified("questions");
//             qtnairsDocument.save().then((qsResults)=>{
//
//               var send_requests = new Object();
//              if(qsResults.questions[findIndex_this_qs].media_question != null ){
//
//                 var media_part = ( qsResults.questions[findIndex_this_qs].media_question.media_type == 0 ) ?
//                 config.server_ip+"themeimages/" + "question_"+question_id+fileExtension :
//                 qsResults.questions[findIndex_this_qs].media_question.media_field
//                 send_requests['Media_directory'] = media_part ;
//               }
//               send_requests["Question_details"] = qsResults.questions[findIndex_this_qs];
//               res.send(notes.notifications.success_calling(send_requests));
//             }).catch((err)=>{
//                 return new Promise((resolve , reject)=>{
//                   res.send(notes.notifications.catch_errors(err));
//                 });
//             });
//
//
//        }
//       if (processType =="delete"){
//         if(!qtnairsDocument.questions){
//             return new Promise((resolve , reject)=>{
//             res.send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("questions Array")))
//             });
//         }
//         var required = new Array();
//         if(req.body.question_id == null){
//             required[required.length] = 'question_id';
//         }
//
//         if(required.length != 0 ){
//             return new Promise((resolve, reject)=>{
//                res.send(notes.notifications.catch_errors(notes.Errors.Required_Message(required)));
//             });
//         }
//         var question_id = req.body.question_id ;
//         var application_questions = qtnairsDocument.questions ;
//         var findIndex_this_qs = _.findIndex(application_questions , {"id":question_id} );
//
//         if(findIndex_this_qs == -1 ){
//           return new Promise((resolve, reject)=>{
//              res.send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Question")));
//           });
//         }
//       var target_question = qtnairsDocument.questions;
//         if(target_question[findIndex_this_qs].media_question != null ){
//           var image_root =/* __dirname + "/../../*/"ui-public/themeimages/" +target_question[findIndex_this_qs].media_question.media_field;
//           if( fs.existsSync(image_root)){
//             fs.unlink(image_root , function (err) {
//                 //console.log("Deleted Image !!");
//             });
//           }
//         }
//         var deleting_pull = _.pull(target_question , target_question[findIndex_this_qs]);
//
//         qtnairsDocument.markModified("questions");
//         qtnairsDocument.save().then((qsResults)=>{
//           if(deleting_pull){
//             res.send(notes.notifications.catch_errors("This Question "+question_id + " Is Deleted"));
//           }
//           else
//           res.send(notes.notifications.catch_errors(notes.Errors.General_Error));
//
//         }).catch((err)=>{
//             return new Promise((resolve , reject)=>{
//               res.send(notes.notifications.catch_errors(notes.Errors.General_Error));
//             });
//         });
//       }
//
//   });
//
// });
// // ==> Update answer
// qtnrRouters.patch("/:app_id/question/:question_id/answer/media/edit" , question_answer_images.single("media_src") ,  auth_verify_api_keys , (req , res)=>{
//   var question_id = req.params.question_id;
//    var user = req.verified_user;
//    var userType = req.is_creator;
//
//    var app_id = req.params.app_id;
//
//    // this user should be a creator user !
//    if (userType != 1) {
//        return new Promise((resolve, reject) => {
//            res.send(notes.notifications.permission_denied());
//        });
//    }
//
//    qtnr.findOne({_id: app_id} , (err, docs)=>{
//      if (!docs || err) {
//         return new Promise((resolve, reject) => {
//           res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Application")));
//         });
//       }
//    }).then((qtnairsDocument) => {
//      var questionnaire_results;
//      if (!qtnairsDocument) {
//             return new Promise((resolve, reject) => {
//               res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Application")));
//             });
//         }
//
//         if (qtnairsDocument.creator_id != user.id) {
//             return new Promise((resolve, reject) => {
//                 res.send(notes.notifications.permission_denied());
//             });
//         }
//
//         var questionIndex = _.findIndex(qtnairsDocument.questions, {
//             "id": question_id
//         });
//         if (questionIndex == -1) {
//             return new Promise((resolve, reject) => {
//                 res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Question")));
//             });
//         }
//
//         var question_type = qtnairsDocument.questions[questionIndex].question_type;
//         var question_answers = new Object();
//         if (!req.body.answer_id || req.body.answer_id == null) {
//                 return new Promise((resolve, reject) => {
//                     res.send(notes.notifications.catch_fields(notes.Errors.Required_Message("answer_id")));
//                 });
//             }
//             var answer_id = req.body.answer_id;
//             var question_answers = qtnairsDocument.questions[questionIndex].answers_format;
//             //var answerss = _.filter(question_answers ,  x => x._id == answer_id)
//             var answerArgs = qtnairsDocument.questions[questionIndex].answers_format;
//             var foundAnswer = false;
//             var answerIndex = '';
//             for (var i = 0; i < answerArgs.length; i++) {
//                 if (answer_id == answerArgs[i]._id) {
//                     foundAnswer = true;
//                     answerIndex = i;
//                 }
//             }
//             if (foundAnswer == false) {
//                 return new Promise((resolve, reject) => {
//                     res.send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Answer")));
//                 });
//             }
//
//             var question_type = qtnairsDocument.questions[questionIndex].question_type;
//
//             if (req.body.is_correct != null)
//                 answerArgs[answerIndex].is_correct = req.body.is_correct;
//
//
//
//       // ==============> 1 choices text
//        if (question_type == 0){
//          if (req.body.choices_value != null || !answerArgs[answerIndex].value)
//              answerArgs[answerIndex].value = req.body.choices_value;
//
//          if (req.file_status != "undefine" && req.file_status == false) {
//               return new Promise((resolve, reject) => {
//                    res.send(notes.notifications.catch_errors(notes.Errors.Error_file_extension));
//               });
//          }
//
//          if (req.body.media_src != null || req.file != null) {
//
//             if ( answerArgs[answerIndex].media_optional )
//                 answerArgs[answerIndex].media_optional = new Object();
//
//             // ==> Media part here
//             if (req.file != null) {
//               var imagePath = req.file.path;
//               var fileExtension = path.extname(req.file.filename);
//               var new_filename = "answer_text_" + answerArgs[answerIndex]._id + fileExtension;
//
//               var targetPath = "ui-public/themeimages/" + new_filename;
//               answerArgs[answerIndex].media_optional.media_type = 0;
//               answerArgs[answerIndex].media_optional.media_name = new_filename;
//               answerArgs[answerIndex].media_optional.media_src = "themeimages/" + new_filename;
//               answerArgs[answerIndex].media_optional.Media_directory = config.server_ip + "themeimages/" + new_filename;
//               if (fs.existsSync(imagePath)) {
//                   fs.rename(imagePath, targetPath, function(err) {
//                       //console.log(err);
//                   });
//               }
//             }else {
//
//               var video = req.body.media_src;
//               var videoType = null;
//               var videoId = null;
//               var video_src_value = null;
//               if (video.toLowerCase().includes("youtube") == true) {
//                   videoType = 0; // => youtube
//                   var idWithLastSplit = video.lastIndexOf('?');
//                   var videos = video.substr(idWithLastSplit + 1);
//                   var lastId = videos.substr(0, videos.indexOf('&'));
//                   if (lastId != '' || lastId)
//                         videoId = lastId;
//                   else
//                         videoId = videos;
//
//                   var afterEqualChar = videoId.lastIndexOf('=');
//                   videoId = videoId.substring(afterEqualChar + 1);
//                   video_src_value = "http://youtube.com/embed/" + videoId;
//                } // end youtube
//                else if (video.includes("vimeo") == true) {
//                  videoType = 1; // => vimeo
//                  var n = video.lastIndexOf('/');
//                  videoId = video.substring(n + 1);
//                  video_src_value = "https://player.vimeo.com/video/" + videoId;
//                } // end vimeo
//                else if (video.includes(".mp4") == true){
//                  videoType = 2;
//                  videoId = null;
//                  var media_mp4 = req.body.media_src.substring(0, req.body.media_src.lastIndexOf('.'));
//                  answerArgs[answerIndex].media_optional["mp4_option"] = new Object();
//                  answerArgs[answerIndex].media_optional["mp4_option"]["mp4_url"] = media_mp4 + '.mp4';
//                  answerArgs[answerIndex].media_optional["mp4_option"]["ogg_url"] = media_mp4 + '.ogg';
//                }
//
//                answerArgs[answerIndex].media_optional.video_id = videoId;
//                answerArgs[answerIndex].media_optional.embed_path = video_src_value;
//                answerArgs[answerIndex].media_optional.video_type = videoType;
//             } // => End the video related text choices
//
//          }
//        }
//       // ==============> 2 Media Choices
//       if (question_type == 1){
//         if (req.body.choices_value != null || !answerArgs[answerIndex].value)
//                     answerArgs[answerIndex].value = req.body.choices_value;
//
//                 if (req.file_status != "undefine" && req.file_status == false) {
//                     return new Promise((resolve, reject) => {
//                          res.send(notes.notifications.catch_errors(notes.Errors.Error_file_extension));
//                     });
//                 }
//                 if (req.body.media_src != null || req.file != null) {
//                     if (req.file != null) { // Image
//                         var imagePath = req.file.path;
//                         var fileExtension = path.extname(req.file.filename);
//                         var new_filename = "answer_media_" + answerArgs[answerIndex]._id + fileExtension;
//
//                         var targetPath = "ui-public/themeimages/" + new_filename;
//                         answerArgs[answerIndex].media_type = 0;
//                         answerArgs[answerIndex].media_name = new_filename;
//                         answerArgs[answerIndex].media_src = "themeimages/" + new_filename;
//                         answerArgs[answerIndex].Media_directory = config.server_ip + "themeimages/" + new_filename;
//
//
//                         if (fs.existsSync(imagePath)) {
//                             fs.rename(imagePath, targetPath, function(err) {
//                                 //console.log(err);
//                             });
//                         }
//                     } else { // Video
//
//                         var video = req.body.media_src; // heeer
//                         var videoType = null;
//                         var videoId = null;
//                         var video_src_value = null;
//                         if (video.toLowerCase().includes("youtube") == true) {
//                             videoType = 0; // => youtube
//                             var idWithLastSplit = video.lastIndexOf('?');
//                             var videos = video.substr(idWithLastSplit + 1);
//                             var lastId = videos.substr(0, videos.indexOf('&'));
//
//                             if (lastId != '' || lastId)
//                                 videoId = lastId;
//                             else
//                                 videoId = videos;
//
//
//                             var afterEqualChar = videoId.lastIndexOf('=');
//                             videoId = videoId.substring(afterEqualChar + 1);
//                             video_src_value = "http://youtube.com/embed/" + videoId;
//
//                         } else if (video.includes("vimeo") == true) {
//                             videoType = 1; // => vimeo
//                             var n = video.lastIndexOf('/');
//                             videoId = video.substring(n + 1);
//                             video_src_value = "https://player.vimeo.com/video/" + videoId;;
//
//                         } else if (video.includes(".mp4") == true) {
//                             videoType = 2;
//                             videoId = null;
//
//                             var media_mp4 = req.body.media_src.substring(0, req.body.media_src.lastIndexOf('.'));
//
//                             // question_tag ["media_question"]["media_src"] = media_mp4 ;
//                             if(answerArgs[answerIndex]["mp4_option"]  == null || answerArgs[answerIndex]["mp4_option"]  == undefined)
//                             answerArgs[answerIndex]["mp4_option"] = new Object();
//
//                             answerArgs[answerIndex]["mp4_option"]["mp4_url"] = media_mp4 + '.mp4'
//                             answerArgs[answerIndex]["mp4_option"]["ogg_url"] = media_mp4 + '.ogg'
//                         }
//
//
//                         answerArgs[answerIndex]["Media_directory"] = req.body.media_src;
//                         answerArgs[answerIndex]["media_type"] = 1;
//                         answerArgs[answerIndex]["media_name"] = req.body.media_src;
//                         answerArgs[answerIndex]["media_src"] = req.body.media_src;
//
//                         // store new values
//                         answerArgs[answerIndex].video_id = videoId;
//
//                         answerArgs[answerIndex].embed_path = video_src_value;
//                         answerArgs[answerIndex].video_type = videoType;
//
//
//                     }
//                 }
//       }
//       // ==============> 3
//       // ==============> 4
//       // ==============> 5
//
//       questionnaire_results = answerArgs[answerIndex];
//       qtnairsDocument.markModified("questions");
//         qtnairsDocument.save().then(() => {
//             res.send(notes.notifications.success_calling(questionnaire_results));
//         }).catch((err) => {
//             return new Promise((resolve, reject) => {
//                 res.send(notes.notifications.catch_errors({
//                     "error": notes.Errors.General_Error.error,
//                     "details": err.message
//                 }));
//             });
//       });
//    }); // end document here !
// });
// // Answers
// qtnrRouters.patch("/:app_id/question/:question_id/answer/:process" , question_answer_images.single("media_src") ,  auth_verify_api_keys , (req , res)=>{
//   ///localhost:3000/api/5a1efcc61826bd398ecd4dee/question/5a1f0c5c0b6a6843735020b2/answer/create
//   var processType= req.params.process ;
//   var question_id = req.params.question_id;
//   var user = req.verified_user;
//   var userType = req.is_creator;
//
//   var app_id = req.params.app_id ;
//
//   // this user should be a creator user !
//  if (userType != 1) {
//       return new Promise((resolve, reject) => {
//          res.status(401).send( notes.notifications.permission_denied());
//      });
//  }
//
//    qtnr.findOne({ _id:app_id } , (err , docs)=>{
//      if(!docs || err ) {
//        return new Promise((resolve, reject)=>{
//           res.status(404).send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Application")));
//        });
//      }
//    }).then( ( qtnairsDocument) => {
//
//        if (!qtnairsDocument){
//          return new Promise((resolve, reject)=>{
//             res.status(404).send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Application")));
//          });
//        }
//
//        if(qtnairsDocument.creator_id != user.id){
//          return new Promise((resolve , reject)=>{
//            res.status(401).send( notes.notifications.permission_denied());
//          });
//        }
//
//        var questionIndex = _.findIndex(qtnairsDocument.questions , {"id":question_id});
//        if(questionIndex == -1 ){
//          return new Promise((resolve, reject)=>{
//             res.status(404).send(notes.notifications.catch_fields(notes.Errors.Error_Doesnt_exists("Question")));
//          });
//        }
//
//        var question_type =  qtnairsDocument.questions[questionIndex].question_type  ;
//        var question_answers = new Object ();
//
//        if(processType == 'create') {// Answer type creation
//          switch (question_type) {
//           case 0:
//                question_answers["_id"] = mongoose.Types.ObjectId();
//                  question_answers["indexer"] = null ;
//
//                 if(req.body.choices_value != null )
//                      question_answers["value"] = req.body.choices_value ;
//                 else
//                      question_answers["value"] = "Write answer here !" ;
//
//                     // if(req.body.media_optional != null ){
//                     // if(req.body.media_optional.media_type == null) {
//                     //   exists_array[exists_array.length] = "media_type";
//                     // }
//                     //
//                     // if(req.body.media_optional.media_name == null) {
//                     //   exists_array[exists_array.length] = "media_name";
//                     // }
//                     //
//                     // if(req.body.media_optional.media_src == null) {
//                     //   exists_array[exists_array.length] = "media_src";
//                     // }
//                     //
//                     // if(exists_array.length != 0 ){
//                     //     return new Promise((resolve , reject) => {
//                     //       res.send(notes.Messages.Required_Message(exists_array));
//                     //     });
//                     // }
//                     //
//                     // if( ! _.isInteger(req.body.media_optional.media_type)  || req.body.media_optional.media_type  > 1 ){
//                     //    return new Promise((resolve , reject)=>{
//                     //      res.send({"Message" : "This Value should be integer (0 or 1) 0 => for image type , 1 => for video type"});
//                     //    });
//                     // }
//
//                     /*-------------------------------------------- Answer Media */
//
//
//                      if(req.file_status != "undefine" && req.file_status == false){
//                          return new Promise((resolve , reject)=>{
//                            res.send(notes.notifications.catch_fields ( notes.Errors.Error_file_extension ))
//                          });
//                      }
//                      if(req.body.media_src != null || req.file != null){
//                        question_answers["media_optional"] = new Object();
//
//                        if(req.file != null ){
//                          var imagePath =  req.file.path ;
//                          var fileExtension = path.extname(imagePath);
//                          var new_filename = "answer_text_"+question_answers["_id"]+fileExtension;
//                          var targetPath ="ui-public/themeimages/"+new_filename ;
//                          question_answers["media_optional"]["media_type"] = 0;
//                          question_answers["media_optional"]["media_name"] = new_filename ;
//                          question_answers["media_optional"]["media_src"] = "themeimages/"+new_filename;
//                          question_answers["media_optional"]["Media_directory"] = config.server_ip + "themeimages/"+new_filename;
//                          if( fs.existsSync(imagePath)){
//                            fs.rename( imagePath , targetPath , function (err) {
//                                //console.log(err);
//                            });
//                          }
//                       }else {
//                           question_answers["media_optional"]["Media_directory"] = req.body.media_src ;
//                           question_answers["media_optional"]["media_type"] = 1;
//                           question_answers["media_optional"]["media_name"] = req.body.media_src ;
//                           question_answers["media_optional"]["media_src"] = req.body.media_src ;
//
//
//
//
//
//                           /////////////////////>>>>
//                           // detect video type
//                           var video = req.body.media_src ;
//                           var videoType = null ;
//                           var videoId = null ;
//                           var video_src_value = null  ;
//                           if( video.toLowerCase().includes("youtube")    == true   ) {
//                             videoType = 0 ; // => youtube
//                             var idWithLastSplit = video.lastIndexOf('?');
//                             var videos = video.substr(idWithLastSplit + 1);
//                             var lastId = videos.substr(0, videos.indexOf('&'));
//
//                             if(lastId != '' || lastId )
//                               videoId = lastId ;
//                             else
//                               videoId = videos ;
//
//
//                             var afterEqualChar = videoId.lastIndexOf('=');
//                             videoId = videoId.substring(afterEqualChar + 1);
//
//                             video_src_value = "http://youtube.com/embed/"+ videoId ;
//                           }
//                           else if( video.includes("vimeo") == true   ) {
//                             videoType = 1 ; // => vimeo
//                             var n = video.lastIndexOf('/');
//                             videoId = video.substring(n + 1);
//                             video_src_value = "https://player.vimeo.com/video/"+ videoId ;
//                           }
//                           else if( video.includes(".mp4")  == true   ) {
//                             videoType = 2 ;
//                             videoId = null;
//
//                             var media_mp4 = req.body.media_src.substring(0, req.body.media_src.lastIndexOf('.'));
//                             question_answers ["media_optional"]["media_src"] = media_mp4 ;
//
//                           }
//                           question_answers ["media_optional"]["video_type"] = videoType;
//                           question_answers ["media_optional"]["video_id"] = videoId;
//                           question_answers ["media_optional"]["video_source"] = video_src_value ;
//
//
//
//
//
//
//
//                       }
//                      }
//                     /*--------------------------------------------------------- */
//               //  }
//
//                 if(qtnairsDocument.app_type == 1 ){
//                       if(req.body.is_correct != null )
//                           question_answers["is_correct"] = req.body.is_correct ;
//                 }
//           break ;
//           // --------------------------------------------------------------
//           case 1:
//
//               //  var exists_array = new Array();
//               //  if(req.body.media_type == null) {
//               //    exists_array[exists_array.length] = "media_type";
//               //  }
//                //
//               //  if(req.body.media_name == null) {
//               //    exists_array[exists_array.length] = "media_name";
//               //  }
//                //
//               //  if(req.body.media_src == null) {
//               //    exists_array[exists_array.length] = "media_src";
//               //  }
//                //
//               //  if(exists_array.length != 0 ){
//               //      return new Promise((resolve , reject) => {
//               //        res.send(notes.Messages.Required_Message(exists_array));
//               //      });
//               //  }
//
//               //  if( ! _.isInteger(req.body.media_type)  || req.body.media_type  > 1 ){
//               //     return new Promise((resolve , reject)=>{
//               //       res.send({"Message" : "This Value should be an integer value (0 or 1) 0 => for image type , 1 => for video type"});
//               //     });
//               //  }
//               question_answers["_id"] = mongoose.Types.ObjectId();
//               /*---------------------------------------------- medi type upload */
//
//               if(req.file_status != "undefine" && req.file_status == false){
//                   return new Promise((resolve , reject)=>{
//                      res.send(notes.Errors.Error_file_extension)
//                   });
//                }
//                if((req.file == '' || req.file == null) && req.body.media_src == null ){
//                     return new Promise((resolve , reject) => {
//                       res.send(notes.notifications.catch_fields (notes.Messages.Required_Message("media_src")));
//                     });
//                 }
//                if(req.body.media_src != null || req.file != null){
//
//                  if(req.file != null ){
//                      var imagePath =  req.file.path ;
//                      var fileExtension = path.extname(imagePath);
//                      var new_filename = "answer_media_"+question_answers["_id"]+fileExtension;
//                      var targetPath = "ui-public/themeimages/"+new_filename ;
//                      // rename this file
//                      question_answers["media_src"] = "themeimages/"+new_filename ;
//                      question_answers["media_type"] = 0 ;
//                      question_answers["media_name"] = new_filename   ;
//                      question_answers["Media_directory"] = config.server_ip + "themeimages/"+new_filename  ;
//
//
//                      if( fs.existsSync(imagePath)){
//                         fs.rename( imagePath , targetPath , function (err) {
//                                //console.log(err);
//                         });
//                      }
//                  }else {
//                    question_answers["media_src"] = req.body.media_src ;
//                    question_answers["media_type"] = 1 ;
//                    question_answers["media_name"] = req.body.media_src   ;
//                    question_answers["Media_directory"] =  req.body.media_src ;
//
//                    // detect video type
//                    var video = req.body.media_src
//                    var videoType = null ;
//                    var videoId = null ;
//                    var video_src_value = null ;
//                    if( video.toLowerCase().includes("youtube")    == true   ) {
//                      videoType = 0 ; // => youtube
//                      var idWithLastSplit = video.lastIndexOf('?');
//                      var videos = video.substr(idWithLastSplit + 1);
//                      var lastId = videos.substr(0, videos.indexOf('&'));
//
//                      if(lastId != '' || lastId )
//                        videoId = lastId ;
//                      else
//                        videoId = videos ;
//
//
//                      var afterEqualChar = videoId.lastIndexOf('=');
//                      videoId = videoId.substring(afterEqualChar + 1);
//                      video_src_value = "http://youtube.com/embed/"+ videoId ;
//                    }
//                    else if( video.includes("vimeo") == true   ) {
//                      videoType = 1 ; // => vimeo
//                      var n = video.lastIndexOf('/');
//                      videoId = video.substring(n + 1);
//                      video_src_value = "https://player.vimeo.com/video/"+ videoId;
//                    }
//                    else if( video.includes(".mp4")  == true   ) {
//                      videoType = 2 ;
//                      videoId = null;
//
//                      var media_mp4 = req.body.media_src.substring(0, req.body.media_src.lastIndexOf('.'));
//                      question_answers["media_src"] = media_mp4 ;
//
//                    }
//                    question_answers["video_type"] = videoType;
//                    question_answers["video_id"] = videoId;
//                    question_answers["video_source"] = video_src_value;
//
//                  }
//                }
//               /*---------------------------------------------- medi type upload */
//               if(qtnairsDocument.app_type == 1 ){
//                   if(req.body.is_correct != null )
//                   question_answers["is_correct"] = req.body.is_correct ;
//               }
//           break;
//           // --------------------------------------------------------------
//           case 2:
//
//           // ===> first time
//
//           var required_fields = [] ;
//             if(req.body.boolean_value == null)
//                 required_fields[boolean_value.length] = "boolean_value"
//             if(req.body.boolean_type == null)
//                 required_fields[boolean_type.length] = "boolean_type"
//
//               if(required_fields.length != 0){
//                   res.send(notes.notifications.catch_fields (notes.Messages.Required_Message(required_fields)));
//               }
//
//
//             question_answers["_id"] = mongoose.Types.ObjectId();
//             if (req.body.boolean_type != null )
//              question_answers["boolean_type"] = req.body.boolean_type ;
//
//              //if(qtnairsDocument.app_type != 0 ){
//
//                    if(req.body.boolean_value != null ){
//
//                            if(req.body.boolean_type == "true/false")
//                                  {
//                                      if(req.body.boolean_value == true)
//                                        {
//                                         question_answers["boolean_value"] = "True";
//
//                                        }else {
//                                           question_answers["boolean_value"] = "False";
//
//                                        }
//                                   }
//                             if(req.body.boolean_type == "yes/no")
//                                   {
//                                       if(req.body.boolean_value == true)
//                                         {
//                                           question_answers["boolean_value"] =  "Yes";
//                                         }
//                                         else
//                                         {
//                                           question_answers["boolean_value"] =  "No";
//                                         }
//                                   }
//                               }else {
//                                 return new Promise((resolve , reject )=>{
//                                     res.send(notes.Messages.Required_Message(["boolean_value"]));
//                                 });
//                               }
//                     //}
//                     // //console.log(question_answers);
//
//                      if(qtnairsDocument.app_type == 1 ){
//                        if(req.body.is_correct != null )
//                         question_answers["is_correct"] = req.body.is_correct ;
//                      }
//
//
//           break;
//           // --------------------------------------------------------------
//           case 3:
//
//                    if(qtnairsDocument.app_type != 0 ){
//                      return new Promise((resolve , reject)=>{
//                        res.send(notes.notifications.catch_fields("That's not Survey !" ));
//                      });
//                    }
//                    var required_scale = new Array();
//
//                     if(req.body.step_numbers == null )
//                         required_scale[required_scale.length] = "step_numbers";
//                     if(req.body.ratscal_type == null )
//                          required_scale[required_scale.length] = "ratscal_type";
//
//                     if(required_scale.length != 0 )
//                     {
//                         return new Promise((resolve , reject)=>{
//                           res.send(notes.notifications.catch_fields(notes.Messages.Required_Message(required_scale) ));
//                             // res.send(notes.Messages.Required_Message(required_scale));
//                         })
//                     }
//                         question_answers["_id"] = mongoose.Types.ObjectId();
//                         question_answers["ratscal_type"] = req.body.ratscal_type;
//                         question_answers["step_numbers"] = req.body.step_numbers ;
//
//                       if(req.body.ratscal_type != null && req.body.ratscal_type == 0) // => means that is scale type
//                         {
//                           if(req.body.show_labels != null )
//                               question_answers["show_labels"] = req.body.show_labels ;
//                           if(req.body.started_at != null )
//                               question_answers["started_at"] = req.body.started_at ;
//                           if(req.body.centered_at != null )
//                              question_answers["centered_at"] = req.body.centered_at
//                           if(req.body.ended_at != null )
//                             question_answers["ended_at"] = req.body.ended_at;
//                         }
//           break;
//             // --------------------------------------------------------------
//           case 4 :
//               if(qtnairsDocument.app_type != 0 ){
//                  return new Promise((resolve , reject)=>{
//                     res.send(notes.notifications.catch_fields("That's not Survey !" ));
//                  });
//               }
//           question_answers["_id"] = mongoose.Types.ObjectId();
//           break ; // Free Texts
//        }
//        }
//
//        var questionnaire_results ;
//       if(processType == 'create')
//          {
//            // Specificaiton for each answer
//            if(qtnairsDocument.app_type == 1 ){
//                if(req.body.is_correct == null )
//                {
//                    return new Promise(( resolve , reject ) => {
//                      res.send(notes.notifications.catch_fields(notes.Messages.Required_Message('is_correct') ));
//                    });
//                }
//             }
//
//
//
//            qtnairsDocument.questions[questionIndex].answers_format.push(question_answers);
//            ////console.log(qtnairsDocument.questions[questionIndex].answers_format);
//             questionnaire_results = question_answers ;
//          }
//
//       if(processType == 'edit')
//         {
//
//               if(!req.body.answer_id || req.body.answer_id == null ){
//                 return new Promise((resolve , reject)=>{
//                     // res.send(notes.Messages.Required_Message("answer_id"));
//                     res.send(notes.notifications.catch_fields(notes.Messages.Required_Message('answer_id') ));
//                 });
//               }
//               var answer_id = req.body.answer_id ;
//               var question_answers = qtnairsDocument.questions[questionIndex].answers_format;
//               //var answerss = _.filter(question_answers ,  x => x._id == answer_id)
//               var answerArgs = qtnairsDocument.questions[questionIndex].answers_format;
//               var foundAnswer = false ;
//               var answerIndex = '';
//               for(var i = 0 ; i < answerArgs.length ; i++ ){
//                 if(answer_id == answerArgs[i]._id){
//                   foundAnswer = true ;
//                   answerIndex = i ;
//                 }
//               }
//               if(foundAnswer == false){
//                 return new Promise((resolve , reject)=>{
//                     res.send(notes.notifications.catch_fields(notes.Messages.Error_Doesnt_exists('Answer') ));
//                 });
//               }
//
//               var question_type = qtnairsDocument.questions[questionIndex].question_type;
//
//               if(req.body.is_correct != null )
//               answerArgs[answerIndex].is_correct = req.body.is_correct;
//
//
//
//               // ====> Upload Our new directory
//               // it should be an image or video
//
//               // => choices text
//               if(question_type == 0) {
//                 //-------------------------------------> Updated part
//                 if(req.body.choices_value != null || !answerArgs[answerIndex].value)
//                     answerArgs[answerIndex].value = req.body.choices_value;
//
//                 if(req.file_status != "undefine" && req.file_status == false){
//                   return new Promise((resolve , reject)=>{
//                    res.send(notes.notifications.catch_fields(notes.Errors.Error_file_extension));
//                   });
//                 }
//                 if(req.body.media_src != null || req.file != null){
//
//                       if(!answerArgs[answerIndex].media_optional || answerArgs[answerIndex].media_optional == undefined )
//                         answerArgs[answerIndex].media_optional = new Object();
//
//                         if(req.file != null ){ // Image
//                           var imagePath =  req.file.path ;
//                           var fileExtension = path.extname(req.file.filename);
//                           var new_filename = "answer_text_"+answerArgs[answerIndex]._id+fileExtension;
//
//                           var targetPath ="ui-public/themeimages/"+new_filename ;
//                           answerArgs[answerIndex].media_optional.media_type = 0;
//                           answerArgs[answerIndex].media_optional.media_name  = new_filename ;
//                           answerArgs[answerIndex].media_optional.media_src = "themeimages/"+new_filename;
//                           answerArgs[answerIndex].media_optional.Media_directory  = config.server_ip + "themeimages/"+new_filename;
//
//                           if( fs.existsSync(imagePath)){
//                             fs.rename( imagePath , targetPath , function (err) {
//                                 //console.log(err);
//                             });
//                           }
//                        }else { // Video
//
//                          if( answerArgs[answerIndex].media_optional == null ||  answerArgs[answerIndex].media_optional == undefined )
//                           answerArgs[answerIndex].media_optional = new Object();
//
//                            answerArgs[answerIndex].media_optional["Media_directory"] = req.body.media_src ;
//                            answerArgs[answerIndex].media_optional["media_type"] = 1;
//                            answerArgs[answerIndex].media_optional["media_name"] = req.body.media_src ;
//                            answerArgs[answerIndex].media_optional["media_src"] = req.body.media_src ;
//
//                           var video =  req.body.media_src ; // heeer
//                           var videoType = null ;
//                           var videoId = null ;
//                           var video_src_value = null;
//                           if( video.toLowerCase().includes("youtube")    == true   ) {
//                             videoType = 0 ; // => youtube
//                             var idWithLastSplit = video.lastIndexOf('?');
//                             var videos = video.substr(idWithLastSplit + 1);
//                             var lastId = videos.substr(0, videos.indexOf('&'));
//
//                             if(lastId != '' || lastId )
//                               videoId = lastId ;
//                             else
//                               videoId = videos ;
//
//
//                             var afterEqualChar = videoId.lastIndexOf('=');
//                             videoId = videoId.substring(afterEqualChar + 1);
//                             video_src_value = "http://youtube.com/embed/"+ videoId ;
//                           } else if( video.includes("vimeo") == true   ) {
//                             videoType = 1 ; // => vimeo
//                             var n = video.lastIndexOf('/');
//                             videoId = video.substring(n + 1);
//                             video_src_value = "https://player.vimeo.com/video/"+ videoId;;
//                           }else if( video.includes(".mp4")  == true   ) {
//                             videoType = 2 ;
//                             videoId = null;
//                             video_src_value = null ;
//                             var media_mp4 = req.body.media_src.substring(0, req.body.media_src.lastIndexOf('.'));
//
//                               // question_tag ["media_question"]["media_src"] = media_mp4 ;
//                             if(answerArgs[answerIndex].media_optional == undefined || answerArgs[answerIndex].media_optional == null )
//                             answerArgs[answerIndex].media_optional = new Object();
//
//                             answerArgs[answerIndex].media_optional["mp4_option"] = new Object() ;
//                             answerArgs[answerIndex].media_optional["mp4_option"]["mp4_url"] = media_mp4 + '.mp4'
//                             answerArgs[answerIndex].media_optional["mp4_option"]["ogg_url"] = media_mp4 + '.ogg'
//                           }
//
//                           if(answerArgs[answerIndex].media_optional == undefined || answerArgs[answerIndex].media_optional == null )
//                           answerArgs[answerIndex].media_optional = new Object();
//
//
//                            // store new values
//                            answerArgs[answerIndex].media_optional["video_id"]   =  videoId ;
//                            answerArgs[answerIndex].media_optional["embed_path"] =  video_src_value;
//                            answerArgs[answerIndex].media_optional["video_type"] =  videoType ;
//
//
//
//                        }
//
//
//                 }
//                 //-------------------------------------
//               }
//               // //console.log("+++>>>+++>>> {-----} <<<<+++<<<++++");
//               // //console.log(answerArgs);
//               // //console.log("+++>>>+++>>> {-----} <<<<+++<<<++++");
//
//               // => media_choices
//               if(question_type == 1) {
//                 //-------------------------------------> Updated part
//                 if(req.body.choices_value != null || !answerArgs[answerIndex].value)
//                     answerArgs[answerIndex].value = req.body.choices_value;
//
//                 if(req.file_status != "undefine" && req.file_status == false){
//                   return new Promise((resolve , reject)=>{
//                    res.send(notes.notifications.catch_fields(notes.Errors.Error_file_extension));
//                   });
//                 }
//                 if(req.body.media_src != null || req.file != null){
//                       if(req.file != null ){ // Image
//                           var imagePath =  req.file.path ;
//                           var fileExtension = path.extname(req.file.filename);
//                           var new_filename = "answer_media_"+answerArgs[answerIndex]._id+fileExtension;
//
//                           var targetPath ="ui-public/themeimages/"+new_filename ;
//                           answerArgs[answerIndex].media_type = 0;
//                           answerArgs[answerIndex].media_name  = new_filename ;
//                           answerArgs[answerIndex].media_src = "themeimages/"+new_filename;
//                           answerArgs[answerIndex].Media_directory  = config.server_ip + "themeimages/"+new_filename;
//
//
//                           if( fs.existsSync(imagePath)){
//                             fs.rename( imagePath , targetPath , function (err) {
//                                 //console.log(err);
//                             });
//                           }
//                        }else { // Video
//
//                           var video =  req.body.media_src ; // heeer
//                           var videoType = null ;
//                           var videoId = null ;
//                           var video_src_value = null;
//
//                           if( video.toLowerCase().includes("youtube")    == true   ) {
//                             videoType = 0 ; // => youtube
//                             var idWithLastSplit = video.lastIndexOf('?');
//                             var videos = video.substr(idWithLastSplit + 1);
//                             var lastId = videos.substr(0, videos.indexOf('&'));
//
//                             if(lastId != '' || lastId )
//                               videoId = lastId ;
//                             else
//                               videoId = videos ;
//
//
//                             var afterEqualChar = videoId.lastIndexOf('=');
//                             videoId = videoId.substring(afterEqualChar + 1);
//                             video_src_value = "http://youtube.com/embed/"+ videoId ;
//                           }
//                           else if( video.includes("vimeo") == true   ) {
//
//                             videoType = 1 ; // => vimeo
//                             var n = video.lastIndexOf('/');
//                             videoId = video.substring(n + 1);
//                             video_src_value = "https://player.vimeo.com/video/"+ videoId;;
//                           }
//                           else if( video.includes(".mp4")  == true   ) {
//                             videoType = 2 ;
//                             videoId = null;
//                             // //console.log("MP4 ++++");
//                             var media_mp4 = req.body.media_src.substring(0, req.body.media_src.lastIndexOf('.'));
//
//                             // question_tag ["media_question"]["media_src"] = media_mp4 ;
//                             answerArgs[answerIndex].mp4_option = new Object() ;
//                             answerArgs[answerIndex].mp4_option["mp4_url"] = media_mp4 + '.mp4';
//                             answerArgs[answerIndex].mp4_option["ogg_url"] = media_mp4 + '.ogg';
//
//
//                           }
//
//                           answerArgs[answerIndex]["Media_directory"] = req.body.media_src ;
//                            answerArgs[answerIndex]["media_type"] = 1;
//                            answerArgs[answerIndex]["media_name"] = req.body.media_src ;
//                            answerArgs[answerIndex]["media_src"] = req.body.media_src ;
//                            answerArgs[answerIndex]["video_id"] = videoId ;
//                            answerArgs[answerIndex]["video_type"] = videoType ;
//                            answerArgs[answerIndex]["embed_path"] = video_src_value ;
//
//
//                           //  //console.log("----------------------");
//                           //  //console.log(answerArgs[answerIndex]);
//                           //  //console.log("----------------------");
//                        }
//                 }
//                 //-------------------------------------
//               }
//
//
//               // => boolean_choices
//               if(question_type == 2) {
//                 if(req.body.boolean_type)
//                   answerArgs[answerIndex].boolean_type = req.body.boolean_type;
//               }
//               // => rating_scales
//               if(question_type == 3) {
//                 if(req.body.show_labels)
//                   answerArgs[answerIndex].show_labels = req.body.show_labels ;
//                 if(req.body.ratscal_type)
//                     answerArgs[answerIndex].ratscal_type = req.body.ratscal_type;
//                 if(req.body.step_numbers)
//                     answerArgs[answerIndex].step_numbers = req.body.step_numbers;
//                 if(req.body.started_at)
//                     answerArgs[answerIndex].started_at = req.body.started_at;
//                 if(req.body.ended_at)
//                     answerArgs[answerIndex].ended_at = req.body.ended_at;
//               }
//               // => free texts
//               if(question_type == 4) {
//                 // Nothing here :D
//               }
//
//                 questionnaire_results = answerArgs[answerIndex] ;
//          }
//       if(processType == 'delete')
//         {
//               if(!req.body.answer_id || req.body.answer_id == null ){
//                 return new Promise((resolve , reject)=>{
//                     // res.send(notes.Messages.Required_Message("answer_id"));
//                     res.send(notes.notifications.catch_fields(notes.Messages.Required_Message("answer_id")));
//                 });
//               }
//               var answer_id = req.body.answer_id ;
//               var question_answers = qtnairsDocument.questions[questionIndex].answers_format;
//               //var answerss = _.filter(question_answers ,  x => x._id == answer_id)
//               var answerArgs = qtnairsDocument.questions[questionIndex].answers_format;
//               var foundAnswer = false ;
//               var answerIndex = '';
//               for(var i = 0 ; i < answerArgs.length ; i++ ){
//                 if(answer_id == answerArgs[i]._id){
//                   foundAnswer = true ;
//                   answerIndex = i ;
//                 }
//               }
//
//               if(foundAnswer == false){
//                 return new Promise((resolve , reject)=>{
//                     res.send(notes.notifications.catch_fields(notes.Messages.Error_Doesnt_exists("Answer")));
//                 });
//               }
//               // Delete image related this media part
//               var answer_object = answerArgs[answerIndex];
//               var question_item = qtnairsDocument.questions[questionIndex] ;
//               if(question_item.question_type == 1 ){
//                 // Delete image
//                 var image_directory = __dirname + "/../../ui-public/themeimages/" + answer_object.media_src
//                 if( fs.existsSync(image_directory ) ) {
//                   fs.unlink(image_directory , (err)=>{
//                     if(err) throw err ;
//                     //console.log("Deleted Image !");
//                   });
//                 }
//               }
//               if( question_item.question_type == 0 ){
//                 // Delete image
//                 if(answer_object.media_optional != null ){
//                     var image_directory = __dirname + "/../../ui-public/themeimages/" + answer_object.media_optional.media_src;
//                     if( fs.existsSync(image_directory ) ) {
//                       fs.unlink(image_directory , (err)=>{
//                         if(err) throw err ;
//                         //console.log("Deleted Image !");
//                       });
//                     }
//                 }
//               }
//               var delete_completed = _.pull(answerArgs , answerArgs[answerIndex]);
//               if(delete_completed){
//                 questionnaire_results = "This Answer ( "+answer_id+" ) is deleted successfully !";
//               }
//
//         }
//
//
//       qtnairsDocument.markModified("questions");
//       qtnairsDocument.save().then(()=>{
//         res.send(notes.notifications.success_calling(questionnaire_results));
//       }).catch((err)=>{
//         return new Promise((resolve , reject )=>{
//           res.send(notes.notifications.catch_errors ( err ));
//         });
//       });
//
//    }).catch((err)=>{
//      return new Promise((resolve, reject)=>{
//         res.send(notes.notifications.catch_errors ( err ));
//      });
//    });
//
// });
// // ==> retrieve data from questions
// // objects => styles | questions | retrieve | settings |
// qtnrRouters.post("/:app_id/application/:objects" , auth_verify_api_keys , (req ,res )=>{
//       var objects= req.params.objects ;
//       var user = req.verified_user;
//       var userType = req.is_creator;
//
//       var app_id = req.params.app_id ;
//
//       if (userType != 1) {
//            return new Promise((resolve, reject) => {
//               res.status(401).send(notes.notifications.permission_denied());
//           });
//       }
//
//
//       qtnr.findOne({ _id:app_id }).then( ( qtnairsDocument) => {
//
//          if (!qtnairsDocument){
//            return new Promise((resolve, reject)=>{
//               res.status(404).send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Application")));
//            });
//          }
//
//          if(qtnairsDocument.creator_id != user.id){
//            return new Promise((resolve , reject)=>{
//              res.send(notes.notifications.permission_denied());
//            });
//          }
//         var apps ;
//         if( objects == 'retrieve'){
//              apps = qtnairsDocument ;
//         }
//         if( objects == 'settings'){
//              apps = qtnairsDocument.settings ;
//         }
//         if( objects == 'questions'){
//           if(req.body.target_id != null ){
//             var isexists = _.findIndex(qtnairsDocument.questions , {"id":req.body.target_id});
//             if(isexists == -1 )
//               {
//                 return new Promise((resolve , reject)=>{
//                   res.status(404).send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Question")));
//                 });
//               }
//             apps =  _.find(qtnairsDocument.questions , {"id":req.body.target_id});
//           } else
//             apps = qtnairsDocument.questions ;
//         }
//         if( objects == 'stylesheets'){
//           if(req.body.target_id != null ){
//             var isexists = _.findIndex(qtnairsDocument.theme_style , { "file_name":  "styletheme_"+req.body.target_id+".css" });
//             // //console.log(isexists);
//             if(isexists == -1 )
//               {
//                 return new Promise((resolve , reject)=>{
//                   res.status(404).send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Stylesheet")));
//                 });
//               }
//             apps =  _.find(qtnairsDocument.theme_style , {"file_name":  "styletheme_"+req.body.target_id+".css"});
//           } else
//              apps = qtnairsDocument.theme_style ;
//         }
//
//        res.send(apps);
//         }).catch((error)=>{
//           return new Promise((resolve, reject)=>{
//             res.status(404).send(notes.notifications.catch_errors(error));
//           });
//        });
// });
// // ==> populate for attendee draft
// qtnrRouters.get("/:app_id/application/:objects" , auth_api_keys_only , (req ,res )=>{
//       var objects= req.params.objects ;
//       var app_id = req.params.app_id ;
//
//     qtnr.findOne({ _id:app_id }).populate('app_registry').exec( (error , qtnairsDocument) => {
//
//          if (!qtnairsDocument || error ){
//            return new Promise((resolve, reject)=>{
//               res.status(404).send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Application")));
//               return false ;
//            });
//          }
//
//         var apps ;
//         if( objects == 'retrieve'){
//              apps = qtnairsDocument ;
//
//         }
//         if( objects == 'settings'){
//              apps = qtnairsDocument.settings ;
//         }
//         if( objects == 'questions'){
//           if(req.body.target_id != null ){
//             var isexists = _.findIndex(qtnairsDocument.questions , {"id":req.body.target_id});
//             if(isexists == -1 )
//               {
//                 return new Promise((resolve , reject)=>{
//                   res.status(404).send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Question")));
//                   return false ;
//                 });
//               }
//             apps =  _.find(qtnairsDocument.questions , {"id":req.body.target_id});
//           } else
//             apps = qtnairsDocument.questions ;
//         }
//         if( objects == 'stylesheets'){
//           if(req.body.target_id != null ){
//             var isexists = _.findIndex(qtnairsDocument.theme_style , { "file_name":  "styletheme_"+req.body.target_id+".css" });
//             // //console.log(isexists);
//             if(isexists == -1 )
//               {
//                 return new Promise((resolve , reject)=>{
//                   res.status(404).send(notes.notifications.catch_errors(notes.Errors.Error_Doesnt_exists("Stylesheet")));
//                   return false ;
//                 });
//               }
//             apps =  _.find(qtnairsDocument.theme_style , {"file_name":  "styletheme_"+req.body.target_id+".css"});
//           } else
//              apps = qtnairsDocument.theme_style ;
//         }
//
//         // //console.log({
//         //   'cacac' : apps
//         // });
//        res.send(notes.notifications.success_calling(apps));
//        return false ;
//      });
//         /*
//         .catch((er)=>{
//           return new Promise((resolve, reject)=>{
//             res.status(404).send(notes.Errors.General_Error);
//           });
//         });
//         */
// });
// qtnrRouters.get("/:uid/applications" , authenticate_keys_with_curr_status ,  (req,res) => {
//
//   var userId= req.params.uid ;
//   // var user = req.verified_user;
//   // var userType = req.is_creator;
//
//   qtnr.find({  "creator_id": userId }).then((doc)=>{
//     if(!doc ){
//       return new Promise((resolve, reject) => {
//          res.status(404).send(notes.notifications.catch_errors('There are no any applications'));
//      });
//     }
//     res.send(notes.notifications.success_calling('doc'));
//   });
//
// });
//
// qtnrRouters.get("/applications/list" , auth_api_keys_only , (req , res )=>{
//   qtnr.find().populate("creator_id").exec((error , doc)=>{
//     if(!doc || error){
//       return new Promise((resolve, reject) => {
//          res.status(404).send(res.status(404).send(notes.notifications.catch_errors("There are no any applications")));
//         });
//     }
//     //console.log(doc);
//     res.send(notes.notifications.success_calling(doc));
//   });
//
// });
//











qtnrRouters.get("/:app_id/application/get/all"  , ( req , res )=>{
  var appId = req.params.app_id ;

  qtnr.findOne({ _id:appId }).populate('app_registry').exec( ( error , qtnairsDocument ) => {

    var application_object = new Object();

    if( application_object['question_ids'] == undefined )
      application_object['question_ids'] = new Object();

      if( application_object['answer_ids'] == undefined )
        application_object['answer_ids'] = new Object();


     for (var i = 0; i <= 200 ; i++) {
       application_object['question_ids']['id_'+i] =  mongoose.Types.ObjectId()
       application_object['answer_ids']['id_'+i] =  mongoose.Types.ObjectId()
     }


     if ( qtnairsDocument._id != undefined ) application_object['_id'] = qtnairsDocument._id ;
     if ( qtnairsDocument.settings != undefined ) application_object['settings'] = qtnairsDocument.settings ;
     if ( qtnairsDocument.theme_style != undefined ) application_object['theme_style'] = qtnairsDocument.theme_style ;
     if ( qtnairsDocument.creator_id != undefined ) application_object['creator_id'] = qtnairsDocument.creator_id ;
     if ( qtnairsDocument.app_type != undefined ) application_object['app_type'] = qtnairsDocument.app_type ;
     if ( qtnairsDocument.questionnaire_title != undefined ) application_object['questionnaire_title'] = qtnairsDocument.questionnaire_title ;
     if ( qtnairsDocument.description != undefined ) application_object['description'] = qtnairsDocument.description ;
     if ( qtnairsDocument.createdAt != undefined ) application_object['createdAt'] = qtnairsDocument.createdAt ;
     if ( qtnairsDocument.updatedAt  != undefined ) application_object['updatedAt'] = qtnairsDocument.updatedAt ;
     if ( qtnairsDocument.questions != undefined ) application_object['questions'] = qtnairsDocument.questions ;
     if ( qtnairsDocument.app_registry  != undefined ) application_object['app_registry'] = qtnairsDocument.app_registry ;
     if ( qtnairsDocument.app_report  != undefined ) application_object['app_report'] = qtnairsDocument.app_report ;
     if ( qtnairsDocument.att__draft != undefined ) application_object['att__draft'] = qtnairsDocument.att__draft ;
     if ( qtnairsDocument.stylesheet_properties != undefined ) application_object['stylesheet_properties'] = qtnairsDocument.stylesheet_properties ;
     if ( qtnairsDocument.theme_style != undefined ) application_object['theme_style'] = qtnairsDocument.theme_style ;


    res.json(application_object);
  });

});



qtnrRouters.post("/:app_id/:model/:question_id/cropping_system"  , question_answer_images.single("media_field") , ( req , res )=>{
  /*Params data*/
  //model
  //question_id
  /*body data*/
  //cropping_data model_type == 'answer'
  console.log("+++++++++++++++++++++++++++++++++++++++++++++++++");

  var model_type = req.params.model ;
  var appId = req.params.app_id ;
  var questionId = req.params.question_id;

  var file_path = 'ui-public/themeimages/';
  var file_name = '_' ;
  if( req.params.model == "question" )
    file_name =  "question_" + questionId

  var imagePath =  req.file.path ;
  var fileExtension = path.extname(imagePath);
  var new_filename = "question_"+questionId+fileExtension.toLowerCase();
  var new_file_path = file_path + new_filename ;
  var main_filename = req.file.originalname ;
  var main_file_path = file_path  + req.file.originalname ;

  // ==> Case it answer
  if(req.params.model == "answer"){
    if( req.body.answer_id == undefined )
      {
        res.send("answer_id is not defined");
        return false;
      }
      // answer_media_5b5f668678114e0ae9ce1ab0.png
      // answer_text_5b471f1d0bfbcc1d20c8232a.png
      // ==> File Path here
      file_name =  "answer_media_" + answer_id ;
      new_filename = "answer_media_"+answer_id+fileExtension.toLowerCase();
      new_file_path = file_path + new_filename ;

  }

  if(! fs.existsSync(main_file_path)){
    console.log("file Does not exists");
    res.send( { error : 'This file does not exits' });
    return false ;
  }

  if(req.body.width == undefined || req.body.height == undefined ||req.body.x == undefined || req.body.y == undefined)
    return false ;

    console.log("There is no issue at here ! +++++++++++++ ");
  var resizing = req.body.width + 'x' + req.body.height +'+'+ req.body.x +'+'+  req.body.y ;
  im.convert([ main_file_path ,'-crop', resizing , new_file_path ], function( err, stdout ){


    if (err) {
      console.log("ERR im -----");
      console.log(err);
      throw err;
    }
    var new_file_path_ = file_path + '___' +new_filename ;
    fs.rename( imagePath  , new_file_path_  , (err)=>{

       if(err) {
         console.log("ERR RENAME +++++");
         console.log(err);

         throw err} ;
     });
  });

  // ==> Saving Data
  qtnr.findOne({ _id:appId }).then( (   qtnairsDocument ) => {
      var questions = qtnairsDocument.questions ;
      var this_question = questions.find( x => x._id == questionId ) ;
      if(this_question != undefined ){
        if( model_type == 'question'){
          if( this_question.media_question == undefined )
          this_question['media_question'] = new Object();

          if(this_question.media_question.media_type == undefined )
          this_question.media_question['media_type'] = '';
          if(this_question.media_question.media_name == undefined )
          this_question.media_question['media_name'] = '';
          if(this_question.media_question.media_field == undefined )
          this_question.media_question['media_field'] = '';
          if(this_question.media_question.Media_directory == undefined )
          this_question.media_question['Media_directory'] = '';
          if(this_question.media_question.image_cropped == undefined )
          this_question.media_question['image_cropped'] = '';
          if(this_question.media_question.image_full == undefined )
          this_question.media_question['image_full'] = '';
          if(this_question.media_question.image_updated_date == undefined )
          this_question.media_question['image_updated_date'] = '';

          this_question.media_question['media_type'] = 0;
          this_question.media_question['media_name'] = new_filename
          this_question.media_question['media_field'] = new_file_path ;
          this_question.media_question['Media_directory'] = config.server_ip + 'themeimages/'+ new_filename;
          this_question.media_question['image_cropped'] = new_filename;
          this_question.media_question['image_full'] =   '___' +new_filename  ;
          this_question.media_question['image_updated_date'] = new Date();

        }else if( model_type == 'answer' ) {
          if(req.body.answer_id == undefined )
          {
            res.send("Undefined 'answer_id'");
            return false;
          }

          var answer_id = req.body.answer_id ;
          var this_answer = this_question.answers_format.find(x => x._id == answer_id );
          if(this_answer == undefined )
          {
            res.send("Undefined Answer !");
            return false ;
          }
          // ==> Media with text
          if(this_question.question_type == 0 ){
            if( this_answer.media_optional == undefined )
            this_answer['media_optional'] = new Object();

            if(this_answer.media_optional.media_name == undefined )
            this_answer.media_optional['media_name'] = ''

            if( this_answer.media_optional.media_type== undefined )
            this_answer.media_optional['media_type'] = '';

            if( this_answer.media_optional.Media_directory== undefined )
            this_answer.media_optional['Media_directory'] = '';

            if( this_answer.media_optional.image_cropped== undefined )
            this_answer.media_optional['image_cropped'] = '';

            if( this_answer.media_optional.image_full== undefined )
            this_answer.media_optional['image_full'] = '';

            if( this_answer.media_optional.image_updated_date== undefined )
            this_answer.media_optional['image_updated_date'] = '';


            this_answer.media_optional.media_name = new_filename;
            this_answer.media_optional.media_type= 0;
            this_answer.media_optional.Media_directory= config.server_ip + 'themeimages/'+ new_filename;;
            this_answer.media_optional.image_cropped= new_filename;
            this_answer.media_optional.image_full= '___' +new_filename  ;
            this_answer.media_optional.image_updated_date= new Date();


          }
          if( this_question.question_type == 1 ){

                if(this_answer.media_name == undefined )
                this_answer['media_name'] = ''

                if( this_answer.media_type== undefined )
                this_answer['media_type'] = '';

                if( this_answer.Media_directory== undefined )
                this_answer['Media_directory'] = '';

                if( this_answer.image_cropped== undefined )
                this_answer['image_cropped'] = '';

                if( this_answer.image_full== undefined )
                this_answer['image_full'] = '';

                if( this_answer.image_updated_date== undefined )
                this_answer['image_updated_date'] = '';


                this_answer.media_name = new_filename;
                this_answer.media_type= 0;
                this_answer.Media_directory= config.server_ip + 'themeimages/'+ new_filename;;
                this_answer.image_cropped= new_filename;
                this_answer.image_full= '___' +new_filename  ;
                this_answer.image_updated_date= new Date();

          }







        }
      }

      qtnairsDocument.markModified('questions');
      qtnairsDocument.save().then((data)=>{
        res.send( data );
      });
  });
  // console.log(req.body.media_dimentionals);
  // console.log(req.body.questions);
  // console.log(req.file);

});


qtnrRouters.post("/:app_id/add/:data"  , ( req , res ) => {
  var appId = req.params.app_id ;
  var dataColumns = req.params.data;
  var data = req.body.data ;

  qtnr.findOne({ _id:appId }).then( (   qtnairsDocument ) => {

    if(qtnairsDocument.questions == undefined )
    qtnairsDocument.questions = '';
    qtnairsDocument.questions = data ;
    qtnairsDocument.markModified('questions');
    qtnairsDocument.save().then(()=>{
      res.json( qtnairsDocument.questions );
    });
  });

});
module.exports = {
    qtnrRouters
};
