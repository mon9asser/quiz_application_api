
const { mongoose  } = require("../database/connx");
const { MongoClient , ObjectID } = require("mongodb");
const { questionnaireDataTypes } = require("../database/schema");
const { config , apis } = require("../database/config");

const _ = require("lodash");
const jwt = require("jsonwebtoken");

var Schema = mongoose.Schema;
var questionnaireSchema = new Schema(questionnaireDataTypes);
//  questionnaireSchema.statics.qtnr_find_by_id = function (qtnrId){
//   var qtnr = this ;
//   return qtnr.findOne(qtnrId , (error , docQtnr )=>{
//       return docQtnr ;
//   });
// };

var qtnr = mongoose.model("questionnaire" , questionnaireSchema );

module.exports = {qtnr};
