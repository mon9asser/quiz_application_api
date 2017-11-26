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
qtnrRouters.get(["/init", "/create", "/:app_id/settings/create" , "/:app_id/settings/themestyle"], verify_token_user_type, (req, res) => {
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
    res.send(apis.authorize_success);
});
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
    application.questionnaire.app_type = userType;
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
// creating from a to z
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
    req.body.settings = null;
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
            res.status(401).send({
                error: apis.permission_denied
            });
        });
    });

});
// Create settings for quiz or survey ( remember this part => surv/quiz )
qtnrRouters.patch("/:app_id/settings/create", verify_token_user_type, (req, res) => {
    var user = req.verified_user;
    var userType = req.verified_user_type;
    var token = req.verified_token;
    var app_id = req.params.app_id;
    var update_type = req.body.updateType;
    // this user should be a creator user !
    if (userType != 1) {
        console.log("ERROR 1");
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

            if (req.body.titles.start_with)
                $settings["settings.titles.start_with"] = req.body.titles.start_with;

            if (req.body.titles.end_with)
                $settings["settings.titles.end_with"] = req.body.titles.end_with;

            if (req.body.titles.success_with)
                $settings["settings.titles.success_with"] = req.body.titles.success_with;

            if (req.body.titles.faild_with)
                $settings["settings.titles.faild_with"] = req.body.titles.faild_with;

        }


        if (req.body.step_type)
            $settings["settings.step_type"] = req.body.step_type;


        if (req.body.grade_settings) {
            if (req.body.grade_settings.is_graded)
                $settings["settings.grade_settings.is_graded"] = req.body.grade_settings.is_graded;

            if (req.body.grade_settings.value)
                $settings["settings.grade_settings.value"] = req.body.grade_settings.value;
        }


        if (req.body.quiz_status) {
            if (req.body.quiz_status.attendee_id)
                $settings["settings.quiz_status.attendee_id"] = req.body.quiz_status.attendee_id;

            if (req.body.quiz_status.report_id)
                $settings["settings.quiz_status.report_id"] = req.body.quiz_status.report_id;

            if (req.body.quiz_status.stopped_at_time)
                $settings["settings.quiz_status.stopped_at_time"] = req.body.quiz_status.stopped_at_time;

            if (req.body.quiz_status.at_question_id)
                $settings["settings.quiz_status.at_question_id"] = req.body.quiz_status.at_question_id;

        }

        if (req.body.review_setting)
            $settings["settings.review_setting"] = req.body.review_setting;


        if (req.body.retake_setting)
            $settings["settings.retake_setting"] = req.body.retake_setting;


        if (req.body.navigation_btns)
            $settings["settings.navigation_btns"] = req.body.navigation_btns;

        if (req.body.label_btns) {
            if (req.body.label_btns.start_with)
                $settings["settings.label_btns.start_with"] = req.body.label_btns.start_with;
            if (req.body.label_btns.continue_with)
                $settings["settings.label_btns.continue_with"] = req.body.label_btns.continue_with;
            if (req.body.label_btns.retake_with)
                $settings["settings.label_btns.retake_with"] = req.body.label_btns.retake_with;
            if (req.body.label_btns.review_with)
                $settings["settings.label_btns.review_with"] = req.body.label_btns.review_with;
        }
        if (req.body.randomize_setting) {
            $settings["settings.randomize_setting"] = req.body.randomize_setting;
        }
        if (req.body.time_settings) {
            if (req.body.time_settings.is_with_time)
                $settings["settings.time_settings.is_with_time"] = req.body.time_settings.is_with_time;
            if (req.body.time_settings.value)
                $settings["settings.time_settings.value"] = req.body.time_settings.value;
            if (req.body.time_settings.timer_type)
                $settings["settings.time_settings.timer_type"] = req.body.time_settings.timer_type;
            if (req.body.time_settings.timer_layout)
                $settings["settings.time_settings.timer_layout"] = req.body.time_settings.timer_layout;
        }
        if (req.body.progression_bar) {
            if (req.body.progression_bar.is_available)
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
                    "error": apis.permission_denied
                });
            });
        });

    }).catch((err) => {
        return new Promise((resolve, reject) => {
            res.status(401).send({
                "error": apis.permission_denied
            });
        });
    });

});
// Create or Update Themestyle
qtnrRouters.patch(["/:app_id/settings/themestyle" , "/:app_id/settings/themestyle/:theme_id"], verify_token_user_type, (req, res) => {
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
      var pushed_objects = new Object();

      pushed_objects["id"] =  mongoose.Types.ObjectId() ;
      pushed_objects["stylesheet_name"] =  "theme_"+mongoose.Types.ObjectId() +".css" ;
      pushed_objects["is_active"] = true ;
      pushed_objects["class_name"] = "body,html" ;
      pushed_objects["source_code"] = [
        { background: ":red;" , color : ":green;"}
      ];
      var $themestyles ;

     // updated object with id in this array
      if(req.params.theme_id){
         if(req.body.quiz_theme_style.is_active) {

          }
      }

      console.log(pushed_objects);


    });
});

qtnrRouters.patch("/:app_id/edit", verify_token_user_type, (req, res) => {
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



});


module.exports = {
    qtnrRouters
};
