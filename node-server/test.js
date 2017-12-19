//=======================================
// ==> Add Reports ( Quiz part - Survey part) => 2 on 1
//=======================================
rptRouters.post(
    // app_type => quiz or survey
    "/:app_id/:attendee_id/attent/:app_type/:question_id/:answer_id", verify_token_user_type, (req, res) => {
        var app_type = req.params.app_type; // => quiz or survey
        var appliation_id = req.params.app_id;
        var attendee_id = req.params.attendee_id;
        var question_id = req.params.question_id;
        var answer_id = req.params.answer_id;
        var proccessType = req.params.proccess;
        var user_id = req.verified_user._id;
        var token = req.verified_token;
        var userType = req.verified_user_type;

        if (user_id != attendee_id) {
            return new Promise((resolve, reject) => {
                res.status(401).send({
                    "Message": apis.permission_denied
                });
            });
        }



        // Detect User type should be user attendee
        if (userType != 0) {
            return new Promise((resolve, reject) => {
                res.status(401).send({
                    "Message": "That's not user attendee !"
                });
            });
        }

        qtnr.findById(appliation_id, (error, qtnrDocument) => {

            if (!qtnrDocument) {
                return new Promise((resolve, reject) => {
                    res.status(401).send({
                        "Message": "This Questionnaire doesn't exists !"
                    });
                });
            }

            var updatedAt = new Date();
            // get current reattendees
            rpt.findOne({
                "questionnaire_id": qtnrDocument._id,
                "creator_id": qtnrDocument.creator_id
            }, (error, rptDocument) => {

                var attendee_object = new Object();
                attendee_object['_id'] = mongoose.Types.ObjectId();
                attendee_object['attendee_id'] = attendee_id;
                attendee_object['user_information'] = attendee_id;
                if (app_type == 'quiz')
                    attendee_object['is_completed'] = false;

                if (app_type == 'quiz')
                    attendee_object['passed_the_grade'] = false;

                if (app_type == 'quiz') {
                    attendee_object['results'] = {
                        wrong_answers: 0,
                        correct_answers: 0,
                        count_of_questions: 0,
                        result: {
                            percentage_value: 0,
                            raw_value: 0
                        }
                    };
                }

                attendee_object['survey_quiz_answers'] = [];
                attendee_object['created_at'] = new Date();
                attendee_object['updated_at'] = new Date();

                // Detect if question is exists or not
                var target_questionIndex = _.findIndex(qtnrDocument.questions, {
                    "id": question_id
                });

                if (target_questionIndex == -1) {
                    return new Promise((resolve, reject) => {
                        res.send("This Question id doesn't exists");
                    });
                }
                // Detect if Answer is exists or not
                var target_question = _.find(qtnrDocument.questions, {
                    "id": question_id
                });
                var all_answer_body = function(object) {
                    return object._id == answer_id;
                }

                var target_answer = target_question.answers_format.find(all_answer_body);
                if (!target_answer) {
                    return new Promise((resolve, reject) => {
                        res.send("This Answer id doesn't exists");
                    });
                }

                var reportObject = new Object();
                reportObject['questionnaire_id'] = qtnrDocument._id;
                reportObject['creator_id'] = qtnrDocument.creator_id;
                reportObject['app_type'] = qtnrDocument.app_type;
                reportObject['created_at'] = new Date();
                reportObject['updated_at'] = new Date();
                reportObject['attendees'] = new Array();

                if (qtnrDocument.app_type == 0) {
                    reportObject['statistics'] = new Array();
                }




                var survey_and_answers = new Object()
                survey_and_answers["_id"] = mongoose.Types.ObjectId();
                survey_and_answers["question_id"] = target_question._id;
                survey_and_answers["questions"] = new Object();
                survey_and_answers["questions"]["question_type"] = target_question.question_type;
                survey_and_answers["questions"]["question_id"] = target_question._id;
                // detect if question type same in answer type - skip some values
                // if (
                //     (
                //         target_question.question_type == 0 ||
                //         target_question.question_type == 1
                //     ) &&
                //     (
                //         qtnrDocument.app_type != 1
                //     )
                // ) {
                //     return new Promise((resolve, reject) => {
                //         res.status(406).send({
                //             "Message": "That's not quiz !"
                //         });
                //     });
                // }


                if (
                    (
                        target_question.question_type == 3 ||
                        target_question.question_type == 4
                    ) &&
                    (
                        qtnrDocument.app_type != 0
                    )
                ) {
                    return new Promise((resolve, reject) => {
                        res.status(406).send({
                            "Message": "That's not Survey !"
                        });
                    });
                }

                survey_and_answers["questions"]["question_body"] = target_question;
                survey_and_answers["answers"] = new Object();
                survey_and_answers["answers"]["answer_id"] = target_answer._id;
                var qs_data = _.findIndex(qtnrDocument.questions, {
                    'id': question_id
                });

                if (qtnrDocument.questions[qs_data].question_type == 4) {
                    if (req.body.free_text_value != null)
                        target_answer['free_text_value'] = req.body.free_text_value;
                    else {
                        if (qtnrDocument.questions[qs_data].question_is_required && qtnrDocument.questions[qs_data].question_is_required == true)
                            res.send({
                                "Message": "Answer Required !"
                            });
                    }
                } else if (qtnrDocument.questions[qs_data].question_type == 3) {
                    if (req.body.rating_scale_value != null)
                        target_answer['rating_scale_value'] = req.body.rating_scale_value;
                    if (qtnrDocument.questions[qs_data].question_is_required && qtnrDocument.questions[qs_data].question_is_required == true)
                        res.send({
                            "Message": "Answer Required !"
                        });
                } else if (qtnrDocument.questions[qs_data].question_type == 2) {
                    if (req.body.true_false_value != null) {
                        if (req.body.true_false_value == false && target_answer.boolean_type == "yes/no")
                            target_answer['true_false_value'] = "No";
                        else if (req.body.true_false_value == true && target_answer.boolean_type == "yes/no")
                            target_answer['true_false_value'] = "Yes";
                        else if (req.body.true_false_value == true && target_answer.boolean_type == "true/false")
                            target_answer['true_false_value'] = true;
                        else if (req.body.true_false_value == false && target_answer.boolean_type == "true/false")
                            target_answer['true_false_value'] = false;
                        console.log(target_answer['true_false_value']);
                    }


                    if (qtnrDocument.questions[qs_data].question_is_required && qtnrDocument.questions[qs_data].question_is_required == true)
                        res.send({
                            "Message": "Answer Required !"
                        });
                    console.log(target_answer);
                }


                survey_and_answers["answers"]["answer_body"] = target_answer;
                if (qtnrDocument.app_type == 1)
                    survey_and_answers["is_correct"] = target_answer.is_correct;
                survey_and_answers['created_at'] = new Date();


                var helper = new Object();
                helper["attendee_id"] = attendee_id;
                helper["user_information"] = attendee_id;
                if (!rptDocument) {
                    // +++++++++++++++++++++++++++++++++++++++++++++++ Add New
                    // Basics
                    var reporting = new rpt(reportObject);
                    reporting.save()
                        .then((reports) => {
                            // Saving the attendees
                            return reporting.create_attendees(attendee_object);
                        })
                        .then((attendee_arguments) => {
                            // Saving the answers and question
                            return reporting.create_survey_quiz_answers(helper, survey_and_answers);
                        }).then((attendee_user) => {
                            // Calculation
                            if (qtnrDocument.app_type == 1)
                                return reporting.quiz_calculation(attendee_user, qtnrDocument);

                        }).then((returned) => {
                            if (qtnrDocument.app_type == 1)
                                res.send(returned);
                        }).then(() => {
                            res.send(reports)
                        })
                        .catch((err) => {
                            return new Promise((resolve, reject) => {
                                res.send(err);
                            });
                        });
                } else {
                    // +++++++++++++++++++++++++++++++++++++++++++++++ Update
                    rptDocument.updated_at = new Date();
                    rptDocument.save().then(() => {
                            // create attendee
                            return rptDocument.create_attendees(attendee_object);
                        }).then((attendee_arguments) => {
                            // Questions and answers
                            return rptDocument.create_survey_quiz_answers(helper, survey_and_answers);
                        }).then((attendee_user) => {
                            // Calculation
                            return rptDocument.quiz_calculation(attendee_user, qtnrDocument);
                        }).then((returned) => {
                            res.send(rptDocument);
                        })
                        .catch((err) => {
                            return new Promise((resolve, reject) => {
                                res.send(err);
                            });
                        });

                }

            })

        }).catch((err) => {
            return new Promise((resolve, reject) => {
                res.send(err);
            });
        });

    });




