
const { mongoose  } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { questionnaireDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config");

const _ = require("lodash");
const jwt = require("jsonwebtoken");




var questionnaireSchema = mongoose.Schema(questionnaireDataTypes );

/******************************************/
// Update Changes according the requests !
/******************************************/
questionnaireSchema.methods.update_changes = function (app_id , changes){
  

  // Settings
  // General Updates
  // questions
  // answers
  // attendee answers
  // report casess

};

var qtnr = mongoose.model("questionnaire" , questionnaireSchema );

module.exports = {qtnr};
