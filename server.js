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
const {drftRouter} = require("./server/routes/drft");
const {infceRouter} = require("./server/routes/infce");
const {usr} = require("./models/users");


const app = express();
// const exphbs  = require('express-handlebars'); // => Deprecated !!


// Use `.hbs` for extensions and find partials in `views/partials`.
app.engine('hbs', hbs.express4({
  partialsDir: path.join(__dirname, 'ui-public/partials' )
}));

// app.use(express.static(path.join(__dirname, 'ui-public')));
app.use(express.static(path.join(__dirname, 'ui-public')));

// app.use( express.static(__dirname +'/ui-public') );
app.set('view engine', 'hbs');
app.set('views',  __dirname +'/ui-public');

hbs.registerHelper('server_ip', config.server_ip );



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
// ----------> Attendee draft ( Case Broswer is closed will use this api )
//------------------------------------------------
app.use ( apis._dir_ , drftRouter);


// -----------------------------------------------
// ----------> Interface ( Api's ) =>  For usgin in Iframes ( Client Server)
//------------------------------------------------
app.use( apis._dir_ , infceRouter );




app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE'); // => OPTIONS, PUT,
  res.header('Access-Control-Allow-Headers', 'Content-Type , X-api-keys , X-api-app-name , X-app-token'); // X-Requested-With
  res.header('Access-Control-Allow-Credentials', true);
  next();
});



// http.createServer((req,res)=>{
//   console.log(`Started up at port ${config.server_port}`);
// }).listen(config.server_port);
app.listen(config.server_port , ()=>{
  console.log(`Started up at port ${config.server_port}`);
});
