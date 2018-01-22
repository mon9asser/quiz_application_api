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
const {infceRouter} = require("./server/routes/infce");
const {usr} = require("./models/users");
const {interfaceRouters} = require("./server/routes/interfaceRouters")
const app = express();


// Use `.hbs` for extensions and find partials in `views/partials`.
// app.engine('hbs', hbs.express4({
//   partialsDir: __dirname + '/views/partials'
// }));

// app.use(  express.static(__dirname +'/public')  );
// app.set('view engine', 'hbs');
// app.set('views',  __dirname +'/views');

app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/ui-public/templates'
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

// -----------------------------------------------
// ----------> Interface ( Api's ) =>  For usgin in Iframes ( Client Server)
//------------------------------------------------
app.use( apis._dir_ , infceRouter );

// -----------------------------------------------
// ---------->  Login Register Pages
//------------------------------------------------
app.use( interfaceRouters );

// http.createServer((req,res)=>{
//   console.log(`Started up at port ${config.server_port}`);
// }).listen(config.server_port);
app.listen(config.server_port , ()=>{
  console.log(`Started up at port ${config.server_port}`);
});
