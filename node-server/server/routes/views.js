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


var viewRouters = express.Router();
viewRouters.use(build_session);

viewRouters.use(bodyParser.json());
viewRouters.use(bodyParser.urlencoded({ extended: false}));


viewRouters.get('/home' , verify_session , ( req , res )=>{
  res.render("index" , {
      user : req.session.userInfo
  });
});
viewRouters.get('/register' , ( req , res )=>{
  res.render("register");
});
viewRouters.get("/login" , ( req , res )=>{
  res.render("login");
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
