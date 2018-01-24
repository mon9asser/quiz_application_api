
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
const {insertIntoApiKey} = require("./qtnr");


var infceRouter = express.Router();
infceRouter.use(build_session);


infceRouter.use(  bodyParser.json() );
infceRouter.use(  bodyParser.urlencoded({ extended: false}) );

infceRouter.get("/:app_id/edit/:token" , verify_access_tokens_admin_user , ( req , res )=>{
  // ================> Params
  var app_id = req.params.app_id ;
  // ================> Verified Items
  var Verified_user = req.user ;


  //res.status(404).send({"Error":notes.Errors.Error_Doesnt_exists('Application')});
  qtnr.findOne({_id:app_id} , (error , qtnrObject)=>{

    if(!qtnrObject || error ){
      return new Promise((resolve, reject) => {
        res.render("page-404" , {
          data_404 : "This Application Does not exists !"
        });
      });
    }

    var app_type = qtnrObject.app_type ;
    var application_type ;
    if ( app_type == 0 ) application_type = "survey_creation";
    else application_type = "quiz_creation";

    res.render( application_type , {
      app : qtnrObject
    });

  });

});




module.exports = {infceRouter};
