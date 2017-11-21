
const { mongoose  } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { reportDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config"); 

const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require ("bcryptjs");

var reportSchema = mongoose.Schema(reportDataTypes );

// --------------------------
// Add Default Settings
// --------------------------

var rpts = mongoose.model("reports" , reportSchema );

module.exports = {rpts};
