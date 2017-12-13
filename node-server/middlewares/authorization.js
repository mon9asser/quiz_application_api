const {apis , config} = require("../database/config");
const { rpt } = require( "../models/reports" );
const {usr} = require( "../models/users" );

var authByTokenWCreatorType = function ( req , res , next ) {
	var token = req.header("x-auth");
 	if(!token){
		return   res.status(404).send(apis.unauth) ;
	}
	usr.verifyTokens(token).then((user)=>{
		if(!user)
      res.status(404).send(apis.notfound_message);

    if(user.is_creator != 1 )
      res.status(401).send(apis.user_unauthorized);

    req.user = user ;
		req.token = token ;
		next();
		}).catch((error)=>{
			return new Promise((resolve , reject )=>{
				res.status(401).send(error);
			});
		});
};

var can_i_access_that = function(req,res,next){
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
				res.status(401).send(apis.permission_denied)  ;
		 });
		}

	 var token = req.header("x-auth");

	 usr.verifyTokens(token).then(( user ) => {

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
					 res.status(401).send(apis.permission_denied)  ;
				});
			 }
				var token = req.header("x-auth");
			 usr.verifyTokens(token).then((user)=>{
					if(!user)
					 {
						 return new Promise((resolve, reject) => {
							 res.status(401).send(apis.permission_denied);
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
				 req.isAdmin =  user.is_creator ;
				 req.verified_user = user ;
				 req.verified_token = token ;
				 req.verified_user_type = user.is_creator ;


			 }).then(()=>{

 				 var  accesor_id ;
				 if (req.params.creator_id) accesor_id =  {creator_id:req.params.creator_id} ;
				 if (req.params.app_id) accesor_id =  {questionnaire_id:req.params.app_id} ;
 				 rpt.findOne ( accesor_id , (errors , rptDocument )=>{

					 if(!rptDocument){
						 return new Promise((resolve, reject) => {
							 res.status(401).send("There are no recordes !");
						 });
					  }

 				  if(rptDocument.creator_id != req.verified_user.id){
						 return new Promise((resolve, reject) => {
							res.status(401).send(apis.permission_denied);
						});
					}

					req.RptDocument = rptDocument;
 					 next();
				 });
			 }).catch((error)=>{
					 res.status(401).send(error);
				 });
	 });


}
module.exports = {authByTokenWCreatorType , can_i_access_that};
