const mongoose = require("mongoose");
const _ = require("lodash");
var config = {
    server_ip:             'http://34.215.133.182/' , // http://34.215.133.182/
    port :                  ':27017' ,
    database_name :         '/todo' ,
    host_name:              'mongodb://localhost' ,
    options :                 { useMongoClient:true }   ,
    server_port :            process.env.port || 80  ,
    session_access : false ,
    default_records_per_page : 5 ,
    token_expiration_time : 9 , // means 9 hours  // => can be 500 hrs also
    secretCode :             "@5rU5d@!tsd&$90f*&#5$~1100sdk$oprFRTgkjfddY1%js",
    apiSecret :              "DRdsd542sder@sds&%4sd854sd=+sds54sderSSfdf##$%@sd",
    apiSecretKey :           "s8Ee~$rV9%#t+T@y&9cY*c-!vJ^Pu" ,
    restricted_api_header :   "dfV@%4$5v^xs)@5rY*c-!vJ^$90f*&amp;#5$~U5d@!tsd&amp;$90f*&amp;#(cY*c-56)}8$~1100sdk$oprFRTgkEe~$rV9%#t+T@y1DR2VG5YU4XS}+$+&amp;%*tY"
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
                  Error_Application_Verify : {
                    "Authentication_Failed":"API keys not verified"
                  } ,
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
                   Error_file_extension : {error : "File should be an 'image' or video format ended with 'png' , 'gif' , 'jpg' or 'jpeg'"} ,
                   Error_prevent_use : { error : "You couldn't able to use this api from another host please go to this `right_path` to create an account"  , right_path : config.server_ip+"application/create"  }
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
                      return `These ${data} aren't Updated because there are no data !`;
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
     description : "Write description for this app !" ,
     settings : {
         titles : { title_start_with : "Write Starting Text"  , title_end_with: "Write Ending Text" , title_success_with : " Success quiz Text" , title_failed_with : "Quiz Failed Text"} ,
         label_btns : {lbl_start_with:"Start" , lbl_continue_with : "Continue" , lbl_retake_with : "Retake" , lbl_review_with : "Review"} ,
         grade_settings : { is_graded : false , value : 90 } ,
         time_settings : { is_with_time:false , value : "15" , timer_type : false , timer_layout : 0 },
         progression_bar : {is_available:true , progression_bar_layout:0} ,
        //  theme_style : [] ,
         randomize_settings : false ,
         step_type : true ,
         show_results_per_qs :false ,
         retake_setting : false ,
         navigation_btns : false ,
         review_setting : true ,
         createdAt : new Date(),
         updatedAt : new Date ()
     } ,
     questions : []   ,
     createdAt : new Date(),
     updatedAt : new Date ()
  }
};
module.exports = {config , apis , application , notes  };
