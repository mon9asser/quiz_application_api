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

var interfaceRouters = express.Router();
interfaceRouters.use(build_session);
interfaceRouters.use(bodyParser.json());

interfaceRouters.use(bodyParser.urlencoded({ extended: false}));



// ==================================================>>>>
// =================>>>> User Access
// ==================================================>>>>
  interfaceRouters.get('/login'  , ( req , res )=>{
    res.render("login");
  });
  interfaceRouters.get('/register'  , ( req , res )=>{
    res.render("register");
  });


// ==================================================>>>>
// =================>>>>
// ==================================================>>>>




module.exports = {interfaceRouters};
