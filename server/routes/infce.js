
const express = require("express");
const hbs = require("hbs");
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');

const _ = require('lodash');
const jwt = require('jsonwebtoken');
const {apis , config} = require("../../database/config");
const {build_session , verify_session , build_header , verify_access_tokens_admin_user} = require("../../middlewares/authenticate");
const {usr} = require("../../models/users");
const {qtnr} = require("../../models/questionnaires");
const {drft} = require("../../models/attendee_draft");
const {rpt} = require("../../models/reports");
const {insertIntoApiKey} = require("./qtnr");
const psi = require('psi');


var psi_for_status_code_in_server = ( api_url ) => {

  // Get the PageSpeed Insights report
  psi('http://35.166.78.187/api/5bc73cc884b3961bae7fcad2/editor/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmM3M2NiOTg0YjM5NjFiYWU3ZmNhZDEiLCJkYXRlX21hZGUiOiIyMDE4LTEwLTIwVDA4OjA2OjExLjk1NFoiLCJpYXQiOjE1NDAwMjI3NzF9.AuGqDgYZe0h2Go7r793uzHlhBrj5zWyheCbQ3T4ApnY').then(data => {
    // console.log(data.ruleGroups.SPEED.score);
    // console.log(data.pageStats);
    // console.log("------------------------------------------------");
  });

  // Output a formatted report to the terminal
  psi.output('http://35.166.78.187/api/5bc73cc884b3961bae7fcad2/editor/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmM3M2NiOTg0YjM5NjFiYWU3ZmNhZDEiLCJkYXRlX21hZGUiOiIyMDE4LTEwLTIwVDA4OjA2OjExLjk1NFoiLCJpYXQiOjE1NDAwMjI3NzF9.AuGqDgYZe0h2Go7r793uzHlhBrj5zWyheCbQ3T4ApnY').then(() => {
    // console.log('done');
    // console.log("------------------------------------------------");
  });




  // Supply options to PSI and get back speed and usability scores
  psi('http://35.166.78.187/api/5bc73cc884b3961bae7fcad2/editor/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmM3M2NiOTg0YjM5NjFiYWU3ZmNhZDEiLCJkYXRlX21hZGUiOiIyMDE4LTEwLTIwVDA4OjA2OjExLjk1NFoiLCJpYXQiOjE1NDAwMjI3NzF9.AuGqDgYZe0h2Go7r793uzHlhBrj5zWyheCbQ3T4ApnY', {nokey: 'true' }).then(data => {
    // console.log('Speed score:', data.ruleGroups.SPEED.score);
    // console.log('Usability score:', data.ruleGroups.USABILITY.score);
    // console.log("------------------------------------------------");
  });
}


var infceRouter = express.Router();
infceRouter.use(  build_session );
// infceRouter.use(  bodyParser.json() );
// infceRouter.use(  bodyParser.urlencoded({ extended: false }) );
// ################################################################
// ==========>>> Application Interface Api  ( Quiz VS Survey ) Player <<====
// ################################################################
infceRouter.get("/:app_id/:player_type/player/:token/data" , verify_access_tokens_admin_user ,  (req , res) => {
  var player = req.params.player_type;
  var app_id = req.params.app_id;
  // Player (does not exists) case
  if( player != 'quiz' && player != 'survey' ){
    res.send({
      error : "This iframe doesn't exists !"
    });
    return false ;
  }
  // application (does not exists) case
  qtnr.findOne({_id:app_id}).populate("created_id").exec((error , qtnrObject)=>{

      if(!qtnrObject || error){
        return new Promise((resolve, reject) => {
          res.render("page-404" , {
            data_404 : "This application does not exists !" ,
            user : req.user
          });
        });
          return false ;
      }

      var app_type = qtnrObject.app_type ;
      var application_type ;
      if ( app_type == 0 ) application_type = "survey-player";
      else application_type = "quiz-player";


      res.render( application_type , {
        app : qtnrObject ,
        user : req.user ,
        header_status : config.show_header
      });
  });

});

