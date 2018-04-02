
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
  var attendee_draft = this ;
  attendee_draft.push(attendee_draft);
};
var drft = mongoose.model("attendee_drafts" , attendeeDraftSchema );
module.exports = {drft};
