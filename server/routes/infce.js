
const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');

const _ = require('lodash');
const jwt = require('jsonwebtoken');
const {apis , config} = require("../../database/config");
const {build_session , verify_session , build_header , verify_access_tokens_admin_user} = require("../../middlewares/authenticate");
const {usr} = require("../../models/users");
const {qtnr} = require("../../models/questionnaires");
const {insertIntoApiKey} = require("./qtnr");


var infceRouter = express.Router();
infceRouter.use(build_session);
infceRouter.use(  bodyParser.json() );
infceRouter.use(  bodyParser.urlencoded({ extended: false}) );

// ################################################################
// ==========>>> Application Interface Api  ( Quiz VS Survey ) ====
// ################################################################
infceRouter.get("/:app_id/editor/:token" , verify_access_tokens_admin_user , (req , res)=>{
  // ================> Params
  var app_id = req.params.app_id ;
  console.log(app_id);
  // ================> Verif"This Application does not exists !" ,ied Items
  var Verified_user = req.user ;
  qtnr.findOne({_id:app_id} , (error , qtnrObject)=>{

    if(!qtnrObject || error ){
      return new Promise((resolve, reject) => {
        res.render("page-404" , {
          data_404 : "This application does not exists !" ,
          user : req.user
        });
      });
    }

    if(qtnrObject.creator_id != Verified_user.id){
      return new Promise((resolve, reject) => {
        res.render("page-401" , {
          data_401 : "Permission Denied !! , You don't have any permission to use this page !" ,
          user : req.user
        });
      });
    }

    var app_type = qtnrObject.app_type ;
    var application_type ;
    if ( app_type == 0 ) application_type = "survey-editor";
    else application_type = "quiz-editor";
     
    res.render( application_type , {
      app : qtnrObject ,
      user : req.user
    });

  });
});

// ################################################################
// ==========>>> Application Interface Api  ( Attendee ) ==========
// ################################################################


module.exports = {infceRouter};