//-----------------------------------------------------------------------------------------------------




rptRouters.post([
    // filters => attendee_id , question_id || array contained some specified indexes
    // report_type => brief  ( quiz - survey ) | detailed  ( quiz - survey ) | statistics ( survey only )
    "/:creator_id/:report_type/report", // => all questionnaires
    "/:creator_id/:app_type/:report_type/report"
], can_i_access_that, (req, res) => {
    // Basic Params
    var creator_id = req.params.creator_id;
    var report_type = req.params.report_type;
    var queries = new Object();
    queries["creator_id"] = creator_id;

    // Determined app type
    if (req.body.date) {
        if (req.body.date.date_from != null && req.body.date.date_to != null) {
            var query_range = new Object();
            // if( report_type == 'detailed' ){
            //    queries["$and"] = new Array();
            //     query_range  = {
            //         "attendees.created_at": {
            //             "$gte": req.body.date.date_from,
            //             "$lt": req.body.date.date_to
            //         }
            //     }
            //     queries["$and"].push(query_range);
            //  }
            if (report_type == 'brief') {

                query_range = {
                    "created_at": {
                        "$gte": new Date(req.body.date.date_from),
                        "$lt": new Date(req.body.date.date_to)
                    }
                }
                queries = query_range;
            }

        }
    }
    // Determined app type
    if (req.params.app_type) {
        queries["app_type"] = (req.params.app_type == 'quiz') ? 1 : 0;
        if (report_type == "statistics")
            queries["app_type"] = 0; // survey type
    }
    if (req.body.filters) {

        if (req.body.filters.application_id) {
            queries["questionnaire_id"] = req.body.filters.application_id;
        }
    }
    console.log(queries);
    rpt.find(queries).
    populate("questionnaire_id").
    populate("attendees.user_information").
    exec((error, reportDocument) => {
        if (!reportDocument) {
            return new Promise((resolve, reject) => {
                res.status(404).send("This report doesn't exists");
            });
        }

        //   res.send(reportDocument);
        // return false ;
        var appviews, attendee_curr_page, attendee_records_inpu, current_result, applications, applicationPageNumber, object_user_attent;
        var user_attensees_lists = new Array();
        // Detaild Reports ( Quiz - Survey )
        if (req.body.filters != null && report_type == "detailed") {
            // Check about the pagination of application
            if (req.body.filters.paginations == null && req.body.filters.attendee_id == null) {
                return new Promise((resolve, reject) => {
                    res.status(404).send({
                        "Message": "Pagination is required !"
                    })
                });
            } // end pagination detection


            var pagin_is_found = false;
            if (req.body.filters.paginations != null) {
                if (req.body.filters.paginations.attendees != null && req.body.filters.attendee_id != null)
                    pagin_is_found = true;
                else pagin_is_found = false;
            } else {
                if (req.body.filters.attendee_id != null)
                    pagin_is_found = false;
            }
            if (pagin_is_found == true) {
                return new Promise((resolve, reject) => {
                    res.status(404).send({
                        "Message": "That's a specified user ! you can't use pagination option with !"
                    });
                });
            }

            current_result = reportDocument;


            //  console.log(current_result);
            for (var i = 0; i < current_result.length; i++) {
                if (req.body.filters.attendee_id != null) // return one attendee
                {
                    var attendee = _.find(current_result[i].attendees, {
                        "attendee_id": req.body.filters.attendee_id
                    });
                    var attendeeIndex = _.findIndex(current_result[i].attendees, {
                        "attendee_id": req.body.filters.attendee_id
                    });
                    object_user_attent = new Object();
                    object_user_attent['attendee_information'] = {
                        "id": current_result[i].attendees[attendeeIndex].user_information._id,
                        "name": current_result[i].attendees[attendeeIndex].user_information.name,
                        "email": current_result[i].attendees[attendeeIndex].user_information.email
                    };
                    object_user_attent['app_name'] = current_result[i].questionnaire_id.questionnaire_title;
                    object_user_attent['app_id'] = current_result[i].questionnaire_id._id;
                    object_user_attent['total_questions'] = current_result[i].attendees[attendeeIndex].survey_quiz_answers.length
                    object_user_attent['completed_date'] = current_result[i].attendees[attendeeIndex].updated_at;

                    if (current_result[i].questionnaire_id.app_type != 0) {
                        object_user_attent['pass_mark'] = current_result[i].attendees[attendeeIndex].passed_the_grade;
                        object_user_attent['correct_answers'] = current_result[i].attendees[attendeeIndex].results.correct_answers;
                        object_user_attent['score'] = current_result[i].attendees[attendeeIndex].results.result.percentage_value + "%";
                        if (current_result[i].questionnaire_id.settings.grade_settings.is_graded == true) {
                            if (current_result[i].attendees[attendeeIndex].results.result.percentage_value >= current_result[i].questionnaire_id.settings.grade_settings.value)
                                object_user_attent['status'] = "Passed";
                            else
                                object_user_attent['status'] = "Failed";

                            if (req.body.filters.questions == true) { // HERE
                                // => question part
                                object_user_attent['question'] = new Array();
                                var survey_questions = attendee.survey_quiz_answers
                                for (var i = 0; i < survey_questions.length; i++) {
                                    object_user_attent['question'].push({
                                        "question": survey_questions[i].questions.question_body.question_body,
                                        "is_correct": survey_questions[i].is_correct,
                                        "answer": survey_questions[i].answers.answer_body
                                    });
                                }
                            }
                        }
                    }
                    object_user_attent;
                }
            }

            if (req.body.filters.attendee_id != null)
                appviews = object_user_attent;

            else if (req.body.filters.paginations.attendees != null || req.body.filters.attendee_id == null) {
                if (req.body.filters.paginations.attendees == null) {
                      return new Promise((resolve, reject) => {
                          res.status(404).send(notes.Messages.Required_Message("Pagination of attendees"));
                      });

                      var required_fields_ = new Array();
                      if(req.body.filters.paginations.attendees.page_number == null){
                        required_fields_[required_fields_.length] = "page_number";
                      }
                      if(req.body.filters.paginations.attendees.records_per_page == null){
                        required_fields_[required_fields_.length] = "records_per_page";
                      }

                      if (required_fields_.length != 0 ) {
                          return new Promise((resolve, reject) => {
                              res.status(404).send(notes.Messages.Required_Message(required_fields_));
                          });
                      }
                  }

                attendee_records_inpu = req.body.filters.paginations.attendees.records_per_page;
                var attendee_curr_page = req.body.filters.paginations.attendees.page_number;

                for (var i = 0; i < current_result.length; i++) {

                    var curr_attendee = current_result[i].attendees;
                    var attendee_records = _.chunk(curr_attendee, attendee_records_inpu);

                    if (attendee_curr_page < 0 || !_.isNumber(attendee_curr_page) || attendee_curr_page == 1)
                        attendee_curr_page = 0;
                    else if (attendee_curr_page != 0)
                        attendee_curr_page = attendee_curr_page - 1;


                    var record_current_page = attendee_records[attendee_curr_page];

                    if (!record_current_page) {
                        return new Promise((resolve, reject) => {
                            res.status(404).send({
                                "Message": "There are no attendees else !"
                            });
                        });
                    }
                    // console.log(attendee_records_inpu);
                    // return false; 

                    for (var x = 0; x < record_current_page.length; x++) {


                        var user_attensees = new Object();
                        user_attensees["attendee_information"] = {
                            "name": record_current_page[x].user_information.name,
                            "email": record_current_page[x].user_information.email,
                            "_id": record_current_page[x].user_information._id
                        };

                        user_attensees["total_questions"] = record_current_page[x].survey_quiz_answers.length;
                        user_attensees["completed_date"] = record_current_page[x].updated_at;
                        if (current_result[i].questionnaire_id.app_type != 0) {
                            user_attensees['pass_mark'] = record_current_page[x].passed_the_grade;
                            user_attensees['correct_answers'] = record_current_page[x].results.correct_answers;
                            user_attensees['score'] = record_current_page[x].results.result.percentage_value + "%";
                            if (current_result[i].questionnaire_id.settings.grade_settings.is_graded) {
                                if (record_current_page[x].results.result.percentage_value >= current_result[i].questionnaire_id.settings.grade_settings.value) {
                                    user_attensees['status'] = "Passed";
                                } else user_attensees['status'] = "Failed";

                                if (req.body.filters.questions == true) {
                                    user_attensees['question'] = new Array();
                                    var survey_questions = record_current_page[x].survey_quiz_answers;
                                    for (var w = 0; w < survey_questions.length; w++) {
                                        user_attensees['question'].push({
                                            "question": survey_questions[w].questions.question_body.question_body,
                                            "is_correct": survey_questions[w].is_correct,
                                            "answer": survey_questions[w].answers.answer_body
                                        });
                                    }
                                }
                            }
                        }
                        /*
                           var dateFrom = "02/05/2013";
                           var dateTo = "02/09/2013";
                           var dateCheck = "02/07/2013";

                           var d1 = dateFrom.split("/");
                           var d2 = dateTo.split("/");
                           var c = dateCheck.split("/");

                           var from = new Date(d1[2], parseInt(d1[1])-1, d1[0]);  // -1 because months are from 0 to 11
                           var to   = new Date(d2[2], parseInt(d2[1])-1, d2[0]);
                           var check = new Date(c[2], parseInt(c[1])-1, c[0]);

                           console.log(check > from && check < to)
                        */
                        if (req.body.date != null) {
                            if (req.body.date.date_from != null && req.body.date.date_to != null) {
                                /*
                                req.body.date.date_from
                                req.body.date.date_to
                                record_current_page[x].created_at
                                */
                                var from = new Date(req.body.date.date_from);
                                var to = new Date(req.body.date.date_to);
                                var date_passed = new Date(record_current_page[x].created_at);

                                if (date_passed >= from && date_passed <= to) {
                                    user_attensees_lists.push(user_attensees);
                                }
                            } else
                                user_attensees_lists.push(user_attensees);
                        } else
                            user_attensees_lists.push(user_attensees);

                    } // end loop of attendees
                    // => set pagination for new array
                    var detailed_report_object = new Object();
                    detailed_report_object["app_name"] = current_result[i].questionnaire_id.questionnaire_title;
                    detailed_report_object["app_id"] = current_result[i].questionnaire_id._id;
                    detailed_report_object["attendees"] = user_attensees_lists;
                    appviews = detailed_report_object;
                }
            }
            /*
            @Montasser report is almost ok for us, can we pass quiz(application) id   in filter for getting report for a particular quiz
            Suggestion : app_name & app_id can be moved out from attendee  details so that we can avoid repetition of these item along with each user
            */
        } // end Filters here !!
        else if (report_type == 'brief') {
            var brief_array = new Array();


            if (req.body.filters.paginations.application == null) {
                return new Promise((resolve, reject) => {
                    res.send({
                        "Message": "pagination.application fields are required"
                    });
                });

                if (!req.body.filters.paginations.application.page_number || !req.body.filters.paginations.application.records_per_page) {
                    res.send({
                        "Message": "Make sure application.page_number and application.records_per_page are available !"
                    });
                    return false;
                }

            }
            var pages = req.body.filters.paginations.application.records_per_page;
            var page_number = req.body.filters.paginations.application.page_number;

            if (!_.isNumber(page_number))
                page_number = 0;

            var document_reports = _.chunk(reportDocument, pages);
            if (page_number == 1)


                if (page_number < 0 || !_.isNumber(page_number) || page_number == 1)
                    page_number = 0;
                else if (page_number != 0)
                page_number = page_number - 1;

            if (page_number >= document_reports.length) {
                page_number = (document_reports.length - 1);
            }

            var document_brief = document_reports[page_number];


            for (var brief = 0; brief < document_brief.length; brief++) {
                var brief_object = new Object();
                var total_passed = _.countBy(document_brief[brief].attendees, {
                    'passed_the_grade': true
                });
                var total_is_completed = _.countBy(document_brief[brief].attendees, {
                    'is_completed': true
                });
                var total_is_completed = _.countBy(document_brief[brief].attendees, {
                    'is_completed': true
                });
                // var average_score = _.  / document_brief[brief].attendees.length ;
                var total_is_completed_count = _.countBy(document_brief[brief].attendees, 'results.correct_answers');

                brief_object["app_name"] = document_brief[brief].questionnaire_id.questionnaire_title;
                brief_object["app_id"] = document_brief[brief].questionnaire_id._id;
                brief_object["app_type"] = (document_brief[brief].app_type == 1) ? "Quiz" : "Survey";
                brief_object["total_questions"] = document_brief[brief].questionnaire_id.questions.length;
                brief_object["total_attendees"] = document_brief[brief].attendees.length;

                brief_object["total_passed"] = total_passed.true;
                brief_object["total_completed"] = total_is_completed.true;

                // brief_object["average_score"]=reducer ;// document_brief[brief].questionnaire_id.questions.length / ( document_brief[brief].attendees.length );
                brief_array.push(brief_object);
            }


            appviews = brief_array;
        } else if (report_type == 'statistics') { // => for Survey

            if (req.body.filters.application_id == null) {
                return new Promise((resolve, reject) => {
                    res.send({
                        "Message": "filters.appliation_id required !"
                    })
                });
            }
            // => reportDocument[0] ;
            var statistics_report = new Object();

            statistics_report["survey_id"] = reportDocument[0].questionnaire_id._id;
            statistics_report["survey_name"] = reportDocument[0].questionnaire_id.questionnaire_title;
            statistics_report["total_attendees"] = reportDocument[0].attendees.length;
            var statistics = reportDocument[0].statistics;
            var questions_answers = new Array();
            for (var i = 0; i < statistics.length; i++) {
                var qs_object = new Object();
                qs_object['question_id'] = statistics[i].question_id;
                qs_object['question'] = statistics[i].question_body;
                qs_object['count_of_attendees'] = statistics[i].attendee_count;
                qs_object['answers'] = new Array();
                var answer_args = statistics[i].question_answers
                for (var xi = 0; xi < answer_args.length; xi++) {
                    var answer_argument = new Object();
                    answer_argument['answer_id'] = answer_args[xi].answer_id;
                    answer_argument['answer_body'] = answer_args[xi].answer_body;
                    answer_argument['attendees'] = answer_args[xi].statistics_in_raw + " (" + _.parseInt(answer_args[xi].statistics_in_percentage) + "%" + ")";
                    qs_object['answers'].push(answer_argument);
                }

                questions_answers.push(qs_object);
            }


            statistics_report["questions"] = questions_answers;
            appviews = statistics_report
        }
        res.send(appviews);
    });
});




