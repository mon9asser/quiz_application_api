var server = "http://34.215.133.182" ;

var config = {
    api_application_name : "jApps",
    api_key_code : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YTVjNmI2NWJhMmY3MDA2OThjOWQzYzMiLCJlbWFpbCI6Im1vdW4yMDMwQGdtYWlsLmNvbSIsImFwcGxpY2F0aW9uX25hbWUiOiJqQXBwcyIsIm5hbWUiOiJNb250YXNzZXIiLCJpYXQiOjE1MTYwMDYyNDV9.Y7LeoBr3s7lA_Jbvuk-3cZzotmPi17USB0zjW5YvubE" ,
    init_application :   server + "/api/init",
    create_application : server + "/api/create" ,
    create_user : server  +"/api/users/create" ,
    require : {
      creator_id : "This Field 'creator_id' is required"
    } ,
    errors : {
      creator :"This 'Creator' does not exists"
    }
};


var application = angular.module("application", ["ngRoute"]);
application.config(["$routeProvider" , "$locationProvider" , function($routeProvider , $locationProvider) {
    $routeProvider
    .when("/", {                       // ==> Redirect to default page
        templateUrl : "login.html",
        controller : "loginController as login"
    })
    .when("/register", {
        templateUrl : "register.html", // ==> For Register New user
        controller : "registerController as register"
    })
    .when("/login", {
        templateUrl : "login.html", // ==> For Login The Existing user
        controller : "loginController as login"
    })
    .when("/quiz/:app_id", { // ==> For Retrieve The Created Application {Quiz Type}
        templateUrl : "quiz-creation.html",
        controller : "quizCreationController as create_quiz"
    })
    .when("/survey/:app_id", { // ==> For Retrieve The Created Application {Survey Type}
        templateUrl : "survey-creation.html",
        controller : "surveyCreationController as create_survey"
    })
    .when("/applications/:creator_id", { // ==> For Retrieve All Application of this creator
        templateUrl : "my-applications.html",
        controller : "applicationsController as apps"
    })
    .when("/home" , {              // ==> Redirect to default page
      templateUrl : "home.html",
      controller : "homeController as create_quiz"
    })
    .otherwise("/" , {             // ==> Redirect to default page
      templateUrl : "login.html",
      controller : "loginController as login"
    })
}]);


