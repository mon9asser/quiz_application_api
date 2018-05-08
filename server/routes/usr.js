const express = require("express");
const hbs = require("hbs");
// const bodyParser = require('body-parser');
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
// usrRouters.use(bodyParser.json());
// usrRouters.use(bodyParser.urlencoded({ extended: false}));
usrRouters.use(session({
  secret : config.apiSecret ,
  resave : true ,
  saveUninitialized : true
}));


// ===========================================
// =========================Version 1.1
// ===========================================
usrRouters.post("/users/create/v1.1" , verify_api_keys_user_apis , (req,res)=> {
     var body = _.pick( req.body , ['name','email','password' , 'is_creator' ]);

      if ( req.body.password )
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


          var user = new usr(body);
          var date_now = new Date();
          // Generate an expire tokens
          var generated_token   ;
          try {
            generated_token = jwt.sign({ _id: user._id.toHexString() ,  date_made :date_now } ,config.secretCode)
          } catch (e) {
            return Promise.reject(e);
          }
          // Generate New Tokens
          user.tokens = generated_token;

          user.save().then((user)=>{
           // Storing Session !!
            req.session.userInfo = {
             id : user._id ,
             name : user.name ,
             email : user.email ,
             userType : user.is_creator,
             token : user.tokens
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
usrRouters.post("/users/login/v1.1" , verify_api_keys_user_apis , (req,res)=>{
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


         var date_now = new Date();
         // Generate an expire tokens
         var generated_token   ;
         try {
           generated_token = jwt.sign({ _id: user._id.toHexString() ,  date_made :date_now } ,config.secretCode)
         } catch (e) {
           return Promise.reject(e);
         }
         // Generate New Tokens
         user.tokens = generated_token;
         user.save();

         // Save session
         req.session.userInfo = {
           id : user._id      ,
           name : user.name   ,
           email :user.email  ,
           userType : user.is_creator ,
           token : user.tokens
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


// ====================================
// =================>> Updates
// ====================================
usrRouters.post("/users/create" , verify_api_keys_user_apis , (req,res)=> {


      var aruments = [] ;

      if(req.body.name == null )
      aruments[aruments.length] = "name";

      if(req.body.password == null )
      aruments[aruments.length] = "password";

      if(req.body.email == null  )
      aruments[aruments.length] = "email";

      if(req.body.is_creator == null )
      aruments[aruments.length] = "is_creator";

    if(aruments.length != 0 ){
      res.send(notes.notifications.catch_fields(notes.Messages.Required_Message(aruments)));
      return false ;
    }

         var body = _.pick( req.body , ['name','email','password' , 'is_creator' ]);

          if ( req.body.password )
              {
                var salt = bcrypt.genSaltSync(10);
                var hash  = bcrypt.hashSync(body.password.toString() , salt);
                body.password = hash ;
              }
          //var compare = bcrypt.compareSync("666666", hash);



             usr.findOne({"email":req.body.email}).then((user)=>{
                if(user.length != 0)
                {
                    return new Promise((resolve , reject)=>{
                        res.send(notes.notifications.catch_existing_data('Email'));
                        return false ;
                    });
                }
              });




              var user = new usr(body);
              var date_now = new Date();
              // Generate an expire tokens
              var generated_token   ;
              try {
                generated_token = jwt.sign({ _id: user._id.toHexString() ,  date_made :date_now } ,config.secretCode)
              } catch (e) {
                return Promise.reject(e);
              }
              // Generate New Tokens
              user.tokens = generated_token;

              user.save().then((user)=>{
               // Storing Session !!
                req.session.userInfo = {
                 id : user._id ,
                 name : user.name ,
                 email : user.email ,
                 userType : user.is_creator,
                 token : user.tokens
               };

               var usr = { user : user , redirectTo : true }
               res.send(notes.notifications.success_calling(usr));
             })

    });
usrRouters.post("/users/login" , verify_api_keys_user_apis , (req,res)=>{
        var value_redirect = false ;
        usr.findOne({email:req.body.email}).then((user)=>{
          if(!user){
             res.send(notes.notifications.catch_doesnt_existing_data('Email'));
             return false ;
          }

         // verify password => This Part not completed !
          var comparePassword =  bcrypt.compareSync(req.body.password.toString(), user.password ); // true
          if(comparePassword != true ){
            return new Promise((reject , resolve)=>{
              res.send(notes.notifications.password_authentication_failed());
            });
          }


         // make authenticate token
         //  user.generateAuthentication();


         var date_now = new Date();
         // Generate an expire tokens
         var generated_token   ;
         try {
           generated_token = jwt.sign({ _id: user._id.toHexString() ,  date_made :date_now } ,config.secretCode)
         } catch (e) {
           return Promise.reject(e);
         }
         // Generate New Tokens
         user.tokens = generated_token;
         user.save();

         // Save session
         req.session.userInfo = {
           id : user._id      ,
           name : user.name   ,
           email :user.email  ,
           userType : user.is_creator ,
           token : user.tokens
         };
         if(! req.session.userInfo)
          {
            res.status(400).send({
              "errorMSG" : "You Couldn't able to login now , try later!"
            });
             return false ;
          }
          value_redirect = true;


          var usrStatus = { isRedirect: value_redirect , userInfo :  req.session.userInfo };
          res.send(notes.notifications.success_calling(usrStatus));

        }).catch((err)=>{

          var authFail = { isRedirect: false ,  erorr : err };
          res.send(notes.notifications.show_authentication_failed(authFail));

         res.status(404).send();
       });
  });
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


module.exports = { usrRouters };
