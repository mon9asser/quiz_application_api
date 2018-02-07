const {usr} = require("../models/users");
const {qtnr} = require("../models/questionnaires");
const {rpt} = require ("../models/reports");

const session = require("express-session");
const {apis , config , notes } = require("../database/config");
const {apk} = require("../models/api_keys");
const _ = require("lodash");
const jwt = require("jsonwebtoken");

var build_session = session({
  secret : config.apiSecret ,
  resave : true ,
  saveUninitialized : true
});

var verify_session = function (req,res,next){
    if(!req.session.userInfo)
      {
        return new Promise((resolve, reject) => {
            res.redirect("/login")   ;
         });
      }
      next();
}

// => This Middleware for Authenticate by token
const authByToken = function ( req , res , next ) {

 	if(!req.header("x-auth")){
    new Promise((resolve , reject )=>{
      res.status(404).send(notes.Errors.Error_Header_found);
    });
	}
	var token = req.header("x-auth");
	usr.verifyTokens(token).then((user)=>{
		if(!user)
			{
        return new Promise((resolve , reject)=>{
           res.status(204).send( `${notes.Errors.Error_User_found}`  );
        });
			}
		req.user = user ;
		req.token = token ;

		next();
		}).catch((error)=>{
        return new Promise((resolve , reject )=>{
          res.status(400).send( `${notes.Errors.General_Error}`  );
        });
		});
};

var verify_token_user_type = function(req,res,next){

    if(config.session_access == true){
      if(!req.session.userInfo)
          {
            return new Promise((resolve, reject) => {
              return res.redirect("/logout")   ;
            });
          }
    }
   if(!req.header("x-auth")){
      return new Promise((resolve, reject) => {
        res.status(401).send(notes.Warnings.Permission_Warning);
     });
    }
     var token = req.header("x-auth");
    usr.verifyTokens(token).then((user)=>{

       if(!user)
        {
          return new Promise((resolve, reject) => {
              res.status(401).send(notes.Warnings.Permission_Warning);
          });
        }

      //  Detect if this is right user
      if(config.session_access  == true){
        if(user.id.toString() != req.session.userInfo.id.toString())
          {
            return new Promise((resolve, reject) => {
              return res.redirect("/logout");
             });
          }
      }
      req.verified_user = user ;
      req.verified_token = token ;
      req.verified_user_type = user.is_creator ;
      next();
      }).catch((error)=>{
        return new Promise((resolve , reject )=>{
           res.status(400).send( notes.Errors.Unverified_Tokens );
        });
      });
};

var verify_api_keys_user_apis = function (req , res , next )   {
  if(!req.header("X-api-keys") || !req.header("X-api-app-name")){
     return new Promise((resolve, reject) => {
       res.status(401).send(notes.Errors.Error_Application_Verify);
    });
   }

  var api_keys = req.header("X-api-keys");
  var app_name = req.header("X-api-app-name");
  apk.verify_api_keys(api_keys , app_name ).then((apk_key)=>{

    if(!apk_key || apk_key == null || apk_key == ''){
      return new Promise((resolve , reject)=>{
        res.send({"Authentication_Failed" : "Your Application keys not verified ! to use our API please create 'api keys'"});
      });
    }

    if(apk_key.length != 0){
      next();
    }

  }).catch((error)=>{
    res.status(404).send(error);
  });

}



var generate_tokens = function (req,res,next){
  if(req.body.creator_id == null){

  }else if(req.body.attendee_id == null ){

  }
  next();
};
var auth_verify_api_keys_tokens  =   function (req , res , next )   {
  if(!req.header("X-api-keys") || !req.header("X-api-app-name")){
     return new Promise((resolve, reject) => {
       res.status(401).send(notes.Errors.Error_Application_Verify);
    });
   }
  var api_keys = req.header("X-api-keys");
  var app_name = req.header("X-api-app-name");
  apk.verify_api_keys(api_keys , app_name ).then((apk_key)=>{

    if(!apk_key || apk_key == null || apk_key == ''){
      return new Promise((resolve , reject)=>{
        res.send({"Authentication_Failed" : "Your Application keys not verified ! to use our API please create 'api keys'"});
      });
    }
    if(apk_key.length != 0){
      // ==> Verify current user status ( 0 1) => user type
      if( req.body.creator_id == null  ){
        return new Promise((resolve , reject)=>{
          res.send({
            "Required" : notes.Messages.Required_Message("creator_id")
          });
        });
      }

     var creator_id = req.body.creator_id;
     usr.findOne({_id:creator_id} , (error , user)=>{
       if(!user || error ){
         return new Promise((resolve , reject)=>{
           res.send({"Error":notes.Errors.Error_Doesnt_exists("Creator")});
         });
       }
        if(config.session_access == true){
          if(!req.session.userInfo)
            {
              return new Promise((resolve, reject) => {
                return res.redirect("/logout")   ;
              });
            }
        }

        if(!user){
          return new Promise((resolve, reject) => {
              res.status(401).send(notes.Warnings.Permission_Warning);
          });
        }

        req.verified_user = user ;
        req.is_creator  =  user.is_creator ;

        var date_now = new Date();
        // Generate an expire tokens
        var generated_token   ;
        try {
          generated_token = jwt.sign({ _id: user._id.toHexString() ,  date_made :date_now } ,config.secretCode)
        } catch (e) {
          return Promise.reject(e);
        }


        user.tokens = generated_token ;
        user.save();
        next();
     }) ;
    }
  }).catch((error)=>{
    res.status(404).send(error);
  });

}

