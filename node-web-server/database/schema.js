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
        required:[true , "Full name required"]
    } ,
    email : {
      type:String ,
      trim:true ,
      unique : [true , "This email already exists"] ,
      required:[true , "Email required"] ,
      validate : {
        validator : validator.isEmail ,
        message : '{VALUE} is not valid email'
      }
    } ,
    password: {
      type: String ,
      required:[true , "Password required"]
    } ,
    access_type : {
      type : {
        is_creator:{
          type : Boolean
        } ,
        createdAt:{
          type:  Date
        } ,
        updatedAt: {
          type:  Date
        }
      }
    } ,
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
                  start_with : {  /* Both ( Survey/quiz )  */
                    type : String ,
                    trim : true
                  } ,
                  end_with :{     /* Both ( Survey/quiz )  */
                    type : String ,
                    trim : true
                  },
                  success_with:{
                    type : String ,
                    trim : true
                  },
                  faild_with : {
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
                    value : {
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
                start_with : {
                  type : String ,
                  trim:true
                } ,
                continue_with :{
                  type : String ,
                  trim:true
                } ,
                retake_with :{
                  type : String ,
                  trim:true
                },
                review_with:{
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
        type : {
              _id : { // Name of stylesheet file
                  type : mongoose.Schema.ObjectId
              } ,
              style_file_dir : {
                type : String ,
                trim : true
              } ,
              stylesheet : {
                type : [
                  {
                     element_class : {
                      type : String
                     } ,
                     css_attributes : [
                       {
                         background : {
                         type : String
                       } ,
                         color : {
                         type : String
                       } ,
                         fonts : {
                         type : String
                       }
                       }
                     ]
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

var Questionnaire_questions = {
  type : [
           {
            _id : {
               type :  mongoose.Schema.ObjectId
            } ,
            question_options : {
              type : {
                is_required :{
                  type : Boolean
                } ,
                answer_types : quiz_answer_types
              }
            } ,
            question_body : {
               type : String ,
                trim : true
            } ,
            attendee_answers : {
              type : [
                {
                  _id : {
                    type : mongoose.Schema.ObjectId
                  } ,
                  attendee_id : {
                    type:String
                  } ,
                  answers : {
                    type : {
                      answer_id :{
                        type : String
                      },
                      answer_value : {
                        type : String
                      } ,
                      answer_type : {
                        type : Number
                      }
                    }
                  } ,
                  done_it : {
                    type :Boolean
                  }
                }
              ]
            } ,
            created_at : {
              type :   Date
            } ,
            updatedAt : {
              type :   Date
            }
          }
        ]
} ;
var questionnaireDataTypes = {
   creator_id : {
     type : String ,
     required : true ,
     trim : true
    } ,
   app_type : {
     type : Boolean ,
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
