
const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const http = require('http');
const _ = require('lodash');
const session = require("express-session");
// const zip = new require('node-zip')();

//const simplePassword = require('simple-password');
const mongoose = require("mongoose");
const {MongoClient} = require("mongodb");
const {drft} = require("../../models/attendee_draft");
const {qtnr} = require("../../models/questionnaires");
const {apis , config, notes} = require("../../database/config");
const {authByToken , verify_api_keys} = require("../../middlewares/authenticate") ;

var drftRouter = express.Router();
drftRouter.use(bodyParser.json());
drftRouter.use(bodyParser.urlencoded({ extended: false}));
drftRouter.use(session({
  secret : config.apiSecret ,
  resave : true ,
  saveUninitialized : true
}));

drftRouter.get("/application/user_status/:app_id/get" , (req,res)=>{
  var app_id = req.params.app_id;
  drft.findOne({application_id: app_id }).populate('questionnaire_info').exec( ( err , draftDocument )=>{

    if(!draftDocument){
      return new Promise((resolve , reject )=>{
        res.send({error : "This application doesn't exists"});
        return false;
      });
    }

    res.send(draftDocument);
  });
});
drftRouter.get("/application/user_status/:app_id/get/:user_id" , (req,res)=> {
  var user_id = req.params.user_id ;
  var app_id = req.params.app_id ;
  drft.findOne({application_id : app_id} , (err , drftDoc) => {
    if(err , !drftDoc){
      return new Promise((resolve , reject)=>{
        return false ;
      })
    }
    // => looking for this user id
    var attendeeObject = drftDoc.att_draft.find(x => x.user_id == user_id );
    var attendeeIndex = drftDoc.att_draft.findIndex(x => x.user_id == user_id );
    if(attendeeIndex == -1 )
      res.send({message : false })
    else {
      res.send({
        message : true ,
        object : attendeeObject
      });
    }
  }).then();
});
drftRouter.post("/application/user_status/:app_id" , (req,res)=>{

  if(req.body.application_fields == null )
    {
        return new Promise((resolve, reject) => {
          res.send("attendee_draft_arrgs args is required !")
        });
    }
  var app_id = req.params.app_id;
  var object = req.body.application_fields ;
  var userId = req.body.user_id ;

  drft.findOne({application_id: app_id } , (err , draftDocument )=>{
      if(!draftDocument || err ){
        var dr = new drft(object);
        dr.save().then((data)=>{
          res.send("Successed");
          return false ;
        });
      }else {
          var userIndex = draftDocument.att_draft.findIndex(x => x.user_id == userId);
          if(userIndex != -1 ){
            draftDocument.att_draft[userIndex].questions_data = object.att_draft[userIndex].questions_data ;
            // console.log(draftDocument.att_draft[userIndex].questions_data);
            // console.log("------------------------------------------------<><>");
            // console.log(object.att_draft[userIndex].questions_data);
            draftDocument.markModified('questions_data');
            draftDocument.save();
          }
      }


  });


});

module.exports = { drftRouter };