var auth_verify_generated_tokens  =   function (req , res , next )   {
  if(!req.header("X-api-keys") || !req.header("X-api-app-name")){
     return new Promise((resolve, reject) => {
       res.status(401).send(notes.Errors.Error_Application_Verify);
    });
   }

   if(!req.header("X-app-token")){
      return new Promise((resolve, reject) => {
        res.status(401).send({"Warning":"Unverified app token !!"});
     });
  }

  var api_keys  = req.header("X-api-keys");
  var app_name  = req.header("X-api-app-name");
  var app_token = req.header("X-app-token");
  apk.verify_api_keys(api_keys , app_name ).then((apk_key)=>{

    if(!apk_key || apk_key == null || apk_key == ''){
      return new Promise((resolve , reject)=>{
        res.send({"Authentication_Failed" : "Your Application keys not verified ! to use our API please create 'api keys'"});
      });
    }
    if(apk_key.length != 0){
      // ==> Verify current user status ( 0 1) => user type
      if( req.body.creator_id == null  ){
        return new Promise((resolve , reject)=>{
          res.send({"Required" : notes.Messages.Required_Message("creator_id")});
        });
      }

     var creator_id = req.body.creator_id;
     usr.findOne({_id:creator_id} , (error , user)=>{
       if(!user || error ){
         return new Promise((resolve , reject)=>{
           res.send({"Error":notes.Errors.Error_Doesnt_exists("Creator")});
         });
       } // _id: user._id.toHexString() ,  date_made :date_now } ,config.secretCode)
       // Verify Token
        var decoded ;
       try {
         decoded = jwt.verify( app_token , config.secretCode );
       } catch (e) {
         return new Promise((resolve, reject) => {
           res.status(401).send({"Error":"Undefined Token !!"});
        });
       }

        // Verify this token
        var tokenDate = new Date(decoded.date_made);
        var currDate = new Date();
        var timeDiff =  currDate.getTime() - tokenDate.getTime() ;
        var hours = _.ceil(timeDiff / (1000 * 3600));
        console.log(hours);
        if(hours > config.default_records_per_page){
          return new Promise((resolve , reject)=>{
            res.send({"Warning": "Token is expired !!"})
          });
        }
        //   var days =  timeDiff / (1000 * 3600 * 24) ;
        // ==> End Verified token here !!
        if(config.session_access == true){
          if(!req.session.userInfo)
            {
              return new Promise((resolve, reject) => {
                return res.redirect("/logout")   ;
              });
            }
        }

        if(!user){
          return new Promise((resolve, reject) => {
              res.status(401).send(notes.Warnings.Permission_Warning);
          });
        }

        req.verified_user = user ;
        req.is_creator  =  user.is_creator ;

        next();
     }) ;
    }
  }).catch((error)=>{
    res.status(404).send(error);
  });

}
//----------------------------------------------------------
var auth_verify_api_keys  =   function (req , res , next )   {
  if(!req.header("X-api-keys") || !req.header("X-api-app-name")){
     return new Promise((resolve, reject) => {
       res.status(401).send(notes.Errors.Error_Application_Verify);
    });
   }
  var api_keys = req.header("X-api-keys");
  var app_name = req.header("X-api-app-name");
  apk.verify_api_keys(api_keys , app_name ).then((apk_key)=>{

    if(!apk_key || apk_key == null || apk_key == ''){
      return new Promise((resolve , reject)=>{
        res.send({"Authentication_Failed" : "Your Application keys not verified ! to use our API please create 'api keys'"});
      });
    }
    if(apk_key.length != 0){
      // ==> Verify current user status ( 0 1) => user type
      if( req.body.creator_id == null  ){
        return new Promise((resolve , reject)=>{
          res.send({"Required" :notes.Messages.Required_Message("creator_id")});
        });
      }

     var creator_id = req.body.creator_id;
     usr.findOne({_id:creator_id} , (error , user)=>{
       if(!user || error ){
         return new Promise((resolve , reject)=>{
           res.send({"Error":notes.Errors.Error_Doesnt_exists("Creator")});
         });
       }
        if(config.session_access == true){
          if(!req.session.userInfo)
            {
              return new Promise((resolve, reject) => {
                return res.redirect("/logout")   ;
              });
            }
        }

        if(!user){
          return new Promise((resolve, reject) => {
              res.status(401).send(notes.Warnings.Permission_Warning);
          });
        }

        req.verified_user = user ;
        req.is_creator  =  user.is_creator ;

        next();
     }) ;
    }
  }).catch((error)=>{
    res.status(404).send(error);
  });

}

