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
                    value : {
                      type:Number
                    }
                }
      } ,
      // quiz_status : {
      //   type : [
      //           {
      //             attendee_id:{
      //               type : String ,
      //               trim : true
      //             } ,
      //             report_id : {
      //               type : String ,
      //               trim : true
      //             } ,
      //             stopped_at_time : {
      //               type : String ,
      //               trim : true
      //             } ,
      //             at_question_id : {
      //               type : String ,
      //               trim : true
      //             }
      //           }
      //         ]
      // } ,
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
      randomize_settings : {
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
      }  ,
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


var choices_object = {

    _id :                 { type : mongoose.Schema.ObjectId } ,
    indexer :             { type : Number } ,
    value :               { type : String } ,
    media_optional :      { type : { media_type: { type : Number } , media_name : { type : String } , media_src : { type : String } } } ,
    is_correct :   { type : Boolean }

};
var media_choices_object = {

    _id :                  { type : mongoose.Schema.ObjectId } ,
    indexer  :             { type : Number  } ,
    media_name :           { type : String  } ,
    media_dir   :          { type : String  } ,
    is_correct   :         { type : Boolean }

};
var boolean_choices_object = {

    boolean_type :        { type : String } , //=> yes/no OR true/false
    is_correct :          { type : Boolean} // => true (Yes) or false (No)

};
var rating_scales_object = {

    ratscal_type :        { type : Number } , // 0=> Scale or 1=> ratings
    step_number :        { type : Number } ,
    started_at :          { type : String } ,
    centered_at :         { type : String } ,
    ended_at :            { type : String }

};
var answer_bo = {
  type : [

               //choices_object //, // 0 => choices
               //media_choices_object , // 1 => media_choices
               //boolean_choices_object , // 2 => boolean_choices
               //rating_scales_object // 3 => rating_scales

       ]
};
var answer_setting_bo = {
  type : {
    is_randomized :           { type : Boolean }  ,
    super_size:               { type : Boolean }  ,
    single_choice:            { type : Boolean }  ,
    choice_style :            { type : Boolean }  , //Inline or full block
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
        answers_format :            answer_bo , // Under Updateing
        media_question :          { type : { media_type :{ type : Number } , media_name : { type : String } , media_field:{ type : String } } } ,  //  /* url of video */ } } ,
        // attendee_answers :        attendee_ans_bo , => Moving it for report
        question_is_required :    { type : Boolean } ,
        answer_settings :         answer_setting_bo ,
        question_type :            { type : Number } ,
      }
    ]
};
var questionnaireDataTypes = {
   creator_id : { type : String , required : true ,  trim : true  } ,
   app_type : {  type : String ,  required : true  } ,
   theme_style : { type:[] } ,
   description : { type : String ,  trim : true ,  },
   questionnaire_title : {  type : String ,  required :true ,  trim : true },
   createdAt : { type : Date } ,
   updatedAt : {  type : Date   },
   settings :  Questionnaire_settings  ,
   questions : Questionnaire_questions
};

/*
  ++++++++++++++++++++++++++++++++++++++++++++++++
    For Report Collection
  ++++++++++++++++++++++++++++++++++++++++++++++++
*/

var builde_survey_quiz_answers = {
  question_id : { type:mongoose.Schema.ObjectId , unique : true} ,
  questions :   { type : { question_type : {type : Number } ,question_id : {type : String  } , question_body : {type : String} } } ,
  answers :     { type : { answer_id : {type : String} , answer_body : {type : String}   } } ,
  is_correct :  { type : Boolean },
  created_at  : { type : Date }
};

var build_attendees = {
  _id                         : { type:mongoose.Schema.ObjectId }  ,
  attendee_id                 : { type:String ,   unique : false }  ,
  is_completed                : { type:Boolean }  ,
  passed_the_grade            : { type:Boolean }  ,
  results                     : { type : { wrong_answers:{ type:Number } , correct_answers : { type:Number }  , count_of_questions : { type:Number } , result:{ type:{ percentage_value :{type:Number} , raw_value:{type:Number} } } } }  ,
  survey_quiz_answers         : { type : [ builde_survey_quiz_answers ] } ,
  created_at                  : { type : Date } ,
  updated_at                  : { type : Date } ,
  user_information            : { type:String ,   unique : false , ref : "users"}
} ;
var reportDataTypes = {
   questionnaire_id   : { type:String  , ref : "questionnaire" , unique : true } ,
   app_type           : { type: Number  } ,
   creator_id         : { type:String , ref : "users" } ,
   attendees          : { type : [ build_attendees ] } ,
   history            : { type : [ { date_made : Date  , attendee_counts : Number } ] } ,

   // Case survey
    statistics : { type : {
        question_id :{ type : String } ,
        question_body : { type : String } ,
        count  : { type : Number } ,
        question_answers : { type : [
          // repeating case if string value not exists ( answer_body )
          { answer_body : { type : String } , attendees : { type : Number} }
        ]}
    }}
    ,
   created_at         : { type : Date } ,
   updated_at         : { type : Date }
 }
module.exports = {
      userDataTypes , questionnaireDataTypes , reportDataTypes
}