// ################################################################
// ==========>>> Application Interface Api  ( Quiz VS Survey ) Editor <<====
// ################################################################
infceRouter.get("/:app_id/editor/:token" , verify_access_tokens_admin_user , (req , res)=>{
  // ================> Params
  var app_id = req.params.app_id ;
  var token = req.params.token ;
  console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++");
  console.log(" ===> Quiz Editor Page insight ");
  console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++");
  psi_for_status_code_in_server( config.server_ip + 'api/' + app_id + '/editor/' +token );

  // ================> Verif"This Application does not exists !" ,ied Items
  var Verified_user = req.user ;
  qtnr.findOne({_id:app_id} , (error , qtnrObject)=>{

    if(!qtnrObject || error ){
      return new Promise((resolve, reject) => {
        res.render("page-404" , {
          data_404 : "This application does not exists !" ,
          user : req.user
        });
      });
    }


    if(qtnrObject.creator_id != Verified_user.id){
      return new Promise((resolve, reject) => {
        res.render("page-401" , {
          data_401 : "Permission Denied !! , You don't have any permission to use this page !" ,
          user : req.user
        });
      });
    }

    var app_type = qtnrObject.app_type ;
    var application_type ;
    if ( app_type == 0 ) application_type = "survey-editor";
    else application_type = "quiz-editor";

    res.render( application_type , {
      app : qtnrObject ,
      user : req.user ,
      header_status : config.show_header
    });

  });
});

// ################################################################
// ==========>>> Application Interface Api  ( Attendee ) ==========
// ################################################################
//mongoose

