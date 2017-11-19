//  Files
const {config} = require("./config");
const {mongodb , ObjectID} = require('mongodb');

const mongoose = require("mongoose");

mongoose.promise = global.promise;
// Connect to mongodb
mongoose.connect(
  config.host_name        +
  config.port             +
  config.database_name    ,
  config.options
);

module.exports = {mongoose};
