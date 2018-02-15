// == -----------------------------------------------------------------
// == --------------------------> Login part
// == -----------------------------------------------------------------
apps.controller("register-app" , ["$rootScope" , "$http" , "$scope" , function ($rootScope , $http , $scope){
  $scope.server_ip = $("#serverIp").val() ;
  $scope.json_apk_file = $scope.server_ip + "ext/json/json-keys.json";
  $scope.api_url = $scope.server_ip + "api/users/create";
  $scope.register_access = $('#signup_user');


  $scope.access = {
    email       : '' ,
    password    : '' ,
    name        : '' ,
    is_creator  : 0
  };

  // => email validator
  $scope.email_validator = function (mail){
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
      return true
       else
      return false ;
  };

  $scope.register_access.on("click",function(){
  $scope.register_args = [] ;

  if($scope.access.email == '')
	 $scope.register_args[$scope.register_args.length] = 'email' ;
	if($scope.access.name == '')
	 $scope.register_args[$scope.register_args.length] = 'name';
	if($scope.access.password == '')
	 $scope.register_args[$scope.register_args.length] = 'password';

   if($scope.email_validator($scope.access.email) != true ){
      $('input[name="email"]').prev('.error-message').html("Invalid Email !!");
      return false
   }

   if($scope.register_args.length != 0 ){
				for (var i = 0; i < $scope.register_args.length; i++) {
					var field = $scope.register_args[i] ;
					$('input[name="' + field + '"]'
				).prev('.error-message').html("Required !");
					$('input[name="' + field + '"]'
					).css({
						border: '1px solid red'
					});
				}
				return false;
			}





      $.getJSON($scope.json_apk_file , function(api_key_data){
        $http({
            method : "POST" ,
            url    : $scope.api_url ,
            headers: {
    					"X-api-keys": api_key_data.API_KEY,
    					"X-api-app-name": api_key_data.APP_NAME
  				  },
            data: $scope.access
        }).then(function (res){
            if(res.data.Message){
							$(".error_mesage > ul > li").html(res.data.Message);
							$(".error_mesage").css({display:'block'});
							return false ;
						}
						if(res.data.redirectTo == true )
						window.location.href = "/" ;
        } , function (err){
          if (err.responseJSON.errors.email) {
							$('input[name="' + err.responseJSON
								.errors.email.path + '"]'
							).prev('.error-message').html(
								err.responseJSON.errors.email
								.message);
							$('input[name="' + err.responseJSON
								.errors.email.path + '"]'
							).css({
								border: '1px solid red'
							});
						}
        }); // End ajax login app
      }); // End Json Apps


 });

}]);
