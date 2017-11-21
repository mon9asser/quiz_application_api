const {usr} = require("../models/users");
const {qtnr} = require("../models/questionnaires");
const {apis} = require("../database/config");



// => This Middleware for Authenticate by token
const authByToken = function ( req , res , next ) {

	var token = req.header("x-auth");
 	if(!token){
		return   res.status(404).send(apis.unauth) ;
	}
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
module.exports = {authByToken} ;
