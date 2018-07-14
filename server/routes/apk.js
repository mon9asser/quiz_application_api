
const express = require("express");
const hbs = require("hbs");
// const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const http = require('http');
const _ = require('lodash');
const session = require("express-session");
// const zip = new require('node-zip')();

//const simplePassword = require('simple-password');
const mongoose = require("mongoose");
const {MongoClient} = require("mongodb");
const {apk} = require("../../models/api_keys");
const {apis , config, notes} = require("../../database/config");
const {authByToken , verify_api_keys} = require("../../middlewares/authenticate") ;

var apkRouter = express.Router();
// apkRouter.use(bodyParser.json());
// apkRouter.use(bodyParser.urlencoded({ extended: false}));
apkRouter.use(session({
  secret : config.apiSecret ,
  resave : true ,
  saveUninitialized : true
}));

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++
  For Creating Api key
++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
apkRouter.post("/application/create" , (req,res)=>{
  var header = req.header("X-auth-apis");

  if(config.restricted_api_header != header || !header || header == ''){
    return new Promise((reject , resolve)=>{
      res.status(404).send(notes.Errors.Error_prevent_use);
    });
  }

    apk.findOne({ email : req.body.email }).then((isFound)=>{

      if(!isFound){
        var crypted_password ;

        // detect if string contain spaces value
          var salt = bcrypt.genSaltSync(10);
          var hashed = bcrypt.hashSync( req.body.password , salt);

          var apks = new apk ({
           _id :  mongoose.Types.ObjectId() ,
           application_name :req.body.application_name ,
           user_name : req.body.user_name ,
           email: req.body.email ,
           password: hashed ,
           created_at: new Date() ,
           updated_at: new Date()
         });

         apks.save().then(()=>{
           return apks.generate_api_keys();
         }).then(()=>{
           res.send({ API_KEYS : apks.api_private_keys , _id : apks._id });
         }).catch();

      }else {

          return new Promise((resolve , reject )=>{
            res.send({ API_KEYS : 0 , _id : 0});
          });
      }
    }).catch(()=>{});
});
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++
  For Login to api key
++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
apkRouter.post("/application/api_key_retrieve" , (req , res)=>{

  if((!req.body.email || req.body.email == null ) || (!req.body.password || req.body.password == null ) ){
    return new Promise((resolve , reject)=>{
      res.send(notes.Messages.Required_Message(['email','password']));
    });
  }
  var email = req.body.email ;
  var password = req.body.password ;
 ;
  apk.findOne({email:email}).then((userLoggedIn)=>{
    if(!userLoggedIn || userLoggedIn == null ){
      return new Promise((resolve,reject)=>{
        res.send({ API_KEYS : 0 , _id : 0 });
      })
    }
    bcrypt.compare(password, userLoggedIn.password, function(err, ps) {
      if(ps == true ){
          // Detect if file is exists or not
          // Give 777 Permission for apk api key file
          // Download case find it
          //in our app user can change email any time, so instead of email we will use user internal id (in place of email),
          // Give 555 Permission for apk api key file
          var target_path = __dirname + "/../../ui-public/api-keys/" + userLoggedIn.application_name+"_"+userLoggedIn._id+"_api_key.json";
          var target_file = config.server_ip+ "api-keys/" + userLoggedIn.application_name+"_"+userLoggedIn._id+"_api_key.json";
          if( fs.existsSync(target_path)){
             fs.chmodSync(target_path , '777' );
             res.send({ API_KEYS : target_file , _id : userLoggedIn._id , application_name:userLoggedIn.application_name});
          }else {
               // Create New File ===> HERE
              var target_folder = __dirname + "/../../ui-public/api-keys";
              var API_KEY_FILE_NAME = target_folder+"/"+userLoggedIn.application_name+"_"+userLoggedIn._id+"_api_key.json" ;
              var API_F_NAME = userLoggedIn.application_name+"_"+userLoggedIn._id+"_api_key.json" ;
              var API_F_NAME_ZIP = userLoggedIn.application_name+"_"+userLoggedIn._id+"_api_key.zip" ;
              var API_KEY_FILE_NAME_ZIP = target_folder+"/"+userLoggedIn.application_name+"_"+userLoggedIn._id+"_api_key.zip" ;
              if(!fs.existsSync(API_KEY_FILE_NAME)){
                var file_json = "{" + '"APP_NAME":"'+ userLoggedIn.application_name +'",'+  '"API_KEY":'+ '"'+userLoggedIn.api_private_keys+'"' + "}";
                fs.appendFileSync(API_KEY_FILE_NAME, file_json , (err) => {
                  if (err) throw err;
                    console.log('JSON File Is Created !');
                    fs.chmodSync(API_KEY_FILE_NAME , '777' );
                });
                res.send({ API_KEYS : config.server_ip+"api-keys/" + API_F_NAME , _id : userLoggedIn._id , application_name:userLoggedIn.application_name});
              }
              // if(!fs.existsSync(API_KEY_FILE_NAME_ZIP)){
              //   var file_json = "{" + '"APP_NAME":"'+ userLoggedIn.application_name +'",'+  '"API_KEY":'+ '"'+userLoggedIn.api_private_keys+'"' + "}";
              //   zip.file(API_F_NAME , file_json );
              //   var compressed_key = zip.generate({base64:false,compression:'DEFLATE'});
              //   console.log("-------------------------");
              //   console.log(compressed_key);
              //   console.log("-------------------------");
              //
              //   fs.writeFileSync(API_KEY_FILE_NAME_ZIP, compressed_key, 'binary' );
              //   fs.chmodSync(API_KEY_FILE_NAME_ZIP , '777' );
              //   // res.send({ api_key_file : config.server_ip+"api-keys/" + API_F_NAME_ZIP , filename : API_F_NAME_ZIP  });
              //   res.send({ API_KEYS : config.server_ip+"api-keys/" + API_F_NAME_ZIP , _id : userLoggedIn._id , application_name:userLoggedIn.application_name});
              // }


          }
      }else {
        // loging info not correct
        res.send({ API_KEYS : 0 , _id : 0 });
      }
    });

  });

});
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++
  For Give Api key Permission
