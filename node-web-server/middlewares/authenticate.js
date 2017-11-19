const {usr} = require("../models/users");
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

module.exports = {authByToken}
