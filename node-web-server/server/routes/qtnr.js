const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const {ObjectID} = require("mongodb");
const {apis , config } = require("../../database/config");
const {authByToken} = require("../../middlewares/authenticate") ;
const {qtnr} = require("../../models/questionnaires");
const {usr} = require ("../../models/users");
//**************************************************************
/* ****************/// For Testing only
//**************************************************************

// ==============================================> End the test

var qtnrRouters = express.Router();

qtnrRouters.use(bodyParser.json());
qtnrRouters.use(bodyParser.urlencoded({ extended: false}));

/* +++++++++++++++++++++++++ */
// Add New Quiz Or Survey
/* +++++++++++++++++++++++++ */

// => Create app By Default !
qtnrRouters.post( ["/create"] , (req , res)=>{
   req.body.settings = {
     createdAt : new Date() ,
     updatedAt : new Date() ,
     titles : {
       start_with : 'Lets start Quiz',
       end_with :'You have successfully completed this quiz' ,
       success_with : 'You have passed this quiz',
       faild_with : 'You have failed this quiz'
     } ,
     step_type : true ,
     grade_settings : {
       is_graded : false ,
       value : 90
     } ,
     review_setting : true ,
     retake_setting : false ,
     navigation_btns : false ,
     quiz_status : [] ,
     label_btns : {
       start_with : 'Start Quiz',
       continue_with : 'Continue',
       retake_with : 'Retake Quiz',
       review_with : 'Review'
     },
     randomize_settings : false ,
     time_settings : {
       is_with_time : false ,
       value : '15',
       timer_type : 'mins',  // => hrs / mins
       timer_layout : 1
     } ,
     progression_bar : {
       is_available : true ,
       progression_bar_layout : 1
     } ,
     quiz_theme_style : [{
       id : mongoose.Types.ObjectId() ,
       style_file_dir : 'theme_'+mongoose.Types.ObjectId()+'.css'  ,
       stylesheet : []
     }]
   };

     if ( ! req.body.questions)
      req.body.questions = [];

     if(req.body.questionnaire_title == null )
      req.body.questionnaire_title = "Quiz 1";

    if(req.body.description == null )
    {
      var des_ription = ( req.body.app_type ) ? 'Quiz' : 'Survey' ;
       req.body.description =  `Descripe your ${des_ription}`   ;
    }

    var bodyRequests = _.pick(req.body , [
        'creator_id'          ,
        'app_type'            ,
        'description'         ,
        'questionnaire_title' ,
        'questions'           ,
        'settings'
    ]);

 var questionnaire = new qtnr ( bodyRequests );
 questionnaire.save().then((QuSu)=>{
     res.send(QuSu);
  }).catch((error)=>{
    res.status(400).send(error);
  });
});





qtnrRouters.patch( [ '/survey/:app_id/edit' , '/quiz/:app_id/edit' ] ,
  authByToken  ,
(req,res )=>{
    var application_id = req.params.app_id ;
    req.body.updatedAt = new Date() ;
    req.body.questions._id = mongoose.Types.ObjectId() ;
    if(!ObjectID.isValid(application_id))
      res.status(404).send();


      // update Basics
      var body  = _.pick(req.body , [
          'description',
          'questionnaire_title',
          'updatedAt' ,
          'settings' ,
          'questions'
        ]);

      qtnr.findByIdAndUpdate(application_id , {$set:body} , {new:true} ).then((results)=>{
        res.send(results);
      }).catch((error)=>{
        res.status(400).send();
      });

      // qtnr.questionnaire_basics(application_id , body_basics );
      // push or update new questions
      // push or update new settings

});


module.exports = {qtnrRouters};
