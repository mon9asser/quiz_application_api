const validator = require('validator');

// +++++++++++++++++++++++++++++++++++++++++++++++
// =============> Users !
// +++++++++++++++++++++++++++++++++++++++++++++++

/**
  @message : Completed Schema
  @issues : [ createdAt - creator - updatedAt ] => not saved 
*/
var userDataTypes = {
    name : {
      type : String ,
      trim: true ,
        required:[true , "Full name required"]
    } ,
    email : {
      type:String ,
      trim:true ,
      unique : [true , "This email already exists"] ,
      required:[true , "Email required"] ,
      validate : {
        validator : validator.isEmail ,
        message : '{VALUE} is not valid email'
      }
    } ,
    password: {
      type: String ,
      required:[true , "Password required"]
    } ,
    creator: {
      type: Number ,
      trim:true
    } ,
    createAt:{
      type : Date ,
      trim:true
    } ,
    updatedAt :{
      type : Date ,
      trim:true
    } ,
    tokens : {
          type : [
            {
              token: {
                type : String
              } ,
              access : { // x-auth-user x-auth-creator
                type :String
              }
            }
          ]
    }
};

module.exports = {
      userDataTypes
}
