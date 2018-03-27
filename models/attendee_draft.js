
const { mongoose } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { attendeeDraftDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config");
//const simplePassword = require('simple-password');
const bcrypt = require("bcryptjs")
const _ = require("lodash");
const jwt = require("jsonwebtoken");

var attendeeDraftSchema = mongoose.Schema(attendeeDraftDataTypes );
attendeeDraftSchema.statics.save_attendee_draft = function (app_id ,attendee_draft ){
  console.log(app_id);
  console.log(attendee_draft);
};
var drft = mongoose.model("attendee_draft" , attendeeDraftSchema );
module.exports = {drft};
