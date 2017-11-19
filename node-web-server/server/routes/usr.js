const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const fs = require('fs');
const _ = require('lodash');


const {ObjectID} = require("mongodb");
const {usr} = require("../../models/users");
const {apis} = require("../../database/config");

const {authByToken} = require("../../middlewares/authenticate") ;

var usrRouters = express.Router();

usrRouters.use(bodyParser.json());
usrRouters.use(bodyParser.urlencoded({ extended: false}));

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

  /* GET */
  usrRouters.get('/users' , authByToken , (req,res)=>{

    usr.find().then((users)=>{
      // Send to 401 http status
      if(!users)
      {
        res.status(404).send();
      }

       // success request , send to 200 http status
      res.send(users);

    }).catch((error)=>{
      res.status(400).send(error);
    });

  });

  /* POST */
  usrRouters.post("/users/create" , (req,res)=>{

    req.body.updatedAt = new Date();
    req.body.createdAt = new Date();
    var body = _.pick( req.body , ['name','email','password']);

    var user = new usr(body);

    user.save().then(()=>{
      return user.generateAuthentication();
    }).then((token)=>{
      res.header("x-auth" , token).send(user);
    }).catch((error)=>{
      res.status(400).send(error);
    });
  });
 //
usrRouters.get("/users/test" , authByToken , (req,res)=>{
    res.send(req.user);
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
 /* +++++++++++++++++++++++++++++++++++++++++++ */
  // => Questionnaires
 /* +++++++++++++++++++++++++++++++++++++++++++ */

 /* +++++++++++++++++++++++++++++++++++++++++++ */
  // => Reports
 /* +++++++++++++++++++++++++++++++++++++++++++ */





module.exports = {usrRouters};
