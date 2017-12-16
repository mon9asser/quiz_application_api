const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const _ = require('lodash');
const session = require("express-session");
//const simplePassword = require('simple-password');

const {ObjectID} = require("mongodb");
const {usr} = require("../../models/users");
const {apis , config} = require("../../database/config");
const {authByToken} = require("../../middlewares/authenticate") ;

var usrRouters = express.Router();

usrRouters.use(bodyParser.json());
usrRouters.use(bodyParser.urlencoded({ extended: false}));
usrRouters.use(session({
  secret : config.apiSecret ,
  resave : true ,
  saveUninitialized : true
}));
 /*
  /POST         api/create
  /PUT          api/<quiz/survey id>/edit?uid=<>&token=<>
  /GET          api/<quiz/survey id>/preview
  /GET          api/<quiz/survey id>/attent?uid=<>&token=<>
  /GET          api/<quiz/survey id>/getresult?uid=

  /DELETE       api/<quiz/survey id>/delete
  /DELETE       api/<quiz/survey id>/clear
 */

 /* +++++++++++++++++++++++++++++++++++++++++++ */
  // => Required Api
 /* +++++++++++++++++++++++++++++++++++++++++++ */

 /* +++++++++++++++++++++++++++++++++++++++++++ */
  // => Users
 /* +++++++++++++++++++++++++++++++++++++++++++ */

  // usrRouters.get('/users' , authByToken , (req,res)=>{
  //
  //   usr.find().then((users)=>{
  //     // Send to 401 http status
  //     if(!users)
  //     {
  //       res.status(404).send();
  //     }
  //
  //      // success request , send to 200 http status
  //     res.send(users);
  //
  //   }).catch((error)=>{
  //     res.status(400).send(error);
  //   });
  //
  // });

  usrRouters.post("/users/login" , (req,res)=>{

        usr.findOne({email:req.body.email}).then((user)=>{
          if(!user){
            return res.status(404).send({
              "errorMSG" : "This account does not exists !"
            });
          }

         // verify password => This Part not completed !
          var comparePassword =  bcrypt.compareSync(req.body.password.toString(), user.password ); // true
          if(comparePassword != true ){
            return new Promise((reject , resolve)=>{
              res.send({"Message":"Rejected Authentication"});
            });
          }
         // make authenticate token
         user.generateAuthentication();
         // Save session
         req.session.userInfo = {
           id : user._id,
           name : user.name,
           email :user.email
         };
         if(! req.session.userInfo)
          {
            res.status(400).send({
              "errorMSG" : "You Couldn't able to login now , try later!"
            });
             return false ;
          }
          res.send({
            redirectTo : "/home" ,
            user :  user
          });
       }).catch((err)=>{
         res.status(404).send(err);
       });
  });
  /* POST */
   usrRouters.post("/users/create" , (req,res)=>{
     var body = _.pick( req.body , ['name','email','password' , 'is_creator' ]);
      // console.log(body);

      if(req.body.password)
      {
        var salt = bcrypt.genSaltSync(10);
        var hash  = bcrypt.hashSync(body.password.toString() , salt);
        body.password = hash ;
      }
      //var compare = bcrypt.compareSync("666666", hash);

      usr.find({email:body.email}).then((user)=>{

        if(user.length != 0)
        {
            return new Promise((resolve , reject)=>{
                res.send({"Message":"This user already exists !"});
            });
        }


          var user = new usr(body);
          user.save().then(()=>{
            return user.generateAuthentication();
         }).then((token)=>{
           // Storing Session !!
           req.session.userInfo = {
             id : user._id ,
             name : user.name ,
             email : user.email
           };
            // Request header !
           res.header("x-auth" , token).send({
             user : user ,
             redirectTo : '/home'
           });
         }).catch((error)=>{
            res.status(403).send(error);
         });
      }).catch((resolve , reject)=>{
        return new Promise((resolve , reject)=>{
            res.status(403).send({"Message":"Something went error ! please try later"});
        });
      });



  });


 /* patch */
usrRouters.patch ("/users/:uid/edit" , ( req , res ) => {

    if(!req.params.uid)
      res.status(404).send();


    var userId = req.params.uid ;
    req.body.updatedAt =   new Date();



    var body = _.pick(req.body , 'name','password','email','updatedAt');

    if(!ObjectID.isValid(userId))
      res.status(404).send();
    usr.findByIdAndUpdate(userId , {$set:body} ,{new:true}).then((user)=>{
      if(!user)
        {
            return res.status(404).send();
        }
      res.send(user)
    }).catch((error)=>{
      res.status(400).send();
    });
});

/*DELETE */
usrRouters.delete("/users/:uid/delete" , (req, res)=>{
    var userId = req.params.uid ;
    if(!req.params.uid)
      res.status(404).send();

    if(!ObjectID.isValid(userId))
      res.status(404).send();

    usr.findByIdAndRemove(userId).then((user)=>{
      if(!user)
        res.status(404).send();
         res.send(user);
    }).catch((error)=>{
      res.status(400).send();
    });

});




module.exports = {usrRouters};