/*
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
============================>>>>> Login Controller
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/
application.controller("loginController" , ['$rootScope' , '$http' , function( $rootScope , $http){
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
/*
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
============================>>>>> Register Controller
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/
application.controller("registerController" ,['$rootScope' , function($rootScope){
    var register = this ;
    $rootScope.page_name = "register_page";
    $rootScope.title = "Create New Account";

    register.required_object = {
                                    name        : null ,
                                    password    : null ,
                                    email       : null ,
                                    is_creator  : '0'
                                };
    register.register_fields = $('input.signup , input.login , select.signup');
    register.send_values = $(".btn-signup");
    register.fields = {
        email     :   $('input.signup[type="email"]')  ,
        name      :   $('input.signup[type="text"]')  ,
        password  :   $('input.signup[type="password"]')
    }
    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // ----------====> Reset Values
    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    register.register_fields.on('change , keyup',function(){
      $(this).css({
         "border-color" : "#ccc"
      });
      $(this).prev('.error-message').html('');
      $(this).parent().parent().prev('.error_mesage').html('');
    });

    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // ----------====> Send Values to ec2
    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    register.send_values.on(  "click" , function(){
      var fields = new Array()
      // Check about NULL
      if(register.required_object.name      == '' )
        fields[fields.length] = register.fields.name ;
      if(register.required_object.email     == '' )
        fields[fields.length] = register.fields.email ;
      if(register.required_object.password  == '' )
        fields[fields.length] = register.fields.password ;

        var email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(register.required_object.email);


       if(fields.length != 0 ){
         for (var i = 0; i < fields.length; i++) {
           fields[i].css({
             border:'1px solid red'
           });
           fields[i].prev('.error-message').html("Required !");
         }

         return false ;
       }
       if((email == false ) )
         {
           register.fields.email.prev('.error-message').html("Invalid Email !");
           return false;
         }


        // ==================>>>>>>>>>>>>>>>
        $.ajax({
            type : 'POST',
            url: config.create_user ,
            data :register.required_object  ,
            headers: {
               'Content-Type': undefined ,
               'X-api-keys':config.api_key_code,
               'X-api-app-name':config.api_application_name
            } ,
            success : function (response){
              console.log("++++SUCCESS MESSAGE");
              console.log(response);
            } ,
            error  : function (response){
              console.log("++++ERROR MESSAGE");
              console.log(response);
            }
        });

    });


}]);
/*
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
============================>>>>> Quiz Creation Controller
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/
application.controller("quizCreationController" , ["$rootScope","$http" , function ($rootScope,$http){

  var app = this;


  $rootScope.page_name = "quiz_page";
  $rootScope.title = "Create New Quiz";

  app.templates = 'templates/preview.html';
  app.on_mode = "Preview";
  app.template_mode = false ;
  app.move_mode = function (){
    if ( app.template_mode == false ){
        app.template_mode = false ;
        app.templates= 'templates/preview.html';
        app.on_mode = "Preview";
    } else
    {
      app.template_mode = true ;
      app.templates= 'templates/editor.html';
      app.on_mode = "Editor";
    }
  };


  // ==============================================================
  // ================>>>> Sorting !! <<<<<<<<<<<===================
  // ==============================================================
  app.qs_sortable = $("#qs-sortable") ;
  app.qs_dropped = $(".dropped-qs");
  var dropped = false;
  var draggable_sibling;
  app.qs_dropped.sortable();
  app.qs_sortable.sortable({
      start: function(event, ui) {
           draggable_sibling = $(ui.item).prev();
           $('.dragelement-here').addClass('dragged-items');
   },
      // helper: function(event , ui) {
      //   return $('<span>Data...</span>');
      // } ,
      stop: function(event, ui) {
           if (dropped) {
             if (draggable_sibling.length == 0)
                $('#qs-sortable').prepend(ui.item);
                $('.dragelement-here').removeClass('dragged-items');
               draggable_sibling.after(ui.item);
               dropped = false;
           }
       }
  });

  app.qs_dropped.droppable({
    activeClass: 'active',
        hoverClass:'hovered',
        drop:function(event,ui){
          $('.dragelement-here').removeClass('dragged-items');

            // Question type page [QS]
            var $questionType = ui.helper[0].getAttribute('question-data');


            $http({
                  method: 'GET',
                  url: 'templates/question-types/'+$questionType
                }).then(function successCallback(response) {
                   $(".dropped-qs").prepend(response.data);
                   $(".dragelement-here").remove();
                }, function errorCallback(response) {
                  // called asynchronously if an error occurs
                  // or server returns response with an error status.
              });
            // console.log(event.target);
            // $(event.target).addClass('dropped');
            dropped = true;
      }
  });

  // ==============================================================
  // ================>>>> Create App <<<<<<<<<<<===================
  // ==============================================================
  app.app_type = 1 // => Quiz  Type
  app.error_container = $(".error-container");
  app.create_new_app = function (app_type){

      // ==> Check about application type
      if (app.app_type != 1 ){
        app.error_container.css({display:'bock'});
         app.error_container.html("This Application Type does not exists !");
        return false ;
      }
      app.error_container.css({display:'none'});

      // ==> Create This Application
      // $http({
      //         method: 'POST',
      //         url: config.init_application ,
      //         data : {
      //           creator_id : "s5d4s5d4s54d5s15sdsd"
      //         } ,
      //         headers: {
      //            'Content-Type': undefined ,
      //            'X-api-keys':config.api_key_code,
      //            'X-api-app-name':config.api_application_name
      //         }
      //     }).then(function successCallback(response) {
      //       console.log(response.data);
      //     }, function errorCallback(response) {
      //       app.error_container.css({display:'block'});
      //       /*
      //       --------------------------------------------------
      //       CASE  -------------====>>> Api key not verified
      //       --------------------------------------------------
      //       */
      //       if(response.data.Authentication_Failed != null ){
      //         console.log(response);
      //       }
      //
      //
      //
      //    });
      $.ajax({
        type : 'POST',
        url: config.init_application ,
        data : {
          creator_id : "s5d4s5d4s54d5s15sdsd"
        } ,
        headers: {
           'Content-Type': undefined ,
           'X-api-keys':config.api_key_code,
           'X-api-app-name':config.api_application_name
        } ,
        success : function (response){
          /*
            --------------------------------------------------
            CASE  -------------====>>> Required Creator ID
            --------------------------------------------------
          */
          if(response == config.require.creator_id){

          }
          /*
            --------------------------------------------------
            CASE  -------------====>>> Creator doesn't exists
            --------------------------------------------------
          */
          else if (response.Error == config.errors.creator ){

          }


        } ,
        error  : function (response){
          /*
            --------------------------------------------------
            CASE  -------------====>>> Api key not verified
            --------------------------------------------------
          */
          if(response.data.Authentication_Failed != null ){

          }

        }
      });
      // ==> Display and Edit the existing application
  }
}]);
/*
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
============================>>>>> Survey Creation Controller
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/
application.controller("surveyCreationController",["$rootScope","$http" , function ( $rootScope , $http ){
  var app = this;
  $rootScope.page_name = "survey_page";
  $rootScope.title = "Create New Survey";

  // ==============================================================
  // ================>>>> Create App <<<<<<<<<<<===================
  // ==============================================================
  app.app_type = 0 // => Quiz  Type
  app.create_new_app = function (app_type){

  }

}]);
/*
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
============================>>>>> My Applications Controller
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/
application.controller("applicationsController",["$rootScope","$http" , function ( $rootScope , $http ){
  var apps = this;


  $rootScope.page_name = "applications_page";
  $rootScope.title = "My Applications";
}]);
/*
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
============================>>>>> HomePage Controller
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/
application.controller("homeController",["$rootScope","$http" , function ( $rootScope , $http ){
  var home = this;


  $rootScope.page_name = "home_page";
  $rootScope.title = "Welcome To Quiz Application !";
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
