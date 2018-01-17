const express = require("express");
const hbs = require('express-hbs');
const http = require('http');
const path = require('path');
const {apis , config } = require("./database/config");
const {usrRouters} = require("./server/routes/usr");
const {qtnrRouters} = require("./server/routes/qtnr");
const {viewRouters} = require("./server/routes/views");
const {rptRouters} = require("./server/routes/rpt");
const {apkRouter } = require("./server/routes/apk");
const {usr} = require("./models/users");

const app = express();
// Use `.hbs` for extensions and find partials in `views/partials`.
// app.engine('hbs', hbs.express4({
//   partialsDir: __dirname + '/views/partials'
// }));

/*
create:50 GET http://localhost:9000/application/js/jquery.min.js net::ERR_ABORTED
create:52 GET http://localhost:9000/application/js/bootstrap.min.js net::ERR_ABORTED
create:53 GET http://localhost:9000/application/js/appcreations.js net::ERR_ABORTED
create:54 GET http://localhost:9000/application/js/applications.js net::ERR_ABORTED
*/
// app.use(  express.static(__dirname +'/public')  );
// app.set('view engine', 'hbs');
// app.set('views',  __dirname +'/views');
app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/ui-public/partials'
}));
app.set('view engine', 'hbs');
app.use( express.static(__dirname +'/ui-public') );
app.set('views',  __dirname +'/ui-public');


app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE'); // => OPTIONS, PUT,
  res.header('Access-Control-Allow-Headers', 'Content-Type , X-api-keys , X-api-app-name , X-app-token'); // X-Requested-With
  res.header('Access-Control-Allow-Credentials', true);
  next();
});
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

 // -----------------------------------------------
 // ----------> Routers ( Questionnaires ) => Api
 //------------------------------------------------
 app.use( apis._dir_ ,  rptRouters );

  // -----------------------------------------------
 // ----------> Routers ( Api key ) => Api
 //------------------------------------------------
 app.use( apis._dir_ ,  apkRouter );



// http.createServer((req,res)=>{
//   console.log(`Started up at port ${config.server_port}`);
// }).listen(config.server_port);
app.listen(config.server_port , ()=>{
  console.log(`Started up at port ${config.server_port}`);
});
