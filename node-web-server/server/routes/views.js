const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require("express-session");
const fs = require('fs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const {apis , config} = require("../../database/config");



var viewRouters = express.Router();
viewRouters.use(session({
  secret : config.apiSecret ,
  resave : true ,
  saveUninitialized : true
}));

var detect_about_user_sesstion = function (req,res,next){
    if(! req.session.userInfo)
      res.redirect("/login");
     else
     next();
};
viewRouters.use(bodyParser.json());
viewRouters.use(bodyParser.urlencoded({ extended: false}));


viewRouters.get("/login" , ( req , res )=>{
  res.render("login");
});

viewRouters.get('/register' , ( req , res )=>{
  res.render("register");
})

viewRouters.get('/home' , detect_about_user_sesstion , ( req , res )=>{
  res.render("index" , {
      user : req.session.userInfo
  });
})


module.exports = {viewRouters};
