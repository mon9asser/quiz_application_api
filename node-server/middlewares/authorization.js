const {apis , config} = require("../database/config");
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
			res.status(401).send(error);
		});
};

module.exports = {authByTokenWCreatorType};
