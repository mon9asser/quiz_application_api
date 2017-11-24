const express = require("express");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const {ObjectID} = require("mongodb");
const {apis} = require("../../database/config");
const {authByToken} = require("../../middlewares/authenticate") ;
const {rpts} = require("../../models/reports");
const {usr} = require ("../../models/users");
//**************************************************************
/* ****************/// For Testing only
//**************************************************************

// ==============================================> End the test

var qtnrRouters = express.Router();

qtnrRouters.use(bodyParser.json());
qtnrRouters.use(bodyParser.urlencoded({ extended: false}));
