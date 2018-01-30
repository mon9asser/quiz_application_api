var application = angular.module("application",[]);
// =============================================================
// ================> Configurations
// =============================================================
application.config([
  "$interpolateProvider",
  function($interpolateProvider) {
      $interpolateProvider.startSymbol('~>>');
      $interpolateProvider.endSymbol('<<~');
  }
]);

// =============================================================
// ================> Application
// =============================================================
application.controller("mainController" , [
    "$rootScope" , "$location" ,
    function ( $rootScope , $location ){
      $rootScope.urls = window.location.pathname.split( '/' );;
      $rootScope.page_name = $rootScope.urls[$rootScope.urls.length-1];
      // ##########################################################
      // ========>>>> Meta Tags
      // ##########################################################

      // ===> Home // Default
      $rootScope.meta_tag = {
        page_title        : "Welcome to questionnaire application",
        page_keywords     : "quiz application , survey application , quesitonnaire application , apis , quesitons , answers , multiple choices",
        page_description  : "This is quiz application to allow developers build thier apps" ,
        author            : "Rakesh Vallil" ,
        developer         : "Montasser Mossallem"
      };

      var page_name = $rootScope.page_name;

      // if(page_name == 'login')
      // if(page_name == 'register')
      // if(page_name == 'questionnaires')
      // if(page_name == 'attendees')
      // if(page_name == 'editor') ## For app edit
      // if(page_name == 'quiz')
      // if(page_name == 'survey')


      //  if($rootScope.urls[3] == 'editor')
      //     $rootScope.page_name = 'editor';

       if(page_name == 'login')
       {
         $rootScope.meta_tag = {
           page_title        : "Login to my account",
           page_keywords     : "quiz application , survey application , quesitonnaire application , apis , quesitons , answers , multiple choices",
           page_description  : "This is quiz application to allow developers build thier apps" ,
           author            : "Rakesh Vallil" ,
           developer         : "Montasser Mossallem"
         };
       }
      if(page_name == 'register')
      {
        $rootScope.meta_tag = {
          page_title        : "Create a new account",
          page_keywords     : "quiz application , survey application , quesitonnaire application , apis , quesitons , answers , multiple choices",
          page_description  : "This is quiz application to allow developers build thier apps" ,
          author            : "Rakesh Vallil" ,
          developer         : "Montasser Mossallem"
        };
      }
      if(page_name == 'questionnaires')
      {
        $rootScope.meta_tag = {
          page_title        : "My Application",
          page_keywords     : "Quiz Creation , survey creation , questionnaire creation , application creation , question creation , answer creation , video creation ",
          page_description  : "This is quiz application to allow developers build thier apps" ,
          author            : "Rakesh Vallil" ,
          developer         : "Montasser Mossallem"
        };
      }
      if(page_name == 'attendees')
      {
        $rootScope.meta_tag = {
          page_title        : "My Attendees",
          page_keywords     : "attendees , attend quiz",
          page_description  : "This is quiz application to allow developers build thier apps" ,
          author            : "Rakesh Vallil" ,
          developer         : "Montasser Mossallem"
        };
      }
      if(page_name == 'editor')
      {
        $rootScope.meta_tag = {
          page_title        : "Application Editor !",
          page_keywords     : "Quiz Application , survey application , questions , answers , answer creation , quiz creation , etc ...",
          page_description  : "This is quiz application to allow developers build thier apps" ,
          author            : "Rakesh Vallil" ,
          developer         : "Montasser Mossallem"
        };
      }
      if(page_name == 'quiz')
        {
          $rootScope.meta_tag = {
            page_title        : "null",
            page_keywords     : "null",
            page_description  : "null" ,
            author            : "Rakesh Vallil" ,
            developer         : "Montasser Mossallem"
          };
        }
        if(page_name == 'survey')
        {
          $rootScope.meta_tag = {
            page_title        : "null",
            page_keywords     : "null",
            page_description  : "null" ,
            author            : "Rakesh Vallil" ,
            developer         : "Montasser Mossallem"
          };
        }

    }
]);


application.controller("qsCreationCtr" , [
  "$rootScope" ,
  "$http",
  function ($rootScope , $http){
    $rootScope.templates = $("#serverId_app").attr("serverIp")+'partials/preview.hbs';
    $rootScope.editor_mode = "Preview";
    $rootScope.template_mode = false ;
    $rootScope.change_mode = function (){
        var server = $("#serverId_app").attr("serverIp") ;
      if ( $rootScope.template_mode == true ){
          $rootScope.template_mode = false ;
          $rootScope.templates= server + 'partials/preview.hbs';
          $rootScope.editor_mode = "Preview";
        } else
        {
          $rootScope.template_mode = true ;
          $rootScope.templates=  server +'partials/editor.hbs';
          $rootScope.editor_mode = "Editor";
        }
    };



    //----------------------------------------------
    // Label Check box with other colors and icon
    //----------------------------------------------
    $rootScope.class_checked = "check_boxx";
    $rootScope.check_box = function (){
      if($rootScope.class_checked == "check_boxx")
        $rootScope.class_checked = 'none'
      else
        $rootScope.class_checked  = "check_boxx" ;
        alert($rootScope.class_checked);
    }


    $rootScope.serverIp = $("#serverId_app").attr("serverIp");
    $rootScope.defined_qs = $(".question-object");
    // ---------------------------------------
    // ----->>>>> Delete Quextion Api
    // ---------------------------------------
    $rootScope.delete_this_question = function (qs_id){
      var jsonFile =  $rootScope.serverIp + "ext/js/json.app.keys.json";
      $.getJSON(jsonFile, function(api_key_data) {
        if(qs_id == '' || qs_id == null )
          return false ;
          var url = $rootScope.serverIp + "api/"+$("#appId").attr("applicationId")+"/question/delete";

            var da = {
                "creator_id" : $("#creatorId").attr("creatorId") , //$("creatorId").attr("creatorId") ,
                "question_id":qs_id
            };

            $(".qs-delete-"+qs_id).removeClass("fa-trash");
            $(".qs-delete-"+qs_id).addClass("fa-refresh fa-spin tomato-font");
            setTimeout(function (){
              $.ajax({
                url : url ,
                type : "patch" ,
                data : da ,
                headers : {
                  "X-api-app-name": api_key_data.APP_NAME ,
                  "X-api-keys": api_key_data.API_KEY ,
                  "Content-Type" : undefined
                } ,
                success : function (qsData){

                  var element = $(".qs-"+qs_id);
                  element.remove();
                } ,
                error : function (error){
                  console.log(error);
                }
              });
            } , 2500);

      });

    }; // ==> End Delete QS api




    // ---------------------------------------
    // ----->>>>> Edit Question Part
    // ---------------------------------------
    $rootScope.edit_this_question = function (qs_id){
     alert();
    }// ==> End Editable QS api



  }
]);
