
const express = require("express");
const hbs = require("hbs");
// const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const http = require('http');
const _ = require('lodash');
const session = require("express-session");
const stringify = require('json-stringify-safe')

// const zip = new require('node-zip')();

//const simplePassword = require('simple-password');
const mongoose = require("mongoose");
const {MongoClient} = require("mongodb");
const {drft} = require("../../models/attendee_draft");
const {qtnr} = require("../../models/questionnaires");
const {apis , config, notes} = require("../../database/config");
const {authByToken , verify_api_keys} = require("../../middlewares/authenticate") ;

var drftRouter = express.Router();
// drftRouter.use(bodyParser.json());
// drftRouter.use(bodyParser.urlencoded({ extended: false}));
drftRouter.use(session({
  secret : config.apiSecret ,
  resave : true ,
  saveUninitialized : true
}));
// http://34.215.133.182/api/5ad0a03104c64a0566c1c9fb/join/5acbf5f2800a3f056866e8ab/quiz

drftRouter.post("/application/user_status/:app_id/get" , (req,res)=>{
  var app_id = req.params.app_id;
  var user_id = req.body.user_id ;
  try {

  drft.findOne({application_id: app_id }).populate('questionnaire_info').exec( ( err , draftDocument )=>{

    if(!draftDocument){
      return new Promise((resolve , reject )=>{
        res.send({error : "This application doesn't exists"});
        return false;
      });
    }

    res.send(draftDocument);
  });
} catch (e) {}
});
drftRouter.get("/application/user_status/:app_id/get/:user_id" , (req,res)=> {
  var user_id = req.params.user_id ;
  var app_id = req.params.app_id ;
  try {


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

} catch (e) {

}
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
            // => Found Attendee
            draftDocument.att_draft[userIndex].questions_data = object.att_draft[userIndex].questions_data ;
            // console.log(draftDocument.att_draft[userIndex].questions_data);
            // console.log("------------------------------------------------<><>");
            // console.log(object.att_draft[userIndex].questions_data);
          }else {
            // => Unfound Attendee
            var newAttendee = object.att_draft.find(x => x.user_id == userId) ;
            draftDocument.att_draft.push(newAttendee);
          }

          draftDocument.markModified('att_draft');
          draftDocument.save();
      }


  });
  console.log(userId);
});

drftRouter.patch("/:app_id/update/status" , (req , res )=>{
  var app_id = req.params.app_id ;
  var user_id = req.body.user_id
  try {


  drft.findOne({ application_id: app_id} , (err , response) => {
    if(!response) {
      return new Promise((resolve, reject) => {
          res.send({"error" : "Application doesn't exists !"});
      });
      return false;
    }
    var resAttendee = response.att_draft.find(x => x.user_id == req.body.user_id);
    var resAttendeeIndex = response.att_draft.findIndex(x => x.user_id == req.body.user_id);
    if(resAttendeeIndex != -1){
          resAttendee.is_completed = true;

          response.markModified('att_draft');
          response.save().then((reData)=>{
            res.send(reData);
          });
      }
  }).catch((err)=>{
    console.log(err);
  });
} catch (e) {

}
});

drftRouter.patch("/:app_id/update/settings" , (req , res )=>{
  var app_id = req.params.app_id ;

  drft.findOne({application_id: app_id }).then((response)=>{

    if(!response){
      return new Promise((resolve, reject) => {
          res.send({"error" : "Application doesn't exists !"});
      });
    }
    var attendee_information = response.att_draft.find(x => x.user_id == req.body.user_id)  ;

    // attendee_information.impr_application_object.settings.time_settings.timer_type = false ;
    attendee_information.impr_application_object.settings.time_settings.value = req.body.data_timed_with.minutes;
    attendee_information.impr_application_object.settings.time_settings.seconds = req.body.data_timed_with.seconds;
    attendee_information.impr_application_object.settings.time_settings.minutes = req.body.data_timed_with.minutes
    attendee_information.impr_application_object.settings.time_settings.hours = req.body.data_timed_with.hours;
    response.markModified('att_draft');
    response.save().then((resp)=>{
      res.send(resp);
    });
  }).catch((err)=>{
      return new Promise((resolve, reject) => {
        res.send({error : err});
      });
  });

});





// Draft router !
drftRouter.post("/:user_id/join/:app_id/quiz" , (req , res) => {

var app_id = req.params.app_id;
var user_id = req.body.user_id;
var args = req.body.join_args ;
if(args == null ){
  res.send({"Required" : "join_args is required"});
  return false ;
}

drft.findOne({application_id: app_id } , (err , draftDocument) => {
  if(!draftDocument){
    var dr = new drft (args);
    dr.save();
  }else
  {
    var thisAttIndex = draftDocument.att_draft.findIndex(x => x.user_id == user_id );
    if(thisAttIndex == -1 ){
      draftDocument.att_draft.push(args[thisAttIndex]);
      draftDocument.markModified('att_draft');
      draftDocument.save();
    }
  }
});

});


// => server_ip/api/:app_id/attendee_collection/:user_id
// http://localhost:9000/api/5b8edc55aea5bf606d5a62e3/attendee_collection/5b73412725aab524b49e6c49
drftRouter.post("/:app_id/attendee_collection/:user_id" , (req , res) => {
  // att_draft
  var app_id = req.params.app_id ;
  var user_activity = req.body.user_activity ;
  var usr_id = req.params.user_id ;

  drft.findOne({ "application_id" : app_id }).then((response)=>{
    if(response == null || !response ) {
      // ==> Storing For First Time
      drf_data = {
        att_draft : new Array(user_activity) ,
        application_id : app_id ,
        questionnaire_info :  app_id
      }
      var activity = new drft(drf_data);
      activity.save().then((resp)=>{

        // ==> Updating the id for quationnaire
        qtnr.findById({_id :app_id }, function (err, doc) {
              if (err) console.log(err);
              doc.att__draft = resp._id;
              doc.save();
        });

        res.send(resp);
        return false;
      }).catch((err)=>{
        res.send(err);
        return false ;
      });


    }else {
      // ==> we found this app in our db
      var user_app = response;
      var usr_act_ind = user_app.att_draft.findIndex(x => x.user_id == usr_id );
      if(usr_act_ind != -1 ){
          user_app.att_draft.splice(usr_act_ind , 1 );
      }
      // ==> Add New Uer
      user_app.att_draft.push(user_activity);

      // ==> Saveing
      response.markModified("att_draft");
      response.save().then((resp)=>{
        res.send(resp);
        return false;
      }).catch((err)=>{
        res.send(err);
        return false ;
      });
    }
    res.send(response);
    return false;
  }).catch(function(err){ res.send(err); })
});










module.exports = { drftRouter };
