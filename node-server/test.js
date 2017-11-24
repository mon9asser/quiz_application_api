
var port = process.env.port || 3000 ;
const express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();

app.use(session({
	secret: 'sec'
}));


var sess;
app.get('/logged',function(req,res){
    sess= req.session;
    req.session.cookie.expires = 350000 ;
    /*
    * Here we have assign the 'session' to 'sess'.
    * Now we can create any number of session variable we want.
    * in PHP we do as $_SESSION['var name'].
    * Here we do like this.
    */
    sess.email = "moun2030@gmail.com"; // equivalent to $_SESSION['email'] in PHP.
    sess.username="mon2000"; // equivalent to $_SESSION['username'] in PHP.
    res.send(req.session);
});

app.get("/login" , (req,res)=>{
	res.send(req.session);
});



app.get("/vaar" , (req,res)=>{
	res.send(req.session);
});



app.listen(port , ()=>{
	console.log(`Started up at ${port} `);
});
