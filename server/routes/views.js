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
const {insertIntoApiKey} = require("./qtnr.js");

var viewRouters = express.Router();
viewRouters.use(build_session);

viewRouters.use(bodyParser.json());
viewRouters.use(bodyParser.urlencoded({ extended: false}));


viewRouters.get('/home' , verify_session , ( req , res )=>{
  res.render("index" , {
      user : req.session.userInfo
  });
});

viewRouters.get('/create_app' , ( req , res )=>{
    res.render("create" , {
      helpers : {
        api_secrets :   config.restricted_api_header ,
        server_ip   :   config.server_ip
      }
    });
});

viewRouters.get("/application/login" , ( req , res )=>{
  res.render({
    "message":"Login app page"
  });
});

viewRouters.get("/" , ( req , res )=>{
  res.render("index");
});




viewRouters.get('/logout' , verify_session , ( req , res )=>{
  // Destroy the authentication token
  usr.findByIdAndUpdate(req.session.userInfo.id.toString() , {tokens:[]} , {new : false}).then((Usrs)=>{
    // Destroy Session
    req.session.destroy(function(err) {
       // redirect
      res.redirect("/login");
    });
  }).catch((err)=>{
    res.send(400).send();
  });

});



/*
=================================================================
Testing Only */
viewRouters.get("/testing" , ( req , res )=>{
  res.render("testing");
});
/*
=================================================================
*/

module.exports = {viewRouters};
