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
  function ($rootScope){
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
  }
]);