++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
apkRouter.post("/application/apk_permission" , (req , res)=>{
  if(!req.body.soruce_file){
    return new Promise((resolve , reject)=>{
      res.send(notes.Messages.Required_Message("soruce_file"));
    });
  }
    var target_folder = __dirname + "/../../ui-public/api-keys/" + req.body.soruce_file;
    console.log(target_folder);
    if( fs.existsSync(target_folder)){
       fs.chmodSync(target_folder , '000' );
       res.status(200).send();
    }else {
      res.status(404).send(notes.Errors.Error_Doesnt_exists("File"));
    }
});

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++
  For Download Api key
++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
apkRouter.post("/application/download_keys", (  req , res )=>{
    var header = req.header("X-auth-apis");
    if(config.restricted_api_header != header || !header || header == ''){
      return new Promise((reject , resolve)=>{
        res.send(notes.Errors.Error_prevent_use);
      });
    }

     apk.findOne({ _id : req.body.api_key_id  }).then((key)=>{

        if(!key || key =='' || key == null ){
          return new Promise((resolve ,reject) => {
            res.status(404).send(notes.Errors.Error_Doesnt_exists("API KEYS"));
          });
        }

        var target_folder = __dirname + "/../../ui-public/api-keys";
        var API_KEY_FILE_NAME = target_folder+"/"+key.application_name+"_"+key._id+"_api_key.json" ;
        var API_F_NAME = key.application_name+"_"+key._id+"_api_key.json" ;
        var API_F_NAME_ZIP = key.application_name+"_"+key._id+"_api_key.zip" ;
        var API_KEY_FILE_NAME_ZIP = target_folder+"/"+key.application_name+"_"+key._id+"_api_key.zip" ;
        if(!fs.existsSync(API_KEY_FILE_NAME)){
          var file_json = "{" + '"APP_NAME":"'+ key.application_name +'",'+  '"API_KEY":'+ '"'+key.api_private_keys+'"' + "}";
          fs.appendFileSync(API_KEY_FILE_NAME, file_json , (err) => {
            if (err) throw err;
              console.log('JSON File Is Created !');
              fs.chmodSync(API_KEY_FILE_NAME , '777' );
          });
          res.send({ api_key_file : config.server_ip+"api-keys/" + API_F_NAME , filename : API_F_NAME  })
        }else {
           res.send("NOTE : You couldn't able to download api keys file more than one time , If you have an application login then download your app file ");
          //  fs.unlinkSync(API_KEY_FILE_NAME_ZIP);
         }
        // if(!fs.existsSync(API_KEY_FILE_NAME_ZIP)){
        //   var file_json = "{" + '"APP_NAME":"'+ key.application_name +'",'+  '"API_KEY":'+ '"'+key.api_private_keys+'"' + "}";
        //    zip.file(API_F_NAME , file_json );
        //    var compressed_key = zip.generate({base64:false,compression:'DEFLATE'});
        //    console.log(compressed_key);
        //    fs.writeFileSync(API_KEY_FILE_NAME_ZIP, compressed_key, 'binary' );
        //    fs.chmodSync(API_KEY_FILE_NAME_ZIP , '777' );
        //    res.send({ api_key_file : config.server_ip+"api-keys/" + API_F_NAME_ZIP , filename : API_F_NAME_ZIP  }); // {api_key_file : config.server_ip+"api-keys/"+API_F_NAME_ZIP } dataType: "json",
        //  }else {
        //    res.send("NOTE : You couldn't able to download api keys file more than one time , If you have an application login then download your app file ");
        //   //  fs.unlinkSync(API_KEY_FILE_NAME_ZIP);
        //  }
     }).catch((e)=>{
       return Promise.reject(e);
     });
});

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++
  For Delete Api key file
++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
apkRouter.delete("/application/deleted_api_key" , ( req ,res ) => {
  var header = req.header("X-auth-apis");
  if(config.restricted_api_header != header || !header || header == ''){
    return new Promise((reject , resolve)=>{
      res.status(404).send(notes.Errors.Error_prevent_use);
    });
  }

  apk.findOne({ _id : req.body._id }).then((key)=>{
    if(!key){
      if(config.restricted_api_header != header || !header || header == ''){
        return new Promise((reject , resolve)=>{
          res.status(404).send(notes.Errors.Error_Doesnt_exists("API KEY"));
        });
      }
    }
    // File Created on server
    var target_folder = __dirname+"/../../ui-public/api-keys";
    try {
      var API_KEY_FILE_NAME = target_folder+"/"+key.application_name+"_"+key._id+"_api_key.json" ;
      if(!fs.existsSync(API_KEY_FILE_NAME)){
          var file = fs.createWriteStream(API_KEY_FILE_NAME);
          var request = http.get(API_KEY_FILE_NAME, function(response) {
             response.pipe(file);
          });
          //fs.chmodSync(API_KEY_FILE_NAME, 000);
       }
    } catch (e) {
      return Promise.reject("Rejected process !!");
    }
    res.send({api_key_file:API_KEY_FILE_NAME})
  }).catch();

});
// apkRouter.get("/test/api_keys", verify_api_keys ,  (req , res)=>{
//
// });

module.exports = { apkRouter };
