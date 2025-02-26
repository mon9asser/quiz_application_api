const express = require("express");
const hbs = require('express-hbs');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const {apis , config } = require("./database/config");
const {usrRouters} = require("./server/routes/usr");
const {qtnrRouters} = require("./server/routes/qtnr");
const {viewRouters} = require("./server/routes/views");
const {rptRouters} = require("./server/routes/rpt");
const {apkRouter } = require("./server/routes/apk");
const {drftRouter} = require("./server/routes/drft");
const {infceRouter} = require("./server/routes/infce");
const {usr} = require("./models/users");
const cors= require('cors');
const compression = require('compression')


const app = express();
// const exphbs  = require('express-handlebars'); // => Deprecated !!
function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }

  // fallback to standard filter function
  return compression.filter(req, res)
}
app.use(compression({filter: shouldCompress}))

// Use `.hbs` for extensions and find partials in `views/partials`.
app.engine('hbs', hbs.express4({
  partialsDir: path.join(__dirname, 'ui-public/partials' )
}));

// app.use(express.static(path.join(__dirname, 'ui-public')));
app.use(express.static(path.join(__dirname, 'ui-public')));
// emitter.setMaxListeners();
// app.use( express.static(__dirname +'/ui-public') );
app.set('view engine', 'hbs');
app.set('views',  __dirname +'/ui-public');
// app.use(express.json({limit: '50mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
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


http.globalAgent.maxSockets = 50;
// http.createServer((req,res)=>{
//   console.log(`Started up at port ${config.server_port}`);
// }).listen(config.server_port);



app.listen(config.server_port , ()=>{
  console.log(`Started up at port ${config.server_port}`);
});
