var application = angular.module('application', []);

application.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('~>>');
  $interpolateProvider.endSymbol('<<~');
});

/*----------------------------------------*/
// ==> Quiz Creation
/*----------------------------------------*/
application.controller("controller.quiz.creation" , [ '$scope' ,  function(  $scope  ){
  
}]);
