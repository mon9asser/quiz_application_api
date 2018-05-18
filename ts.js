var http = require('http');

console.log("Start server");
//create a server object:
http.createServer(function (req, res) {
  res.write('Hello World!'); //write a response to the client
  res.end(); //end the response
}).listen(9000); //the server object listens on port 8080
