
const { mongoose  } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { questionnaireDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config");

const _ = require("lodash");
const jwt = require("jsonwebtoken");
 

var questionnaireSchema = mongoose.Schema(questionnaireDataTypes );

var qtnr = mongoose.model("questionnaire" , questionnaireSchema );

module.exports = {qtnr};
