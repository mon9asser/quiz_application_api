const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const _ = require('lodash');
const session = require("express-session");
//const simplePassword = require('simple-password');

const {ObjectID} = require("mongodb");
const {usr} = require("../../models/users");
const {apis , config , notes} = require("../../database/config");
const {authByToken , verify_api_keys_user_apis} = require("../../middlewares/authenticate") ;
var usrRouters = express.Router();
usrRouters.use(bodyParser.json());
usrRouters.use(bodyParser.urlencoded({ extended: false}));
usrRouters.use(session({
  secret : config.apiSecret ,
  resave : true ,
  saveUninitialized : true
}));


  /*
  1- api/auth/uid ======> Authentication ( Generate new token )
    header >> api_keys
        new tokens

  2- api/create/quiz_type/creator_id
    header >> api_keys
        >> created_id & token ( expired on )
  */
  // Authenticate ( Generate new tokens ) => edit quiz - edit quiz taken ( case retak )


  usrRouters.post("/auth/:uid" , verify_api_keys_user_apis , (req,res)=>{
     var user_id = req.params.uid; // creator_id OR attendee_id
     // detect if this user is exists or not
     usr.findOne({_id:user_id} , (err,docsUser)=>{
       if(err || !docsUser){
         return new Promise((resolve , reject)=>{
           res.send({"error":notes.Errors.Error_Doesnt_exists("user")});
         });
       }
       var date_now = new Date();
       // Generate an expire tokens
       var generated_token   ;
       try {
         generated_token = jwt.sign({ _id: docsUser._id.toHexString() ,  date_made :date_now } ,config.secretCode)
       } catch (e) {
         return Promise.reject(e);
       }

       docsUser.tokens = generated_token;
       return docsUser.save().then((user)=>{
         res.send({user_id:user._id,token:generated_token});
       });
     }) ;
  });


  usrRouters.post("/users/login" , verify_api_keys_user_apis , (req,res)=>{
        var value_redirect = false ;
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
         //  user.generateAuthentication();
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
          value_redirect = true;
          res.send({
            isRedirect: value_redirect , // => option for you in ui client side
            // user :  user ,
            userInfo :  req.session.userInfo
          });
       }).catch((err)=>{
         res.status(404).send({
           isRedirect: false , // => option for you in ui client side
           erorr : err
         });
       });
  });
  /* POST */
   usrRouters.post("/users/create" , verify_api_keys_user_apis , (req,res)=>{
     var body = _.pick( req.body , ['name','email','password' , 'is_creator' ]);
      // console.log(body);

      if(req.body.password)
      {
        var salt = bcrypt.genSaltSync(10);
        var hash  = bcrypt.hashSync(body.password.toString() , salt);
        body.password = hash ;
      }
      //var compare = bcrypt.compareSync("666666", hash);

      usr.find({email:body.email} , (error , resData)=>{
        if (!resData || error )
        {
          return new Promise((resolve, reject) => {
               res.send(notes.Errors.General_Error);
          });
        }
      }).then((user)=>{

        if(user.length != 0)
        {
            return new Promise((resolve , reject)=>{
                res.send({"Message":"This user already exists !"});
            });
        }

        /*.then(()=>{
          return user.generateAuthentication();
       })*/
          var user = new usr(body);
          user.save().then((user)=>{
           // Storing Session !!
            req.session.userInfo = {
             id : user._id ,
             name : user.name ,
             email : user.email
           };
            // Request header !
           res.send({
             user : user ,
             redirectTo : true
           });
         }).catch((error)=>{
            res.status(404).send(error);
         });
      }).catch((error)=>{
        return new Promise((resolve , reject)=>{
            res.status(403).send({"Message":"Something went error ! please try later" , details : error});
        });
      });
  });






 /* patch */
usrRouters.patch ("/users/:uid/edit" , verify_api_keys_user_apis , ( req , res ) => {
  if(!req.params.uid)
     res.status(404).send();


   var userId = req.params.uid ;
   req.body.updatedAt =   new Date();



   var body = _.pick(req.body , 'name','password','email','updatedAt');

   if(!ObjectID.isValid(userId))
     res.status(404).send(notes.Errors.Error_Doesnt_exists("user_id"));

     usr.findByIdAndUpdate(userId , {$set:body} ,{new:true}).then((user)=>{
     if(!user)
       {
           return res.status(404).send();
       }
     res.send(user)
   }).catch((error)=>{
     res.status(200).send("Issues !!");
   });
});

/*DELETE */
usrRouters.delete("/users/:uid/delete" ,verify_api_keys_user_apis , (req, res)=>{
    var userId = req.params.uid ;
    if(!req.params.uid)
      res.status(404).send({"Error":notes.Errors.Error_Doesnt_exists("User")});

    if(!ObjectID.isValid(userId))
      res.status(404).send();

    usr.findByIdAndRemove(userId).then((user)=>{
      if(!user)
        res.status(404).send({"Error":notes.Errors.Error_Doesnt_exists("User")});
         res.send({"Message":"user is deleted successfully"});
    }).catch((error)=>{
      res.status(404).send({"Error":notes.Errors.Error_Doesnt_exists("User")});
    });

});


// usrRouters.post( "/date" , (req,res)=>{
//     var date1 = new Date("01/10/2018 8:00:00"); // stored token date
//     var date2 = new Date();
//     var timeDiff =  date2.getTime() - date1.getTime() ;
//     var days =  timeDiff / (1000 * 3600 * 24) ;
//     var hours = _.ceil(timeDiff / (1000 * 3600));
//     res.send({ "hours":hours});
// });


module.exports = {usrRouters};
