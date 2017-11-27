
const { mongoose  } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { questionnaireDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config");

const _ = require("lodash");
const jwt = require("jsonwebtoken");



var Schema = mongoose.Schema;
var questionnaireSchema = new Schema(questionnaireDataTypes);



/******************************************/
// Update Changes according the requests !
/******************************************/
questionnaireSchema.methods.update_theme_stylsheet = function (theme_id ,data){
 
 console.log(this.settings.titles);
};
// Settings
// General Updates
// questions
// answers
// attendee answers
// report casess
var qtnr = mongoose.model("questionnaire" , questionnaireSchema );

module.exports = {qtnr};
