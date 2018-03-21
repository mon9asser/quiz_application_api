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
const {qtnr} = require("../../models/questionnaires");
const {insertIntoApiKey} = require("./qtnr");

var viewRouters = express.Router();
viewRouters.use(build_session);

viewRouters.use(  bodyParser.json() );
viewRouters.use(  bodyParser.urlencoded({ extended: false}) );


// ======================================================
// ===========>>>>>>>>> DOC FILE
// ======================================================
viewRouters.get('/docs' , ( req , res )=>{
    res.render("docs");
});



// ======================================================
// ===========>>>>>>>>> Login && Register
// ======================================================
viewRouters.get('/login'  , ( req , res )=>{
  res.render("login");
});

viewRouters.get('/register'  , ( req , res )=>{
  res.render("register");
});



// ======================================================
// ===========>>>>>>>>> HOME PAGE
// ======================================================
viewRouters.get('/' , verify_session , ( req , res )=>{
  res.render("index" , {
      user : req.session.userInfo
  });
});

// ======================================================
// ===========>>>>>>>>> Attendees
// ======================================================
viewRouters.get('/attendees' , verify_session , ( req , res )=>{
  if(req.session.userInfo.userType == 1 ) {
    res.render("attendees" , {
        user : req.session.userInfo
    });
  }else {
    res.render("page-401" , {
        user : req.session.userInfo ,
        data_401 : "Permission Denied !! , You don't have any permission to use this page !"
    });
  }
});




// ======================================================
// ===========>>>>>>>>> Applications
// ======================================================
viewRouters.get('/questionnaires' , verify_session , ( req , res )=>{
  if(req.session.userInfo.userType == 1 ) {


    qtnr.find({  "creator_id": req.session.userInfo.id }).then((doc)=>{
      if(!doc ){
        return new Promise((resolve, reject) => {
           res.status(404).send("There are no any applications");
       });
      }

      res.render("questionnaires" , {
          user : req.session.userInfo ,
          myApps : doc ,
          server_ip : config.server_ip
      });

    });


  }else {
    res.render("page-401" , {
        user : req.session.userInfo ,
        data_401 : "Permission Denied !! , You don't have any permission to use this page !"
    });
  }
});




// ======================================================
// ===========>>>>>>>>> Quizzes
// ======================================================
viewRouters.get('/quizzes' , verify_session , ( req , res )=>{
  if(req.session.userInfo.userType == 0 ) {

    // req.session.userInfo.id
    qtnr.find().then((doc)=>{
      if(!doc ){
        return new Promise((resolve, reject) => {
           res.status(404).send("There are no any applications");
       });
      }

      res.render("quizzes" , {
          user : req.session.userInfo ,
          myApps : doc ,
          server_ip : config.server_ip
      });

    });


  }else {
    res.render("page-401" , {
        user : req.session.userInfo ,
        data_401 : "Permission Denied !! , You don't have any permission to use this page !"
    });
  }
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



// ======================================================
// ===========>>>>>>>>> Logout & Destroy sessions
// ======================================================
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


module.exports = {viewRouters};
