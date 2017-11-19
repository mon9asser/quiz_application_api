var config = {
    port :                  ':27017' ,
    database_name :         '/quiz-application' ,
    host_name:              'mongodb://localhost' ,
    options :                { useMongoClient:true } ,
    server_port :            process.env.port || 3000 ,
    secretCode :             "@5rU5d@!tsd&$90f*&#5$~1100sdk$oprFRTgkjfddY1%js"
};

var apis = {
  _dir_   : '/api' ,
  _auth_  : 'auth-200' ,
  unauth :  "Unauthorized message !"  ,  // Access token not right
  notfound_message :  "Unfound Page !"
};

module.exports = {config , apis};
