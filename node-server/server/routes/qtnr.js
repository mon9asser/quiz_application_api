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
qtnrRouters.get(["/init", "/create", "/:app_id/settings/create", "/:app_id/settings/themestyle"], verify_token_user_type, (req, res) => {
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
            res.status(401).send({
                error: apis.permission_denied
            });
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
            if (req.body.label_btns.lbl_start_with)
                $settings["settings.label_btns.start_with"] = req.body.label_btns.lbl_start_with;
            if (req.body.label_btns.lbl_continue_with)
                $settings["settings.label_btns.continue_with"] = req.body.label_btns.lbl_continue_with;
            if (req.body.label_btns.lbl_retake_with)
                $settings["settings.label_btns.retake_with"] = req.body.label_btns.lbl_retake_with;
            if (req.body.label_btns.lbl_review_with)
                $settings["settings.label_btns.review_with"] = req.body.label_btns.lbl_review_with;
        }
        if (req.body.randomize_settings) {
            $settings["settings.randomize_settings"] = req.body.randomize_settings;
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
// Stylesheet Settings ( process => edit / push) this mesthod required id of class name via req
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



    if (req.params.process == "push") {

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




module.exports = {
    qtnrRouters
};
