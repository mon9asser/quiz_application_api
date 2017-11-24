const mongoose = require("mongoose");

var config = {
    port :                  ':27017' ,
    database_name :         '/quiz-application' ,
    host_name:              'mongodb://localhost' ,
    options :                { useMongoClient:true } ,
    server_port :            process.env.port || 3000 ,
    secretCode :             "@5rU5d@!tsd&$90f*&#5$~1100sdk$oprFRTgkjfddY1%js",
    apiSecret :              "DRdsd542sder@sds&%4sd854sd=+sds54sderSSfdf##$%@sd"
};

var apis = {
  _dir_   : '/api' ,
  _auth_  : 'auth-200' ,
  unauth :  "Unauthorized message !"  ,  // Access token not right
  notfound_message :  "Page Not Found !" ,
  user_unauthorized : "Authorization is required" ,
  permission_denied : "You dont have any permission to use This Api " ,
  general_error : "Something wen wrong , please try later !" ,
  authorize_success : "Your permission is successed to use this api .."
};

// => Default Settings to init the app when user create !!
var application = {
  questionnaire : {
     creator_id : null ,
     app_type : null ,
     questionnaire_title : null ,
     description : null ,
     description : "Write description for this app !" ,
     settings : {
         titles : { start_with : "Write Starting Text"  , end_with: "Write Ending Text" , success_with : " Success quiz Text" , faild_with : "Quiz Faild Text"} ,
         label_btns : {start_with:"Start" , continue_with : "Continue" , retake_with : "Retake" , review_with : "Review"} ,
         grade_settings : { is_graded : false , value : 90 } ,
         time_settings : { is_with_time:false , value : "15" , timer_type : "mins" , timer_layout : 0 },
         progression_bar : {is_available:true , progression_bar_layout:0} ,
         quiz_theme_style : [ { id:mongoose.Types.ObjectId() ,  style_file_dir : 'theme_'+mongoose.Types.ObjectId()+'.css' , stylesheet: [ /*under update*/ ] } ] ,
         randomize_settings : false ,
         step_type : true ,
         retake_setting : false ,
         navigation_btns : false ,
         review_setting : true ,
         quiz_status : [] ,
         createdAt : new Date(),
         updatedAt : new Date ()
     } ,
     questions : []   ,
     createdAt : new Date(),
     updatedAt : new Date ()
  }
};
module.exports = {config , apis , application};
