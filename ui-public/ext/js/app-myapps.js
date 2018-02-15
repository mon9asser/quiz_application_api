// == -----------------------------------------------------------------
// == --------------------------> Login part
// == -----------------------------------------------------------------
apps.controller("my-applications-controller" , ["$rootScope" , "$http" , "$scope" , function ($rootScope , $http , $scope){

  $scope.server_ip = $("#serverIp").val() ;
  $scope.user_id = $("#userId").val() ;

  $scope.json_apk_file = $scope.server_ip + "ext/json/json-keys.json";
  $scope.api_url =  $scope.server_ip + "api/create" ;
  $scope.api_url_delete =  $scope.server_ip + "api/delete" ;

  $scope.application_fields = new Array();
  $scope.user_token = $("#userToken").val();
  $scope.model_loading = $(".modal-content-overlay");
  $scope.applicationType = 1 ;
  $scope.application_title = "Quiz 1";
  $scope.application_description = "This description for Quiz 1";
  // ==> Init Default Value for app type
  $scope.create_application =  function (appType){
    $scope.application_title = appType + "1";
    $scope.application_description = "This description for "+appType + " 1";
    if(appType == "Quiz") {
      $scope.applicationType  = 1 ;
    }else {
      $scope.applicationType = 0;
    } ;
  };
  // ==> Create new application
  $scope.start_app_creation = function (){
    if($scope.application_title  == '' )
      {
        $scope.application_fields[$scope.application_fields.length]
          = ".application-title";
      }
      if($scope.application_description == '' )
      {
        $scope.application_fields[$scope.application_fields.length]
            = ".application-description";
      }

      if($scope.application_fields.length != 0 ){
         for (var i = 0; i < $scope.application_fields.length; i++) {
           $($scope.application_fields[i]).css({
             border : "1px solid tomato"
           });
         }
         return false ;
       }

       $scope.model_loading.fadeIn();

       $.getJSON($scope.json_apk_file , function(api_key_data){
         setTimeout(function(){
           $http({
               method : "POST" ,
               url    : $scope.api_url ,
               headers: {
       					"X-api-keys": api_key_data.API_KEY,
       					"X-api-app-name": api_key_data.APP_NAME
     				  },
               data: {
                 creator_id :$scope.user_id ,
                 app_type : $scope.applicationType ,
                 questionnaire_title : $scope.application_title ,
                 description : $scope.application_description
               }
           }).then(function (resData){
             window.location.href =
              $scope.server_ip +"api/"+resData.data._id+"/editor/"+$scope.user_token;
           } , function (err){
             console.log(err);
           }); // End ajax login app
         } , 2000 ); // end timeout
       }); // End Json Apps

  }; // End App creation


  $scope.delete_existing_app = function (appId) {
    var app_id = appId;
    var parent = $(".listed-app-"+app_id);
    var target_handler =   $(".delete-handler-"+app_id);
    // target_handler.html("<i class='fa fa-refresh fa-spin'></i>");
    $scope.api_url_delete =  $scope.server_ip + "api/"+app_id+"/delete" ;


    $.getJSON($scope.json_apk_file , function (api_keys){
      $.ajax({
          url :$scope.api_url_delete ,
          type :"DELETE",
          headers : {
            "X-api-app-name":api_keys.APP_NAME,
            "X-api-keys":api_keys.API_KEY
          },
          data : {
            creator_id : $scope.user_id
          }, // {{server_ip}}api/{{_id}}/editor/{{../user.token}}
          success : function (data){

          } ,
          error : function (er){
            console.log(er);
          }
        });
      // if(parent.parent("ul").children("li").length == 0){
      //   parent.parent("ul").
      // }
      parent.remove();
      var appLists = $(".my-apps").children("li");
      if(appLists.length == 0 ) {
        $(".my-apps").html('<li class="text-center ng-scope">There are no any records ! </li>');
      }
    }); // End Json Apps
  }; // end app deletion

}]);
