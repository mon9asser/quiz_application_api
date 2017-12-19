const mongoose = require("mongoose");
const _ = require("lodash");
var config = {
    port :                  ':27017' ,
    database_name :         '/todo' ,
    host_name:              'mongodb://localhost' ,
    options :                { useMongoClient:true } ,
    server_port :            process.env.port || 9000 ,
    session_access : false ,
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
  general_error : "Something went wrong , please try later !" ,
  authorize_success : "Your permission is successed to use this api .."
};

var notes = {
   "Warnings"   : {
                   Permission_Warning : { Warning : "You couldn't able to access this api ! because you dont have a permission !" }
                 },
  "Errors"     : {
                   Error_Doesnt_exists : function (data) {
                     return `This '${data}' does not exists`;
                   },
                   duplication : function (dup){
                     return `This answer id : ${dup} already exists ! , duplication is rejected`
                   },
                   Not_Available : function (message){
                     return `The '${message}' Not Available !`;
                   }
                   ,
                   Error_not_found : { error : "Not Found !" }  ,
                   Error_Header_found : { error : "Header is required" } ,
                   Error_User_found :   { error : `This User does not exists`} ,
                   General_Error :      { error : `Something Went wrong! please try later`} ,
                   Unverified_Tokens :  { error : "Unverified Token !"} ,
                   Error_file_extension : {error : "File should be an 'image' or video format ended with '.png' , 'jpg' or 'jpeg' or  youtube video url , vimeo video url"}
                 },
  "Messages"   : {
                   Required_Message : function (field){
                      var manyFields = '';
                      if(_.isArray(field)){
                        for (var i = 0; i < field.length ; i++){
                            manyFields += field[i] ;
                            if(i != (field.length -1))
                              manyFields += " , ";
                        }
                      } else manyFields = field ;
                      var field_w , def_xx , df_fff;
                      if(_.isArray(field))
                      {
                        if(field.length > 1 ){
                          field_w = "Fields" ;
                          def_xx = "are"
                          df_fff = "These"
                        }else {
                          field_w = "Field" ;
                          def_xx = "is";
                          df_fff = "This";
                        }
                      }else{
                        field_w = "Field" ;
                        def_xx = "is";
                        df_fff = "This";
                      }
                       return `${df_fff} ${field_w} '${manyFields}' ${def_xx} required`;
                    } ,
                    Update_Message_Not_completed : function (data){
                      return `This ${data} Not Updated because there is no data !`;
                    } ,
                    Stylesheet_Enough : {"Message":"Be inform that , We have added only 11 attributes from your data as a maximum for each time"}
                  }
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
         titles : { title_start_with : "Write Starting Text"  , title_end_with: "Write Ending Text" , title_success_with : " Success quiz Text" , title_faild_with : "Quiz Faild Text"} ,
         label_btns : {lbl_start_with:"Start" , lbl_continue_with : "Continue" , lbl_retake_with : "Retake" , lbl_review_with : "Review"} ,
         grade_settings : { is_graded : false , value : 90 } ,
         time_settings : { is_with_time:false , value : "15" , timer_type : "mins" , timer_layout : 0 },
         progression_bar : {is_available:true , progression_bar_layout:0} ,
         theme_style : []  ,
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
module.exports = {config , apis , application , notes  };
