// ==> 25 chars for each databinding

apps.filter("set_iframe" , [
      "$timeout" ,"$sce" ,
  function (  $timeout , $sce){
    return function (media_object){ // media_object.embed_path
      // alert(media_object);
      var embed_video ;

      switch (media_object.media_type) {

        case 1:

          if( media_object.video_type == 0 ){
            embed_video = "<iframe src='"+media_object.embed_path+"' width='100%' height='140px'></iframe>";
          }
          if( media_object.video_type == 1 ){
            embed_video = "<iframe src='"+media_object.embed_path+"' width='100%' height='140px'></iframe>";
          }
          if( media_object.video_type == 2 ){
            embed_video = '<video width="100%" height="auto" controls>' +
                          '<source src="'+media_object.mp4_option.mp4_url+'" type="video/mp4">'+
                          '<source src="'+media_object.mp4_option.ogg_url+'" type="video/ogg">'+
                          'Your browser does not support the video tag.' +
                        '</video>';
          }

        break;

      }

          return $sce.trustAsHtml(embed_video) ;


    };
  }
]);


apps.filter('this_chars_only' , [
  function (){
    return function (specs){
      var spesificChars = '' ;
      var char_counts = 26 ;
      for (var i = 0; i < specs.length; i++) {
        if(i < char_counts) {
          spesificChars += specs[i];
          if(i == (char_counts - 1) )
            spesificChars += " ... ";
        }
      }
       return spesificChars
    }
  }
]);
// ==> Main Controller
apps.controller("apps-controller" , ['$scope','$http' , '$timeout' , function ($scope , $http , $timeout){

  $scope.current_answer_index = null ;
  $scope.model_type = null ;
  $scope.drag_drop_status = true ;
  $scope.questionIndex = null ;
  $scope.current_video_id = "xdV4jPeXb4k";
  $scope.change_media_link_by_system = true ;
  $scope.answer_media = null ;
  //--------------------------------------------------------
  // ==>  Callback Finder
  //--------------------------------------------------------
  $scope.question_id = null ;
  $scope.question_media = null ;
  $scope.callback_index = function (object){
    return object._id == $scope.question_id ;
  };

  $scope.answer_id = null ;
  $scope.callback_answer_index = function (object){
    return object._id == $scope.answer_id ;
  };
  $scope.file_object = {
    "media_type" : null ,
    "file"       : null ,
    "link"       : null
  }
  $scope.show_media_uploader = function (media_for_model , answer_id = null  ){

    if(media_for_model == "question_media_type")
      $scope.model_type = "questions";
    else
      $scope.model_type = "answers";
      // =============================================
      // ================>> Storing media uploader
      // =============================================
      var media_block = $(".media-x-preview"); // => preview div
      var show_media_link = $(".show_media_link"); // => input

      if($scope.model_type == "questions"){ // ==> This type is question media uploader
                        /*Default all elements should be empty*/
                        media_block.html('');
                        show_media_link.val('') ;
                        show_media_link.css("display","none");
                        /*show media in ui*/

                        if($scope.question_media == undefined || $scope.question_media == null) {
                          var no_media = "<b class='no-media'>There is no media ! </b>"
                          media_block.html(no_media);
                        }else {
                            show_media_link.css("display","block");
                            var iframe = "<iframe width='100%' height='250px'></iframe>";
                            var image  = "<div class ='show-image'></div>";
                            var mp4    = '<video width="100%" height="auto" controls>' +
                                            '<source src="'+$scope.question_media.media_field+'.mp4" type="video/mp4">'+
                                            '<source src="'+$scope.question_media.media_field+'.ogg" type="video/ogg">'+
                                            'Your browser does not support the video tag.' +
                                          '</video>' ;

                            // image
                            if($scope.question_media.media_type == 0 ) {
                              media_block.html(image);
                              show_media_link.val($scope.server_ip + $scope.question_media.media_field);
                                media_block.find('div').css({
                                  "background-image":"url('"+$scope.server_ip + $scope.question_media.media_field +"')"
                                });
                            }
                            if($scope.question_media.media_type == 1 ) {
                              media_block.html(iframe);
                              show_media_link.val($scope.question_media.media_name);
                              // youtube or vimeo
                              if($scope.question_media.video_type == 0 || $scope.question_media.video_type == 1)
                                media_block.find('iframe').attr("src" , $scope.question_media.video_source);
                              // mp4
                              if( $scope.question_media.video_type == 2 ) {
                                media_block.html(mp4)
                              }

                              $timeout(function(){
                                // styling vimeo
                                if ($scope.question_media.video_type == 1 ){
                                  console.log(  media_block.find('iframe').html());
                                }
                              } , 3000 );
                            }
                        }
    } else if ($scope.model_type == "answers"){
      // fill current answer id
      $scope.answer_id = answer_id ;
      // set it with empty values
      //-------------------------
      media_block.html('');
      show_media_link.val('') ;
      show_media_link.css("display","none");
      // ====>> current answer id
      var target_question = $scope.questions_list.find($scope.callback_index);
      var target_answer = target_question.answers_format.find($scope.callback_answer_index);


      if(target_answer.media_src  == "http://localhost:3000/img/media-icon.png" ){
        var no_media = "<b class='no-media'>There is no media ! </b>"
         media_block.html(no_media);
      }else {
        show_media_link.css("display","block");
        var iframe = "<iframe width='100%' height='250px'></iframe>";
        var image  = "<div class ='show-image'></div>";

        if(target_answer.media_type == 0 ) {
          media_block.html(image);
          show_media_link.val($scope.server_ip + target_answer.media_src);
          media_block.find('div').css({
              "background-image":"url('"+$scope.server_ip + target_answer.media_src +"')"
          });
        }
        if(target_answer.media_type == 1 ) {
            media_block.html(iframe);
            show_media_link.val(target_answer.embed_path);
            // youtube + vimeo
        if(target_answer.video_type == 0 || target_answer.video_type == 1)
            media_block.find('iframe').attr("src" , target_answer.embed_path);
            // mp4
        if( target_answer.video_type == 2 ) {
          var mp4    = '<video width="100%" height="auto" controls>' +
                          '<source src="'+target_answer.mp4_option.mp4_url+'" type="video/mp4">'+
                          '<source src="'+target_answer.mp4_option.ogg_url+'" type="video/ogg">'+
                          'Your browser does not support the video tag.' +
                        '</video>' ;
                        show_media_link.val(target_answer.mp4_option.mp4_url);
            media_block.html(mp4)
            }

        }
      }
      console.log(target_answer);
      // console.log('Answer Details');
      // console.log(target_answer);
      // console.log(">>>-----*************************----<<<");
      // // ========> Show values related this part
      // console.log($scope.file_object);
      // alert("Answer media uploader !! " + answer_id);
    }

    //media_for_model =>  media for question or answer ??
    $(".media-imgvid-uploader").fadeIn();
  };
  // ==============================
  // ================+>> Application Settings
  // -------------------------------------
  $scope.application_settings = {
      questionnaire_title : null ,
      settings : {
        titles :
          {
            title_start_with : "Write Starting Text"  ,
            title_end_with: "Write Ending Text" ,
            title_success_with : " Success quiz Text" ,
            title_failed_with : "Quiz Failed Text"
          } ,
        label_btns : {
            lbl_start_with:"Start" ,
            lbl_continue_with : "Continue" ,
            lbl_retake_with : "Retake" ,
            lbl_review_with : "Review"
         } ,
        grade_settings : {
          is_graded : false ,
          value : 90
        } ,
        time_settings : {
          is_with_time:false ,
          value : "15" ,
          timer_type : false ,
          timer_layout : 0
        },
        progression_bar : {
          is_available:false ,
          progression_bar_layout:0
        } ,
       //  theme_style : [] ,
        randomize_settings : false ,
        step_type : true ,

        show_results_per_qs : false ,
        retake_setting : false ,
        navigation_btns : false ,
        review_setting : true ,
        createdAt : new Date() ,
        updatedAt : new Date ()
      }
  }




  $scope.question_tag = "Data Editor";
  $scope.indexes = 1 ;
  $scope.labels = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'm',
    'l',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ];
  //--------------------------------------------------------
  // ==>  Default Values
  //--------------------------------------------------------
   $scope.server_ip = $("#serverIp").val();
   $scope.user_id = $("#userId").val();
   $scope.app_id = $("#applicationId").val();

   $scope.mongoose_id = null;
   $scope.mongoose_answer_id = null;
   $scope.mongoose_date = null;

   // -------------------------------------------------------
   // ==>  Question Action ( Trash - Edit )
   // -------------------------------------------------------
   $scope.quesion_actions = "<ul class='question-option'>"+
    "<li class='right' style='opacity: 0;'>"+
      "<i style='cursor:pointer;' class='fa fa-trash iconx-trashable question-deletion'></i>" // for trash
      +
    "</li>"
      +
    "<li class='right' style='opacity: 0;'>"
      +
      "<i style='cursor:pointer;' class='fa fa-pencil iconex-movable'></i>" // for edit
    +"</li>"
   +"</ul>";

   //--------------------------------------------------------
   // ==>  api urls
   //--------------------------------------------------------
   $scope.api_url_current_app         = $scope.server_ip + "api/"+$scope.app_id+"/application/retrieve"
   $scope.json_apk_file               = $scope.server_ip + "ext/json/json-keys.json";
   $scope.api_url_create_question     = null;
   $scope.api_url_delete_question     = $scope.server_ip + "api/"+$scope.app_id+"/question/delete";
   $scope.api_url_edit_question       = $scope.server_ip + "api/"+$scope.app_id+"/question/edit";
   $scope.api_url_create_answer       = null;
   $scope.api_url_delete_answer       = null;
   $scope.api_url_edit_answer         = null;
   $scope.api_url_init_id_date        = $scope.server_ip + "api/generate/new/data";
   $scope.api_url_question_creation   = $scope.server_ip + "api/" + $scope.app_id + "/question/creation"
   $scope.api_url_app_settings        = $scope.server_ip + "api/" + $scope.app_id + "/app/setup_settings"
   //--------------------------------------------------------
   // ==>  Default Settings
   //--------------------------------------------------------
    $scope.unique_ids = null ;
    $scope.question_settings = {
     is_required           : false ,
     single_choice  : false ,
     is_randomized          : false ,
     super_size         : false
    }

   // -------------------------------------------------------
   // ----> Init current App
   // -------------------------------------------------------
   $scope.questions_list = null ; // loading questions here from mongoDB
  //  $scope.application_settings = null ;
   $scope.application_stylesheet = null ;
   $scope.app_title = null ;
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

            // Stylesheets
            $scope.application_stylesheet =  resp.data.theme_style;
            // APP Titles
            $scope.app_title = resp.data.questionnaire_title ;

            var mongo_settings = resp.data.settings;
            var settings_obj = new Object();


            // ===================+> Start Settings
            if(mongo_settings != null ){
                settings_obj['settings'] = mongo_settings ;
              // settings_obj['settings'] = new Object();
              if(mongo_settings.titles != null ){
                  // settings_obj['settings']['titles'] = mongo_settings.titles

                  if(mongo_settings.titles.title_start_with != null )
                  settings_obj['settings']['titles']['title_start_with'] = mongo_settings.titles.title_start_with;
                  else // => Default
                  settings_obj['settings']['titles']['title_start_with'] = $scope.application_settings.settings.titles.title_start_with;

                  if(mongo_settings.titles.title_end_with != null )
                  settings_obj['settings']['titles']['title_end_with'] = mongo_settings.titles.title_end_with;
                  else // Default
                  settings_obj['settings']['titles']['title_end_with'] =  $scope.application_settings.settings.titles.title_end_with;


                  if(mongo_settings.titles.title_success_with != null )
                  settings_obj['settings']['titles']['title_success_with'] = mongo_settings.titles.title_success_with;
                  else // Default
                  settings_obj['settings']['titles']['title_success_with'] = $scope.application_settings.settings.titles.title_success_with;

                  if(mongo_settings.titles.title_failed_with != null )
                  settings_obj['settings']['titles']['title_failed_with'] = mongo_settings.titles.title_failed_with;
                  else // Default
                  settings_obj['settings']['titles']['title_failed_with'] = $scope.application_settings.settings.titles.title_failed_with;
              } else  // end titles
              settings_obj['settings']['titles'] =  $scope.application_settings.settings.titles;


              if(mongo_settings.label_btns != null ){
                // settings_obj['settings']['label_btns'] = mongo_settings.label_btns ;


                if(mongo_settings.label_btns.lbl_start_with != null )
                settings_obj['settings']['label_btns']['lbl_start_with'] = mongo_settings.label_btns.lbl_start_with ;
                else // default
                settings_obj['settings']['label_btns']['lbl_start_with'] =  $scope.application_settings.settings.label_btns.lbl_start_with;

                if(mongo_settings.label_btns.lbl_continue_with != null )
                settings_obj['settings']['label_btns']['lbl_continue_with'] = mongo_settings.label_btns.lbl_continue_with ;
                else // default
                settings_obj['settings']['label_btns']['lbl_continue_with'] =  $scope.application_settings.settings.label_btns.lbl_continue_with;

                if(mongo_settings.label_btns.lbl_retake_with != null )
                settings_obj['settings']['label_btns']['lbl_retake_with'] = mongo_settings.label_btns.lbl_retake_with ;
                else // default
                settings_obj['settings']['label_btns']['lbl_retake_with'] =  $scope.application_settings.settings.label_btns.lbl_retake_with;

                if(mongo_settings.label_btns.lbl_review_with != null )
                settings_obj['settings']['label_btns']['lbl_review_with'] = mongo_settings.label_btns.lbl_review_with ;
                else // default
                settings_obj['settings']['label_btns']['lbl_review_with'] =  $scope.application_settings.settings.label_btns.lbl_review_with;

              }else  // end Labelds
              settings_obj['settings']['label_btns'] = $scope.application_settings.settings.label_btns;

              if(mongo_settings.grade_settings != null ){
                // settings_obj['settings']['grade_settings'] = mongo_settings.grade_settings ;

                if(mongo_settings.grade_settings.is_graded != null )
                  settings_obj['settings']['grade_settings']['is_graded'] =mongo_settings.grade_settings.is_graded ;
                  else // default
                  settings_obj['settings']['grade_settings']['is_graded'] = $scope.application_settings.settings.grade_settings.is_graded;

                if(mongo_settings.grade_settings.value != null )
                  settings_obj['settings']['grade_settings']['value'] =mongo_settings.grade_settings.value ;
                  else // default
                  settings_obj['settings']['grade_settings']['value'] = $scope.application_settings.settings.grade_settings.value;
              }else // end grade setting
              settings_obj['settings']['grade_settings'] = $scope.application_settings.settings.grade_settings;

              if(mongo_settings.time_settings != null ){
                //  settings_obj['settings']['time_settings'] = mongo_settings.time_settings ;

                if(mongo_settings.time_settings.is_with_time != null)
                settings_obj['settings']['time_settings']['is_with_time'] = mongo_settings.time_settings.is_with_time ;
                else // default
                settings_obj['settings']['time_settings']['is_with_time'] = $scope.application_settings.settings.is_with_time;

                if(mongo_settings.time_settings.value != null)
                settings_obj['settings']['time_settings']['value'] = mongo_settings.time_settings.value;
                else // default
                settings_obj['settings']['time_settings']['value'] = $scope.application_settings.settings.value;

                if(mongo_settings.time_settings.timer_type != null)
                settings_obj['settings']['time_settings']['timer_type'] = mongo_settings.time_settings.timer_type ;
                else // default
                settings_obj['settings']['time_settings']['timer_type'] = $scope.application_settings.settings.timer_type;

                if(mongo_settings.time_settings.timer_layout != null)
                settings_obj['settings']['time_settings']['timer_layout'] = mongo_settings.time_settings.timer_layout;
                else // default
                settings_obj['settings']['time_settings']['timer_layout'] = $scope.application_settings.settings.timer_layout;

              }else // end grade setting
                $scope.application_settings.settings.time_settings;

              if(mongo_settings.progression_bar != null ){

                // settings_obj['settings']['progression_bar'] = mongo_settings.progression_bar ;
                if(mongo_settings.progression_bar.is_available != null ){
                  settings_obj['settings']['progression_bar']['is_available'] = mongo_settings.progression_bar.is_available ;
                }else  // default
                settings_obj['settings']['progression_bar']['is_available'] = $scope.application_settings.settings.progression_bar.is_available;

                if(mongo_settings.progression_bar.progression_bar_layout != null ){
                  settings_obj['settings']['progression_bar']['progression_bar_layout'] = mongo_settings.progression_bar.progression_bar_layout;
                } else  // default
                settings_obj['settings']['progression_bar']['progression_bar_layout'] = $scope.application_settings.settings.progression_bar.progression_bar_layout;

              }// end grade progress bar
              if(mongo_settings.randomize_settings!= null ){
                settings_obj['settings']['randomize_settings'] = mongo_settings.randomize_settings ;
              }else  // end randomize settings
              settings_obj['settings']['randomize_settings'] = $scope.application_settings.settings.randomize_settings;
              if(mongo_settings.step_type != null){
                settings_obj['settings']['step_type'] = mongo_settings.step_type;
              }else  // end step_type settings
              settings_obj['settings']['step_type'] = $scope.application_settings.settings.step_type;

              if(mongo_settings.show_results_per_qs != null){
                settings_obj['settings']['show_results_per_qs'] = mongo_settings.show_results_per_qs;
              }else  // end step_type settings
              settings_obj['settings']['show_results_per_qs'] = $scope.application_settings.settings.show_results_per_qs;


              if(mongo_settings.retake_setting != null ){
                settings_obj['settings']['retake_setting'] = mongo_settings.retake_setting;
              }else  // end retake settings
              settings_obj['settings']['retake_setting'] = $scope.application_settings.settings.retake_setting ;

              if(mongo_settings.navigation_btns != null ){
                settings_obj['settings']['navigation_btns'] = mongo_settings.navigation_btns;
              }else // end navigation_btns settings
              settings_obj['settings']['navigation_btns'] = $scope.application_settings.settings.navigation_btns ;

              if(mongo_settings.review_setting != null ){
                settings_obj['settings']['review_setting'] = mongo_settings.review_setting;
              } else // end review settings
              settings_obj['settings']['review_setting'] = $scope.application_settings.settings.review_setting ;

            }else{
              console.log($scope.application_settings);
              settings_obj['settings'] = $scope.application_settings.settings;
              // alert(settings_obj['settings']);
            }


            if (resp.data.questionnaire_title != null ){
              settings_obj['questionnaire_title'] =  resp.data.questionnaire_title ;
            }
            //====================-> End Settings
            $scope.application_settings = settings_obj;

          },function(err){
       });
   }); // End Json Data

      // ==> to find question by id
      //  $timeout(function (){
      //    $scope.question_id = "5a87024f41355238299396ae";
      //    console.log($scope.questions_list.find($scope.callback_index));
      //  } , 300 );

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
   $scope.delete_this_question = function(questionId = null ){
     if (questionId== null )
      {
        if($scope.question_id == null ){
          alert("To delete this question you need to select it from question list !")
          return false;
        }
        questionId = $scope.question_id ;

        // This question is delted from button
        $(".x-editor-x-body").slideUp(function(){
          $(".save_changes").attr("disabled");
        });


      }

      // 1- question
      $scope.question_body = null ;
      // $scope.enable_description = true ;
      $scope.question_description = null ;
      $scope.question_id = null ;
      $scope.question_type = null ;
      // 2- answers
      $scope.asnwers = null ;
      // 3 Question settings
      $scope.question_settings = null ;
      $scope.question_media = null ;
      $(".x-editor-x-body").slideUp();

     $(".qs-delete-"+questionId).removeClass("fa-trash");
     $(".qs-delete-"+questionId).addClass("fa-refresh fa-spin tomato-font");
      var element = $(".qs-"+questionId);
      element.css({background:"rgba(255, 99, 71, 0.4)" , color:"rgba(255, 99, 71, 0.4)" , border:"1px solid rgba(255, 99, 71, 0.7)"});
      $(".fa-spin").css("color","tomato");
      $(".fa-spin").parent("li:first-child").css({border:"1px solid rgba(255, 99, 71, 0.7)"});

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
            // console.log("-----------------------------");
            // console.log(element.prop("className"));
            // console.log("-----------------------------");
            //  element.addClass("animated rotateOutUpLeft");//rollOut

             // Delete From angular array
             $scope.question_id = questionId ;
             element.addClass("animated rotateOutUpLeft");//rollOut


             $timeout(function(){
               element.remove();
                var found_qs = $scope.questions_list.find($scope.callback_index);
                var targetIndex = $scope.questions_list.indexOf(found_qs);
                if(targetIndex != -1 ){
                  $scope.questions_list.splice(targetIndex, 1);
                }
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
   // Sorting the exisitng questions
   $scope.sort_handler = document.getElementById("docQuestions");
   Sortable.create($scope.sort_handler , {
     ghostClass: 'shadow_element' ,
     group: "question-list" ,
     disabled: false ,
     onStart : function (evt){

      //  console.log(evt.item);
      // var targetEl = $(evt.item).hasClass("draggable-x");
     } ,
     onEnd : function (evt){

       var itemEl = evt.item;  // dragged HTMLElement
       var newIndex = evt.newIndex ;
       var oldIndex = evt.oldIndex ;
       $scope.question_id = $(itemEl).attr("data-question-id");
       var question_sor = $scope.questions_list.find($scope.callback_index);

       // store values
       var newPosition = question_sor;
       // remove old index
       $scope.questions_list.splice(oldIndex, 1);
       // relocate new position
       $scope.questions_list.splice(newIndex ,0,  newPosition );
       // Save change in db
       $.getJSON($scope.json_apk_file , function(api_key_data){
         $http({
               url   : $scope.api_url_question_creation ,
               method : "PATCH",
               data  : {
                 "sorted_question": $scope.questions_list ,
                 "creator_id":$scope.user_id
               } ,
               headers: {
                 "X-api-keys": api_key_data.API_KEY,
                 "X-api-app-name": api_key_data.APP_NAME
               }
             }).then(function(resp){

             },function(err){
               console.log(err);
             });
       });
     }
   }); // end sortable
   // Add New Quiz
   $scope.sortble_draggable_handler = document.getElementById("qs-sortable");
   Sortable.create($scope.sortble_draggable_handler , {
     ghostClass: 'shadow_element' ,
     sort: false,
     group: {
        name: "question-list",
        pull: "clone",
        revertClone: false,
     },
     onStart : function (evt){
       // ---------------------------------------------------
       // ------->> Get Id from mongoDB
       // ---------------------------------------------------
       $http({
           url : $scope.api_url_init_id_date ,
           method : "GET"
         }).then(function(resp){
           $scope.mongoose_id = resp.data.id;
           $scope.mongoose_answer_id = resp.data.id_1;
           $scope.mongoose_date = resp.data.date;;
           $scope.unique_ids = resp.data.list_of_ids ;

         },function(err){
           console.log(err);
       });

      var qsLength = $("#docQuestions").children("li").length ;
      if(qsLength == 0 ){
        $("#docQuestions").css({
          minHeight:"20px" ,
          background:"#eee"
        });
      }


     } ,
     onEnd : function (evt){
       $scope.drag_drop_status = false;
        var htmlVal = $("#docQuestions ").find(evt.item);
        $("#docQuestions").css({
          background :"transparent"
        });


          // ---------------------------------------------------
          // ------->> push and update indexes in array
          // ---------------------------------------------------
          var itemType = $(evt.item).attr('data-type');
          var questionType = $(evt.item).attr('data-question-type');
          var new_question = {
            _id:$scope.mongoose_id,
            question_type :questionType,
            question_body :"Edit Model",
            enable_description : $scope.enable_description ,
            created_at :$scope.mongoose_date,
            answer_settings : {
                answer_char_max : 200 ,
                choice_style : "inline" ,
                is_randomized : false,
                is_required : false,
                single_choice : true,
                super_size : false
            },
            answers_format : []
          };
          // Push Default answer ( one answer )
          var answer_obj = new Object() ;
          // answer_obj['creator_id'] = $scope.user_id ;
          answer_obj['is_correct'] = false ;
          answer_obj['_id'] = $scope.mongoose_answer_id  ;
          if(questionType == 0 ){
            answer_obj['value'] = 'Answer 1';
          }
          if(questionType == 1 ){
            answer_obj['media_type'] = 0 ;
            answer_obj['media_src'] = $scope.server_ip + "img/media-icon.png";
          }
          if(questionType == 2 ){
            answer_obj['boolean_type'] = "true/false";
            answer_obj['boolean_value'] = false;

            new_question.answers_format.push({
              '_id': $scope.mongoose_answer_id.toString()+'12f',
              'creator_id' : $scope.user_id ,
              'is_correct' : true ,
              'boolean_type' : "true/false" ,
              'boolean_value': true
            });
          }
          new_question.answers_format.push(answer_obj);
          //-----------------------------
          if($scope.mongoose_id == null ){

            // ---------------------------------------------------
            // ------->> Get Id from mongoDB
            // ---------------------------------------------------
            $http({
                url : $scope.api_url_init_id_date ,
                method : "GET"
              }).then(function(resp){
                new_question['_id'] = resp.data.id;
                new_question['created_at'] = resp.data.date;;
                $scope.unique_ids = resp.data.list_of_ids ;
                new_question.answers_format[0]['_id'] = resp.data.id_1;
                if(questionType == 2 ){
                  new_question.answers_format[1]['_id'] = resp.data.id_1+'12fd';
                }
              },function(err){
                console.log(err);
            });

          }

          // ---------------------------------------------------
          // ------->>>>> Mongo Database
          // ---------------------------------------------------
          $timeout(function (){

            // Push to array w index
            var index_in_array = evt.newIndex;
            $scope.questions_list.splice(index_in_array,0, new_question );

            htmlVal.find("ul.question-option").find("li.right").addClass("animated bounceIn");
            htmlVal.remove();




            $scope.edit_this_question(new_question._id , index_in_array);

            if(itemType == 'qst'){ //=> Question
              $.getJSON($scope.json_apk_file , function(api_key_data){
                $http({
                      url   : $scope.api_url_question_creation ,
                      method : "PATCH",
                      data  : {
                        "sorted_question": $scope.questions_list ,
                        "creator_id":$scope.user_id
                      } ,
                      headers: {
              					"X-api-keys": api_key_data.API_KEY,
              					"X-api-app-name": api_key_data.APP_NAME
            				  }
                    }).then(function(resp){

                      // $scope.questions_list = resp.questions;

                      console.log(resp);
                    },function(err){
                      console.log(err);
                    });
              });
            }
            if(itemType == 'text'){ //=> Welcome / close message

            }
          } , 300 );

          // ---------------------------------------------------
          // ------->>>>> Ui Design
          // ---------------------------------------------------

          // build current element
          // htmlVal.find("span.titles").html("Edit Model");
          // // build action handler
          // htmlVal.append($scope.quesion_actions);
          // // Add animation for this question
          // htmlVal.find("ul.question-option").find("li.right").addClass("animated bounceIn");

      //  } , 300);

     },
   }); // end sortable draggable


  //--------------------------------------------------------
  // ==> Edit Current Question     color: #89d7d7;
  //--------------------------------------------------------
  $scope.edit_this_question = function ( qs_id  , qsCurrIndex){
    // init Vars ===========>>>>
    $scope.questionIndex = qsCurrIndex ;
    $scope.question_id = qs_id ;
    $scope.indexes = 1 ;
    // setup data into the -> array
    var taget_question = $scope.questions_list.find($scope.callback_index);
    if(taget_question.answers_format.length > 1) {
      $scope.indexes = taget_question.answers_format.length ;
    }
    // setup data into the -> ui { databinding part }
     // 1 ==> question part
     $scope.question_id = taget_question._id;
     $scope.question_type = taget_question.question_type;
     // 2 ==> media parts
     $scope.question_media = taget_question.media_question ;
     // 3 ==> answer part
     $scope.asnwers = taget_question.answers_format;
      //  $timeout(function(){
      //    // retrieve answers w media
      //    var answer_containers = $('.choices-part').children("li");
      //    answer_containers.each(function(i){
      //      var thisAns = $(this);
      //      s
      //    });
      //  } , 300 );

     // 4 ==> question setting
     $scope.question_settings = {
        is_required           : taget_question.answer_settings.is_required ,
        single_choice   : taget_question.answer_settings.single_choice ,
        is_randomized          : taget_question.answer_settings.is_randomized ,
        super_size         : taget_question.answer_settings.super_size
      }
      // 5 ==> box overlay ( show media part )
      var media_block = $(".media-x-preview"); // => preview div
      var show_media_link = $(".show_media_link"); // => input
      /*Default all elements should be empty*/
      media_block.html('');
      show_media_link.val('') ;
      show_media_link.css("display","none");
      /*show media in ui*/

      if($scope.question_media == undefined || $scope.question_media == null) {
        var no_media = "<b class='no-media'>There is no media ! </b>"
        media_block.html(no_media);
      }else {
          show_media_link.css("display","block");
          var iframe = "<iframe width='100%' height='250px'></iframe>";
          var image  = "<div class ='show-image'></div>";
          var mp4    = '<video width="100%" height="auto" controls>' +
                          '<source src="'+$scope.question_media.media_field+'.mp4" type="video/mp4">'+
                          '<source src="'+$scope.question_media.media_field+'.ogg" type="video/ogg">'+
                          'Your browser does not support the video tag.' +
                        '</video>' ;

          // image
          if($scope.question_media.media_type == 0 ) {
            media_block.html(image);
            show_media_link.val($scope.server_ip + $scope.question_media.media_field);
              media_block.find('div').css({
                "background-image":"url('"+$scope.server_ip + $scope.question_media.media_field +"')"
              });
          }
          if($scope.question_media.media_type == 1 ) {
            media_block.html(iframe);

            show_media_link.val($scope.question_media.media_name);
            // youtube or vimeo
            if($scope.question_media.video_type == 0 || $scope.question_media.video_type == 1)
              media_block.find('iframe').attr("src" , $scope.question_media.video_source);
            // mp4
            if( $scope.question_media.video_type == 2 ) {
              media_block.html(mp4)
            }


          }


      }




      // var cases = $scope.question_media.media_type


    // init icons and highlighted parts ==============>>>>
    $(".qs-edit-"+$scope.question_id).removeClass("fa-pencil");
    $(".iconex-movable").each(function(){
      if($(this).hasClass("fa-cog")){
        $(this).removeClass("fa-cog fa-spin");
        $(this).addClass("fa-pencil");
        $(this).css({color:"tan"});
      }
    });
    $(".qs-edit-"+$scope.question_id).css({"color":"#89d7d7"});
    $(".qs-edit-"+$scope.question_id).addClass("fa-cog fa-spin -font");
    $(".question-li-x").removeClass("highlighted-question");
    $(".qs-"+$scope.question_id).addClass("highlighted-question");

    // init ids ===========>>>>
    $http({
         url : $scope.api_url_init_id_date ,
         method : "GET"
       }).then(function(resp){
         $scope.mongoose_id = resp.data.id;
         $scope.mongoose_answer_id = resp.data.id_1;
         $scope.mongoose_date = resp.data.date;;
         $scope.unique_ids = resp.data.list_of_ids ;

       },function(err){
         console.log(err);
     });

  } // End Edit Question





  // =====================================
  // ===> Question Settings
  // =====================================
  $("#MultipleResponse-option , #Randomize-option , #SuperSize-option , #required-option").on("change",function(){
    console.log($scope.questions_list);
    if($scope.question_id == null )
    {
      alert("Please select question first from question list !");
      return false ;
    }
     // sotre settings in array => $scope.question_id
     var question_selected = $scope.questions_list.find($scope.callback_index);
     question_selected.answer_settings = $scope.question_settings ;
    //  question_selected.answer_settings =
     // Remove the current list from array
     var targetIndex = $scope.questions_list.indexOf(question_selected);
     if(targetIndex != -1 ){
       $scope.questions_list.splice(targetIndex, 1);
     }
     // ==============================
    //  alert(question_selected.answer_settings.single_choice);
     if(question_selected.answer_settings.single_choice == true ) {
       var all_answers = question_selected.answers_format;
       for (var i = 0; i < all_answers.length; i++) {
           all_answers[i].is_correct = false;
       }
     }



     // Push to array with index
     $scope.questions_list.splice(targetIndex, 0, question_selected);

    //  console.log($scope.questions_list);
  });
  // =====================================
  // ===> Answer Creation
  // =====================================
  $scope.create_new_answer = function (){

    if($scope.question_id == null ){
      alert("Please select question from question list");
    }

    var question_selected = $scope.questions_list.find($scope.callback_index);
    var answer_length = question_selected.answers_format.length ;

    $scope.indexes = answer_length+1;
    if($scope.unique_ids[$scope.indexes] == undefined)
    {
      $(".add-new-option").css({
        background : "rgba(221,34,34,0.24)" ,
        color : '#ff5252'
      });
      $(".add-new-option").html("You couldn't able create more answers !!");
      return false ;
    }
    var new_answer = {
         is_correct: false,
         _id : $scope.unique_ids[$scope.indexes]
       };

       if($scope.question_type == 0 )
          new_answer['value'] = "Answer " + $scope.indexes;

       if( $scope.question_type == 1 )
        new_answer['media_src'] = $scope.server_ip + "img/media-icon.png" ;

         question_selected.answers_format.push(new_answer);


  };

  // ============================================
  // =====>> Delete Answers from array
  // ============================================
  $scope.question_answer_deletion = function (answer_id){
    // ==> This Answer
    $scope.answer_id = answer_id ;
    var question_selected = $scope.questions_list.find($scope.callback_index); //heeer
    var answer_selected = question_selected.answers_format.find($scope.callback_answer_index);

    // let's excute our func here
    var targetIndex = question_selected.answers_format.indexOf(answer_selected);
    if(targetIndex != -1 ){
      question_selected.answers_format.splice(targetIndex, 1);
    }
  };



  // ============================================
  // =====>> Mark this answer as a right
  // ============================================
  $scope.question_answer_mark_it_correct = function (answer_id){
    // ==> This Answer
    $scope.answer_id = answer_id ;
    var question_selected = $scope.questions_list.find($scope.callback_index);
    var answer_selected = question_selected.answers_format.find($scope.callback_answer_index);

    if( question_selected.question_type == 2 ){
      var all_answers = question_selected.answers_format;
      for (var i = 0; i < all_answers.length; i++) {
        all_answers[i].is_correct = false;
      }
      answer_selected.is_correct = !answer_selected.is_correct ;

      return false ;
    }
    // let's excute our func here
    if(question_selected.answer_settings.single_choice == true ) { // only one response
      var all_answers = question_selected.answers_format;
      for (var i = 0; i < all_answers.length; i++) {
        all_answers[i].is_correct = false;
      }
      answer_selected.is_correct = !answer_selected.is_correct ;
    }else { // multiple response
      answer_selected.is_correct = !answer_selected.is_correct ;
    }


  };
  // ============================================
  // =====>> Edit Question Text
  // ============================================
  // $("#editor-question-body").on('keydown' , function (){
  //   var question_value = $(this).val();
  //
  //   if($scope.question_id == null )
  //     {
  //       alert("please select question to edit it first !");
  //       return false ;
  //     }
  //
  //     // Select Question From Array
  //     var question_selected = $scope.questions_list.find($scope.callback_index);
  //     if(question_selected){
  //        question_selected.question_body = question_value;
  //     }
  //     $scope.question_chars(question_selected.question_body);
  // });
  // $scope.question_chars = function (chars){
  //   alert(chars.length)
  // };

  // ============================================
  // =====>> Question Description
  // ============================================

  $("#editor-question-desc").on('keydown change keypress keyup' , function (){
    var question_value = $(this).val();
    if($scope.question_id == null )
      {
        alert("please select question to edit it first !");
        return false ;
      }

    // Select Question From Array
      var question_selected = $scope.questions_list.find($scope.callback_index);
      if(question_selected)
      question_selected.question_description = question_value;
   });



  // ==============================================================
  // =====>> Save Changes that completed in angular backend
  // ==============================================================
  $scope.save_changes_in_angular_backend = function (){
    console.log($scope.questions_list);
    if($scope.question_id == null ){
      alert("You should select question from question list to allow you edit it");
      return false ;
    }
    var changes_button = $(".save_changes");
    changes_button.html("Saving Changes ....");



    // Save change in db
    $.getJSON($scope.json_apk_file , function(api_key_data){
      $http({
            url   : $scope.api_url_question_creation ,
            method : "PATCH",
            data  : {
              "sorted_question": $scope.questions_list ,
              "creator_id":$scope.user_id
            } ,
            headers: {
              "X-api-keys": api_key_data.API_KEY,
              "X-api-app-name": api_key_data.APP_NAME
            }
          }).then(function(resp){
            changes_button.html("Save Changes");

          },function(err){
            console.log(err);
          });
    });

  }

  $timeout(function(){
    $(".loader_block").fadeOut(5000);
  } , 3000 );



  // =========================
  // ---->> Settings Menu
  // -------------------------
  $scope.open_settgins_menu = function (){

    $(".side-left-bar").css({
      left: '-150px' ,
      display: 'none'
    });
     $(".left_part").css ({
        left: '-80%',
        display: 'none'
      });

      $(".setting-part").css({
        right: '0px' ,
        display: 'block'
      });

      $(".update-rows").css({
        'margin-left': '0px'
      });

  };
  $scope.close_settgins_menu = function (){
    $timeout(function (){
      $(".side-left-bar").css({
        left: '0px'
      });
      $(".left_part").css ({
         left: '0%'
       });
       $(".setting-part").css({
         right: '-80%'
       });

    } , 1000) ;

    $(".side-left-bar").css({
      display: 'block'
    });
     $(".left_part").css ({
       display: 'block'
      });

      $(".setting-part").css({
        display: 'none'
      });

      $(".update-rows").css({
        'margin-left': '130px'
      });

  };
  // $scope.open_settgins_menu();
  $scope.settings_menu_handler = $(".setting-menu-handler");
  $scope.settings_menu_handler.on("click" , function (){

    if($scope.settings_menu_handler.hasClass("open") == true )
    {
      $scope.settings_menu_handler.removeClass("open");
      $scope.close_settgins_menu();
    }
    else
    {
      $scope.settings_menu_handler.addClass("open");
      $scope.open_settgins_menu();
    }
  });

  // -------------------------------------------
  // collapsed - expanded options
  // --------------------------------------
  $scope.expand_collapse_handler =   $(".app-settings li .control-item-header") ;
  $scope.expand_collapse_handler.on("click" , function (){
    var target = $(this) ;

    $scope.expand_collapse_handler.each(function(i){
        if(target.parent("li").index() != $(this).parent("li").index() )
        $scope.expand_collapse_handler.next(".control-item-content").slideUp();

    });
    $(this).next(".control-item-content").slideDown();
  });



  // ===================================
  // ==== Angular Backend into Mongo (data)
  // ===================================
  $scope.application_save_settings = function (){


    // $scope.api_url_app_settings
    // $scope.application_settings
    $.getJSON( $scope.json_apk_file , function (api_key_data ){
        $http({
          method : "PATCH" ,
          url    : $scope.api_url_app_settings ,
          headers: {
              "X-api-keys": api_key_data.API_KEY,
              "X-api-app-name": api_key_data.APP_NAME
          },
          data: {
            creator_id : $scope.user_id ,
            settings : $scope.application_settings.settings,
            questionnaire_title : $scope.application_settings.questionnaire_title
          }
            }).then(function(resp){
            console.log(resp);
              } , function(err){
            console.log(err);

          });



    });


  };




// =========================================================
// =====================> Media Uploader
// =================================================
//* Detect video type that written in input */
$(".show_media_link").on("change keyup keydown keypress", function (){
    var currentValue =$(this).val();

    $scope.change_media_link_by_system = false;
    if($scope.change_media_link_by_system == false ){
      // case it image => decline this  !

      // case it youtube
      if( currentValue.toLowerCase().includes("youtube")    == true ){
        $scope.file_object['media_type'] = 1 ;
      }
      // case it vimeo
      if( currentValue.toLowerCase().includes("vimeo")    == true ){
        $scope.file_object['media_type'] = 1 ;
      }
      // case it mp4
      if( currentValue.toLowerCase().includes(".mp4")    == true ){
        $scope.file_object['media_type'] = 1 ;
      }
    } // else => means this is changed by system

});
/* Video Handler part */
$scope.video_handler = $(".video-handler");
$scope.video_handler.on("click",function(){
  $scope.file_object['media_type'] = 1 ;
  $(".media-inputs").css({display:'block'});
});
/* Image Handler part */
$scope.image_handler = $(".image-handler");
$scope.image_handler.on("click", function (){
  $(".image-uploader-x").trigger("click");
});
$scope.upload_handler = $(".image-uploader-x");
$scope.upload_handler.on("change" , function (){
  $scope.file_object['media_type'] = 0 ;
  $scope.file_object['file'] = $(this)[0].files[0];
});

// ===============================
// => Upload & save in mongoDB
// ===============================
$(".media-changeable-img-case").on("click" , function (){
    $(".box-overlay").fadeIn();
});
$scope.show_preview_media = function (media_object){

  var media_field = media_object.media_field ;
  var media_name  = media_object.media_name;
  var media_type  = media_object.media_type;
  var video_id    = media_object.video_id;
  var video_type  = media_object.video_type;


  var preview_box = $(".media-x-preview");
  var media_iframe ;
  $(".media-loader-spinner").fadeOut(2000);
  switch (media_type) {
    case 0: // Image Type
      media_iframe = "<div style='background:url("+$scope.server_ip+media_field+")' class='emb-image-case public-media'></div>" ;
      break;
// ---------------------------------------->> Separated line
    case 1: // Video Type
        if (video_type == 0 ){
          //  media_iframe = '<iframe width="100%" height="250px" src="http://www.youtube.com/embed/'+video_id+'?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' ;
          media_iframe = '<iframe class="iframe" width="100%" src="http://www.youtube.com/embed/'+video_id+'"    height="250px" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' ;

        } // Youtube
        if (video_type == 1 ){
          media_iframe = ' <style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; height: auto; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style> <iframe src="https://player.vimeo.com/video/'+video_id+'" width="100%" height="250px" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
        } // Vimeo
        if (video_type == 2 ){
          media_iframe = '<video width="100%" height="auto" controls>'
              + '<source src="'+media_field+'.mp4" type="video/mp4">'
              + '<source src="'+media_field+'.ogg" type="video/ogg">'
              + 'Your browser does not support the video tag.'
              + '</video>'
        } // Mp4
      break;
  } // end switch ---

  preview_box.html(media_iframe);
}; // => beside qs Preview

$scope.close_media_box = function (){
  $(".box-overlay").fadeOut();
}; // => beside qs Preview

$scope.save_media_with = function (action_type) {
  // LOADING PAGE
  var loader = '<div class="media-loader-spinner"><div class="spinner">'+
                  '<div class="rect1"></div>'+
                  '<div class="rect2"></div>'+
                  '<div class="rect3"></div>'+
                  '<div class="rect4"></div>'+
                  '<div class="rect5"></div>'+
                '</div>' +
                '<span class="title-loader">Please wait it may take a few moments</span></div>';
  $(".media-x-preview").html(loader);
if($scope.model_type == 'questions'){

  // ==> END LOADER HERE !!

  // $scope.question_id = "5a8ea78a3a4c8d3a5c9a69e8"; // for testing only

  if($scope.question_id == null ) {
    alert("You've to select question first from question list to allow you edit it !");
    return false ;
  }

  var found_qs = $scope.questions_list.find($scope.callback_index);
  var targetIndex = $scope.questions_list.indexOf(found_qs);
  // found_qs.media_question.media_name = " this is an update to see what happened in angular backend";
  var headers = new Object();
  var data_object ;
  // console.log("media type " + $scope.file_object.media_type);
  if($scope.file_object.media_type == 0 ) {// Image
      data_object = new FormData();
      data_object.append("creator_id" , $scope.user_id );
      data_object.append("question_id" , $scope.question_id );
      data_object.append("media_field" , $scope.file_object.file );
      headers["Content-Type"] = undefined ;
  }
  if($scope.file_object.media_type == 1 ) { // Video
    data_object = new Object();
    data_object['creator_id']  =  $scope.user_id ;
    data_object['question_id'] =  $scope.question_id ;
    data_object['media_field'] =  $scope.file_object.link ;
  }
  console.log(data_object);
   $.getJSON( $scope.json_apk_file , function (api_key_data ){
    headers["X-api-keys"] = api_key_data.API_KEY ;
    headers["X-api-app-name"] = api_key_data.APP_NAME ;

    console.log("user ids ");
    console.log(data_object);
      $http({
        method : "PATCH" ,
        url : $scope.api_url_edit_question ,
        headers: headers ,
        processData: false,
        contentType: false ,
        data: data_object
      }).then(function(success_data){    // console.log($scope.questions_list);
        var question_data = success_data.data ;
        var media_question_url = question_data.Media_directory;

        var question_media_details = question_data.Question_details.media_question;
        found_qs.media_question = question_media_details ;
        var media_type_is = found_qs.media_question.media_type ;
        if( media_type_is == 0 ){ // image
          $(".media-changeable-img-case").css({
            "background-image" : "url('"+$scope.server_ip+found_qs.media_question.media_field +"')"
          });
        }
        if( media_type_is == 1 ){ // image
          var video_type = found_qs.media_question.video_type ;
          if(video_type == 0 ) {
            $(".media-changeable-img-case").css({
              "background-image" : "url('"+$scope.server_ip+'img/vid-youtube.jpg' +"')"
            });
          }
          if(video_type == 1 ){
            $(".media-changeable-img-case").css({
              "background-image" : "url('"+$scope.server_ip+'img/vid-vimeo.jpg' +"')"
            });
          }
          if (video_type == 2 ){
            $(".media-changeable-img-case").css({
              "background-image" : "url('"+$scope.server_ip+'img/vid-mp4.jpg' +"')"
            })
          }
        }

        // =========> Action Proccess
           if (action_type == "close")
                $scope.close_media_box();
      else if (action_type == "preview")
                $scope.show_preview_media(found_qs.media_question ); // media_type , video_type = null

      },function(error_data){
        console.log(error_data);
      });
  });


} else {
  /*
      $scope.question_id
      $scope.answer_id
  */

  if($scope.answer_id != null ){
                                                  // api/{:app_id}/question/{:question_id}/answer/edit
    $scope.api_url_edit_answer = $scope.server_ip + "api/"+$scope.app_id+"/question/"+$scope.question_id+"/answer/edit";
    var headers = new Object();
    var answer_object ;
    // ====>> current answer id
    var target_question = $scope.questions_list.find($scope.callback_index);
    var target_answer = target_question.answers_format.find($scope.callback_answer_index);
    $scope.question_id = target_question._id ;
    if($scope.file_object.media_type == 0) {
      answer_object = new FormData();
      answer_object.append("creator_id" , $scope.user_id );
      answer_object.append("question_id" , $scope.question_id );
      answer_object.append("answer_id" , $scope.answer_id );
      answer_object.append("media_src" , $scope.file_object.file );
      headers["Content-Type"] = undefined ;
    }else if($scope.file_object.media_type == 1) {
      answer_object = new Object();
      answer_object['creator_id']  =  $scope.user_id ;
      answer_object['question_id'] =  $scope.question_id ;
      answer_object['answer_id'] =  $scope.answer_id ;
      answer_object['media_src'] =  $scope.file_object.link ;
    }

    $.getJSON( $scope.json_apk_file , function (api_key_data ){
      headers["X-api-keys"] = api_key_data.API_KEY ;
      headers["X-api-app-name"] = api_key_data.APP_NAME ;
      // save question answers first into mongoDB
      $scope.save_changes_in_angular_backend();
      $timeout(function(){
        // Sotre media
          $http({
            method : "PATCH" ,
            url : $scope.api_url_edit_answer ,
            headers: headers ,
            processData: false,
            contentType: false ,
            data: answer_object
          }).then(function(success_data){
            if(target_question.question_type == 1){
                var answer_data = success_data.data ;


                // Store it into scope object
                $scope.answer_media = answer_data ;
                // Store it into Array
                target_answer = answer_data ;

                // update the-array
                var thisAnswer = $scope.questions_list.find($scope.callback_index).answers_format.find($scope.callback_answer_index);
                var currIndex = $scope.questions_list.find($scope.callback_index).answers_format.indexOf(thisAnswer);
                if(currIndex != -1 ){
                  $scope.questions_list.find($scope.callback_index).answers_format[currIndex] =
                  answer_data ;
                }

            }
            if(target_question.question_type == 0 ){
                var answer_data = success_data.data ;
                var media_optional = answer_data.media_optional;

                // Store it into question list array
                target_answer.media_optional = answer_data.media_optional ;
                // Store it into scope object
                $scope.answer_media = target_answer.media_optional ;
            }







            if(action_type == "close"){
              $scope.close_media_box();
            }else if (action_type == "preview"){
                $scope.extract_answer_media_from_mongodb();
            }



          }, function(error_data){
              console.log(error_data);
          });
      } , 500);

    });
  }
  // ==>>> Save and show media related answer part
}

};


  $scope.extract_answer_media_from_mongodb = function (){
    if($scope.answer_media == null ) {
      console.log("Error : Answer Media Not Found !");
      return false;
    }
     console.log($scope.answer_media);
     var preview_box = $(".media-x-preview");
     var media_iframe ;
     $(".media-loader-spinner").fadeOut(2000);
     switch ($scope.answer_media.media_type) {
       // =====================================> Image
       case 0 :
       media_iframe = "<div style='background:url("+$scope.server_ip+$scope.answer_media.media_src+")' class='emb-image-case public-media'></div>" ;
       break;
       // =====================================> Video
       case  1 :
       if($scope.answer_media.video_type == 0)
         {
           media_iframe = '<iframe class="iframe" width="100%" src="'+$scope.answer_media.embed_path+'"    height="250px" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' ;
         }
       if($scope.answer_media.video_type == 1)
         {
           media_iframe = '<iframe class="iframe" width="100%" src="'+$scope.answer_media.embed_path+'"    height="250px" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' ;
         }
       if($scope.answer_media.video_type == 2)
        {
          media_iframe = '<video width="100%" height="auto" controls>'
             + '<source src="'+$scope.answer_media.mp4_option.mp4_url+'" type="video/mp4">'
             + '<source src="'+$scope.answer_media.mp4_option.ogg_url+'" type="video/ogg">'
             + 'Your browser does not support the video tag.'
             + '</video>'
        }
       break;


     }
     preview_box.html(media_iframe);
  } ; // end extract func here !



}]);
