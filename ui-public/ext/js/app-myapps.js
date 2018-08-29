// == -----------------------------------------------------------------
// == --------------------------> Login part
// == - ----------------------------------------------------------------
apps.controller("my-applications-controller" , ["$rootScope" , "$http" , "$scope" , function ($rootScope , $http , $scope){

  $scope.server_ip = $("#serverIp").val() ;
  $scope.user_id = $("#userId").val() ;
  $scope.survey_applications = [];
  $scope.quiz_applications = [];


  $scope.application_settings = {
         titles :
           {
             title_start_with : "Write Starting Text"  ,
             title_end_with: "Write Ending Text" ,
             title_success_with : " Success quiz Text" ,
             title_failed_with : "Quiz Failed Text" ,
             title_resume : "Quiz Resume Text"
           } ,
         label_btns : {
           lbl_start_with:"Start" ,
           lbl_continue_with : "Continue" ,
           lbl_retake_with : "Retake" ,
           lbl_review_with : "Review" ,
           lbl_back_with : "Back",
           lbl_finish_with : "Finish",
           lbl_resume_with : "Resume" , 
           lbl_submit_quiz_with : "Submit Quiz",
           lbl_score_with :"Score",
           lbl_grade_with :"Grade" ,
           didnot_yet:"You didn't solve any question , click here to attend" ,
           unsolved_question:"question(s) isn't attended click here to attend" ,
           when_you_solve : "When you solve this question the next one will come directly after few moments",
           there_are_many_options : "There're many correct choices , You've to select them  to pass this question"
          } ,
         grade_settings : {
           is_graded : false ,
           value : 90
         } ,
         indexes : {
           questions : 0 ,
           answers : 1
         } ,
         time_settings : {
           is_with_time:false ,
           value : 1799 ,
           timer_type : false ,
           timer_layout : 1 ,
           hours : 0 ,
           minutes : 29 ,
           seconds : 59
         },
         enable_screens : true ,
         progression_bar : {
           is_available:false ,
           progression_bar_layout:0
         } ,
         expiration : {
           is_set : false  ,
           through_time : 3 , // => it will be per day
           expire_warning : "This quiz will expire after 3 days" ,
           expire_message : "Quiz is expired !"
         } ,
        //  theme_style : [] ,
         randomize_settings : false ,
         step_type : false ,
         auto_slide : false ,
         allow_touch_move : false ,
         show_results_per_qs : false ,
         retake_setting : false ,
         navigation_btns : true ,
         review_setting : false ,
         createdAt : new Date() ,
         updatedAt : new Date () ,
         indexes : {
           questions : '0' ,
           answers : '1'
         }

     };
  $scope.json_apk_file = $scope.server_ip + "ext/json/json-keys.json";
  $scope.api_url =  $scope.server_ip + "api/create/v1.1" ;
  $scope.api_url_delete =  $scope.server_ip + "api/delete" ;

  $scope.application_fields = new Array();
  $scope.user_token = $("#userToken").val();
  $scope.model_loading = $(".modal-content-overlay");
  $scope.applicationType = 1 ;
  $scope.application_title = "Quiz 1";
  $scope.application_description = "This description for Quiz 1";
  // ==> Init Default Value for app type
  $scope.create_application =  function (appType){
      var ll = $(".all_questionnaire_lists").children('li').length // attr('questionnaire_type_x'). ;

      $scope.application_title = appType + "1";
      $scope.application_description = "This description for "+appType + " 1";
      if(appType == "Quiz") {
        $scope.applicationType  = 1 ;
        $scope.application_title = appType + " " +( $scope.quiz_applications.length + 1 );
        $scope.application_description = "This description for "+appType + " " +( $scope.quiz_applications.length + 1 );
      }else {
        $scope.applicationType = 0;
        $scope.application_title = appType + " " +( $scope.survey_applications.length + 1 );
        $scope.application_description = "This description for "+appType + " " +( $scope.survey_applications.length + 1 );
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
                 app_settings : $scope.application_settings ,
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
  // ==> Cancel new application
  $rootScope.cancel_app_creation = function (){
    $(".bs-example-modal-sm").trigger("click");
  }
  // ==> Delete existing application
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
            console.log(data);
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
  $scope.get_all_applications_data = () => {
    $http({
      url :$scope.server_ip +'api/'+ $scope.user_id + '/applications/list' ,
      type : 'GET'
    }).then(( resp ) => {
       $scope.survey_applications = resp.data.surveys;
       $scope.quiz_applications = resp.data.quizzes;
    });
  }
  $scope.get_all_applications_data();
}]);
