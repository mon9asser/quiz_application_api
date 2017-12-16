const {usr} = require("../models/users");
const {qtnr} = require("../models/questionnaires");
const session = require("express-session");
const {apis , config , notes } = require("../database/config");
const _ = require("lodash");


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






module.exports = {authByToken  , build_session , verify_session , verify_token_user_type } ;
