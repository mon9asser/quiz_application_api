var apps = angular.module("app-quiz" , []);
apps.controller("page-controller" , [
  "$scope", "$timeout" ,
   ( $scope , $timeout ) => {
     // ==> Start Application From Here !

     /* => Variables */
     $scope.server_ip = $("#serverIp").val();
     $scope.api_keys = new Object();

     /* => API urls */
     $scope.json_apk_file  = $scope.server_ip + "ext/json/json-keys.json";



     /* => functionalities */
     $scope.init = () => {

       // ==> Load APi Keys
       $.getJSON( $scope.json_apk_file , ( data ) => {
          $scope.api_keys['X-api-keys'] = data.API_KEY ;
          $scope.api_keys['X-api-app-name']  = data.APP_NAME ;
       });

       // ==> Do an actions here
       $timeout(function(){
         console.log($scope.api_keys);
       } , 100);
     }
     $scope.onclick_items = (elementId)=>{
       alert("Add New Question !");
     }


     /* => Execute all functionalities*/
     $scope.init();


     // ==> End App Controller Here
   }]);
