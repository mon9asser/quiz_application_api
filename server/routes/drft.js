
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

drftRouter.post("/application/user_status/:app_id" , (req,res)=>{

  if(req.body.attendee_draft_arrgs != null )
    {
        return new Promise((resolve, reject) => {
          res.send("attendee_draft_arrgs args is required !")
        });
    }
  var app_id = req.params.app_id;
  var attendee_draft = req.body.attendee_draft_arrgs;

  drft.find().then((objDrft)=>{
    console.log(objDrft);
    return  drft.save_attendee_draft(app_id ,attendee_draft );
  });


});
module.exports = { drftRouter };
