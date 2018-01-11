const {
    qtnr
} = require("../models/questionnaires");

const {
    usr
} = require("../models/users");

const {
    apis,
    config,
    notes ,
    application
} = require("../database/config");

var helper =  (req , res , next) => {

  if(req.body.attendee_id == null){
    return new Promise((resolve , reject)=>{
      res.send(notes.Messages.Required_Message("attendee_id"));
    });
  }
  
  var attendee_id = req.body.attendee_id;
  usr.findOne({_id:attendee_id}).then((user)=>{
    // => Check if this user is already exists
    if(!user){
      return new Promise((resolve , reject)=>{
        res.status(404).send(notes.Errors.Error_Doesnt_exists("Attendee")) ;
      });
    }

    if(user.is_creator != 0){
      return new Promise((resolve , reject)=>{
        res.status(404).send({"Error":"That's not attendee"} ) ;
      });
    }

    req.attendee_info = {
        id : user._id ,
        user_type :user.is_creator,
        full_name :user.name,
        email :user.email
    };
    next();
  }).catch((err)=>{
    return new Promise((resolve , reject)=>{
      res.status(404).send(notes.Errors.Error_Doesnt_exists("Attendee")) ;
    });
      next();
  });
}

module.exports = { helper } ;
