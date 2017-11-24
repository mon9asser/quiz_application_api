const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const {ObjectID} = require("mongodb");
const {apis , config , application } = require("../../database/config");
const {authByToken , verify_session , build_session , build_header } = require("../../middlewares/authenticate") ;
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

// => Create app By Default !
qtnrRouters.get("/create" ,  verify_session  ,  (req , res)=>{
    if(!req.session.userInfo){
      res.redirect("/login");
    }
    usr.findById(req.session.userInfo.id).then((Usr)=>{
      res.send({
        "Message" : (Usr.is_creator == 1 ) ? "Authorized by you !" : "You dont have premissions to see this api"  
      });
    }).catch((error)=>{
        res.status(404).send(error);
    });

});
qtnrRouters.post("/create" , verify_session , build_header ,  (req , res) => {
  if(!req.body.app_type){
    res.status(401).send(apis.premission_denid);
  }
  var  token = req.token ;


  // Detect about session and user Id ( case unloggedIn ) => in middleware
  // Get user Id
    var userId = req.session.userInfo.id.toString();
  // Get token via header and detect about the following cases :-
    usr.verifyTokens(token).then((user)=>{
      // Case => ( Token not right )
          // send status (401) => unauthorized status
          if(!user)
          res.status(401).send(apis.premission_denid);
      // Case => ( Token is right )
          // Detect about type of this user
            // - if no return (401) unauthorized status ( case attendee type 0 )
            console.log(user.is_creator === 0);

           if(user.is_creator === 0 ) // 0
              {
                console.log(apis.permission_denied);
                 return res.status(401).send(apis.permission_denied);
              }


           console.log("User type is : "+ user.is_creator.toString());
          // => Fill Default data for title and description
          application.questionnaire.creator_id = userId
          application.questionnaire.app_type = req.body.app_type ;
          application.questionnaire.questionnaire_title = ( req.body.app_type === 1 ) ? 'Quiz 1' : 'Survey 1' ;
          application.questionnaire.description = "Write description for this " + ( req.body.app_type == 1 ) ? 'Quiz 1' : 'Survey 1';
          //console.log("Application Type :" + application.questionnaire.questionnaire_title);
          // Build bodyParser Request ( Not needed for now ! )
          var body = _.pick(application.questionnaire , ['creator_id','app_type','questionnaire_title','description','createdAt','updatedAt','settings','questions'])
          //console.log(body);
          //=> Save data
          // res.send(body);
          console.log("Application Type" + body.app_type);
          var questionnaire_model = new qtnr(
              body
           );
          questionnaire_model.save().then((qtnr)=>{
            // Send status (200) and get app_id
          //=> error
            // Send status (400) => bad request
           if(!qtnr)
            {
                res.status(400).send(err); // Bad request
            }
             res.send(qtnr);
          }).catch((err)=>{
            // Send status (200) and get app_id
            res.status(400).send(err); // Bad request
          });

    }).catch((error)=>{
      // Case => ( Token not right )
          // send status (401) => unauthorized status
        res.status(401).send(apis.premission_denid);
    });
});



// => Update Via comming data !
qtnrRouters.patch("/:app_id/edit" , verify_session , build_header  , (req , res) => {
  // Detect about session and user Id ( case unloggedIn ) => in middleware
  // Get user Id
  // Get token via header and detect about the following cases :-
    // Case => ( Token not right )
        // send status (401) => unauthorized status
    // Case => ( Token is right )
        // Detect about type of this user
          // - if no return (401) unauthorized status ( case attendee type 0 )

  // Detect about app_id : the following cases : -
    // Case 1 : app_id not found
        // Send status (404) => not found status
    // Case 2 : app_id found but for another user
       // Send status (401) => unauthorized status

   // => Check about fields or array that need to update via the following
   /// .... [Here !]

  // Set Updated Date

  // Build bodyParser Request

  //=> Update data
    // Send status (200) and get app_id
  //=> error
    // Send status (400) => bad request
});





module.exports = {qtnrRouters};
