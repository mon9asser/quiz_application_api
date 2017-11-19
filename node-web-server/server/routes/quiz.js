const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const fs = require('fs');
const _ = require('lodash');


const {ObjectID} = require("mongodb");
const {apis} = require("../../database/config");
const {authByToken} = require("../../middlewares/authenticate") ;
var quesRouters = express.Router();

quesRouters.use(bodyParser.json());
quesRouters.use(bodyParser.urlencoded({ extended: false}));



module.exports = {quesRouters};
