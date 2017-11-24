const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const {ObjectID} = require("mongodb");
const {apis , config , application } = require("../../database/config");
const {authByToken , verify_token_user_type , verify_session , build_session} = require("../../middlewares/authenticate") ;
const {authByTokenWCreatorType}  = require("../../middlewares/authorization") ;
const {qtnr} = require("../../models/questionnaires");
const {usr} = require ("../../models/users");

//**************************************************************
/* ****************/// For Testing only
//**************************************************************

// ==============================================> End the test

var qtnrRouters = express.Router();

qtnrRouters.use(bodyParser.json());
qtnrRouters.use(bodyParser.urlencoded({ extended: false}));
qtnrRouters.use(build_session);




//========================================
// =========> /api/create => post|get
//========================================
qtnrRouters.get("/create" , verify_token_user_type ,  ( req , res ) => {
  var user = req.verified_user ;
  var userType = req.verified_user_type;
  var token = req.verified_token;

  // this user should be a creator user !
  if( userType != 1 ){
     return new Promise((resolve, reject) => {
        res.status(401).send({"error":apis.permission_denied});
     });
  }
  res.send(apis.authorize_success);
});
 qtnrRouters.post("/create" , verify_token_user_type ,  ( req , res ) => {

    var user = req.verified_user ;
    var userType = req.verified_user_type;
    var token = req.verified_token;

    // this user should be a creator user !
    if( userType != 1 ){
       return new Promise((resolve, reject) => {
          res.status(401).send({"error":apis.permission_denied});
       });
    }

     // => Fill Default data for title and description
     application.questionnaire.creator_id = user.id
     application.questionnaire.app_type = userType ;
     application.questionnaire.questionnaire_title = ( req.body.app_type === 1 ) ? 'Quiz 1' : 'Survey 1' ;
     application.questionnaire.description = "Write description for this " + ( req.body.app_type == 1 ) ? 'Quiz 1' : 'Survey 1';

     // Build bodyParser with data
     var body = _.pick(application.questionnaire , ['creator_id','app_type','questionnaire_title','description','createdAt','updatedAt','settings','questions']);
     var app = new qtnr (body);
     app.save().then((respQtnr)=>{
       if(!respQtnr){
         return new Promise((resolve, reject) => {
           res.status(404).send({error:apis.general_error})
          });
        }

        res.send(respQtnr);
     }).catch((error)=>{
       return new Promise((resolve, reject) => {
         res.status(401).send({error:apis.permission_denied});
        });
     });

 });



 //========================================
 // =========> /api/create => post|get
 //========================================

module.exports = {qtnrRouters};
