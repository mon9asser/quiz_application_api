const express = require("express");
const hbs = require('express-hbs');

const {apis , config } = require("./database/config");
const {usrRouters} = require("./server/routes/usr");
const {qtnrRouters} = require("./server/routes/qtnr");
const {viewRouters} = require("./server/routes/views");
const {usr} = require("./models/users");


const app = express();
// Use `.hbs` for extensions and find partials in `views/partials`.
app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views/partials'
}));



app.set('view engine', 'hbs');
app.set('views',  __dirname +'/views');
app.use(express.static(__dirname + '/public'));



 

// -----------------------------------------------
// ----------> Routers  Views
//------------------------------------------------
app.use(viewRouters);

// -----------------------------------------------
// ----------> Routers ( User ) => Api
//------------------------------------------------
app.use( apis._dir_ ,  usrRouters );

// -----------------------------------------------
// ----------> Routers ( Questionnaires ) => Api
//------------------------------------------------
 app.use( apis._dir_ ,  qtnrRouters );





// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// testing only -------------------------------------------
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// -------------------------------------------> End Testing
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++





// -----------------------------------------------
// ---------->  User Authenticate
//------------------------------------------------


app.listen(config.server_port , ()=>{
  console.log(`Started up at port ${config.server_port}`);
});
