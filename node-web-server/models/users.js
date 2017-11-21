
const { mongoose  } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { userDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config");

const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require ("bcryptjs");

var userSchema = mongoose.Schema(userDataTypes );

userSchema.pre('save', function(next) {
  var usr = this ;
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash( usr.password , salt, function(err, hash) {
         usr.password =  hash ;
         usr.save().then(()=>{
           return ;
         });
    });
});
  next();
});

userSchema.methods.toJSON = function (){
  var usr = this ;
  var usrObject = usr.toObject();
  return _.pick(usrObject , ['_id' ,'email', 'name' , 'creator']);
}
userSchema.statics.verifyTokens = function(token){

  var usr = this ;
  var verified ;
  try {
      verified = jwt.verify(token , config.secretCode );
  } catch (e) {
    return Promise.reject(apis.unauth);
  }
  return usr.findOne({
     _id :             verified._id      ,
     'tokens.access':  verified.access.toString()   ,
     'tokens.token':   token
 });
};
userSchema.methods.generateAuthentication = function(){
  var usr = this;
  var access = apis._auth_ ;
  var token = jwt.sign({_id:usr._id.toHexString() , access} ,config.secretCode);
  usr.tokens.push({
      token : token ,
      access : access
  });
  return usr.save().then(()=>{
    return token ;
  });
};

var usr = mongoose.model("users" , userSchema );

module.exports = {usr};
