const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const {apis , config} = require("../../database/config");
const {build_session , verify_session , build_header } = require("../../middlewares/authenticate");
const {usr} = require("../../models/users");
const {insertIntoApiKey} = require("./qtnr");

var viewRouters = express.Router();
viewRouters.use(build_session);

viewRouters.use(  bodyParser.json() );
viewRouters.use(  bodyParser.urlencoded({ extended: false}) );



// ======================================================
// ===========>>>>>>>>> DOC FILE
// ======================================================
viewRouters.get('/' , ( req , res )=>{
    res.render("docs");
});
// ======================================================
// ===========>>>>>>>>> Login
// ======================================================
viewRouters.get('/login'  , ( req , res )=>{
  res.render("login");
});
// ======================================================
// ===========>>>>>>>>> HOME PAGE
// ======================================================
viewRouters.get('/home' , verify_session , ( req , res )=>{
  res.render("index" , {
      user : req.session.userInfo
  });
});
// ======================================================
// ===========>>>>>>>>> API key Creation
// ======================================================
viewRouters.get('/create_app' , ( req , res )=>{
    res.render("api-creation" , {
      helpers : {
        api_secrets :   config.restricted_api_header ,
        server_ip   :   config.server_ip
      }
    });
});


module.exports = {viewRouters};
