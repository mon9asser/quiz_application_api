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
/* +++++++++++++++++++++++++ */
// Add New Quiz Or Survey
/* +++++++++++++++++++++++++ */


 qtnrRouters.get("/create" , verify_token_user_type ,  ( req , res ) => {


    var user = req.verified_user ;
    var userType = req.verified_user_type;
    var token = req.verified_token;
      console.log(userType == 0);
    // this user should be a creator user !
    if( userType != 1 ){
      console.log( apis.premission_denid );
    }


    //res.send(req.verified_user);

 });


module.exports = {qtnrRouters};
