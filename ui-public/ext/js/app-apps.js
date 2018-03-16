//==> Apply html tags
apps.filter ("apply_html" , [
  '$sce' , function ($sce){
    return function (text_changed){
      return $sce.trustAsHtml(text_changed);
    }
  }
]);
apps.filter("set_iframe" , [
      "$timeout" ,"$sce" ,
  function (  $timeout , $sce){
    return function (media_object){
      var embed_video , video_path , video_mp4  , iframe_size ;

      if( media_object.embed_path != null)
      {
         video_path = media_object.embed_path ;
         iframe_size = new Object();
         iframe_size.width = "100%";
         iframe_size.height = "130px" ;
      }
      else
      {
         video_path = media_object.video_source ;
         iframe_size = new Object();
         iframe_size.width = "100%";
         iframe_size.height = "130px" ;
      }

      if(media_object.mp4_option != undefined || media_object.mp4_option != null ){
        video_mp4 = new Object();
        video_mp4['mp4_url'] = media_object.mp4_option.mp4_url ;
        video_mp4['ogg_url'] = media_object.mp4_option.ogg_url ;

        iframe_size = new Object();
        iframe_size.width = "100%";
        iframe_size.height = "130px" ;
      }else {
        video_mp4 = new Object();
        video_mp4['mp4_url'] =  media_object.media_field+'.mp4';
        video_mp4['ogg_url'] =  media_object.media_field+'.ogg';
        iframe_size = new Object();
        iframe_size.width = "100%";
        iframe_size.height = "130px" ;
      }
      switch (media_object.media_type) {
        case 1:
          if( media_object.video_type == 0 ){
            embed_video = "<iframe width='"+iframe_size.width+"' height='"+iframe_size.height+"' src='"+video_path+"' ></iframe>";
          }
          if( media_object.video_type == 1 ){
            embed_video = "<iframe width='"+iframe_size.width+"' height='"+iframe_size.height+"' src='"+video_path+"' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
          }
          if( media_object.video_type == 2 ){
            embed_video = '<video style="width:'+iframe_size.width+'; height:'+iframe_size.height+';" controls>' +
                          '<source src="'+video_mp4.mp4_url+'" type="video/mp4">'+
                          '<source src="'+video_mp4.ogg_url+'" type="video/ogg">'+
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
  '$sce' ,
  function ($sce){
    return function (specs){
      var spesificChars = '' ;
      var char_counts = 40 ;

      if(specs == undefined)
        spesificChars = specs ;
        else {
            for (var i = 0; i < specs.length; i++) {
              if(i < char_counts) {
                spesificChars += specs[i];
                if(i == (char_counts - 1) )
                  spesificChars += " ... ";
              }
            }
        }

       return $sce.trustAsHtml(spesificChars);
    }
  }
]);
apps.filter('show_chars' , [
  '$sce' ,
  function ($sce){
    return function (specs){
      var spesificChars = '' ;
      var char_counts = 16 ;

      if(specs == undefined)
        spesificChars = specs ;
        else {
            for (var i = 0; i < specs.length; i++) {
              if(i < char_counts) {
                spesificChars += specs[i];
                if(i == (char_counts - 1) )
                  spesificChars += " . ";
              }
            }
        }

       return $sce.trustAsHtml(spesificChars);
    }
  }
]);

apps.controller("apps-controller" , ['$scope','$http' , '$timeout' , function ($scope , $http , $timeout){

    // ==> Vars in scope object
    $scope.rating_scale_elements = [] ;
    $scope.rating_values = null ;
    $scope.questions_list = null ;
    $scope.window_navigation = $(window);
    $scope.generated_media_box_handler = $(".box-data");
    $scope.close_iconx = $(".setting-iconx");
    $scope.settings_menu = $(".settings_menu") ;
    $scope.questions_list_box = $(".left_part");
    $scope.redactor = $('.redactor-editor');
    $scope.upload_handler = $(".image-uploader-x");
    $scope.hidden_question_body = $("#editor-question-body-hidden");
    $scope.show_selected_text = $("#editor-question-body");
    $scope.questions_editor_preview_box = $(".left_part");
    $scope.application_type = $("#applicationType").val();
    $scope.video_handler = $(".video-handler");
    $scope.close_settings_menu_handler = $(".setting-iconx");
    $scope.server_ip = $("#serverIp").val();
    $scope.user_id = $("#userId").val();
    $scope.app_id = $("#applicationId").val();
    $scope.slide_edditor_slices = $(".x-editor-x-title");
    $scope.image_handler = $(".image-handler");
    $scope.quest_media_parts = null ;
    $scope.questPreiouseId = null ;
    $scope.unsaved_question = false ;
    $scope.old_question_data = null ;
    $scope.left_part_position  = $scope.questions_list_box.width() + 21 ;
    $scope.sort_handler = document.getElementById("docQuestions");
    $scope.sortble_draggable_handler = document.getElementById("qs-sortable");
    $scope.expand_collapse_handler =   $(".app-settings li .control-item-header") ;
    $scope.style_of_answers = "Two columns per row"
    $scope.data_object   = null ;
    $scope.answer_object = null ;
    $scope.question_object_that_added = null ;
    $scope.current_answer_index = null ;
    $scope.model_type = null ;
    $scope.drag_drop_status = true ;
    $scope.questionIndex = null ;
    $scope.current_video_id = null;
    $scope.change_media_link_by_system = true ;
    $scope.answer_media = null ;
    $scope.selected_text = null ;
    $scope.answer_old_status = null ;
    $scope.mongodb_questions = null ;
    $scope.question_id = null ;
    $scope.question_media = null ;
    $scope.answer_id = null ;
    $scope.indexes = 1 ;
    $scope.mongoose_id = null;
    $scope.mongoose_answer_id = null;
    $scope.mongoose_date = null;
    $scope.unique_ids = null ;
    $scope.targetElement_bind = null ;
    $scope.application_stylesheet = null ;
    $scope.app_title = null ;
    $scope.selected_passage = null ;
    $scope.current_editor_index = 0 ;
    // ==> Objects in scope object
    $scope.headers = new Object() ;
    $scope.window = {
      // ===========> Width
      current_window  : $(window).width()  ,
      settings_menu   : $(".left_part").width() - 28
      };
    $scope.file_object = {
      "media_type" : null ,
      "file"       : null ,
      "link"       : null
      }
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
    $scope.question_settings = {
      is_required           : false ,
      single_choice  : false ,
      is_randomized          : false ,
      super_size         : false ,
      choice_style : true  //
                }
    $scope.labels = [  'a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];

    // ==> API URLS
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



    // ==> Loading and store main data
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
                  // console.log($scope.application_settings);
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

    // ==> functions in scope object

    $scope.select_rating_scale__ = function ( index , type){
       var thisElement = index ;


       if(type == 1 ) { // ==> Rating
           var highlighted_stars = $('.fa-star').length ;
           if($('.start-o').children("li").eq(index).children("span").children("i").hasClass("fa-star")){
              if((highlighted_stars - 1 ) == index){
                $(".start-o li").each(function(i){
                  $(this).children("span").children("i").removeClass("fa-star");
                  $(this).children("span").children("i").addClass("fa-star-o");
                });
              }else {
                $(".start-o li").each(function(i){
                   if($(this).children("span").children("i").hasClass('fa-star')){
                       $(this).children("span").children("i").removeClass('fa-star');
                       $(this).children("span").children("i").addClass("fa-star-o");
                   }
                   if(i <= thisElement){
                       $(this).children("span").children("i").removeClass("fa-star-o");
                        $(this).children("span").children("i").addClass('fa-star');
                    }
                });
              }
           }else {
             $(".start-o li").each(function(i){
               if(i <= thisElement){
                 $(this).children("span").children("i").removeClass("fa-star-o");
                 $(this).children("span").children("i").addClass("fa-star");
               }
             });
           }
        }
        if(type == 0 ) { // ==> Scale .scalet-o li span
           if($('.scalet-o').children("li").eq(index).children("span").hasClass("highlighted_scale")){
             $('.scalet-o').children("li").eq(index).children("span").removeClass("highlighted_scale");
           }else {
             $('.scalet-o').children("li").each(function (){
               $(this).children("span").removeClass("highlighted_scale");
             });
             $('.scalet-o').children("li").eq(index).children("span").addClass("highlighted_scale");
           }
        }
       return false;
    };
    $scope.class_data_func = function (is_correct , choice_style){
      var class_item = '';

      if (choice_style != true )
        class_item += 'one_column ';
      if(is_correct)
        class_item += 'highlighted-right-answers';
      return class_item ;
    };
    $scope.collapse_menu_settings = function (target_iconx){
          target_iconx.removeClass("fa-times");
          target_iconx.addClass("fa-cog");
          var settings_word = target_iconx.parent(".setting-iconx");
          if(settings_word.children("span.settings_title").length == 0 ){
              settings_word.append("<span class='settings_title'>Settings</span>");
          }
          // some styles
          $scope.close_iconx.css("left", "-140px")
          // $scope.close_iconx.css("left", "-60px")
          // => Slide settings Menu into ( - right)
          $scope.settings_menu.animate({"margin-right": '-='+$scope.settings_menu.width()});
          // Slide question settings into ( + left )
          $scope.questions_list_box.css({"left": '0px'});
          $scope.questions_editor_preview_box.css({"margin-left": '0px'});
          // Generated media box
          $scope.generated_media_box_handler.css({left:"0px"}) ;
          // append 'quiz setting' word

        };
      $scope.expand_menu_settings  = function (target_iconx){
      target_iconx.removeClass("fa-cog");
      target_iconx.addClass("fa-times");
      // some styles
      $scope.close_iconx.css("left", "-35px")
      // => Slide settings Menu into ( + right)
      $scope.settings_menu.animate({"margin-right": '+='+$scope.settings_menu.width()});
      // Slide question list into ( + left )
      $scope.questions_list_box.css({"left": '-'+ $scope.left_part_position + 'px'});
      $scope.questions_editor_preview_box.css({"margin-left": '-'+ $scope.left_part_position + 'px'});
      $scope.generated_media_box_handler.css({left:'-'+ Math.round(($scope.left_part_position / 2) + 25) + 'px'})
    }
    $scope.expand_collapsed_items = function (id){
       var targetId = id ;
       var targetAll = $(".x-editor-x-body").height() ;
       var targetH = $(targetId).height() ;
       $(targetId).slideToggle();
     };
    $scope.callback_index = function (object){
      if(object == null )
        return false;
      return object._id == $scope.question_id ;
    };
    $scope.callback_answer_index = function (object){
      return object._id == $scope.answer_id ;
    };
    $scope.randomize_arries = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
        }

        return array;
      }
    $scope.show_media_uploader = function (media_for_model , answer_id = null  ) {

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
                                      // console.log(  media_block.find('iframe').html());
                                    }
                                  } , 3000 );
                                }
                            }
        } else if ($scope.model_type == "answers"){
          var media_block = $(".media-x-preview");
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
          console.log(target_answer);
          if(target_answer.media_src  == $scope.server_ip + "img/media-icon.png" ){
            var no_media = "<b class='no-media'>There is no media ! </b>"
             media_block.html(no_media);
          }else {
            // console.log("/*/*/*/*/*//*/*/*/*/*/*/*/*/*/*///*");
            // console.log(target_answer);
            // console.log("/*/*/*/*/*//*/*/*/*/*/*/*/*/*/*///*");
            show_media_link.css("display","block");
            var iframe = "<iframe width='100%' height='250px'></iframe>";
            var image  = "<div class ='show-image'></div>";

            // ==> it will be according to question Type
            if ($scope.question_type == 1 ) {  // text media only

              if(target_answer.media_type == 0 ) {
                media_block.html(image);
                show_media_link.val($scope.server_ip + target_answer.media_src);
                media_block.find('div').css({
                    "background-image":"url('"+$scope.server_ip + target_answer.media_src +"')"
                });
              } // end image type

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
            } // end video type
          }else if ($scope.question_type == 0 ) { // text with media

                  if(target_answer.media_optional == undefined || !target_answer.media_optional ) {
                    var no_media = "<b class='no-media'>There is no media ! </b>"
                     media_block.html(no_media);
                  }else {
                    if(target_answer.media_optional.media_type == 0  ) {
                      media_block.html(image);
                      show_media_link.val($scope.server_ip + target_answer.media_optional.media_src);
                      media_block.find('div').css({
                          "background-image":"url('"+$scope.server_ip + target_answer.media_optional.media_src +"')"
                      });
                    } // end image type

                    if(target_answer.media_optional.media_type == 1 ) {
                        media_block.html(iframe);
                        show_media_link.val(target_answer.media_optional.embed_path);
                        // youtube + vimeo
                    if(target_answer.media_optional.video_type == 0 || target_answer.media_optional.video_type == 1)
                        media_block.find('iframe').attr("src" , target_answer.media_optional.embed_path);
                        // mp4
                    if( target_answer.media_optional.video_type == 2 ) {
                      var mp4    = '<video width="100%" height="auto" controls>' +
                                      '<source src="'+target_answer.media_optional.mp4_option.mp4_url+'" type="video/mp4">'+
                                      '<source src="'+target_answer.media_optional.mp4_option.ogg_url+'" type="video/ogg">'+
                                      'Your browser does not support the video tag.' +
                                    '</video>' ;
                                    show_media_link.val(target_answer.media_optional.mp4_option.mp4_url);
                        media_block.html(mp4)
                        }
                  }

                } // end video type
          } // end question type number 1




          }
          // console.log(target_answer);
          // ('Answer Details');
          // console.log(target_answer);
          // console.log(">>>-----*************************----<<<");
          // // ========> Show values related this part
          // console.log($scope.file_object);
          // alert("Answer media uploader !! " + answer_id);
        }

        //media_for_model =>  media for question or answer ??
        $(".media-imgvid-uploader").fadeIn();
      };
    $scope.delete_this_question = function(){

        if( $scope.question_id == null )
          return false ;

        $scope.deleted_question_id = $scope.question_id ;
        var editor_loader = $(".loader-container");
        var editor_block = $(".right_part");


        var found_qs = $scope.questions_list.find($scope.callback_index);
        var targetIndex = $scope.questions_list.indexOf(found_qs);
        if(targetIndex != -1 ){
            var next_id = $scope.questions_list[ targetIndex + 1 ] ;


            // Remove all highlighted question
            $("#docQuestions").children("li").each(function (){
              ($(this).hasClass("highlighted-question") == true ) ?
                $(this).removeClass("highlighted-question"):  null  ;
            });

            // Show loaders
            editor_block.fadeOut(function (){
              editor_loader.fadeIn();
            });

            // doing some delay !
            $timeout(function (){
                $scope.questions_list.splice(targetIndex, 1);
                $scope.save_changes_in_angular_backend();
            } , 290);
         }
     };
    $scope.hide_loader = function (){
       $(".right_part").fadeIn( function (){
         $(".loader-container").fadeOut(2000 , function (){
           $(".question-opener").next().slideDown();
         });
       });
    };
    $scope.onclick_items = function (elementId){
        var evt = {
          item      :  $("#"+elementId) ,
          newIndex  :  ( $("#docQuestions li" ).length - 1 )
        }
        return $scope.dragged_items(evt);
      };
    $scope.loading_redactor_editor = function (){
        $timeout(function(){
          $R('.answer-redactor-editors' ,  {
            plugins: ['fontcolor' , 'fontsize'] ,
            buttons: ['font','bold' , 'italic', 'underline' , 'link' , 'html'] ,
            paragraphize: false,
            replaceDivs: false,
            linebreaks: false,
            enterKey: false ,
            toolbarExternal: '#redactor-editor-menu'
            // , air : true
          });
          $R('.redactor-editor' , {
             plugins: ['fontcolor' , 'fontsize'] ,
             buttons: ['font','bold' , 'italic', 'underline' , 'link' , 'html'] ,
             paragraphize: false,
             replaceDivs: false,
             linebreaks: false,
             enterKey: false ,
             minHeight : '90px' ,
             toolbarExternal: '#redactor-editor-menu'
          });
        } , 100);
      }
    $scope.create_new_answer = function (){
      // $("#redactor-editor-menu").css("display","none");
      if($scope.question_id == null ){
        alert("Please select question from question list");
      }

      var question_selected = $scope.questions_list.find($scope.callback_index);
      var answer_length = question_selected.answers_format.length ;
      console.log(answer_length);
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
           console.log(question_selected);
        if($scope.question_type == 0 ){
          $scope.loading_redactor_editor();
          $scope.load_redactor_text_data();
          // $scope.show_redactor_menu_options_in_timeframe('add-answer');
        }

    };
    $scope.question_answer_deletion = function (answer_id){
      // ==> This Answer
      $scope.answer_id = answer_id ;
      var question_selected = $scope.questions_list.find($scope.callback_index); //heeer
      var answer_selected = question_selected.answers_format.find($scope.callback_answer_index);
      console.log(answer_selected);
      // let's excute our func here
      var targetIndex = question_selected.answers_format.indexOf(answer_selected);

      if(targetIndex != -1 ){
        question_selected.answers_format.splice(targetIndex, 1);
      }
    };
    $scope.question_answer_mark_it_correct = function (answer_id){
        // ==> This Answer

        $scope.answer_id = answer_id ;
        var question_selected = $scope.questions_list.find($scope.callback_index);
        var answer_selected = question_selected.answers_format.find($scope.callback_answer_index);
        console.log(answer_selected);
        if( question_selected.question_type == 2 ){
          var all_answers = question_selected.answers_format;
          for (var i = 0; i < all_answers.length; i++) {
            all_answers[i].is_correct = false;
          }
          answer_selected.is_correct = !answer_selected.is_correct ;
          console.log(answer_selected);
          return false ;
        }


        // let's excute our func here
        if(question_selected.answer_settings.single_choice == true ) { // only one response
          var all_answers = question_selected.answers_format;
          console.log(all_answers);
          for (var i = 0; i < all_answers.length; i++) {
            all_answers[i].is_correct = false;
          }
          answer_selected.is_correct = !answer_selected.is_correct ;
        }else { // multiple response
          answer_selected.is_correct = !answer_selected.is_correct ;
        }

      };
    $scope.save_changes_in_angular_backend = function ( decline_next = null ){

          // console.log($scope.questions_list);
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
                    // console.log(old_question_list);
                    // $scope.questions_list = resp.data.questions ;
                    // $scope.mongodb_questions = resp.data.questions ;
                    if ( decline_next == null ){
                          // GO TO NEXT Question
                          var found_qs = $scope.questions_list.find($scope.callback_index);
                          var targetIndex = $scope.questions_list.indexOf(found_qs);
                          if(targetIndex != -1 ) {
                            if($scope.questions_list.length > ( targetIndex ) ) {
                              var next_question = targetIndex + 1 ;
                              if ( $scope.questions_list[next_question] != undefined )
                              $scope.edit_this_question($scope.questions_list[next_question]._id , next_question) ;
                            }
                          }
                    }


                },function(err){
                  console.log(err);
                });
          });
        };
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
    $scope.close_media_box = function (){
          $(".box-overlay").fadeOut();
        };
    $scope.save_media_with = function ( type ) {
              var headers = new Object();
              if($scope.file_object.media_type == 0 ){
                   // ==> Header
                  $scope.headers["Content-Type"] = undefined ;
                   // ==> Show Progression bar for uploading image
                   var image_container  =  $(".emb-image-case") ;
                   var upload_progeress = "<div class='progress_barx'>";
                       upload_progeress += '<div class="loaderxcv">Loading...</div>';
                      //  upload_progeress += "<center>Uploading Image</center>";
                       upload_progeress += "</div>";
                   image_container.html(upload_progeress);
              } else {
                // Set header as an empty to fix issue related video urls !!
                $scope.headers = new Object();
              }

              $scope.save_changes_in_angular_backend(true);

              $timeout(function (){
                $.getJSON( $scope.json_apk_file , function (api_key_data ){
                  $scope.headers["X-api-keys"] = api_key_data.API_KEY ;
                  $scope.headers["X-api-app-name"] = api_key_data.APP_NAME ;

                    var url ;
                    if($scope.model_type == 'questions')
                      url =  $scope.api_url_edit_question ;
                      else
                      url =$scope.api_url_edit_answer = $scope.server_ip + "api/"+$scope.app_id+"/question/"+$scope.question_id+"/answer/edit";

                   $http({
                     method : "PATCH"           ,
                     url :  url                 ,
                     headers: $scope.headers    ,
                     processData: false         ,
                     contentType: false         ,
                     data: $scope.data_object
                   }).then(function(success_data){

                     if($scope.model_type == 'questions'){
                      $scope.quest_media_parts = success_data.data.Question_details.media_question ;
                      $scope.question_id = success_data.data.Question_details._id;
                      var qsItem = $scope.questions_list.find($scope.callback_index);
                      qsItem.media_question =success_data.data.Question_details.media_question ;

                      //   if($scope.file_object.media_type == 0 ){
                          // var image_iframe = '<div style="background-image:url('+success_data.data.Media_directory+')" class="image-case img_">';
                          // ==> Image : success_data.data.Media_directory

                        // }else {
                        //   console.log(success_data.data);
                        //   var  videoTypeX =  success_data.data.Question_details.media_question.video_type ;
                        //   var  video_src_value = success_data.data.Question_details.media_question.video_source ;
                        //   var  video_media_iframe ;
                        //
                        //   console.log(success_data.data.Question_details.media_question);
                        //   switch (videoTypeX){
                        //     case 0 : // youtube
                        //         video_media_iframe = '<iframe class="iframe" width="100%" src="'+video_src_value+'"    height="130px" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' ;
                        //     break;
                        //
                        //     case 1 : // Vimeo
                        //         video_media_iframe = '<iframe class="iframe" width="100%" src="'+video_src_value+'"    height="130px" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' ;
                        //     break;
                        //
                        //     case 2 : // mp4
                        //         video_media_iframe = '<video width="100%" height="auto" controls>'
                        //                        + '<source src="'+success_data.data.Question_details.media_question.media_field+'.mp4" type="video/mp4">'
                        //                        + '<source src="'+success_data.data.Question_details.media_question.media_field+'.ogg" type="video/ogg">'
                        //                        + 'Your browser does not support the video tag.'
                        //                        + '</video>'
                        //     break;
                        //   }
                        //
                        //   // video_media_iframe
                        //   $(".media-uploads").html(video_media_iframe);
                        // }
                      }else {
                        // --------------------------------------------
                        // 1 ===> Answers
                        // --------------------------------------------
                        var target_question = $scope.questions_list.find($scope.callback_index);
                        // $scope.asnwers = target_question.answers_format ;
                        console.log(target_question);
                        var target_answer = target_question.answers_format.find($scope.callback_answer_index);
                        console.log(target_answer);
                        if( target_question.question_type == 1 ){
                              var answer_data = success_data.data ;

                              // Store it into scope object
                              $scope.answer_media = answer_data ;
                              // Store it into Array
                              target_answer = answer_data ;
                              // update the-array
                              var thisAnswer = $scope.questions_list.find($scope.callback_index).answers_format.find($scope.callback_answer_index);
                              console.log(thisAnswer);
                              var currIndex = $scope.questions_list.find($scope.callback_index).answers_format.indexOf(thisAnswer);
                              console.log(currIndex);
                              if(currIndex != -1 ){
                                $scope.questions_list.find($scope.callback_index).answers_format[currIndex] =
                                answer_data ;
                                console.log("ANSWER DATA");
                                console.log(answer_data);
                              }
                          }
                        if(target_question.question_type == 0 ){
                              var answer_data = success_data.data ;
                              var media_optional = answer_data.media_optional;
                              // console.log(answer_data);
                              //  console.log(media_optional);
                              // Store it into question list array
                              target_answer.media_optional = answer_data.media_optional ;
                              // Store it into scope object
                              $scope.answer_media = target_answer.media_optional ;
                              console.log(target_answer.media_optional);
                          }

                      }

                    $(".media-imgvid-uploader").fadeOut();
                   } , function(error_data){
                        console.log(error_data);
                   });
                 }); // End JSON File reader here !
              } , 500 );
            };
    $scope.highlighted_question_and_show_data = function (newIndex , itemEl = null) {
           // ==> Update highlighted question when update ( in sortable )
           if ($(itemEl).hasClass("highlighted-question")) {
               var new_index = newIndex ;
               $timeout(function (){
                 $("#docQuestions").children("li").each(function (){
                   ($(this).hasClass("highlighted-question")) ?
                      $(this).removeClass("highlighted-question") : null ;
                 });
                 $("#docQuestions").children("li").eq(new_index).addClass("highlighted-question");
               }, 200);
            }
         };
    $scope.remove_media_from_target_model = function (modelType = null ){
         if(modelType != null ) // question
         {
           if ($scope.question_id == null ) return false ;

           var found_qs = $scope.questions_list.find($scope.callback_index);
           var targetIndex = $scope.questions_list.indexOf(found_qs);
           // Remove From array
           delete found_qs['media_question'];
           // remove from view
           delete $scope.quest_media_parts ;
           // $scope.save_changes_in_angular_backend(true);
           // console.log(found_qs);
           // question_building["_id"] =
         } else { // answer
           // alert("answer")
         }
     };
    $scope.status_of_questions = function (){
         // -----------------------------------------------------
         // ----------------- init questions from db
         // -----------------------------------------------------
         $.getJSON($scope.json_apk_file , function(api_key_data){
           var urls = $scope.server_ip+ 'api/' + $scope.app_id+"/application/questions";
           $http({
                 url   : urls ,
                 method : "POST",
                 data  : {
                   "creator_id":$scope.user_id
                 } ,
                 headers: {
                   "X-api-keys": api_key_data.API_KEY,
                   "X-api-app-name": api_key_data.APP_NAME
                 }
               }).then(function (resp){
                   $scope.mongodb_questions  = resp.data ;
               } , function (err){
                 console.log(err);
               });
         });
       };
    $scope.databiding_answers = function (thisElem , thisIndex){
          var thisVal = thisElem.html();
          $scope.questions_list[$scope.questionIndex].answers_format[thisIndex].value = thisVal;
          console.log($scope.questions_list);
       };
    $scope.databiding_question = function (){
            $scope.questions_list[$scope.questionIndex].question_body
            = $(".redactor-in-0").html();
         $scope.targetElement_bind = $("#docQuestions").children("li").eq($scope.questionIndex);
            $scope.targetElement_bind.find(".qs-body").html($(".redactor-in-0").html());
         };
    $scope.databiding_description = function (){
        $scope.questions_list[$scope.questionIndex].question_description
        = $(".redactor-in-1").html();
     };
    $scope.load_redactor_text_data = function (){
          $timeout(function(){
            var redactorIn = $(".redactor-in");

            redactorIn.each(function(i){
              if( i >= 2 ) {
                $(this).bind("keyup input change" , function (){
                    var answerIndex = i ;
                    $scope.databiding_answers($(this) , answerIndex - 2 );
                });
              }

            });
          },3000 );
        };
    $scope.dragged_items = function (evt){

                       $http({
                       url : $scope.api_url_init_id_date ,
                       method : "GET"
                     }).then(function(resp){
                       $scope.mongoose_id = resp.data.id;
                       $scope.mongoose_answer_id = resp.data.id_1;
                       $scope.mongoose_date = resp.data.date;;
                       $scope.unique_ids = resp.data.list_of_ids ;

                       $scope.drag_drop_status = false;
                       var htmlVal = $("#docQuestions").find(evt.item);
                        $("#docQuestions").css({
                          background :"transparent"
                        });

                       // ==> push and update indexes in array
                       var itemType = $(evt.item).attr('data-type');
                       var questionType = $(evt.item).attr('data-question-type');
                       var questionId = htmlVal.attr("data-question-id");




                       var new_question = {
                           _id:$scope.mongoose_id,
                           question_type :questionType,
                           question_body :"Add your question here !",
                           enable_description : $scope.enable_description ,
                           created_at :$scope.mongoose_date,
                           answer_settings : {
                               answer_char_max : 200 ,
                               choice_style : true , // ==> inline or block
                               is_randomized : false,
                               is_required : false,
                               single_choice : true,
                               super_size : false
                           },
                           answers_format : []
                         };
                         console.log("Check de india");
                         console.log(new_question);
                         // Push Default answer ( one answer )
                         var answer_obj = new Object() ;
                         if($scope.application_type == 0 )
                         answer_obj['is_correct'] = false ;

                         answer_obj['_id'] = $scope.mongoose_answer_id  ;
                         var obj_2_id = $scope.mongoose_answer_id.toString()+'12f' ;
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
                             '_id': obj_2_id ,
                             'creator_id' : $scope.user_id ,
                             'is_correct' : true ,
                             'boolean_type' : "true/false" ,
                             'boolean_value': true
                           });
                         }
                         if(questionType == 3 ){
                           var rating_scale = $(evt.item).attr("data-asnwer-type") ;
                           // case it scale should take ==> 0 else 1
                           answer_obj['ratscal_type'] = rating_scale ;
                           answer_obj['step_numbers'] = 5 ;
                           if(rating_scale == 0 ){ // show labels for scale values
                               answer_obj['show_labels'] = false ;
                               answer_obj['started_at'] = "Left label" ;
                               answer_obj['centered_at'] = "Center label" ;
                               answer_obj['ended_at'] = "Right label" ;
                           }
                         }
                         if(questionType == 4 ){
                             new_question.answer_settings.answer_char_max = 500 ;
                         }
                          console.log(new_question);
                         new_question.answers_format.push(answer_obj);
                          console.log(new_question.answers_format);
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
                       } // End Mmongodb Ids



                       // $timeout(function (){
                       //   var html_loader =
                       //     '<div class="loader-xc"><span></span><span></span><span></span></div>'
                       //     // htmlVal.html(html_loader);
                       // } , 500 );
                       $timeout(function (){
                         // sorting element with angular elements
                         var index_in_array = evt.newIndex;
                         $scope.questions_list.splice(index_in_array,0, new_question );

                       } , 300 );
                       // =>> Transfeer data into mongoDB
                       $timeout(function (){
                         // sorting element with angular elements
                         var index_in_array = evt.newIndex;

                         // Removing catches that stored from sortable
                         // htmlVal.find("ul.question-option").find("li.right").addClass("animated bounceIn");
                         htmlVal.remove();


                         // storing array that has all questions into our db
                         if(itemType == 'qst'){
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
                                 $scope.question_object_that_added = new_question ;
                                 $scope.edit_this_question(resp.data._id , evt.newIndex  );
                             } , function(err){
                               console.log(err);
                             });
                           });
                         }
                       } , 300 );

                     },function(err){
                       console.log(err);
                   });

                   $scope.loading_redactor_editor();
               };
    $scope.edit_this_question = function ( qs_id  , qsCurrIndex , nextIndex = null){


                $scope.question_id = qs_id ;
                if(nextIndex == null ){
                    $("#docQuestions").children("li").each(function (){
                      ( $(this).hasClass("highlighted-question")  ) ?
                        $(this).removeClass("highlighted-question")
                        : null ;
                    });
                    $("#docQuestions").children("li").eq(qsCurrIndex).addClass("highlighted-question");
                }
                  var right_part = $(".right_part").css("display");
                   if(right_part == "none")
                   {
                     $scope.hide_loader();
                   }
                 $scope.questionIndex = qsCurrIndex ;
                 $scope.question_id = qs_id ;
                 $scope.indexes = 1 ;

                 var taget_question = $scope.questions_list.find($scope.callback_index);

                 if (taget_question == undefined )
                   taget_question = $scope.question_object_that_added ;

                 if( taget_question.answers_format.length > 1 ){
                     $scope.indexes = taget_question.answers_format.length ;
                 }
                 $(".redactor-in-0").html('');
                 $(".redactor-in-1").html('');
                 $scope.question_id = taget_question._id;
                 $scope.question_type = taget_question.question_type;
                 $scope.old_question_data = taget_question.question_body ;
                 $(".redactor-in-0").html( taget_question.question_body );
                 $(".redactor-in-1").html(taget_question.question_description);
                 // 2 ==> media parts
                 $scope.question_media = taget_question.media_question ;
                 $scope.quest_media_parts = taget_question.media_question ;
                 // 3 ==> answer part
                 $scope.asnwers = taget_question.answers_format;
                 console.log($scope.asnwers );
                 $scope.question_settings = {
                    is_required           : taget_question.answer_settings.is_required ,
                    single_choice   : taget_question.answer_settings.single_choice ,
                    is_randomized          : taget_question.answer_settings.is_randomized ,
                    super_size         : taget_question.answer_settings.super_size ,
                    choice_style      : taget_question.answer_settings.choice_style
                  }

                // 4 ==> store rating scale values  to ui desing
              $timeout(function (){
                if($scope.question_type == 3 ){
                  if($("#docQuestions").children('li').length == 0 )
                    $scope.questionIndex = 0;

                    alert($scope.questionIndex);
                    console.log("LENGTH :- " + $("#docQuestions").children('li').length);
                    console.log("1 SET QS ::--");
                    console.log($scope.questions_list[$scope.questionIndex]); // giving me "undefined"
                    console.log("2 SET QS ::--");
                    console.log($scope.questions_list); // => giving me "questions array"
                  $scope.change_rating_scale_value($scope.questions_list[$scope.questionIndex].answers_format[0].step_numbers);
                }
              } , 4200);
                var media_block = $(".media-x-preview"); // => preview div
                var show_media_link = $(".show_media_link"); // => input
                media_block.html('');
                show_media_link.val('') ;
                show_media_link.css("display","none");
                $scope.loading_redactor_editor();

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

      };
    $scope.rating_scale_values = function (){
      $timeout(function (){
        if($scope.question_type == 3 ){
           $scope.change_rating_scale_value($scope.questions_list[$scope.questionIndex].answers_format[0].step_numbers);
        }
      } , 5000 );
    };
    // $scope.redactor_menu_position = function (evt){
    //   if($scope.selected_passage != null ) {
    //     var currentPosition ;
    //
    //     if ($scope.current_editor_index == 'redactor-in-0'){ // ==> Question
    //         currentPosition = $('.redactor-in-0').offset();
    //     }
    //     if ($scope.current_editor_index == 'redactor-in-1'){ // ==> Description
    //         currentPosition = $('.redactor-in-1').offset();
    //     }
    //     if ($scope.current_editor_index != 'redactor-in-0' && $scope.current_editor_index != 'redactor-in-1'){ // ==> Answers
    //         currentPosition = $('.'+$scope.current_editor_index).parent('.redactor-box').parent(".text-answers").parent('div').parent('li.answers_x').offset();
    //     }
    //
    //     $("#redactor-editor-menu").css({
    //           top   : currentPosition.top   - 60  ,
    //           left  : currentPosition.left - 40
    //      });
    //     $("#redactor-editor-menu").css("display","block");
    //   }
    // };
    // $scope.show_redactor_menu_out_timeframe = function (){
    //   $(".redactor-in").on("keyup mouseup click" , function (evt){
    //     var sel = window.getSelection()
    //
    //     if (sel.rangeCount === 0 || sel.isCollapsed || sel.toString() == null || sel.toString() == ' ') return ;
    //       // show redator menu according to the current position
    //     $scope.selected_passage     = sel.toString() ;
    //     $scope.current_editor_index = $(this).prop('className').split(' ').pop();
    //
    //     // $scope.redactor_menu_position(evt);
    //   });
    // };
    // $scope.show_redactor_menu_options_in_timeframe = function (opt = null){
    //   if(opt != null ){
    //     $timeout(function (){
    //       $scope.show_redactor_menu_out_timeframe();
    //     } , 250 );
    //   }else {
    //     $timeout(function (){
    //       $scope.show_redactor_menu_out_timeframe();
    //     } , 2500 );
    //   }
    // };


    // ==> do an action with scope object
    $scope.window_navigation.on("load" , function (){
        $scope.close_iconx.trigger("click");
        $timeout(function (){
          $scope.settings_menu.css("display" , "block" );
        }, 500);
    });
    // $scope.window_navigation.on('keyup keydown' , function (){
    //   $("#redactor-editor-menu").css("display" , "none");
    // });
    $scope.close_settings_menu_handler.on("click" , function (){
        var target_iconx = $(".close-menu-icon");
        if(target_iconx.hasClass("fa-times") == true )
          $scope.collapse_menu_settings(target_iconx) ;
          else
          $scope.expand_menu_settings(target_iconx) ;
      });
    $scope.window_navigation.resize(function(){
      $scope.settings_menu.css({width:$scope.window.settings_menu});
      });
    $scope.window = {
          current_window  : $(window).width()  ,
          settings_menu   : $(".left_part").width() - 28
        };
    $scope.window_navigation.bind("beforeunload" , function (e){
        if( $scope.unsaved_question != false ){
          return false ;
        }
      });
    $scope.window_navigation.bind("load" , function (){

            // $scope.loading_redactor_editor();

            $timeout(function (){

              if($scope.questions_list[0] != null && $scope.questions_list != null && $scope.questions_list.length > 0){
                var first_question = $scope.questions_list[0];
                $scope.edit_this_question  ( first_question._id  , 0 ) ;
              }

              $R('.redactor-editor' , {
                 callbacks : {
                  start : function (){
                    if( $scope.questions_list != null ) {
                        $timeout(function (){
                          if($scope.questions_list[$scope.questionIndex] != undefined ){
                            var targetQuestion = $scope.questions_list[$scope.questionIndex].question_body;
                            $(".redactor-in-0").html(targetQuestion);
                            var description_ = $scope.questions_list[$scope.questionIndex].question_description;
                             $(".redactor-in-1").html(description_);
                          }
                        } , 200);
                    }
                  }
                 } ,
                 plugins: ['fontcolor' , 'fontsize'] ,
                 buttons: ['font','bold' , 'italic', 'underline' , 'link' , 'html'] ,
                 paragraphize: false,
                 replaceDivs: false,
                 linebreaks: false,
                 enterKey: false ,
                 minHeight : '90px' ,
                 toolbarExternal: '#redactor-editor-menu'
              });


              // $(".redactor-in-0").bind("keyup" , function (){
              //   $scope.databiding_question();
              // });

              $(".redactor-in-0").bind("input , change , keyup" , function (){
                $scope.databiding_question();
              });

              // $(".redactor-in-1").bind("keyup" , function (){
              //   $scope.databiding_description();
              // });

              $(".redactor-in-1").bind("input , change , keyup" , function (){
                $scope.databiding_description();
              });

            } , 1300 );
        });
    $scope.expand_collapse_handler.on("click" , function (){
        var target = $(this).next(".control-item-content") ;
        var target_index = $(this).parent("li").index();

       $scope.expand_collapse_handler.each(function(i){
         var this_index = $(this).parent("li").index();
         var this_item = $(this).next(".control-item-content") ;
         if(this_item.css("display") == "block" && this_index != target_index ){
           this_item.slideUp();
         } else  if(this_item.css("display") == "block" && this_index == target_index ) {
           target.slideUp();
         }
       });
        if(target.css("display") == "none")
            target.slideDown();
      });
    $scope.video_handler.on("click",function(){
        $scope.file_object['media_type'] = 1 ;
        $(".media-inputs").css({display:'block'});
      });
    $scope.image_handler.on("click", function (){
        $(".image-uploader-x").trigger("click");
      });
    $scope.show_selected_text.on("keyup mousedown mousemove mouseup" , function (e){
        var range = $(this).getSelection();
        $scope.selected_text = range.text ;
     });
    $scope.upload_handler.on("change" , function (){
        // ====>>> Uploading media
        $scope.file_object['media_type'] = 0 ;
        $scope.file_object['file'] = $(this)[0].files[0];


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

            if($scope.question_id == null ) {
              alert("You've to select question first from question list to allow you edit it !");
              return false ;
            }
            if($scope.model_type == 'questions'){ // => Case Question Images
              var found_qs = $scope.questions_list.find($scope.callback_index);
              var targetIndex = $scope.questions_list.indexOf(found_qs);


              $scope.data_object = null ;
              $scope.data_object = new FormData();
              $scope.data_object.append("creator_id" , $scope.user_id );
              $scope.data_object.append("question_id" , $scope.question_id );
              $scope.data_object.append("media_field" , $scope.file_object.file );
              $scope.headers["Content-Type"] = undefined ;
            } else { // => Case Answer Image

              $scope.headers["Content-Type"] = undefined ;
              $scope.data_object = null ;
              $scope.data_object = new FormData();
              $scope.data_object.append("creator_id" , $scope.user_id );
              $scope.data_object.append("question_id" , $scope.question_id );
              $scope.data_object.append("answer_id" , $scope.answer_id );
              $scope.data_object.append("media_src" , $scope.file_object.file );

            }
            // ===> Upload Image
            if($scope.file_object['file'] != null ) {
              var reader = new FileReader();
              var thisReader = reader.readAsDataURL($scope.file_object['file']);
              reader.onload = function (e){
                var image_src = e.target.result ;

                if($scope.model_type == 'questions'){
                      // Thumbnail
                      // $(".media-changeable-img-case").css({
                      //     "background-image" : "url('"+image_src+"')"
                      // });
                 }else {
                    // nothing to show here , we need to upload it directly !
                 }

                 // Preview Image
                 var  image_iframe = "<div style='background:url("+image_src+")' class='emb-image-case public-media'></div>" ;
                 var preview_box = $(".media-x-preview");
                 preview_box.html(image_iframe);
              };
            }
        });

    // ==> do an action with calling elements
    // $("html , body").on("click" , function (evt){
    //   var hasThisClass =  evt.target.className.includes('redactor-in');
    //
    //   if(hasThisClass == true )
    //     return;
    //
    //   $("#redactor-editor-menu").css({display :"none"});
    //
    // });
    $("#editor-question-body").on('input' , function (){
         $scope.unsaved_question = true ;
      });
    $("#show-labels").on("input,change" , function (){
        var checked_value = $scope.questions_list[$scope.questionIndex].answers_format[0].show_labels ;
        console.log(checked_value);
        if(checked_value == true ) { // show labels
          $(".item-labels").slideDown();
          $(".block-labels").css("display" , "block");
        }else { // remove labels
          $(".block-labels").css("display" , "none");
          $scope.questions_list[$scope.questionIndex].answers_format[0].started_at  = '';
          $scope.questions_list[$scope.questionIndex].answers_format[0].centered_at = '';
          $scope.questions_list[$scope.questionIndex].answers_format[0].ended_at    = '';
          // hide labels
          $(".item-labels").slideUp();
        }
      });
    $("#MultipleResponse-option , #Randomize-option , #SuperSize-option , #required-option").on("input change",function(){

      if($scope.question_id == null )
      {
        alert("Please select question first from question list !");
        return false ;
      }

       var question_selected = $scope.questions_list.find($scope.callback_index);
       question_selected.answer_settings = $scope.question_settings ;

       var targetIndex = $scope.questions_list.indexOf(question_selected);
       if(targetIndex != -1 ){
         $scope.questions_list.splice(targetIndex, 1);
       }

       if(question_selected.answer_settings.single_choice == true ) {
         var all_answers = question_selected.answers_format;
         console.log(all_answers);
         for (var i = 0; i < all_answers.length; i++) {
             all_answers[i].is_correct = false;
         }
       }

       $scope.questions_list.splice(targetIndex, 0, question_selected);
       console.log($scope.questions_list);
     });
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
    $(".media-changeable-img-case").on("click" , function (){
        $(".box-overlay").fadeIn();
      });
    $(".show_media_link").on("change" , function (){
            // ====>>> Uploading media
            $scope.file_object['media_type'] = 1 ;
            $scope.file_object['link'] = $(this).val();

            // LOADING PAGE
            var loader = '<div class="media-loader-spinner"><div class="spinner">'+
                          '<div class="rect1"></div>'+
                          '<div class="rect2"></div>'+
                          '<div class="rect3"></div>'+
                          '<div class="rect4"></div>'+
                          '<div class="rect5"></div>'+
                        '</div>' +
                        '<span class="title-loader">Please wait while extract video url !</span></div>';

            var preview_box = $(".media-x-preview");
            preview_box.html(loader);

            $timeout(function (){
              var video ;
              if($scope.model_type == 'questions'){ // => Question
                $scope.data_object = null ;
                $scope.data_object = new Object();
                $scope.data_object['creator_id']  =  $scope.user_id ;
                $scope.data_object['question_id'] =  $scope.question_id ;
                $scope.data_object['media_field'] =  $scope.file_object.link ;
                video = $scope.data_object['media_field'] ;
              } else { // => Answer
                $scope.data_object = null ;
                $scope.data_object = new Object();
                $scope.data_object['creator_id']  =  $scope.user_id ;
                $scope.data_object['question_id'] =  $scope.question_id ;
                $scope.data_object['answer_id'] =  $scope.answer_id ;
                $scope.data_object['media_src'] =  $scope.file_object.link ;
                video = $scope.data_object['media_src'] ;
              }


              var videoType = null ;
              var videoId = null ;
              var video_src_value = null;
              if( video.toLowerCase().includes("youtube")    == true   ) {
                videoType = 0 ; // => youtube
                var idWithLastSplit = video.lastIndexOf('?');
                var videos = video.substr(idWithLastSplit + 1);
                var lastId = videos.substr(0, videos.indexOf('&'));

                if(lastId != '' || lastId )
                  videoId = lastId ;
                else
                  videoId = videos ;

                var afterEqualChar = videoId.lastIndexOf('=');
                videoId = videoId.substring(afterEqualChar + 1);
                video_src_value = "http://youtube.com/embed/"+ videoId ;
              }
              else if( video.includes("vimeo") == true   ) {
                videoType = 1 ; // => vimeo
                var n = video.lastIndexOf('/');
                videoId = video.substring(n + 1);
                video_src_value = "https://player.vimeo.com/video/"+ videoId;;
              }
              else if( video.includes(".mp4")  == true   ) {
                videoType = 2 ;
                videoId = null;

                video_src_value = video.substring(0, video.lastIndexOf('.'));
              }

              var media_iframe ;
              switch (videoType) {
                case 0 : // youtube
                    media_iframe = '<iframe class="iframe" width="100%" src="'+video_src_value+'"    height="250px" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' ;
                break;

                case 1 : // Vimeo
                    media_iframe = '<iframe class="iframe" width="100%" src="'+video_src_value+'"    height="250px" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' ;
                break;

                case 2 : // mp4
                    media_iframe = '<video width="100%" height="auto" controls>'
                                   + '<source src="'+video_src_value+'.mp4" type="video/mp4">'
                                   + '<source src="'+video_src_value+'.ogg" type="video/ogg">'
                                   + 'Your browser does not support the video tag.'
                                   + '</video>'
                break;
              }
              preview_box.html(media_iframe);
            } , 1200 );

          });
    $(".text-loader , .loading-data").delay(5000).fadeOut();

    // ==> excute an actions with timeframes
    $timeout(function (){
      $scope.style_of_answers = ($scope.question_settings.choice_style ) ? "Two columns per row" : "One column per row";
      } , 1500 );
      $scope.change_rating_scale_value = function (val){
        var rating_value = val;
        $scope.rating_scale_elements = [];
        for( i=0; i<rating_value; i++){
          $scope.rating_scale_elements.push({
             index : i
          });
        }
      };
    $timeout(function (){

      $(document).bind("selectionchange  , click" , function (evt){
         var target_class ;
         var sel = window.getSelection();
         // what mouse click for !
         if(evt.target != null ){
             if(evt.target.className){
               target_class = evt.target.className.split(' ').pop() ;
             }else {
               if(evt.target.parentNode != null ){
                 if(evt.target.parentNode.className){
                   target_class = evt.target.parentNode.className.split(' ').pop()  ;
                 }
               }
             }
             if( target_class != undefined && sel != null && sel != '' && target_class.includes("redactor-in-") != false ){
               var offset = $('.'+target_class).offset();
               $("#redactor-editor-menu").css({
                 left : offset.left - 40   ,
                 top : offset.top - 80 ,
                 display : 'block'
               });
             }else
             $("#redactor-editor-menu").css("display" , "none");
         }else {
            $("#redactor-editor-menu").css("display" , "none");
         }
      });

      // $("input[type='range']").on("change , input", function  (evt){
      //   $scope.change_rating_scale_value($(this).val());
      // });


      // $('html , body').on('click' , function (evt){
      //     var classes = evt.target.className.split(' ') ;
      //     if(classes[1]){
      //       if (classes[1] != "redactor-in"){
      //         $('#redactor-editor-menu').css('display','none');
      //       }
      //     }
      // });

    } , 6000);

    // ==> Do an action
    $scope.status_of_questions();
    $scope.load_redactor_text_data();
    $scope.rating_scale_values();
    $scope.settings_menu.css({width:$scope.window.settings_menu});

    // ==> Excute a funcs from a plugins
    Sortable.create($scope.sort_handler , {
       ghostClass: 'shadow_element' ,
       group: "question-list" ,
       disabled: false ,
       animation: 250 ,
       handle: '.drag-handler',
       onStart : function (evt){
         $scope.hide_loader ();

       } ,
       onEnd : function (evt){

         var itemEl = evt.item;
         var newIndex = evt.newIndex;
         var oldIndex = evt.oldIndex;


         $scope.question_id = $(itemEl).attr("data-question-id");
         var question_sor = $scope.questions_list.find($scope.callback_index);

         $scope.edit_this_question ( $scope.question_id  , newIndex ) ;

         $scope.highlighted_question_and_show_data (newIndex , itemEl);

          $("#docQuestions").children("li").each(function (){
            ($(this).hasClass("highlighted-question")) ?
              $(this).removeClass("highlighted-question") : null ;
          })

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
    Sortable.create($scope.sortble_draggable_handler , {
         sort: false,
         disabled: false,
         animation: 180 ,
          group: {
             name: "question-list",
             pull: "clone",
             revertClone: false,
         },
         onStart : function (evt){

            $scope.hide_loader();
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
               background:"ghostwhite"
             });
           }

          } ,
          onEnd : function (evt){
            return $scope.dragged_items(evt);
          },
          onMove : function (evt){

             var dragged = evt.dragged;
                 var draggedRect = evt.draggedRect;
                 var related = evt.related;
                 var relatedRect = evt.relatedRect;

             var ParentID = $(dragged).parent().prop("id");
             var ParentEl = $(dragged).parent();
             if(ParentID == "qs-sortable") {
               ParentEl.find(dragged).html("");
               // set animation
               ParentEl.find(dragged).addClass("animated wobble");

               ParentEl.find(dragged).css({
                 minHeight : '40px' ,
                 background : "ghostwhite"
               });
             }

          } ,
        }); // end sortable draggable

}]);
