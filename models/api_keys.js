
const { mongoose } = require("../database/connx"); 
const { MongoClient , ObjectID } = require("mongodb");
const { clientServersDataType } = require("../database/schema");
const { config , apis } = require("../database/config");
//const simplePassword = require('simple-password');
const bcrypt = require("bcryptjs")
const _ = require("lodash");
const jwt = require("jsonwebtoken");


var apikeySchema = mongoose.Schema(clientServersDataType );
apikeySchema.methods.generate_api_keys = function (){
  var apikey = this ;

  var apikey_id = apikey._id ;
  var email     = apikey.email ;
  var name      = apikey.user_name;
  var appName   = apikey.application_name;
  var api_keys  = jwt.sign(
      { _id:apikey_id.toHexString() , email: email , application_name:appName , name: name } ,
      config.apiSecretKey
  );

  apikey.api_private_keys = api_keys ;
  return apikey.save();
};

apikeySchema.statics.verify_api_keys = function (apiKey , appName){
  // ==> apiKeyFrom : _id+email+application_name+name
  var api_key = this ;
  var verified_keys = null ;
  try {
    verified_keys = jwt.verify( apiKey , config.apiSecretKey);
  } catch (e) {

  }
  if( verified_keys == null){

    return Promise.reject({"Authentication_Failed" : "API keys not verified"});
    return false;
  }
  if(appName != verified_keys.application_name ){
    return Promise.reject({"Authentication_Failed" : "APP_NAME field not correct , please check your json file and write existing application name"});
    return false;
  }
  return api_key.findOne({ _id:verified_keys._id, email:verified_keys.email , application_name:verified_keys.application_name , api_private_keys:apiKey }); // ==> verified
}

var apk = mongoose.model("client_servers" , apikeySchema );

module.exports = {apk};
