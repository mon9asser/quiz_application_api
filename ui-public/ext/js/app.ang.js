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

application.controller("myApplicationPage" , ["$rootScope","$timeout" , function ($rootScope,$timeout){
  $rootScope.server_ip = $("#serverIp").attr("server");
  $rootScope.applicationType = 0 ;

  $rootScope.create_application = function (quizType){
     $("input").val(quizType+" 1");
     $("textarea").val("This description for " + quizType+" 1")
     $rootScope.applicationType = (quizType == "Quiz") ? 1 : 0 ;

  };
  $rootScope.cancel_app_creation = function (){
    $(".bs-example-modal-sm").trigger("click");
  }
  // Editing fields
  $(".application-description").on("change keydown", function (){
    $(".application-description").css({
      border:"1px solid #ddd"
    })
  });
  $(".application-title").on("change keydown", function (){
    $(".application-title").css({
      border:"1px solid #ddd"
    })
  });
  // Init New Application
  $rootScope.start_app_creation = function (){
    var file = $rootScope.server_ip + "ext/js/json.app.keys.json";
     $.getJSON(file , function (api_keys){
       var app_title = $(".application-title");   //application-title
       var app_details = $(".application-description"); // application-description
       var user = $("#userId").attr("user");
       var application_fields = [] ;
       if(app_title.val() == '' )
       {
         application_fields[application_fields.length]
           = app_title;
       }
       if(app_details.val() == '' )
       {
         application_fields[application_fields.length]
           = app_details;
       }
       if(application_fields.length != 0 ){
         for (var i = 0; i < application_fields.length; i++) {
           application_fields[i].css({
             border : "1px solid tomato"
           });
         }
         return false ;
       }


       $(".modal-content-overlay").fadeIn();



       setTimeout(()=>{    //<<<---    using ()=> syntax
         $.ajax({
           url : $rootScope.server_ip + "api/create",
           type :"POST",
           headers : {
             "X-api-app-name":api_keys.APP_NAME,
             "X-api-keys":api_keys.API_KEY
           },
           data : {
             creator_id : $("#userId").attr("user"),
             app_type : $rootScope.applicationType ,
             questionnaire_title : app_title.val() ,
             description : app_details.val()
           }, // {{server_ip}}api/{{_id}}/editor/{{../user.token}}
           success : function (data){
             window.location.href =
             $rootScope.server_ip +"api/"+data._id+"/editor/"+$("#userToken").attr("token");
           } ,
           error : function (er){
             console.log(er);
           }
         });
       },5000);




     }); // => End json loader reader
  }
  $rootScope.delete_existing_app = function (app_id ){
    var app_id = app_id ;
    var parent = $(".listed-app-"+app_id);
    var target_handler =   $(".delete-handler-"+app_id);
    target_handler.html("<i class='fa fa-refresh fa-spin'></i>");



    setTimeout(()=>{
      var file = $rootScope.server_ip + "ext/js/json.app.keys.json";

      $.getJSON(file , function (api_keys){
        $.ajax({
          url : $rootScope.server_ip + "api/"+app_id+"/delete",
          type :"DELETE",
          headers : {
            "X-api-app-name":api_keys.APP_NAME,
            "X-api-keys":api_keys.API_KEY
          },
          data : {
            creator_id : $("#userId").attr("user")
          }, // {{server_ip}}api/{{_id}}/editor/{{../user.token}}
          success : function (data){

          } ,
          error : function (er){
            console.log(er);
          }
        });
         parent.remove();
      });
    } , 3000 );

  };




  $rootScope.on_mode = "Preview";
  $rootScope.template_mode = false ;
  $rootScope.move_mode = function (){
    alert();
    if ( $rootScope.template_mode == false ){
        $rootScope.template_mode = false ;
        $rootScope.templates= 'templates/preview.html';
        $rootScope.on_mode = "Preview";
    } else
    {
      $rootScope.template_mode = true ;
      $rootScope.templates= 'templates/editor.html';
      $rootScope.on_mode = "Editor";
    }
  };

}]);

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
    $rootScope.edit_this_question = function (qs_id , app_id){
      var jsonFile =  $rootScope.serverIp + "ext/js/json.app.keys.json";
      var url = $rootScope.serverIp + "api/"+app_id+"/application/retrieve";
      var creatorId = $("#creatorId").attr("creatorId");
      $.getJSON( jsonFile , function (api_key_data){
        $.ajax({
          url : url ,
          type : "POST" ,
          data : {
            "target_id"   : qs_id.toString() ,
            "creator_id"  : creatorId
          } ,
          headers : {
            "X-api-app-name": api_key_data.APP_NAME ,
            "X-api-keys"    : api_key_data.API_KEY ,
            "Content-Type"  : undefined
          } ,
          success : function (qsData){
            var questions = qsData.questions ;
            for (var i = 0; i < questions.length; i++) {
              if(questions[i]._id == qs_id.toString()){
                console.log(questions[i]);
                if(questions[i].question_type == 0){
                  $(".add-new-answer-pt").css("display","block");
                  $(".true-fals-yes-no-type").css("display","none");
                }
                if(questions[i].question_type == 1){
                  $(".add-new-answer-pt").css("display","block");
                  $(".true-fals-yes-no-type").css("display","none");
                }
                if(questions[i].question_type == 2){
                  $(".add-new-answer-pt").css("display","none");
                  $(".true-fals-yes-no-type").css("display","block");
                }
                if(questions[i].question_type == 3){

                }
                if(questions[i].question_type == 4){

                }



                // ---------------------------------------
                // ----->>>>> Question Settings
                // ---------------------------------------
                $rootScope.requiredOption = questions[i].answer_settings.is_required;
                $rootScope.multipleResponseOption = questions[i].answer_settings.single_choice;
                $rootScope.randomizeOption = questions[i].answer_settings.is_randomized;
                $rootScope.superSizeOption  = questions[i].answer_settings.super_size;
                // => Question type
                $("#x-question-type-x").val(questions[i].question_type);
                // ---------------------------------------
                // ----->>>>> Answers
                // ---------------------------------------
                var appendedAnswer = '' ;


                var ansList = questions[i].answers_format
                // for (var i = 0; i < ansList.length; i++) {
                //   var answerVal = ansList[i].value ;
                //   var answer =
                //    '<li class="">'
                //     +'<div class="answer-text-block">'
                //       +'<input type="text" name="" value="'+answerVal+'">'
                //     +'</div>'
                //   +'</li>';
                //   $('.answers-qs').append(answer);
                // }
                // => question id

                $("#x-question-id-x").val(questions[i]._id);

                $('#x-app-id-x').val(qsData._id);
                $("#x-creator-id-x").val(qsData.creator_id);
                 // ==> Question tag
                $("#editor-question-body").html(questions[i].question_body)
                // ==> media part
                $(".media-changeable-img-case").css( 'background-image','url()' );
                if(questions[i].media_question != null ){
                  // Get media type
                  if(questions[i].media_question.media_type == 0 ){ // image
                    var image_media = $rootScope.serverIp + questions[i].media_question.media_field  ;
                    $(".media-changeable-img-case").css( 'background-image','url('+image_media+')' );
                    $(".media-changeable-img-case").html("<p class='edit-pencil-media' onClick='edit_media_part()'><span class='fa fa'></span><p>");
                  }else { // Video type
                    var video_media ;
                    // ==> mp4
                    if(questions[i].media_question.video_type == 2 )
                    video_media = $rootScope.serverIp +  "img/vid-mp4.jpg" ;
                    // ==> youtube
                    if(questions[i].media_question.video_type == 0 )
                    video_media = $rootScope.serverIp +  "img/vid-youtube.jpg" ;
                    // ==> vimeo
                    if(questions[i].media_question.video_type == 1 )
                    video_media = $rootScope.serverIp +  "img/vid-vimeo.jpg" ;

                    $(".media-changeable-img-case").css( 'background-image','url('+video_media+')' );
                    $(".media-changeable-img-case").html("<p class='edit-pencil-media' onClick='edit_media_part()'><span class='fa'></span><p>");
                  }
                }else {
                  $(".media-changeable-img-case").html("<p class='edit-pencil-media' onClick='edit_media_part()'><span class='fa fa-pencil'></span> Add New Media<p>");
                }
                $(".description-field-x").val('');
                // question_description
                if ( questions[i].question_description != null ){
                  $(".description-field-x").val(questions[i].question_description);
                }else { // disable it

                }
                // init defalt ui
                $('.media-x-preview').css({ // ==> For image
                  "background-image" : "url('')"
                });
                $('input.media-inputs').val('');
                $('.media-x-preview').html("<span class='video-not-found'>Extracted Media for view</span>"); // Video Part
                // ============> Loading media part
                $('.media-inputs').css("display","block");
                if(questions[i].media_question != null ){
                if(questions[i].media_question.media_type == 0 ){ // image
                  var image_paa = '<div style="height:250px;background-image:url('+image_media+')" class="img-resp-exrtacted"></div>';
                  $('.media-x-preview').html(image_paa);
                  $('input.media-inputs').val(image_media);
                }else if (questions[i].media_question.media_type == 1 ){
                  var video_part ;
                  if(questions[i].media_question.video_type == 2 ){// mp4
                    video_part =
                      '<video controls style="width:100%; height:auto;">'
                         +'<source type="video/mp4" src="'+questions[i].media_question.media_field+'.mp4">'
                      +'</video>';
                      $('.media-inputs').val( questions[i].media_question.media_field+'.mp4');
                  }
                  if(questions[i].media_question.video_type == 1 ){// Vimeo
                    video_part =
                    '<iframe src="https://player.vimeo.com/video/'+questions[i].media_question.video_id+'" width="100%" height="250" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
                    $('.media-inputs').val("https://player.vimeo.com/video/"+questions[i].media_question.video_id );
                  }
                  if(questions[i].media_question.video_type == 0 ){// youtube
                    video_part =
                    '<iframe width="100%" height="250" src="https://www.youtube.com/embed/'+questions[i].media_question.video_id+'?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
                      $('.media-inputs').val("https://www.youtube.com/embed/"+questions[i].media_question.video_id );
                  }

                  $('.media-x-preview').html(video_part);
                }
                }

                // ==========================> Settings
                // $rootScope.singleResponseOption = questions[i].answer_settings.single_choice;

              }
            }
          } ,
          error : function (error){
            console.log(error);
          }
        });
      });
    }// ==> End Editable QS api



  }
]);
