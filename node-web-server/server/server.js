const express = require("express");
const app = express();


const {apis , config } = require("../database/config");

const {usrRouters} = require("./routes/usr");
const {quesRouters} = require("./routes/quiz");

// -----------------------------------------------
// ----------> Routers ( User )
//------------------------------------------------
app.use( apis._dir_ ,  usrRouters );

// -----------------------------------------------
// ----------> Routers ( Questionnaires )
//------------------------------------------------
app.use( apis._dir_ ,  quesRouters );

app.listen(config.server_port , ()=>{
  console.log(`Started up at port ${config.server_port}`);
});
