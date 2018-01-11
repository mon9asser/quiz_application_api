
const { mongoose } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { userDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config");
//const simplePassword = require('simple-password');
const bcrypt = require("bcryptjs")
const _ = require("lodash");
const jwt = require("jsonwebtoken");

var userSchema = mongoose.Schema(userDataTypes );

userSchema.methods.toJSON = function (){
  var usr = this ;
  var usrObject = usr.toObject();
  return _.pick(usrObject , ['_id' ,'email', 'name' , 'access_type']);
}

 
// userSchema.statics.verifyTokens = function(token){
//
//   var usr = this ;
//   var verified ;
//wher can i find this folder
// 12:55
// where
//
//   try {
//       verified = jwt.verify( token  , config.secretCode );
//   } catch (e) {
//       return Promise.reject({"Message":"unverified token !"});
//   }
//
//   return usr.findOne({
//      _id :             verified._id      ,
//      'tokens.access':  verified.access.toString()   ,
//      'tokens.token':   token
//  })
// };

// userSchema.methods.generateAuthentication = function(){
//   var usr = this;
//   var access = apis._auth_ ;
//   var token = jwt.sign({_id:usr._id.toHexString() , access} ,config.secretCode);
//   usr.createdOn = new Date();
//   usr.updatedOn = new Date();
//   usr.tokens.push({
//       token : token ,
//       access : access
//   });
//   return usr.save().then(()=>{
//     return token ;
//   });
// };

var usr = mongoose.model("users" , userSchema );

module.exports = {usr};
