var application = angular.module( 'application', ["ngRoute"] );

application.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('~>>');
    $interpolateProvider.endSymbol('<<~');
});

// =============================================================
// ================> Home Page
// =============================================================
application.config(['$routeProvider', function ($routeProvider){
    $routeProvider
          .when("/", {                       // ==> Redirect to default page
              templateUrl : "pages/home.html",
              controller : "homePage as Home"
          })
          .otherwise ("/" , {
            templateUrl : "login.html"
          });
}]);

application.controller("homePage" , ["$rootScope", function($rootScope){
  var home = this ;
  // ===> Meta Tags
  $rootScope.page_name = "home";
  $rootScope.page_title = "Welcome to questionnaire application";
  $rootScope.page_keywords = "quiz application , survey application , quesitonnaire application , apis , quesitons , answers , multiple choices";
  $rootScope.page_description = "This is quiz application to allow developers build thier apps";
  $rootScope.page_author = "Rakesh Vallil" ;

  // ==> stylesheets files
  $rootScope.stylesheet_files = ["main"];
  // ==> javascript files
  $rootScope.javascript_files = [""]
}]);


// =============================================================
// ================> Quiz Creation Page
// =============================================================
application.config(['$routeProvider', function ($routeProvider){
    $routeProvider
          .when("/api/:app_id/edit/:token", {
              templateUrl : "pages/quiz-creation.html",
              controller : "quiz_creation as CreateQuiz"
          });
}]);
application.controller("quiz_creation" , ["$rootScope",function($rootScope){
  var home = this ;
  // ===> Meta Tags
  $rootScope.page_name = "quiz_creation";
  $rootScope.page_title = "Build a quiz for attendees";
  $rootScope.page_keywords = "multiple choices , questions , answers , multi answers , media choices , true false questions , quiz questions , picture choices , video choices";
  $rootScope.page_description = "Build your own quiz to allow users attend your tutorial quiz";
  $rootScope.page_author = "Rakesh Vallil" ;

  // ==> stylesheets files
  $rootScope.stylesheet_files = ["main"];
  // ==> javascript files
  $rootScope.javascript_files = [""]
}]);