//-----------------------------------------------------------------------------------------------------


var date_made = function() {
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    return newdate = year + "/" + month + "/" + day;
};
console.log(date_made());

//-----------------------------------------------------------------------------------------------------

rptRouters.post("/:app_id/:proccess/report", verify_token_user_type, (req, res) => {
    var requests = new Object();
    var required_fields = new Array();

    if (req.body.attendee_id == null)
        required_fields[required_fields.length] = "attendee_id";
    if (req.body.question_id == null)
        required_fields[required_fields.length] = "question_id";
    if (req.body.answer_ids == null)
        required_fields[required_fields.length] = "`answer_ids` Array"




    var user_id = req.verified_user._id;
    var token = req.verified_token;
    var userType = req.verified_user_type;
    var appliation_id = req.params.app_id;
    var attendee_id = req.body.attendee_id;

    if (userType != 0) {
        return new Promise((resolve, reject) => {
            res.send(notes.Warnings.Permission_Warning);
        });
    }

    if (required_fields.length != 0) {
        return new Promise((resolve, reject) => {
            res.send(notes.Messages.Required_Message(required_fields));
        });
    }

    if (user_id != attendee_id) {
        return new Promise((resolve, reject) => {
            res.send(notes.Warnings.Permission_Warning);
        });
    }

    if (!_.isArray(req.body.answer_ids)) {
        return new Promise((resolve, reject) => {
            res.send({
                "Warning": "This field 'answer_ids' should be an array !"
            });
        });
    }


    var question_id = req.body.question_id;
    var answer_ids = req.body.answer_ids;

    qtnr.findById(appliation_id, (error, qtnrDocument) => {

        if (!qtnrDocument) {
            return new Promise((resolve, reject) => {
                res.send(notes.Errors.Error_Doesnt_exists("Application"));
            });
        }

        var updatedAt = new Date();

        rpt.findOne({
            "questionnaire_id": qtnrDocument._id,
            "creator_id": qtnrDocument.creator_id
        }, (error, rptDocument) => {
            var attendee_object = new Object();
            attendee_object['_id'] = mongoose.Types.ObjectId();
            attendee_object['attendee_id'] = attendee_id;
            attendee_object['user_information'] = attendee_id;
            attendee_object['is_completed'] = false;
            if (qtnrDocument.app_type == 1) {
                attendee_object['passed_the_grade'] = false;
                attendee_object['results'] = new Object();
                attendee_object['results']['wrong_answers'] = 0;
                attendee_object['results']['correct_answers'] = 0;
                attendee_object['results']['count_of_questions'] = 0;
                attendee_object['results']['result'] = new Object();
                attendee_object['results']['result']['percentage_value'] = 0;
                attendee_object['results']['result']['raw_value'] = 0;
            }


            attendee_object['survey_quiz_answers'] = [];
            attendee_object['created_at'] = new Date();
            attendee_object['updated_at'] = new Date();

            // Detect if question is exists or not
            var target_questionIndex = _.findIndex(qtnrDocument.questions, {
                "id": question_id
            });

            if (target_questionIndex == -1) {
                return new Promise((resolve, reject) => {
                    res.send(notes.Errors.Error_Doesnt_exists("Question"));
                });
            }


            var target_question = _.find(qtnrDocument.questions, {
                "id": question_id
            });

            var survey_and_answers = new Object()
            survey_and_answers["_id"] = mongoose.Types.ObjectId();
            survey_and_answers["question_id"] = target_question._id;
            survey_and_answers["questions"] = new Object();
            survey_and_answers["questions"]["question_type"] = target_question.question_type;
            survey_and_answers["questions"]["question_id"] = target_question._id;

            var answers_object = target_question.answers_format;

            var answer_status = new Object();
            for (var i = 0; i < answer_ids.length; i++) {
                var answerIds = answer_ids[i];
                try {
                    var finderAns = _.findIndex(target_question.answers_format, {
                        "_id": ObjectId(answerIds)
                    });
                    if (finderAns == -1) {
                        return new Promise((resolve, reject) => {
                            res.send(notes.Errors.Error_Doesnt_exists("Answer in index (" + i + ")"));
                        });
                    } else {
                        // ==> Here are right ids ( end to end )
                        if (target_question.answer_settings != null && target_question.answer_settings == false) {
                            // Multi Answers !
                            answer_status['answers'] = {

                            };
                        } else {
                            // Single answer

                        }
                    }
                } catch (e) {
                    return new Promise((resolve, reject) => {
                        res.send(notes.Errors.Error_Doesnt_exists("Answer in index (" + i + ")"));
                    });
                }

            }


        }); // End Report
    }); // End Questionnaire

});




