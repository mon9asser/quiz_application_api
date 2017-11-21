const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');


var viewRouters = express.Router();

viewRouters.use(bodyParser.json());
viewRouters.use(bodyParser.urlencoded({ extended: false}));


viewRouters.get("/login" , ( req , res )=>{
  res.render("login");
});

viewRouters.get('/register' , ( req , res )=>{
  res.render("register");
})


module.exports = {viewRouters};
