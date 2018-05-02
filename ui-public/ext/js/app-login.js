// == -----------------------------------------------------------------
// == --------------------------> Login part
// == -----------------------------------------------------------------
apps.controller("login-app" , ["$rootScope" , "$http" , "$scope" , function ($rootScope , $http , $scope){
  $scope.server_ip = $("#serverIp").val() ;
  $scope.json_apk_file = $scope.server_ip + "ext/json/json-keys.json";
  $scope.api_url = $scope.server_ip + "api/users/login";
  $scope.login_access = $('#login_user');
  $scope.access = {
    email    : null ,
    password : null
  };

  // => email validator
  $scope.email_validator = function (mail){
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
      return true
       else
      return false ;
  };
  // =>> Handler
  $scope.login_access.on("click",function(){
    // Detect values

    if($scope.access.email == '' ){
      $("input[name='email']").css({
					border: "1px solid tomato"
				});
    }

    if($scope.access.password == '' ){
      $("input[name='password']").css({
					border: "1px solid tomato"
				});
    }
    if ($scope.access.password == '' || $scope.access.email == '') {
				return false;
		}
    if($scope.email_validator($scope.access.email) != true ){
      $(".error-msg-response").html("Invalid Email !");
      return false ;
    }

    $.getJSON($scope.json_apk_file , function(api_key_data){
      console.log('----------------------------------------');
      console.log({API_KEY : api_key_data.API_KEY});
      console.log({APP_NAME : api_key_data.APP_NAME});
      $http({
          method : "POST" ,
          url    : $scope.api_url ,
          headers: {
  					"X-api-keys": api_key_data.API_KEY,
  					"X-api-app-name": api_key_data.APP_NAME
				  },
          data: $scope.access
      }).then(function (resData){

         if(resData.data.isRedirect != null && resData.data.isRedirect == true  ) {
           window.location.href = "/";
         }else {
           window.location.href = "/login";
         }
      } , function (err){
        console.log(err);
      }); // End ajax login app

      return false ;
    }); // End Json Apps
  });

}]);