// FUNCTIONS

//--------------------------------------------------------------
reportSchema.methods.create_attendees = function(attendee_args) {
    var thisReport = this;
    var attendee_arguments = this;
    var attendee = _.findIndex(thisReport.attendees, {
        'attendee_id': attendee_args.attendee_id
    });
    //  var attendee_arguments = _.find(thisReport.attendees, { 'attendee_id': attendee_args.attendee_id  });
    if (attendee == -1) {

        thisReport.attendees.push(attendee_args);

        return thisReport.save().then((attendee_arguments) => {
            var attendeeIndex = _.findIndex(attendee_arguments.attendees, {
                'attendee_id': attendee_args.attendee_id
            });
            return attendee_arguments.attendees[attendeeIndex];
        });
    } else {
        return attendee_arguments.attendees[attendee];
    }

};

reportSchema.methods.create_survey_quiz_answers = function(helper, survey_quiz_answers_args) {
    var thisReport = this;
    var attendee_user = new Object();
    var attendeeIndex = _.findIndex(thisReport.attendees, {
        'attendee_id': helper.attendee_id
    });

    if (attendeeIndex != -1){
        var attendeeApp = _.find(thisReport.attendees, {
            'attendee_id': helper.attendee_id
        });

        var question_exists = _.findIndex(thisReport.attendees[attendeeIndex].survey_quiz_answers, {
            "question_id": survey_quiz_answers_args.question_id
        })

        if (question_exists == -1) {
            /*
             Saving statistic report
             =============================== >> Here
            */

            if (thisReport.app_type == 0) {
                var statisticIndex = _.findIndex(thisReport.statistics, {
                    "question_id": survey_quiz_answers_args.question_id
                });
                console.log(" Is this qs here : " + statisticIndex);
                if (statisticIndex == -1) {
                    // Add new Question
                    var question_status = new Object();
                    question_status['question_id'] = survey_quiz_answers_args.question_id;
                    question_status['question_body'] = survey_quiz_answers_args.questions.question_body.question_body;
                    question_status['question_answers'] = new Array();
                    question_status['attendee_count'] = 1;

                    switch (survey_quiz_answers_args.questions.question_type) {

                        case 0:
                            question_status['question_answers'].push({
                                "answer_id": survey_quiz_answers_args.answers.answer_body._id,
                                "answer_body": survey_quiz_answers_args.answers.answer_body.value,
                                "statistics_in_percentage": 100,
                                "statistics_in_raw": 1,
                            });
                            break;

                        case 1:
                            question_status['question_answers'].push({
                                "answer_id": survey_quiz_answers_args.answers.answer_body._id,
                                "answer_body": survey_quiz_answers_args.answers.answer_body.media_dir,
                                "statistics_in_percentage": 100,
                                "statistics_in_raw": 1,
                            });
                            break;

                        case 2:
                            question_status['question_answers'].push({
                                "answer_id": survey_quiz_answers_args.answers.answer_body._id,
                                "answer_body": survey_quiz_answers_args.answers.answer_body.true_false_value,
                                "statistics_in_percentage": 100,
                                "statistics_in_raw": 1,
                            });
                            break;

                        case 3:
                            question_status['question_answers'].push({
                                "answer_id": survey_quiz_answers_args.answers.answer_body._id,
                                "answer_body": survey_quiz_answers_args.answers.answer_body.rating_scale_value,
                                "statistics_in_percentage": 100,
                                "statistics_in_raw": 1,
                            });
                            break;

                        case 4:
                            question_status['question_answers'].push({
                                "answer_id": survey_quiz_answers_args.answers.answer_body._id,
                                "statistics_in_percentage": 100,
                                "statistics_in_raw": 1,
                            });
                            break;

                    }

                    thisReport.statistics.push(question_status);
                } else {
                    // update the-existing Question > answer
                    var answers = thisReport.statistics[statisticIndex].question_answers;

                    switch (survey_quiz_answers_args.questions.question_type) {

                        case 0:
                            var questionAnsIndex = _.findIndex(answers, {
                                "answer_body": survey_quiz_answers_args.answers.answer_body.value
                            });
                            var questionAnswers = _.find(answers, {
                                "answer_body": survey_quiz_answers_args.answers.answer_body.value
                            });
                            if (questionAnsIndex == -1) {
                                var question_status = {
                                    "answer_id": survey_quiz_answers_args.answers.answer_body._id,
                                    "answer_body": survey_quiz_answers_args.answers.answer_body.value,
                                    "statistics_in_percentage": (1 * 100 / (thisReport.attendees.length)),
                                    "statistics_in_raw": 1,
                                };
                                answers.push(question_status);
                            } else {
                                answers[questionAnsIndex].statistics_in_raw = answers[questionAnsIndex].statistics_in_raw + 1;
                                answers[questionAnsIndex].statistics_in_percentage = ((answers[questionAnsIndex].statistics_in_raw) * 100) / thisReport.attendees.length
                            }
                            break;


                        case 1:
                            var questionAnsIndex = _.findIndex(answers, {
                                "answer_body": survey_quiz_answers_args.answers.answer_body.media_dir
                            });
                            var questionAnswers = _.find(answers, {
                                "answer_body": survey_quiz_answers_args.answers.answer_body.media_dir
                            });
                            if (questionAnsIndex == -1) {
                                var question_status = {
                                    "answer_id": survey_quiz_answers_args.answers.answer_body._id,
                                    "answer_body": survey_quiz_answers_args.answers.answer_body.media_dir,
                                    "statistics_in_percentage": (1 * 100 / (thisReport.attendees.length)),
                                    "statistics_in_raw": 1,
                                };
                                answers.push(question_status);
                            } else {
                                answers[questionAnsIndex].statistics_in_raw = answers[questionAnsIndex].statistics_in_raw + 1;
                                answers[questionAnsIndex].statistics_in_percentage = ((answers[questionAnsIndex].statistics_in_raw) * 100) / thisReport.attendees.length
                            }
                            break;


                        case 2:
                            var questionAnsIndex = _.findIndex(answers, {
                                "answer_body": survey_quiz_answers_args.answers.answer_body.true_false_value
                            });
                            var questionAnswers = _.find(answers, {
                                "answer_body": survey_quiz_answers_args.answers.answer_body.true_false_value
                            });
                            if (questionAnsIndex == -1) {
                                var question_status = {
                                    "answer_id": survey_quiz_answers_args.answers.answer_body._id,
                                    "answer_body": survey_quiz_answers_args.answers.answer_body.true_false_value,
                                    "statistics_in_percentage": (1 * 100 / (thisReport.attendees.length)),
                                    "statistics_in_raw": 1,
                                };
                                answers.push(question_status);
                            } else {
                                answers[questionAnsIndex].statistics_in_raw = answers[questionAnsIndex].statistics_in_raw + 1;
                                answers[questionAnsIndex].statistics_in_percentage = ((answers[questionAnsIndex].statistics_in_raw) * 100) / thisReport.attendees.length
                            }
                            break;


                        case 3:
                            var questionAnsIndex = _.findIndex(answers, {
                                "answer_body": survey_quiz_answers_args.answers.answer_body.rating_scale_value
                            });
                            var questionAnswers = _.find(answers, {
                                "answer_body": survey_quiz_answers_args.answers.answer_body.rating_scale_value
                            });
                            if (questionAnsIndex == -1) {
                                var question_status = {
                                    "answer_id": survey_quiz_answers_args.answers.answer_body._id,
                                    "answer_body": survey_quiz_answers_args.answers.answer_body.rating_scale_value,
                                    "statistics_in_percentage": (1 * 100 / (thisReport.attendees.length)),
                                    "statistics_in_raw": 1,
                                };
                                answers.push(question_status);
                            } else {
                                answers[questionAnsIndex].statistics_in_raw = answers[questionAnsIndex].statistics_in_raw + 1;
                                answers[questionAnsIndex].statistics_in_percentage = ((answers[questionAnsIndex].statistics_in_raw) * 100) / thisReport.attendees.length
                            }
                            break;


                        case 4:
                            var questionAnsIndex = _.findIndex(answers, {
                                "answer_id": survey_quiz_answers_args.answers.answer_body._id
                            });
                            var questionAnswers = _.find(answers, {
                                "answer_id": survey_quiz_answers_args.answers.answer_body._id
                            });
                            if (questionAnsIndex == -1) {
                                var question_status = {
                                    "answer_id": survey_quiz_answers_args.answers.answer_body._id,
                                    "statistics_in_percentage": (1 * 100 / (thisReport.attendees.length)),
                                    "statistics_in_raw": 1,
                                };
                                answers.push(question_status);
                            } else {
                                answers[questionAnsIndex].statistics_in_raw = answers[questionAnsIndex].statistics_in_raw + 1;
                                answers[questionAnsIndex].statistics_in_percentage = ((answers[questionAnsIndex].statistics_in_raw) * 100) / thisReport.attendees.length
                            }
                            break;
                    }

                    var attendee_counts = thisReport.attendees.length;
                    var att_counts = 0;

                    for (var i = 0; i < answers.length; i++) {
                        var rawStatistics = answers[i].statistics_in_raw;
                        att_counts = att_counts + answers[i].statistics_in_raw;
                    }

                    for (var i = 0; i < answers.length; i++) {
                        var rawStatistics = answers[i].statistics_in_raw;
                        answers[i].statistics_in_percentage = (rawStatistics * 100) / att_counts;
                        // console.log(i + " - " + (rawStatistics * 100 ) + "/"+ att_counts + " percentage |:===> " + answers[i].statistics_in_percentage);
                    }
                    thisReport.statistics[statisticIndex].attendee_count = att_counts;

                }


            }

            /* ------------------------------ */
            thisReport.attendees[attendeeIndex].survey_quiz_answers.push(survey_quiz_answers_args);
            thisReport.attendees[attendeeIndex].updated_at = new Date();
            thisReport.markModified('statistics');
            return thisReport.save().then(() => {
                attendee_user = {
                    body: thisReport.attendees[attendeeIndex],
                    index: attendeeIndex
                };
                return attendee_user;
            });
        } else {
            attendee_user = {
                body: "This Question is already exists",
                index: -1
            };
            return attendee_user;
        }
    }
};

