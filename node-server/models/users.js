
const { mongoose } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { userDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config");
//const simplePassword = require('simple-password');
const bcrypt = require("bcryptjs")
const _ = require("lodash");
const jwt = require("jsonwebtoken");


var userSchema = mongoose.Schema(userDataTypes );


// userSchema.statics.comparePassword = function(candidatePassword, cb) {
//   bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//       if (err) return cb(err);
//       cb(null, isMatch);
//   });
// };

 // userSchema.pre('save', function(next) {
 //   var user = this;
 //
 //  // only hash the password if it has been modified (or is new)
 //  if (!user.isModified('password')) return next();
 //  var pass = user.password.toString() ;
 //  // generate a salt
 //  bcrypt.genSalt(10, function(err, salt) {
 //      if (err) return next(err);
 //
 //      // hash the password along with our new salt
 //      bcrypt.hash(pass, salt, function(err, hash) {
 //          if (err) return next(err);
 //
 //          // override the cleartext password with the hashed one
 //          user.password = hash;
 //          next();
 //      });
 //  });
 // });

userSchema.methods.toJSON = function (){
  var usr = this ;
  var usrObject = usr.toObject();
  return _.pick(usrObject , ['_id' ,'email', 'name' , 'access_type']);
}
userSchema.statics.verifyTokens = function(token){

  var usr = this ;
  var verified ;


  try {
      verified = jwt.verify( token  , config.secretCode );
  } catch (e) {
      return Promise.reject({"Message":"unverified token !"});
  }
 
  return usr.findOne({
     _id :             verified._id      ,
     'tokens.access':  verified.access.toString()   ,
     'tokens.token':   token
 })
};

userSchema.methods.generateAuthentication = function(){
  var usr = this;
  var access = apis._auth_ ;
  var token = jwt.sign({_id:usr._id.toHexString() , access} ,config.secretCode);
  usr.createdOn = new Date();
  usr.updatedOn = new Date();
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
