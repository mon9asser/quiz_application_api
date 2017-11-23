
const { mongoose  } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { questionnaireDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config");

const _ = require("lodash");
const jwt = require("jsonwebtoken");
 

var questionnaireSchema = mongoose.Schema(questionnaireDataTypes );

// --------------------------
// Update Basics
// --------------------------
questionnaireSchema.statics.questionnaire_basics = function(app_id , body){
   var qusu = this ;
   qusu.findByIdAndUpdate(app_id , {$set:body} ,{new:true}).then((result)=>{

   });
};
var qtnr = mongoose.model("questionnaire" , questionnaireSchema );

module.exports = {qtnr};
