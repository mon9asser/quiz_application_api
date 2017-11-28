const validator = require('validator');
const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.ObjectId;
// +++++++++++++++++++++++++++++++++++++++++++++++
// =============> Users !
// +++++++++++++++++++++++++++++++++++++++++++++++


/*
  ++++++++++++++++++++++++++++++++++++++++++++++++
    For Users Collection
  ++++++++++++++++++++++++++++++++++++++++++++++++
*/
var userDataTypes = {
    name : {
      type : String ,
      trim: true ,
      required:[true , "Required !"]
    } ,
    email : {
      type:String ,
      trim:true ,
      required:[true , "Required !"] ,
      //  unique : [true , "This email already exists"] ,
      validate : {
            validator:function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },   message: `Invalid Email !`
      }
    } ,
    password: {
      type: String ,
      trim : true ,
      required:[true , "Required !"]
    } ,
    createdOn :{
      type:String ,
      trim:true
    },
    updatedOn :{
      type:String ,
      trim:true
    },
    is_creator:{
      type:Number ,
      trim:true
    },
    tokens : {
          type : [
            {
              token: {
                type : String
              } ,
              access : { // x-auth-user x-auth-creator
                type :String
              }
            }
          ]
    }
};

/*
  ++++++++++++++++++++++++++++++++++++++++++++++++
    For Questionnaire Collection
  ++++++++++++++++++++++++++++++++++++++++++++++++
*/
var Questionnaire_settings = {
    type : {
      titles : {
        type : {
                  title_start_with : {  /* Both ( Survey/quiz )  */
                    type : String ,
                    trim : true
                  } ,
                  title_end_with :{     /* Both ( Survey/quiz )  */
                    type : String ,
                    trim : true
                  },
                  title_success_with:{
                    type : String ,
                    trim : true
                  },
                  title_faild_with : {
                    type : String ,
                    trim : true
                  }
                }
      } ,
      step_type : { // False => Precentage Steps || true => Numerical
        type: Boolean
      } ,
      grade_settings : {
        type : {
                    is_graded : {
                      type:Boolean
                    } ,
                    quiz_graded_value : {
                      type:Number
                    }
                }
      } ,
      quiz_status : {
        type : [
                {
                  attendee_id:{
                    type : String ,
                    trim : true
                  } ,
                  report_id : {
                    type : String ,
                    trim : true
                  } ,
                  stopped_at_time : {
                    type : String ,
                    trim : true
                  } ,
                  at_question_id : {
                    type : String ,
                    trim : true
                  }
                }
              ]
      } ,
      review_setting : {
        type : Boolean
      } ,
      retake_setting : {
        type : Boolean
      } ,
      navigation_btns : {
        type : Number
      } ,
      label_btns : {
        type : {
                lbl_start_with : {
                  type : String ,
                  trim:true
                } ,
                lbl_continue_with :{
                  type : String ,
                  trim:true
                } ,
                lbl_retake_with :{
                  type : String ,
                  trim:true
                },
                lbl_review_with:{
                  type : String ,
                  trim:true
                }
              }
      } ,
      randomize_setting : {
           type : Boolean
      } ,
      time_settings : {
        type : {
                is_with_time : {
                    type : Boolean
                } ,
                value : {
                  type : String ,
                  trim : true
                } ,
                timer_type :{
                  type : String ,
                  trim : true
                } ,
                timer_layout : {
                  type : Number
                }
              }
      } ,
      progression_bar : {
        type :{
               is_available : {
                 type : Boolean
               } ,
               progression_bar_layout: {
                 type : Number
               }
             }
      } ,
      quiz_theme_style : {
        type :  {
                      stylesheet_name : {
                        type : String ,
                        trim : true
                      } ,
                      is_active : {
                        type : Boolean
                      } , updatedAt :{type : Date} , createdAt :{type : Date},
                      source_code : {
                        type : [
                          {
                            _id :  mongoose.Schema.ObjectId ,
                            class_name : { //ex: .class {}
                              type: String ,
                              trim:true
                            } ,
                            attributes : { //ex: background : red
                              type : {}
                            }
                          }
                        ]
                      }
            }
      } ,
      createdAt : {
        type : Date
      },
      updatedAt : {
        type : Date
      }
    }
};