// ====> Generate New Id
infceRouter.get("/generate/new/data" , (req,res)=>{
  var id = mongoose.Types.ObjectId();
  var id_1 = mongoose.Types.ObjectId();

// infceRouter.patch("/:app_id/clear/this/report/:attendee_id" , (req,res) => {
//   res.send("DONE +++++++++++++++++++++++++");
//   // var app_id = req.params.app_id ;
//   // var attendee_id = req.params.attendee_id ;
//   // rpt.findOne({questionnaire_id : app_id} , (error , reptDoc) => {
//   //   if(!reptDoc || error) return false ;
//   //   var attendee_object = reptDoc.attendees.findIndex(x => x.attendee_id == attendee_id );
//   //   if(attendee_object != -1 ){
//   //     reptDoc.splice(attendee_object , 1);
//   //   }
//   //   var attendee_details_object = reptDoc.attendee_details.findIndex(x => x.attendee_id == attendee_id );
//   //   if(attendee_details_object != -1 ){
//   //     reptDoc.splice(attendee_details_object , 1);
//   //   }
//   //   reptDoc.markModified('attendees');
//   //   reptDoc.save();
//   // });
//
// });

var asnwer_a = mongoose.Types.ObjectId();
var asnwer_b  = mongoose.Types.ObjectId();
var asnwer_c= mongoose.Types.ObjectId();
var asnwer_d= mongoose.Types.ObjectId();
var asnwer_e   = mongoose.Types.ObjectId();
var asnwer_f   = mongoose.Types.ObjectId();
var asnwer_g = mongoose.Types.ObjectId();
var asnwer_h  = mongoose.Types.ObjectId();
var asnwer_i  = mongoose.Types.ObjectId();
var asnwer_j  = mongoose.Types.ObjectId();
var asnwer_k   = mongoose.Types.ObjectId();
var asnwer_l   = mongoose.Types.ObjectId();
var asnwer_m   = mongoose.Types.ObjectId();
var asnwer_n   = mongoose.Types.ObjectId();
var asnwer_o   = mongoose.Types.ObjectId();
var asnwer_p   = mongoose.Types.ObjectId();
var asnwer_q   = mongoose.Types.ObjectId();
var asnwer_r   = mongoose.Types.ObjectId();
var asnwer_s   = mongoose.Types.ObjectId();
var asnwer_t   = mongoose.Types.ObjectId();
var asnwer_u   = mongoose.Types.ObjectId();
var asnwer_v   = mongoose.Types.ObjectId();
var asnwer_w   = mongoose.Types.ObjectId();
var asnwer_x   = mongoose.Types.ObjectId();
var asnwer_y   = mongoose.Types.ObjectId();
var asnwer_z= mongoose.Types.ObjectId();

var asnwer_aa = mongoose.Types.ObjectId();
var asnwer_bb = mongoose.Types.ObjectId();
var asnwer_cc= mongoose.Types.ObjectId();
var asnwer_dd= mongoose.Types.ObjectId();
var asnwer_ee  = mongoose.Types.ObjectId();
var asnwer_ff = mongoose.Types.ObjectId();
var asnwer_gg = mongoose.Types.ObjectId();
var asnwer_hh  = mongoose.Types.ObjectId();
var asnwer_ii  = mongoose.Types.ObjectId();
var asnwer_jj  = mongoose.Types.ObjectId();
var asnwer_kk   = mongoose.Types.ObjectId();
var asnwer_ll   = mongoose.Types.ObjectId();
var asnwer_mm   = mongoose.Types.ObjectId();
var asnwer_nn   = mongoose.Types.ObjectId();
var asnwer_oo   = mongoose.Types.ObjectId();
var asnwer_pp   = mongoose.Types.ObjectId();
var asnwer_qq   = mongoose.Types.ObjectId();
var asnwer_rr   = mongoose.Types.ObjectId();
var asnwer_ss   = mongoose.Types.ObjectId();
var asnwer_tt   = mongoose.Types.ObjectId();
var asnwer_uu   = mongoose.Types.ObjectId();
var asnwer_vv   = mongoose.Types.ObjectId();
var asnwer_ww   = mongoose.Types.ObjectId();
var asnwer_xx   = mongoose.Types.ObjectId();
var asnwer_yy   = mongoose.Types.ObjectId();
var asnwer_zz= mongoose.Types.ObjectId();

var asnwer_aaa = mongoose.Types.ObjectId();
var asnwer_bbb = mongoose.Types.ObjectId();
var asnwer_ccc= mongoose.Types.ObjectId();
var asnwer_ddd= mongoose.Types.ObjectId();
var asnwer_eee  = mongoose.Types.ObjectId();
var asnwer_fff = mongoose.Types.ObjectId();
var asnwer_ggg = mongoose.Types.ObjectId();
var asnwer_hhh  = mongoose.Types.ObjectId();
var asnwer_iii  = mongoose.Types.ObjectId();
var asnwer_jjj  = mongoose.Types.ObjectId();
var asnwer_kkk   = mongoose.Types.ObjectId();
var asnwer_lll   = mongoose.Types.ObjectId();
var asnwer_mmm   = mongoose.Types.ObjectId();
var asnwer_nnn   = mongoose.Types.ObjectId();
var asnwer_ooo   = mongoose.Types.ObjectId();
var asnwer_ppp   = mongoose.Types.ObjectId();
var asnwer_qqq   = mongoose.Types.ObjectId();
var asnwer_rrr   = mongoose.Types.ObjectId();
var asnwer_sss   = mongoose.Types.ObjectId();
var asnwer_ttt   = mongoose.Types.ObjectId();
var asnwer_uuu   = mongoose.Types.ObjectId();
var asnwer_vvv   = mongoose.Types.ObjectId();
var asnwer_www   = mongoose.Types.ObjectId();
var asnwer_xxx   = mongoose.Types.ObjectId();
var asnwer_yyy   = mongoose.Types.ObjectId();
var asnwer_zzz= mongoose.Types.ObjectId();

var date_made = new Date();
  res.send({
    id : id ,
    id_1 : id_1 ,
    date : date_made ,
    list_of_ids : [
      asnwer_a ,
     asnwer_b,
     asnwer_c,
     asnwer_d,
      asnwer_e,
      asnwer_f,
      asnwer_g,
        asnwer_h,
      asnwer_i,
      asnwer_j,
      asnwer_k,
      asnwer_l,
       asnwer_m,
      asnwer_n,
     asnwer_p,
   asnwer_p  ,
   asnwer_q  ,
   asnwer_r  ,
   asnwer_s   ,
       asnwer_t   ,
       asnwer_u  ,
       asnwer_v   ,
       asnwer_w  ,
       asnwer_x   ,
       asnwer_y   ,
       asnwer_z,
       asnwer_aa,
       asnwer_bb ,
       asnwer_cc,
       asnwer_dd,
       asnwer_ee ,
       asnwer_ff ,
      asnwer_gg ,
      asnwer_hh  ,
      asnwer_ii  ,
      asnwer_jj  ,
      asnwer_kk   ,
      asnwer_ll   ,
      asnwer_mm   ,
      asnwer_nn   ,
      asnwer_oo   ,
      asnwer_pp   ,
      asnwer_qq   ,
      asnwer_rr   ,
      asnwer_ss   ,
      asnwer_tt   ,
      asnwer_uu   ,
      asnwer_vv   ,
      asnwer_ww   ,
      asnwer_xx   ,
      asnwer_yy   ,
      asnwer_zz,
      asnwer_aaa,
      asnwer_bbb,
      asnwer_ccc,
      asnwer_ddd,
      asnwer_eee,
      asnwer_fff,
      asnwer_ggg,
      asnwer_hhh ,
      asnwer_iii  ,
      asnwer_jjj  ,
      asnwer_kkk  ,
      asnwer_lll,
      asnwer_mmm,
      asnwer_nnn ,
      asnwer_ooo,
      asnwer_qqq,
      asnwer_ppp ,
      asnwer_rrr,
      asnwer_sss,
      asnwer_ttt,
      asnwer_uuu,
      asnwer_vvv ,
      asnwer_www  ,
      asnwer_xxx   ,
      asnwer_yyy   ,
       asnwer_zzz
    ]
  });
});

module.exports = {infceRouter};
