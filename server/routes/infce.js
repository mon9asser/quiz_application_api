
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
const {insertIntoApiKey} = require("./qtnr");


var infceRouter = express.Router();
infceRouter.use(build_session);


infceRouter.use(  bodyParser.json() );
infceRouter.use(  bodyParser.urlencoded({ extended: false}) );

infceRouter.get(["/test"] , (req,res) => {
  res.render("login.hbs");
});




module.exports = {infceRouter};
