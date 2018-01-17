var config = {
    server_ip : "http://34.215.133.182" ,
    api_key_code : "",
    api_application_name : ""
};

var application = angular.module("application", ["ngRoute"]);
application.config(["$routeProvider" , "$locationProvider" , function($routeProvider , $locationProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "login.html",
        controller : "loginController as login"
    })
    .when("/register", {
        templateUrl : "register.html",
        controller : "registerController as register"
    })
    .when("/login", {
        templateUrl : "login.html",
        controller : "loginController as login" 
    })
    .when("/app_creation", {
        templateUrl : "app-creation.html",
        controller : "quizCreationController as create_quiz"
    })
    // .otherwise("/" , {
    //   templateUrl : "login.html",
    //   controller : "loginController as login"
    // })
}]);

// ==> Login Controller
application.controller("loginController" ,['$rootScope' , '$http' , function( $rootScope , $http){
    var login = this ;
    $rootScope.page_name = "login_page";
    $rootScope.title = "User Login";
    login.user = { email:null , password:null } ;
    login.style = { email :{ border:"1px solid #ccc" } , password : { border:"1px solid #ccc" } };
    login.detect = function (){
      if(login.user.email)
         login.style.email.border = "1px solid #ccc"  ;
      if(login.user.password)
         login.style.password.border = "1px solid #ccc"  ;
    }
    // ==> Login This user
    login.this_user = function(){

      if(!login.user.email )
         login.style.email.border = "1px solid red";
      if(!login.user.password)
         login.style.password.border = "1px solid red";
      if(!login.user.email || !login.user.password )  return false ;

        var data = {email:login.user.email , password:login.user.password} ;
        // config.server+"/api/users/login"
    }
}] );
// ==> Register Controller
application.controller("registerController" ,['$rootScope' , function($rootScope){
    var register = this ;
    $rootScope.page_name = "register_page";
    $rootScope.title = "Create New Account";
}]);


// ==> Application Creation Controller
application.controller("quizCreationController" , ["$rootScope" , function ($rootScope){
  var app = this;
  $rootScope.page_name = "quiz_page";
  $rootScope.title = "Create New Quiz";
}]);

/*
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();



    // Save data to sessionStorage
    sessionStorage.setItem('key', 'value');

    // Get saved data from sessionStorage
    var data = sessionStorage.getItem('key');

    // Remove saved data from sessionStorage
    sessionStorage.removeItem('key');

    // Remove all saved data from sessionStorage
    sessionStorage.clear();
});

*/
