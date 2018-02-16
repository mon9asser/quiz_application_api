apps.controller("apps-controller" , ['$scope','$http' , '$timeout' , function ($scope , $http , $timeout){


   //--------------------------------------------------------
   // ==>  Default Values
   //--------------------------------------------------------
   $scope.server_ip = $("#serverIp").val();
   $scope.user_id = $("#userId").val();
   $scope.app_id = $("#applicationId").val();


   //--------------------------------------------------------
   // ==>  api urls
   //--------------------------------------------------------
   $scope.api_url_current_app     = $scope.server_ip + "api/"+$scope.app_id+"/application/retrieve"
   $scope.json_apk_file           = $scope.server_ip + "ext/json/json-keys.json";
   $scope.api_url_create_question = null;
   $scope.api_url_delete_question = $scope.server_ip + "api/"+$scope.app_id+"/question/delete";
   $scope.api_url_edit_question   = null;
   $scope.api_url_create_answer   = null;
   $scope.api_url_delete_answer   = null;
   $scope.api_url_edit_answer     = null;

   // -------------------------------------------------------
   // ----> Init current App
   // -------------------------------------------------------
   $scope.questions_list = null ; // loading questions here from mongoDB
   $scope.application_settings = null ;
   $scope.application_stylesheet = null ;
   $.getJSON( $scope.json_apk_file , function (api_key_data ){
       $http({
             method : "POST" ,
             url    : $scope.api_url_current_app ,
             headers: {
               "X-api-keys": api_key_data.API_KEY,
               "X-api-app-name": api_key_data.APP_NAME
             },
             data: {
               creator_id : $scope.user_id
             }
          }).then(function(resp){
            // Questions
            $scope.questions_list = resp.data.questions;
            // Settings
            $scope.application_settings =  resp.data.settings;
            // Stylesheets
            $scope.application_stylesheet =  resp.data.theme_style;

          },function(err){
       });
   }); // End Json Data

    $timeout(function(){
        console.log($scope.questions_list);
    } , 210);

   //--------------------------------------------------------
   // ==> Sliding editor elements to show question details
   //--------------------------------------------------------
   $scope.slide_edditor_slices = $(".x-editor-x-title");
   $scope.slide_edditor_slices.on("click",function (){
      var targetId = $(this).attr('data-toggle');
      var targetAll = $(".x-editor-x-body").height() ;
      var targetH = $(targetId).height() ;
      $(targetId).slideToggle();
   });

   //--------------------------------------------------------
   // ==> Delete Question
   //--------------------------------------------------------
   $scope.delete_this_question = function(questionId){
     $(".qs-delete-"+questionId).removeClass("fa-trash");
     $(".qs-delete-"+questionId).addClass("fa-refresh fa-spin tomato-font");
      var element = $(".qs-"+questionId);
      element.css({background:"snow"})
      $(".fa-spin").css("color","tomato");

     $.getJSON($scope.json_apk_file , function(api_key_data){
       $timeout(function (){
         $http({
              method : "PATCH",
              url : $scope.api_url_delete_question ,
              headers: {
      					"X-api-keys": api_key_data.API_KEY,
      					"X-api-app-name": api_key_data.APP_NAME
    				  },
              data : {
                creator_id  : $scope.user_id ,
                question_id : questionId
              }
          }).then(function(resp){

             element.addClass("animated rotateOutUpLeft");
             $timeout(function(){
                element.remove();
             },1000);
          },function(err){
            console.log(err);
          });
       }, 1200 );
     });
   };

   //--------------------------------------------------------
   // ==> Create Question
   //--------------------------------------------------------
   $scope.sort_handler = document.getElementById("docQuestions");
   Sortable.create($scope.sort_handler , {
     ghostClass: 'shadow_element' ,
     group: "question-list" ,
     disabled: false ,

     onStart : function (evt){
      // var targetEl = $(evt.item).hasClass("draggable-x");
     } ,
     onEnd : function (evt){
       // Sorting it into mongoDb
     }
   }); // end sortable

   $scope.sortble_draggable_handler = document.getElementById("qs-sortable");
   Sortable.create($scope.sortble_draggable_handler , {
     ghostClass: 'shadow_element' ,
     sort: false,
     group: {
        name: "question-list",
        pull: "clone",
        revertClone: false,
     },
     onEnd : function (){
       alert();
     },
   }); // end sortable draggable


  //--------------------------------------------------------
  // ==> Edit Current Question
  //--------------------------------------------------------
  $scope.edit_this_question = function (qs_id , app_id){

  };
}]);