var quiz_answer_types = {
  type : {
    _id : {
      type :  mongoose.Schema.ObjectId
    } ,
    answers_type : {
      type : Number  // { 0 => choice | 1 => media choices | 2 => boolean_choices| 3 => free_texts | 4 => rating_scales  }
    } ,
    answers_body : {
      type : [{
              // ==> Quiz and Suvery
              choices :{
                type : {
                  _id : {
                     type : mongoose.Schema.ObjectId
                  } ,
                  indexer : {
                    type : Number ,
                    trim : true
                  } ,
                  value : {
                    type : String ,
                    trim : true
                  } ,
                  media_optional :{
                    type : {
                      media_name :{
                        type : String ,
                        trim : true
                      } ,
                      media_src : {
                        type : String ,
                        trim : true
                      }
                    }
                  } ,
                  is_correct_answer : {
                    type : Boolean
                  }
                }
              } ,
              media_choices : {
                type : {
                  _id : {
                     type : mongoose.Schema.ObjectId
                  } ,
                  indexer : {
                    type : Number ,
                    trim : true
                  } ,
                  media_name : {
                    type: String ,
                    trim : true
                  } ,
                  media_dir : {
                    type : String ,
                    trim : true
                  } ,
                  is_correct : {
                    type : Boolean
                  }
                }
              } ,
              boolean_choices : {
                type : { // Yes or No => False || True or False => true
                  boolean_type :{
                    type : Boolean
                  } ,
                  is_correct : {
                    type : Boolean
                  }
                }
              } ,
              // ==> Suvery Only
              //free_texts
              rating_scales : {
                type :{
                  ratscal_type : {
                    type : Number // Scale => 0 - ratings
                  } ,
                  elements : {
                      type : {
                        element_type : { // Scale - ratings
                          type: Boolean
                        } ,
                        stpe_numbers : {
                          type : Number
                        },
                        started_at : {
                          trim : true ,
                          type : String
                        } ,
                        centered_at :{
                          trim : true ,
                          type : String
                        },
                        ended_at : {
                          trim : true ,
                          type : String
                        }
                      }
                  }
                }
              }
            }]
    } ,
    answer_settings : {
      type : {
        is_randomized : {
          type : Boolean
        } ,
        super_size : {
          type : Boolean
        },
        single_choice : {
          type : Boolean
        } ,
        choice_format : {
          type : Boolean // Inline or full block
        } ,
        answer_char_max : {
          type : String ,
          trim:true
        }
      }
    }
  }
};





// var attendee_ans_bo =  {
//   type :
//       [
//         {
//           _id :                { type : mongoose.Schema.ObjectId },
//           attendee_id :        { type : String },
//           answer_id :          { type : String } ,
//           answer_value :       { type : String } ,
//           answer_type :        { type : String }
//         }
//       ]
// };
var answer_bo = {
  type : {
     answer_process :     {
      type : [
                  {
                    choices : {} ,
                    media_choices : {} ,
                    boolean_choices : {} ,
                    rating_scales : {}
                  }
             ]
     }
  }


};
var answer_setting_bo = {
  type : {
    is_randomized :           { type : Boolean }  ,
    super_size:               { type : Boolean }  ,
    single_choice:            { type : Boolean }  ,
    choice_style:            { type : Boolean }  , //Inline or full block
    answer_char_max :         { type : String , trim :true }
  }
};
var Questionnaire_questions = {
    type : [
      {
        _id :                     { type : mongoose.Schema.ObjectId } ,
        created_at :              { type : Date     } ,
        updated_at:               { type : Date     } ,
        question_body:            { type : String   } ,
        answers_body :            answer_bo , // Under Updateing
        media_question :          { type : { media_type :{ type : Number } , media_name : { type : String } , media_field:{ type : String } /* url of video */ } } ,
        // attendee_answers :        attendee_ans_bo , => Moving it for report
        question_is_required :    { type : Boolean } ,
        answer_settings :         answer_setting_bo ,
        question_type :            { type : Number } ,
      }
    ]
};
var questionnaireDataTypes = {
   creator_id : {
     type : String ,
     required : true ,
     trim : true
    } ,
   app_type : {
     type : String ,
     required : true
   } ,
   description : {
     type : String ,
     trim : true ,
   },
   questionnaire_title : {
     type : String ,
     required :true ,
     trim : true
   },
   createdAt : {
    type : Date
   } ,
   updatedAt : {
     type : Date
    },
   settings :  Questionnaire_settings  ,
   questions : Questionnaire_questions
};

/*
  ++++++++++++++++++++++++++++++++++++++++++++++++
    For Report Collection
  ++++++++++++++++++++++++++++++++++++++++++++++++
*/
var reportDataTypes = {
  attendee_id : {
        type : ObjectId
      } ,
  questionnaire_id : {
        type : ObjectId
      } ,
  results : {
        type : {
          total : {
            type : Number
          } ,
          wrong_answers : {
            type : Number
          } ,
          correct_answers : {
            type : Number
          } ,
          results : {
            type : Number
          }
        }
      } ,
  answers : [{
            question_report: {
                      type : {
                        question_type : {
                          type : Number
                        } ,
                        question_id : {
                          type : ObjectId
                        } ,
                        question_body : {
                          type : String
                        } ,
                      }
                    } ,
            answer_report : {
                      type : {
                        answer_type : {
                          type : Number
                        } ,
                        answer_id : {
                          type : ObjectId
                        } ,
                        answer_body : {
                          type : String
                        }
                      }
                    } ,
            is_correct : {
                      type : Boolean
                    } ,
            createdAt : {
                      type : Date
                    } ,
            updatedAt : {
                      type : Date
                    }
      }]
};
module.exports = {
      userDataTypes , questionnaireDataTypes , reportDataTypes
}