reportSchema.methods.quiz_calculation = function(attendee_user, questionnaire) {
    var thisReport = this;
    /*
    results:
        { wrong_answers: 0,
          correct_answers: 0,
          count_of_questions: 0,
          result: [Object] },
       passed_the_grade: false,
       is_completed: false,
     */
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















// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



rptRouters.post([
    // filters => attendee_id , question_id || array contained some specified indexes
    // report_type => brief  ( quiz - survey ) | detailed  ( quiz - survey ) | statistics ( survey only )
    "/:creator_id/:report_type/report", // => all questionnaires
    "/:creator_id/:app_type/:report_type/report"
], can_i_access_that, (req, res) => {
    // Basic Params
    var creator_id = req.params.creator_id;
    var report_type = req.params.report_type;
    var queries = new Object();
    queries["creator_id"] = creator_id;

    // Determined app type
    if (req.body.date) {
        if (req.body.date.date_from != null && req.body.date.date_to != null) {
            var query_range = new Object();

            if (report_type == 'brief') {

                query_range = {
                    "created_at": {
                        "$gte": new Date(req.body.date.date_from),
                        "$lt": new Date(req.body.date.date_to)
                    }
                }
                queries = query_range;
            }

        }
    }
    // Determined app type
    if (req.params.app_type) {
        queries["app_type"] = (req.params.app_type == 'quiz') ? 1 : 0;
        if (report_type == "statistics")
            queries["app_type"] = 0; // survey type
    }
    if (req.body.filters) {

        if (req.body.filters.application_id) {
            queries["questionnaire_id"] = req.body.filters.application_id;
        }
    }
    console.log(queries);
    rpt.find(queries).
    populate("questionnaire_id").
    populate("attendees.user_information").
    exec((error, reportDocument) => {
        if (!reportDocument) {
            return new Promise((resolve, reject) => {
                res.status(404).send(notes.Errors.Error_Doesnt_exists("report"));
            });
        }

        //   res.send(reportDocument);
        // return false ;
        var appviews, attendee_curr_page, attendee_records_inpu, current_result, applications, applicationPageNumber, object_user_attent;
        var user_attensees_lists = new Array();
        // Detaild Reports ( Quiz - Survey )
        if (req.body.filters != null && report_type == "detailed") {
            // Check about the pagination of application
            if (req.body.filters.paginations == null && req.body.filters.attendee_id == null) {
                return new Promise((resolve, reject) => {
                    res.status(404).send(notes.Messages.Required_Message("filters.paginations"))
                });
            } // end pagination detection


            var pagin_is_found = false;
            if (req.body.filters.paginations != null) {
                if (req.body.filters.paginations.attendees != null && req.body.filters.attendee_id != null)
                    pagin_is_found = true;
                else pagin_is_found = false;
            } else {
                if (req.body.filters.attendee_id != null)
                    pagin_is_found = false;
            }
            if (pagin_is_found == true) {
                return new Promise((resolve, reject) => {
                    res.status(404).send({
                        "Message": "That's a specified user ! you can't use pagination option with !"
                    });
                });
            }

            current_result = reportDocument;


            //  console.log(current_result);
            for (var i = 0; i < current_result.length; i++) {
                if (req.body.filters.attendee_id != null) // return one attendee
                {
                    var attendee = _.find(current_result[i].attendees, {
                        "attendee_id": req.body.filters.attendee_id
                    });
                    var attendeeIndex = _.findIndex(current_result[i].attendees, {
                        "attendee_id": req.body.filters.attendee_id
                    });
                    object_user_attent = new Object();
                    object_user_attent['attendee_information'] = {
                        "id": current_result[i].attendees[attendeeIndex].user_information._id,
                        "name": current_result[i].attendees[attendeeIndex].user_information.name,
                        "email": current_result[i].attendees[attendeeIndex].user_information.email
                    };
                    object_user_attent['app_name'] = current_result[i].questionnaire_id.questionnaire_title;
                    object_user_attent['app_id'] = current_result[i].questionnaire_id._id;
                    object_user_attent['total_questions'] = current_result[i].attendees[attendeeIndex].survey_quiz_answers.length
                    object_user_attent['completed_date'] = current_result[i].attendees[attendeeIndex].updated_at;

                    if (current_result[i].questionnaire_id.app_type != 0) {
                        object_user_attent['pass_mark'] = current_result[i].attendees[attendeeIndex].passed_the_grade;
                        object_user_attent['correct_answers'] = current_result[i].attendees[attendeeIndex].results.correct_answers;
                        object_user_attent['score'] = current_result[i].attendees[attendeeIndex].results.result.percentage_value + "%";
                        if (current_result[i].questionnaire_id.settings.grade_settings.is_graded == true) {
                            if (current_result[i].attendees[attendeeIndex].results.result.percentage_value >= current_result[i].questionnaire_id.settings.grade_settings.value)
                                object_user_attent['status'] = "Passed";
                            else
                                object_user_attent['status'] = "Failed";

                            if (req.body.filters.questions == true) { // HERE
                                // => question part
                                object_user_attent['question'] = new Array();
                                var survey_questions = attendee.survey_quiz_answers
                                for (var i = 0; i < survey_questions.length; i++) {
                                    object_user_attent['question'].push({
                                        "question": survey_questions[i].questions.question_body.question_body,
                                        "is_correct": survey_questions[i].is_correct,
                                        "answer": survey_questions[i].answers.answer_body
                                    });
                                }
                            }
                        }
                    }
                    object_user_attent;
                }
            }










            if (req.body.filters.attendee_id != null)
                appviews = object_user_attent;

            else if (req.body.filters.paginations.attendees != null || req.body.filters.attendee_id == null) {
                if (req.body.filters.paginations.attendees == null) {
                    return new Promise((resolve, reject) => {
                        res.status(404).send({
                            "Message": "Pagination of attendees is required !"
                        });
                    });
                    if (req.body.filters.paginations.attendees.page_number == null || req.body.filters.paginations.attendees.records_per_page == null) {
                        return new Promise((resolve, reject) => {
                            res.status(404).send({
                                "Message": "These fields 'page_number' and 'records_per_page' are required inside attendees pagination !"
                            });
                        });
                    }
                }

                attendee_records_inpu = req.body.filters.paginations.attendees.records_per_page;
                var attendee_curr_page = req.body.filters.paginations.attendees.page_number;

                for (var i = 0; i < current_result.length; i++) {

                    var curr_attendee = current_result[i].attendees;
                    var attendee_records = _.chunk(curr_attendee, attendee_records_inpu);

                    if (attendee_curr_page < 0 || !_.isNumber(attendee_curr_page) || attendee_curr_page == 1)
                        attendee_curr_page = 0;
                    else if (attendee_curr_page != 0)
                        attendee_curr_page = attendee_curr_page - 1;


                    var record_current_page = attendee_records[attendee_curr_page];

                    if (!record_current_page) {
                        return new Promise((resolve, reject) => {
                            res.status(404).send({
                                "Message": "There are no attendees else !"
                            });
                        });
                    }
                    // console.log(attendee_records_inpu);
                    // return false;

                    for (var x = 0; x < record_current_page.length; x++) {


                        var user_attensees = new Object();
                        user_attensees["attendee_information"] = {
                            "name": record_current_page[x].user_information.name,
                            "email": record_current_page[x].user_information.email,
                            "_id": record_current_page[x].user_information._id
                        };

                        user_attensees["total_questions"] = record_current_page[x].survey_quiz_answers.length;
                        user_attensees["completed_date"] = record_current_page[x].updated_at;
                        if (current_result[i].questionnaire_id.app_type != 0) {
                            user_attensees['pass_mark'] = record_current_page[x].passed_the_grade;
                            user_attensees['correct_answers'] = record_current_page[x].results.correct_answers;
                            user_attensees['score'] = record_current_page[x].results.result.percentage_value + "%";
                            if (current_result[i].questionnaire_id.settings.grade_settings.is_graded) {
                                if (record_current_page[x].results.result.percentage_value >= current_result[i].questionnaire_id.settings.grade_settings.value) {
                                    user_attensees['status'] = "Passed";
                                } else user_attensees['status'] = "Failed";

                                if (req.body.filters.questions == true) {
                                    user_attensees['question'] = new Array();
                                    var survey_questions = record_current_page[x].survey_quiz_answers;
                                    for (var w = 0; w < survey_questions.length; w++) {
                                        user_attensees['question'].push({
                                            "question": survey_questions[w].questions.question_body.question_body,
                                            "is_correct": survey_questions[w].is_correct,
                                            "answer": survey_questions[w].answers.answer_body
                                        });
                                    }
                                }
                            }
                        }
                        /*
                           var dateFrom = "02/05/2013";
                           var dateTo = "02/09/2013";
                           var dateCheck = "02/07/2013";

                           var d1 = dateFrom.split("/");
                           var d2 = dateTo.split("/");
                           var c = dateCheck.split("/");

                           var from = new Date(d1[2], parseInt(d1[1])-1, d1[0]);  // -1 because months are from 0 to 11
                           var to   = new Date(d2[2], parseInt(d2[1])-1, d2[0]);
                           var check = new Date(c[2], parseInt(c[1])-1, c[0]);

                           console.log(check > from && check < to)
                        */
                        if (req.body.date != null) {
                            if (req.body.date.date_from != null && req.body.date.date_to != null) {
                                /*
                                req.body.date.date_from
                                req.body.date.date_to
                                record_current_page[x].created_at
                                */
                                var from = new Date(req.body.date.date_from);
                                var to = new Date(req.body.date.date_to);
                                var date_passed = new Date(record_current_page[x].created_at);

                                if (date_passed >= from && date_passed <= to) {
                                    user_attensees_lists.push(user_attensees);
                                }
                            } else
                                user_attensees_lists.push(user_attensees);
                        } else
                            user_attensees_lists.push(user_attensees);

                    } // end loop of attendees
                    // => set pagination for new array
                    var detailed_report_object = new Object();
                    detailed_report_object["app_name"] = current_result[i].questionnaire_id.questionnaire_title;
                    detailed_report_object["app_id"] = current_result[i].questionnaire_id._id;
                    detailed_report_object["attendees"] = user_attensees_lists;
                    appviews = detailed_report_object;
                }
            }



            /*
            @Montasser report is almost ok for us, can we pass quiz(application) id   in filter for getting report for a particular quiz
            Suggestion : app_name & app_id can be moved out from attendee  details so that we can avoid repetition of these item along with each user
            */
        } // end Filters here !!
        else if (report_type == 'brief') {
            var brief_array = new Array();


            if (req.body.filters.paginations.application == null) {
                return new Promise((resolve, reject) => {
                    res.send({
                        "Message": "pagination.application fields are required"
                    });
                });

                if (!req.body.filters.paginations.application.page_number || !req.body.filters.paginations.application.records_per_page) {
                    res.send({
                        "Message": "Make sure application.page_number and application.records_per_page are available !"
                    });
                    return false;
                }

            }
            var pages = req.body.filters.paginations.application.records_per_page;
            var page_number = req.body.filters.paginations.application.page_number;

            if (!_.isNumber(page_number))
                page_number = 0;

            var document_reports = _.chunk(reportDocument, pages);
            if (page_number == 1)


                if (page_number < 0 || !_.isNumber(page_number) || page_number == 1)
                    page_number = 0;
                else if (page_number != 0)
                page_number = page_number - 1;

            if (page_number >= document_reports.length) {
                page_number = (document_reports.length - 1);
            }

            var document_brief = document_reports[page_number];


            for (var brief = 0; brief < document_brief.length; brief++) {
                var brief_object = new Object();
                var total_passed = _.countBy(document_brief[brief].attendees, {
                    'passed_the_grade': true
                });
                var total_is_completed = _.countBy(document_brief[brief].attendees, {
                    'is_completed': true
                });
                var total_is_completed = _.countBy(document_brief[brief].attendees, {
                    'is_completed': true
                });
                // var average_score = _.  / document_brief[brief].attendees.length ;
                var total_is_completed_count = _.countBy(document_brief[brief].attendees, 'results.correct_answers');

                brief_object["app_name"] = document_brief[brief].questionnaire_id.questionnaire_title;
                brief_object["app_id"] = document_brief[brief].questionnaire_id._id;
                brief_object["app_type"] = (document_brief[brief].app_type == 1) ? "Quiz" : "Survey";
                brief_object["total_questions"] = document_brief[brief].questionnaire_id.questions.length;
                brief_object["total_attendees"] = document_brief[brief].attendees.length;

                brief_object["total_passed"] = total_passed.true;
                brief_object["total_completed"] = total_is_completed.true;

                // brief_object["average_score"]=reducer ;// document_brief[brief].questionnaire_id.questions.length / ( document_brief[brief].attendees.length );
                brief_array.push(brief_object);
            }


            appviews = brief_array;
        } else if (report_type == 'statistics') { // => for Survey

            if (req.body.filters.application_id == null) {
                return new Promise((resolve, reject) => {
                    res.send({
                        "Message": "filters.appliation_id required !"
                    })
                });
            }
            // => reportDocument[0] ;
            var statistics_report = new Object();

            statistics_report["survey_id"] = reportDocument[0].questionnaire_id._id;
            statistics_report["survey_name"] = reportDocument[0].questionnaire_id.questionnaire_title;
            statistics_report["total_attendees"] = reportDocument[0].attendees.length;
            var statistics = reportDocument[0].statistics;
            var questions_answers = new Array();
            for (var i = 0; i < statistics.length; i++) {
                var qs_object = new Object();
                qs_object['question_id'] = statistics[i].question_id;
                qs_object['question'] = statistics[i].question_body;
                qs_object['count_of_attendees'] = statistics[i].attendee_count;
                qs_object['answers'] = new Array();
                var answer_args = statistics[i].question_answers
                for (var xi = 0; xi < answer_args.length; xi++) {
                    var answer_argument = new Object();
                    answer_argument['answer_id'] = answer_args[xi].answer_id;
                    answer_argument['answer_body'] = answer_args[xi].answer_body;
                    answer_argument['attendees'] = answer_args[xi].statistics_in_raw + " (" + _.parseInt(answer_args[xi].statistics_in_percentage) + "%" + ")";
                    qs_object['answers'].push(answer_argument);
                }

                questions_answers.push(qs_object);
            }


            statistics_report["questions"] = questions_answers;
            appviews = statistics_report
        }
        res.send(appviews);
    });
});






























/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/




rptRouters.post([
        // filters => attendee_id , question_id || array contained some specified indexes
        // report_type => brief  ( quiz - survey ) | detailed  ( quiz - survey ) | statistics ( survey only )
        "/:creator_id/:report_type/report", // => all questionnaires
        "/:creator_id/:app_type/:report_type/report"
], can_i_access_that, (req, res) => {
        // Basic Params
        var creator_id = req.params.creator_id;
        var report_type = req.params.report_type;
        var queries = new Object();
        queries["creator_id"] = creator_id;
        // Determined app type
        if (req.body.date) {
                if (req.body.date.date_from != null && req.body.date.date_to != null) {
                        var query_range = new Object();
                        if (report_type == 'brief') {
                                query_range = {
                                        "created_at": {
                                                "$gte": new Date(req.body.date.date_from),
                                                "$lt": new Date(req.body.date.date_to)
                                        }
                                }
                                queries = query_range;
                        }
                }
        }
        // Determined app type
        if (req.params.app_type) {
                queries["app_type"] = (req.params.app_type == 'quiz') ? 1 : 0;
                if (report_type == "statistics") queries["app_type"] = 0; // survey type
        }
        if (req.body.filters) {
                if (req.body.filters.application_id) {
                        queries["questionnaire_id"] = req.body.filters.application_id;
                }
        }
        console.log(queries);

















        rpt.find(queries).
        populate("questionnaire_id").
        populate("attendees.user_information").
        exec((error, reportDocument) => {
                if (!reportDocument) {
                        return new Promise(
                                (resolve, reject) => {
                                        res.status(404).send(notes.Errors.Error_Doesnt_exists("report"));
                                });
                }
                //   res.send(reportDocument);
                // return false ;
                        var appviews,
                        attendee_curr_page,
                        attendee_records_inpu,
                        current_result,
                        applications,
                        applicationPageNumber,
                        object_user_attent;
                var user_attensees_lists = new Array();
                // Detaild Reports ( Quiz - Survey )
                if (req.body.filters != null && report_type == "detailed") {
                        // Check about the pagination of application
                        if (req.body.filters.paginations == null && req.body.filters.attendee_id == null) {
                                return new Promise(
                                        (resolve, reject) => {
                                                res.status(404).send(notes.Messages.Required_Message("filters.paginations"))
                                        });
                        } // end pagination detection
                        var pagin_is_found = false;
                        if (req.body.filters.paginations != null) {
                                if (req.body.filters.paginations.attendees != null && req.body.filters.attendee_id != null) pagin_is_found = true;
                                else pagin_is_found = false;
                        }
                        else {
                                if (req.body.filters.attendee_id != null) pagin_is_found = false;
                        }
                        if (pagin_is_found == true) {
                                return new Promise(
                                        (resolve, reject) => {
                                                res.status(404).send({
                                                        "Message": "That's a specified user ! you can't use pagination option with !"
                                                });
                                        });
                        }
                        current_result = reportDocument;
                        //  console.log(current_result);
                        for (var i = 0; i < current_result.length; i++) {
                                if (req.body.filters.attendee_id != null) // return one attendee
                                {
                                        var attendee = _.find(current_result[i].attendees, {
                                                "attendee_id": req.body.filters.attendee_id
                                        });
                                        var attendeeIndex = _.findIndex(current_result[i].attendees, {
                                                "attendee_id": req.body.filters.attendee_id
                                        });
                                        object_user_attent = new Object();
                                        object_user_attent['attendee_information'] = {
                                                "id": current_result[i].attendees[attendeeIndex].user_information._id,
                                                "name": current_result[i].attendees[attendeeIndex].user_information.name,
                                                "email": current_result[i].attendees[attendeeIndex].user_information.email
                                        };
                                        object_user_attent['app_name'] = current_result[i].questionnaire_id.questionnaire_title;
                                        object_user_attent['app_id'] = current_result[i].questionnaire_id._id;
                                        object_user_attent['total_questions'] = current_result[i].attendees[attendeeIndex].survey_quiz_answers.length
                                        object_user_attent['completed_date'] = current_result[i].attendees[attendeeIndex].updated_at;
                                        if (current_result[i].questionnaire_id.app_type != 0) {
                                                object_user_attent['pass_mark'] = current_result[i].attendees[attendeeIndex].passed_the_grade;
                                                object_user_attent['correct_answers'] = current_result[i].attendees[attendeeIndex].results.correct_answers;
                                                object_user_attent['score'] = current_result[i].attendees[attendeeIndex].results.result.percentage_value + "%";
                                                if (current_result[i].questionnaire_id.settings.grade_settings.is_graded == true) {
                                                        if (current_result[i].attendees[attendeeIndex].results.result.percentage_value >= current_result[i].questionnaire_id.settings.grade_settings.value) object_user_attent['status'] = "Passed";
                                                        else object_user_attent['status'] = "Failed";
                                                        if (req.body.filters.questions == true) { // HERE
                                                                // => question part
                                                                object_user_attent['question'] = new Array();
                                                                var survey_questions = attendee.survey_quiz_answers
                                                                for (var i = 0; i < survey_questions.length; i++) {
                                                                        object_user_attent['question'].push({
                                                                                "question": survey_questions[i].questions.question_body.question_body,
                                                                                "is_correct": survey_questions[i].is_correct,
                                                                                "answer": survey_questions[i].answers.answer_body
                                                                        });
                                                                }
                                                        }
                                                }
                                        }
                                        object_user_attent;
                                }
                        }
                        if (req.body.filters.attendee_id != null) appviews = object_user_attent;
                        else if (req.body.filters.paginations.attendees != null || req.body.filters.attendee_id == null) {
                                if (req.body.filters.paginations.attendees == null) {
                                        return new Promise(
                                                (resolve, reject) => {
                                                        res.status(404).send({
                                                                "Message": "Pagination of attendees is required !"
                                                        });
                                                });
                                        if (req.body.filters.paginations.attendees.page_number == null || req.body.filters.paginations.attendees.records_per_page == null) {
                                                return new Promise(
                                                        (resolve, reject) => {
                                                                res.status(404).send({
                                                                        "Message": "These fields 'page_number' and 'records_per_page' are required inside attendees pagination !"
                                                                });
                                                        });
                                        }
                                }
                                attendee_records_inpu = req.body.filters.paginations.attendees.records_per_page;
                                var attendee_curr_page = req.body.filters.paginations.attendees.page_number;
                                for (var i = 0; i < current_result.length; i++) {
                                        var curr_attendee = current_result[i].attendees;
                                        var attendee_records = _.chunk(curr_attendee, attendee_records_inpu);
                                        if (attendee_curr_page < 0 || !_.isNumber(attendee_curr_page) || attendee_curr_page == 1) attendee_curr_page = 0;
                                        else if (attendee_curr_page != 0) attendee_curr_page = attendee_curr_page - 1;
                                        var record_current_page = attendee_records[attendee_curr_page];
                                        if (!record_current_page) {
                                                return new Promise(
                                                        (resolve, reject) => {
                                                                res.status(404).send({
                                                                        "Message": "There are no attendees else !"
                                                                });
                                                        });
                                        }
                                        // console.log(attendee_records_inpu);
                                        // return false;
                                        for (var x = 0; x < record_current_page.length; x++) {
                                                var user_attensees = new Object();
                                                user_attensees["attendee_information"] = {
                                                        "name": record_current_page[x].user_information.name,
                                                        "email": record_current_page[x].user_information.email,
                                                        "_id": record_current_page[x].user_information._id
                                                };
                                                user_attensees["total_questions"] = record_current_page[x].survey_quiz_answers.length;
                                                user_attensees["completed_date"] = record_current_page[x].updated_at;
                                                if (current_result[i].questionnaire_id.app_type != 0) {
                                                        user_attensees['pass_mark'] = record_current_page[x].passed_the_grade;
                                                        user_attensees['correct_answers'] = record_current_page[x].results.correct_answers;
                                                        user_attensees['score'] = record_current_page[x].results.result.percentage_value + "%";
                                                        if (current_result[i].questionnaire_id.settings.grade_settings.is_graded) {
                                                                if (record_current_page[x].results.result.percentage_value >= current_result[i].questionnaire_id.settings.grade_settings.value) {
                                                                        user_attensees['status'] = "Passed";
                                                                }
                                                                else user_attensees['status'] = "Failed";
                                                                if (req.body.filters.questions == true) {
                                                                        user_attensees['question'] = new Array();
                                                                        var survey_questions = record_current_page[x].survey_quiz_answers;
                                                                        for (var w = 0; w < survey_questions.length; w++) {
                                                                                user_attensees['question'].push({
                                                                                        "question": survey_questions[w].questions.question_body.question_body,
                                                                                        "is_correct": survey_questions[w].is_correct,
                                                                                        "answer": survey_questions[w].answers.answer_body
                                                                                });
                                                                        }
                                                                }
                                                        }
                                                }
                                                /*
                                                   var dateFrom = "02/05/2013";
                                                   var dateTo = "02/09/2013";
                                                   var dateCheck = "02/07/2013";

                                                   var d1 = dateFrom.split("/");
                                                   var d2 = dateTo.split("/");
                                                   var c = dateCheck.split("/");

                                                   var from = new Date(d1[2], parseInt(d1[1])-1, d1[0]);  // -1 because months are from 0 to 11
                                                   var to   = new Date(d2[2], parseInt(d2[1])-1, d2[0]);
                                                   var check = new Date(c[2], parseInt(c[1])-1, c[0]);

                                                   console.log(check > from && check < to)
                                                */
                                                if (req.body.date != null) {
                                                        if (req.body.date.date_from != null && req.body.date.date_to != null) {
                                                                /*
                                                                req.body.date.date_from
                                                                req.body.date.date_to
                                                                record_current_page[x].created_at
                                                                */
                                                                var from = new Date(req.body.date.date_from);
                                                                var to = new Date(req.body.date.date_to);
                                                                var date_passed = new Date(record_current_page[x].created_at);
                                                                if (date_passed >= from && date_passed <= to) {
                                                                        user_attensees_lists.push(user_attensees);
                                                                }
                                                        }
                                                        else user_attensees_lists.push(user_attensees);
                                                }
                                                else user_attensees_lists.push(user_attensees);
                                        } // end loop of attendees
                                        // => set pagination for new array
                                        var detailed_report_object = new Object();
                                        detailed_report_object["app_name"] = current_result[i].questionnaire_id.questionnaire_title;
                                        detailed_report_object["app_id"] = current_result[i].questionnaire_id._id;
                                        detailed_report_object["attendees"] = user_attensees_lists;
                                        appviews = detailed_report_object;
                                }
                        }
                        /*
                        @Montasser report is almost ok for us, can we pass quiz(application) id   in filter for getting report for a particular quiz
                        Suggestion : app_name & app_id can be moved out from attendee  details so that we can avoid repetition of these item along with each user
                        */
                } // end Filters here !!



                
                else if (report_type == 'brief') {
                        var brief_array = new Array();
                        if (req.body.filters.paginations.application == null) {
                                return new Promise(
                                        (resolve, reject) => {
                                                res.send({
                                                        "Message": "pagination.application fields are required"
                                                });
                                        });
                                if (!req.body.filters.paginations.application.page_number || !req.body.filters.paginations.application.records_per_page) {
                                        res.send({
                                                "Message": "Make sure application.page_number and application.records_per_page are available !"
                                        });
                                        return false;
                                }
                        }
                        var pages = req.body.filters.paginations.application.records_per_page;
                        var page_number = req.body.filters.paginations.application.page_number;
                        if (!_.isNumber(page_number)) page_number = 0;
                        var document_reports = _.chunk(reportDocument, pages);
                        if (page_number == 1)
                                if (page_number < 0 || !_.isNumber(page_number) || page_number == 1) page_number = 0;
                                else if (page_number != 0) page_number = page_number - 1;
                        if (page_number >= document_reports.length) {
                                page_number = (document_reports.length - 1);
                        }
                        var document_brief = document_reports[page_number];
                        for (var brief = 0; brief < document_brief.length; brief++) {
                                var brief_object = new Object();
                                var total_passed = _.countBy(document_brief[brief].attendees, {
                                        'passed_the_grade': true
                                });
                                var total_is_completed = _.countBy(document_brief[brief].attendees, {
                                        'is_completed': true
                                });
                                var total_is_completed = _.countBy(document_brief[brief].attendees, {
                                        'is_completed': true
                                });
                                // var average_score = _.  / document_brief[brief].attendees.length ;
                                var total_is_completed_count = _.countBy(document_brief[brief].attendees, 'results.correct_answers');
                                brief_object["app_name"] = document_brief[brief].questionnaire_id.questionnaire_title;
                                brief_object["app_id"] = document_brief[brief].questionnaire_id._id;
                                brief_object["app_type"] = (document_brief[brief].app_type == 1) ? "Quiz" : "Survey";
                                brief_object["total_questions"] = document_brief[brief].questionnaire_id.questions.length;
                                brief_object["total_attendees"] = document_brief[brief].attendees.length;
                                brief_object["total_passed"] = total_passed.true;
                                brief_object["total_completed"] = total_is_completed.true;
                                // brief_object["average_score"]=reducer ;// document_brief[brief].questionnaire_id.questions.length / ( document_brief[brief].attendees.length );
                                brief_array.push(brief_object);
                        }
                        appviews = brief_array;
                }
                else if (report_type == 'statistics') { // => for Survey
                        if (req.body.filters.application_id == null) {
                                return new Promise(
                                        (resolve, reject) => {
                                                res.send({
                                                        "Message": "filters.appliation_id required !"
                                                })
                                        });
                        }
                        // => reportDocument[0] ;
                        var statistics_report = new Object();
                        statistics_report["survey_id"] = reportDocument[0].questionnaire_id._id;
                        statistics_report["survey_name"] = reportDocument[0].questionnaire_id.questionnaire_title;
                        statistics_report["total_attendees"] = reportDocument[0].attendees.length;
                        var statistics = reportDocument[0].statistics;
                        var questions_answers = new Array();
                        for (var i = 0; i < statistics.length; i++) {
                                var qs_object = new Object();
                                qs_object['question_id'] = statistics[i].question_id;
                                qs_object['question'] = statistics[i].question_body;
                                qs_object['count_of_attendees'] = statistics[i].attendee_count;
                                qs_object['answers'] = new Array();
                                var answer_args = statistics[i].question_answers
                                for (var xi = 0; xi < answer_args.length; xi++) {
                                        var answer_argument = new Object();
                                        answer_argument['answer_id'] = answer_args[xi].answer_id;
                                        answer_argument['answer_body'] = answer_args[xi].answer_body;
                                        answer_argument['attendees'] = answer_args[xi].statistics_in_raw + " (" + _.parseInt(answer_args[xi].statistics_in_percentage) + "%" + ")";
                                        qs_object['answers'].push(answer_argument);
                                }
                                questions_answers.push(qs_object);
                        }
                        statistics_report["questions"] = questions_answers;
                        appviews = statistics_report
                }
                res.send(appviews);
        });
});

