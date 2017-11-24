const {usr} = require("../models/users");
const {qtnr} = require("../models/questionnaires");
const session = require("express-session");
const {apis , config} = require("../database/config");
const _ = require("lodash");


// => This Middleware for Authenticate by token
const authByToken = function ( req , res , next ) {

 	if(!req.header("x-auth")){
		return   res.status(404).send(apis.unauth) ;
	}
	var token = req.header("x-auth");
	usr.verifyTokens(token).then((user)=>{
		if(!user)
			{
				res.status(404).send(apis.notfound_message);
			}
		req.user = user ;
		req.token = token ;

		next();
		}).catch((error)=>{
			res.status(401).send(error);
		});
};

var build_session = session({
  secret : config.apiSecret ,
  resave : true ,
  saveUninitialized : true
});

var verify_session = function (req,res,next){
    if(!req.session.userInfo)
      res.redirect("/login");


     next();
}

// const authAppType = function (req , res , next){
// 	// Detect about application type
// var application = req.originalUrl.split('/')[2].toString() ;
// var app_type ;
// 		if(application == 'quiz')
// 			app_type = true ;
// 		else
// 			app_type = false  ;
//
// 	req.app_type = app_type ;
// 	qtnr.findOne({_id:req.params.app_id,app_type:app_type}).then((qusu)=>{
// 			req.que = qusu ;
// 	}).catch();
// 	next();
// };
var build_header = function (req , res , next ){
	// Dedect session Firstly
	 if(!req.session.userInfo)
	 	res.status(401).send();


    var token , tokenx , usrId;

    try {
      usrId = req.session.userInfo.id
    } catch (e) {
      console.log(e);
    }

	// Find this user
	return usr.findById(usrId).then((user)=>{
      tokenx = user.tokens[_.findLastIndex(user.tokens)].token;
       req.token = req.session.header =  tokenx ;
      next();
	}).catch((er)=>{
      res.status(400).send(er);
  });
	next();
};
module.exports = {authByToken , build_header , build_session , verify_session } ;
