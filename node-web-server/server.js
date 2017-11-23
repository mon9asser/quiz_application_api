const express = require("express");
const hbs = require('express-hbs');

const {apis , config } = require("./database/config");
const {usrRouters} = require("./server/routes/usr");
const {qtnrRouters} = require("./server/routes/qtnr");
const {viewRouters} = require("./server/routes/views");

// testing only
const {usr} = require("./models/users.js");
// 
// usr.comparePassword('$2a$10$bOp7HXhFiRChzbE4sp2ReujEs7kOIZeywAhJX74T4SN1H3zXW3qOO', function(err, isMatch) {
//      console.log( isMatch); // -> Password123: true
//  });


/*--------------------------------*/

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



// -----------------------------------------------
// ---------->  User Authenticate
//------------------------------------------------


app.listen(config.server_port , ()=>{
  console.log(`Started up at port ${config.server_port}`);
});