// var api_key_reprot_auth = function (req ,res ,next){
//   if(!req.header("X-api-keys") || !req.header("X-api-app-name")){
//      return new Promise((resolve, reject) => {
//        res.status(401).send(notes.Errors.Error_Application_Verify);
//     });
//    }
//  var api_keys = req.header("X-api-keys");
//  var app_name = req.header("X-api-app-name");
//  apk.verify_api_keys(api_keys , app_name ).then((apk_key)=>{
//    if(!apk_key || apk_key == null || apk_key == ''){
//      return new Promise((resolve , reject)=>{
//        res.send({"Authentication_Failed" : "Your Application keys not verified ! to use our API please create 'api keys'"});
//      });
//    }
//
//    if(apk_key.length == 0){
//      // ==> Verify current user status ( 0 1) => user type
//      return new Promise((resolve,reject)=>{
//          res.send({"Authentication_Failed" : "Your Application keys not verified ! to use our API please create 'api keys'"});
//      });
//     }
//
//     if( req.body.attendee_id == null  ){
//       return new Promise((resolve,reject)=>{
//           res.send({"Required" : "attendee_id field is required !"});
//       });
//     }
//
//
//     var attendee_id = req.body.attendee_id;
//     usr.findOne({_id:attendee_id}).then((user)=>{
//       if(!user){
//           return new Promise((resolve, reject) => {
//               res.status(401).send(notes.Warnings.Permission_Warning);
//           });
//         }
//
//       req.user_id = user._id ;
//       req.verified_user = user ;
//       req.verified_user_type = user.is_creator ;
//       req.isAdmin =  user.is_creator ;
//       // Detect if this repost available or not
//
//     });
//  });
//
//
//  var app_id = req.params.app_id;
//  rpt.findOne ( { questionnaire_id : app_id } , (errors , rptDocument )=>{
//    //if(!rptDocument ){
//     //   return new Promise((resolve, reject) => {
//     //    res.status(401).send("There are no recordes !");
//     //   });
//     //}
//     //  console.log(rptDocument.creator_id +"{ ++ }"+req.user_id);
//     //  if(rptDocument.creator_id != req.user_id){
//     //    return new Promise((resolve, reject) => {
//     //       res.status(401).send(apis.permission_denied);
//     //     });
//     //  }
//    console.log(rptDocument);
//    req.RptDocument = rptDocument;
//    next();
//  });
//
// };









var api_key_report_auth = function (req ,res ,next){
  if(!req.header("X-api-keys") || !req.header("X-api-app-name")){
     return new Promise((resolve, reject) => {
       res.status(401).send(notes.Errors.Error_Application_Verify);
    });
   }
 var api_keys = req.header("X-api-keys");
 var app_name = req.header("X-api-app-name");
 apk.verify_api_keys(api_keys , app_name ).then((apk_key)=>{

   if(!apk_key || apk_key == null || apk_key == ''){
     return new Promise((resolve , reject)=>{
       res.send({"Authentication_Failed" : "Your Application keys not verified ! to use our API please create 'api keys'"});
     });
   }

   if(apk_key.length == 0){
       return new Promise((resolve,reject)=>{
           res.send({"Authentication_Failed" : "Your Application keys not verified ! to use our API please create 'api keys'"});
       });
    }

    next();
 }).catch((error)=>{
   return new Promise((resolve , reject)=>{
     res.send({"Authentication_Failed" : "Your Application keys not verified ! to use our API please create 'api keys'"});
   });
 });

};


var verify_access_tokens_admin_user = function (req  , res  , next ){
  // ================> Params
  var token = req.params.token;
  var app_id = req.params.app_id ;

  var decoded ;
  try {
     decoded = jwt.verify( token , config.secretCode );
  } catch (e) {
     return new Promise((resolve, reject) => {
       res.status(401).render(
         "page-401" ,
         {"data_401":"Undefined Token !! , Please generate a token" }
       );
    });
  }

  return usr.findOne({
    '_id' : decoded._id
  } , (error , user )=>{

      if(error || !user ){
          return new Promise((resolve, reject) => {
              res.status(404).render(
                "page-404" ,
                  {"data_404":"User does not exists" }
                );
          });
      }

      // => detect the token value ( expiration date )
      var tokenDate = new Date(decoded.date_made);
      var currDate = new Date();
      var timeDiff =  currDate.getTime() - tokenDate.getTime() ;
      var hours = _.ceil(timeDiff / (1000 * 3600));

      if(hours > config.default_records_per_page){
        return new Promise((resolve , reject)=>{
          res.status(403).render(
              "page-403" ,
              {"data_403":"Token is expired !! , Please generate a new token" , user : req.user}
            )
        });
      }

      req.user = {
        name  :  user.name ,
        email :  user.email ,
        userType : user.is_creator ,
        id : user.id
      };
      next();
  });

};

module.exports = {verify_access_tokens_admin_user , api_key_report_auth , auth_verify_generated_tokens, auth_verify_api_keys_tokens , generate_tokens, auth_verify_api_keys ,  verify_api_keys_user_apis , authByToken  , build_session , verify_session , verify_token_user_type } ;
