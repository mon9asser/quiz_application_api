
const { mongoose  } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { userDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config");

const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require ("bcryptjs");

var questionnaireSchema = mongoose.Schema(questionnaireDataTypes );

var questionnaire = mongoose.model("questionnaire" , questionnaireSchema );

module.exports = {questionnaire};
