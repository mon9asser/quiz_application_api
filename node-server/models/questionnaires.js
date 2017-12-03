
const { mongoose  } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { questionnaireDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config");
const deepPopulate = require('mongoose-deep-populate')(mongoose);

const _ = require("lodash");
const jwt = require("jsonwebtoken");



var Schema = mongoose.Schema;
var questionnaireSchema = new Schema(questionnaireDataTypes);
questionnaireSchema.plugin(deepPopulate, {} /* more on options below */);


var qtnr = mongoose.model("questionnaire" , questionnaireSchema );

module.exports = {qtnr};
