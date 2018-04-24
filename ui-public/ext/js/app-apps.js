
//==> Apply html tags
apps.filter ("apply_html" , [
  '$sce' , function ($sce){
    return function (text_changed){
      return $sce.trustAsHtml(text_changed);
    }
  }
]);
// ==> This filter to fix javascript issue ( that show in browser console )
apps.filter("image_w_server" , [
  "$timeout" ,"$sce"  ,
  function ( $timeout  , $sce   ){
      return function (img_source){
        var current_server = $("#serverIp").val() ;
        var default_image = current_server + "img/media-icon.png";

        if (img_source == default_image){
          return img_source ;
        }else {
          // alert(current_server + 'themeimages'+img_source.split('themeimages').pop());
          return current_server + 'themeimages'+img_source.split('themeimages').pop() ;
        }
      };
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
      var div = $("<div>"+ specs + "</div>");
      var text_values = div.text() ;
      var spesificChars = '' ;
      var char_counts = 35 ;

      if( text_values == undefined )
        spesificChars = text_values ;
        else {
            for (var i = 0; i < text_values.length; i++) {
              if(i < char_counts) {
                spesificChars += text_values[i];
                if(i == (char_counts - 1) )
                  spesificChars += " ... ";
              }
            }
        }

      // spesificChars =  spesificChars.textContent || spesificChars.innerText || "";
      // remove ( &nbsp; ) from text

       return spesificChars ;
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
        // ng:bind:html = "value | filter"
       return $sce.trustAsHtml(spesificChars);
    }
  }
]);
apps.filter('trust_this_html_values' , [
  '$sce' , function ($sce){
    return function (returned_val){
       return $sce.trustAsHtml(returned_val);
    }
  }
]);
apps.controller("apps-controller" , ['$scope','$http' , '$timeout','$window','$rootScope' , '$sce', ($scope , $http , $timeout , $window , $rootScope , $sce) => {
  try {



    // ==> Vars in scope $R
    $scope.iframe_object = null ;
    $scope.rating_scale_elements = [] ;
    $scope.rating_values = null ;
    $scope.questions_list = null ;
    $scope.window_navigation = $(window);
    $scope.generated_media_box_handler = $(".box-data");
    $scope.close_iconx = $(".setting-iconx");
    $scope.settings_menu = $(".settings_menu") ;
    $scope.questions_list_box = $(".left_part");
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
    $scope.spesific_chars = null ;
    $scope.__player_object     = null;
    $scope.timeFrame = 0;
    $scope.left_part_position  = $scope.questions_list_box.width() + 21 ;
    $scope.sort_handler = document.getElementById("docQuestions");
    $scope.sortble_draggable_handler = document.getElementById("qs-sortable");
    $scope.expand_collapse_handler =   $(".app-settings li .control-item-header") ;
    $scope.switching_editor_preview_value = true ;
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
    $scope.slide_screens = null ;
    $scope.json_source = $scope.server_ip + "ext/json/json-keys.json";
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
             value : "30" ,
             timer_type : false ,
             timer_layout : 0 ,
             hours : 0 ,
             minutes : 29 ,
             seconds : 59
           },
           progression_bar : {
             is_available:false ,
             progression_bar_layout:0
           } ,
           expiration : {
             is_set : false  ,
             through_time : 3 , // => it will be per day
             title : "This quiz will expire after"
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
           updatedAt : new Date ()
         }
            }
    $scope.question_settings = {
      is_required           : false ,
      single_choice  : false ,
      is_randomized          : false ,
      super_size         : false ,
      choice_style : false  //
                }
    $scope.labels = [  'a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
    $scope.seconds = 9 ;
    $scope.minutes = 0;
    $scope.hours = 0 ;
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
    $scope.url_application = $scope.server_ip + "api/" + $scope.app_id +'/application/retrieve';


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



                    if(mongo_settings.time_settings.seconds != null)
                    settings_obj['settings']['time_settings']['seconds'] = mongo_settings.time_settings.seconds;
                    else // default
                    settings_obj['settings']['time_settings']['seconds'] = $scope.application_settings.settings.seconds;


                    if(mongo_settings.time_settings.minutes != null)
                    settings_obj['settings']['time_settings']['minutes'] = mongo_settings.time_settings.minutes;
                    else // default
                    settings_obj['settings']['time_settings']['minutes'] = $scope.application_settings.settings.minutes;

                    if(mongo_settings.time_settings.hours != null)
                    settings_obj['settings']['time_settings']['hours'] = mongo_settings.time_settings.hours;
                    else // default
                    settings_obj['settings']['time_settings']['hours'] = $scope.application_settings.settings.hours;

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

                  if(mongo_settings.expiration != null ){

                    if(mongo_settings.expiration.is_set != null)
                      settings_obj['settings']['expiration']['is_set'] = mongo_settings.expiration.is_set ;
                    else
                      settings_obj['settings']['expiration']['is_set'] = $scope.application_settings.settings.expiration.is_set;

                    if(mongo_settings.expiration.through_time != null)
                    settings_obj['settings']['expiration']['through_time'] = mongo_settings.expiration.through_time ;
                    else
                    settings_obj['settings']['expiration']['through_time'] = $scope.application_settings.settings.expiration.through_time;

                    if(mongo_settings.expiration.title != null)
                    settings_obj['settings']['expiration']['title'] = mongo_settings.expiration.title ;
                    else
                    settings_obj['settings']['expiration']['title'] = $scope.application_settings.settings.expiration.title;
                  } // end expiration date for this quiz



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

                  if(mongo_settings.auto_slide != null ){
                    settings_obj['settings']['auto_slide'] = mongo_settings.auto_slide;
                  }else
                  settings_obj['settings']['auto_slide'] = $scope.application_settings.settings.auto_slide;

                  if(mongo_settings.allow_touch_move != null ){
                    settings_obj['settings']['allow_touch_move'] = mongo_settings.allow_touch_move;
                  }else
                  settings_obj['settings']['allow_touch_move'] = $scope.application_settings.settings.allow_touch_move;



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
                  // //console.log($scope.application_settings);
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
    $scope.time_tracker_layout = () => {
      var layout_template = $scope.__player_object.settings.time_settings.timer_layout;
      return '/time-layouts/layout-'+layout_template+'.hbs';
    };
    $scope.progression_layout = () => {
       var layout_template = $scope.__player_object.settings.progression_bar.progression_bar_layout;
       return '/progressbar-layouts/layout-'+layout_template+'.hbs';
     };
    $scope.load_application_for_preview = () => {
      // alert($scope.url_application );
          $http({
            url : $scope.url_application ,
            type : "GET" ,
            headers : $scope.api_key_headers
          }).then(function(resp){
            $scope.__player_object = resp.data ;

          },function(err){ console.log(err); });
      };
    $scope.load_application_keys = () => {
        $.getJSON( $scope.json_source , function (apk_keys){
          $scope.api_key_headers = {
            "X-api-app-name":apk_keys.APP_NAME ,
            "X-api-keys":apk_keys.API_KEY
          }
           $scope.api_key_headers ;
           // ==> calling funcstionalities
           $scope.load_application_for_preview();
           // ...
        });
      }
    $scope.swal_message = function (){
      if($scope.unsaved_question) {
          $(".swal-overlay").fadeIn();
           swal({
            text: "Would you like to save the last changes ?",
            icon: "warning",
            buttons: ["No" , "Save Changes"],
            dangerMode: true
          }).then((saving) => {

          if (saving) {
          // ==> Saving current change
          swal("Question has been saved successfully", {
            icon: "success",
            buttons: false,
          });

          $("#saving-changes").trigger("click");

        }else {

          var all_old_questions = $scope.questions_list;
          for (var i = 0; i < all_old_questions.length; i++) {
            // Questions !!
            var qs_body = all_old_questions[i].question_body;
            $("#docQuestions").children("li").eq(i).children(".question-part").children('.qs-type').children('.single-question-container').
            children('.qs-body').html(qs_body);

          }
        }
        $(".swal-overlay").fadeOut(1000);

      });;
      }


    }
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
      if(is_correct && $scope.application_type == 1 )
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
                                      // //console.log(  media_block.find('iframe').html());
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
          // //console.log(target_answer);
          if(target_answer.media_src  == $scope.server_ip + "img/media-icon.png" ){
            var no_media = "<b class='no-media'>There is no media ! </b>"
             media_block.html(no_media);
          }else {
            // //console.log("/*/*/*/*/*//*/*/*/*/*/*/*/*/*/*///*");
            // //console.log(target_answer);
            // //console.log("/*/*/*/*/*//*/*/*/*/*/*/*/*/*/*///*");
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
          // //console.log(target_answer);
          // ('Answer Details');
          // //console.log(target_answer);
          // //console.log(">>>-----*************************----<<<");
          // // ========> Show values related this part
          // //console.log($scope.file_object);
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
         $(".question-opener").trigger("click");
         $(".loader-container").fadeOut(6000);
       });
    };
    $scope.onclick_items = function (elementId){
        var evt = {
          item      :  $("#"+elementId) ,
          newIndex  :  ( $("#docQuestions li" ).length > 0 ) ? $("#docQuestions li" ).length  : 0
        }
        return $scope.dragged_items(evt);
      };
    $scope.unsaved_question_x = function (new_vals , for_this_setting = null ){
        $scope.unsaved_question = true;
        $scope.questions_list[$scope.questionIndex].answer_settings = $scope.question_settings;
    };

    $scope.create_new_answer = function (){

      if($scope.question_id == null ){
        alert("Please select question from question list");
      }
      $scope.unsaved_question = true ;
      var question_selected = $scope.questions_list.find($scope.callback_index);
      var answer_length = question_selected.answers_format.length ;
      // //console.log(answer_length);
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
      var new_answer  = {
           is_correct: false,
           _id : $scope.unique_ids[$scope.indexes]
      };

         if($scope.question_type == 0 )
            new_answer['value'] = "Answer " + $scope.indexes;

         if( $scope.question_type == 1 )
          new_answer['media_src'] = $scope.server_ip + "img/media-icon.png" ;

           question_selected.answers_format.push(new_answer);
      //console.log(question_selected);
      $timeout(function () {
          $scope.loading_redactor_models("answer");

      }, 200);

    };
    $scope.question_answer_deletion = function (answer_id){
      // ==> This Answer
      $scope.answer_id = answer_id ;
      var question_selected = $scope.questions_list.find($scope.callback_index); //heeer
      var answer_selected = question_selected.answers_format.find($scope.callback_answer_index);
      //console.log(answer_selected);
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
        //console.log(answer_selected);
        if( question_selected.question_type == 2 ){
          var all_answers = question_selected.answers_format;
          for (var i = 0; i < all_answers.length; i++) {
            all_answers[i].is_correct = false;
          }
          answer_selected.is_correct = !answer_selected.is_correct ;
          //console.log(answer_selected);
          return false ;
        }


        // let's excute our func here
        if(question_selected.answer_settings.single_choice == true ) { // only one response
          var all_answers = question_selected.answers_format;
          //console.log(all_answers);
          for (var i = 0; i < all_answers.length; i++) {
            all_answers[i].is_correct = false;
          }
          answer_selected.is_correct = !answer_selected.is_correct ;
        }else { // multiple response
          answer_selected.is_correct = !answer_selected.is_correct ;
        }

      };
    $scope.save_changes_in_angular_backend = function ( decline_next = null ){

        // ==> Save the quiz settings
        $scope.application_save_settings();

        $scope.unsaved_question = false;
        // ==> Storing Data related redactors into ( angular backend )

        // --> 1 Answers
        if($scope.questions_list.length != 0) {
              if($scope.question_type == 0 ){ // => Saving text answers

                  var answers = $R(".answer-redactor-editors-x" , "source.getCode");
                  var ang_backend_answer_arrgs = $scope.questions_list[$scope.questionIndex].answers_format ;
                  for (var i = 0; i < ang_backend_answer_arrgs.length; i++) {
                    ang_backend_answer_arrgs[i].value = answers[i];
                  }
              }

            // --> Question
            var question = $R("#editor-question-body" , "source.getCode");
            $scope.questions_list[$scope.questionIndex].question_body = question;

            var description = $R("#editor-question-desc" , "source.getCode");
            $scope.questions_list[$scope.questionIndex].question_description = description;
        }
        //console.log($scope.questions_list); #editor-question-body , #editor-question-desc
          // //console.log($scope.questions_list);
          if($scope.question_id == null ){
            alert("You should select question from question list to allow you edit it");
            return false ;
          }

          var changes_button = $(".save_changes");
          changes_button.html("<span class='saving_option'></span> Saving Changes");
          changes_button.css("padding-left","40px");

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
                  $(".save_changes").css("padding-left","5px");
                    changes_button.html("Save Changes");
                    // //console.log(old_question_list);
                    // $scope.questions_list = resp.data.questions ;
                    // $scope.mongodb_questions = resp.data.questions ;


                    // ==> Ignore next question
                    // if ( decline_next == null ){
                    //       // GO TO NEXT Question
                    //       var found_qs = $scope.questions_list.find($scope.callback_index);
                    //       var targetIndex = $scope.questions_list.indexOf(found_qs);
                    //       if(targetIndex != -1 ) {
                    //         if($scope.questions_list.length > ( targetIndex ) ) {
                    //           var next_question = targetIndex + 1 ;
                    //           if ( $scope.questions_list[next_question] != undefined )
                    //           $scope.edit_this_question($scope.questions_list[next_question]._id , next_question) ;
                    //         }
                    //       }
                    // }

                    // console.log("Save change button");
                    // console.log($scope.questions_list);
                    $scope.timeFrame = 0 ;
                },function(err){
                  //console.log(err);
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

      var redactor_start_text = $R(".screen-redactors-strt-txt" , "source.getCode");
      $scope.application_settings.settings.titles.title_start_with =redactor_start_text;
      var redactor_end_text = $R(".screen-redactors-end-txt", "source.getCode");
      $scope.application_settings.settings.titles.title_end_with = redactor_end_text ;
      var redactor_scs_text =  $R(".screen-redactors-scs-txt", "source.getCode");
      $scope.application_settings.settings.titles.title_success_with   = redactor_scs_text ;
      var redactor_fld_text = $R(".screen-redactors-fld-txt", "source.getCode");
      $scope.application_settings.settings.titles.title_failed_with = redactor_fld_text ;

      var saving_settings = $(".saving-settings-changes");
      saving_settings.html("<span class='saving_option'></span> Saving Changes");
      saving_settings.css("padding-left","40px");

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
                  saving_settings.css("padding-left","5px");
                  saving_settings.html("Save changes")
                //console.log(resp);
                  } , function(err){
                //console.log(err);

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
                      var qsItemIndex = $scope.questions_list.findIndex($scope.callback_index);
                      qsItem.media_question =success_data.data.Question_details.media_question ;

                      if(qsItemIndex == -1 ) return false ;

                      var media_objects = qsItem.media_question ;
                      var question_container =  $($scope.iframe_object).find(".question-container").eq(qsItemIndex);
                      var media_data = "<div class='question-media'>" ;
                          // var element = "<div class='question-media'>";
                          if(media_objects.media_type == 0 ){
                              media_data += "<div style='background-image:url("+$scope.server_ip+media_objects.media_field+")' class='image-media-case img-cases'></div>";
                          }
                          if(media_objects.media_type == 1) { // => video_type
                              if(media_objects.video_type == 0 ){ // => youtube
                                media_data += "<iframe src='"+media_objects.video_source+"' width='250px' height='160px'></iframe>";
                              }
                              if(media_objects.video_type == 1 ){  // => vimeo
                                media_data += "<iframe src='"+media_objects.video_source+"' width='250px' height='160px'></iframe>";
                              }
                              if(media_objects.video_type == 2 ){ // => mp4
                                alert("mp4 inProgress");
                              }
                          }
                      media_data += "</div>";

                          var media_question_s = question_container.find('.question-media') ;
                          if(media_question_s.length != 0 ) media_question_s.remove();

                          question_container.append(media_data);

                          console.log(media_objects);
                      //   if($scope.file_object.media_type == 0 ){
                          // var image_iframe = '<div style="background-image:url('+success_data.data.Media_directory+')" class="image-case img_">';
                          // ==> Image : success_data.data.Media_directory

                        // }else {
                        //   //console.log(success_data.data);
                        //   var  videoTypeX =  success_data.data.Question_details.media_question.video_type ;
                        //   var  video_src_value = success_data.data.Question_details.media_question.video_source ;
                        //   var  video_media_iframe ;
                        //
                        //   //console.log(success_data.data.Question_details.media_question);
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
                        //console.log(target_question);
                        var target_answer = target_question.answers_format.find($scope.callback_answer_index);
                        //console.log(target_answer);
                        if( target_question.question_type == 1 ){
                              var answer_data = success_data.data ;

                              // Store it into scope object
                              $scope.answer_media = answer_data ;
                              // Store it into Array
                              target_answer = answer_data ;
                              // update the-array
                              var thisAnswer = $scope.questions_list.find($scope.callback_index).answers_format.find($scope.callback_answer_index);
                              //console.log(thisAnswer);
                              var currIndex = $scope.questions_list.find($scope.callback_index).answers_format.indexOf(thisAnswer);
                              //console.log(currIndex);
                              if(currIndex != -1 ){
                                $scope.questions_list.find($scope.callback_index).answers_format[currIndex] =
                                answer_data ;
                                //console.log("ANSWER DATA");
                                //console.log(answer_data);
                              }
                          }
                        if(target_question.question_type == 0 ){
                              var answer_data = success_data.data ;
                              var media_optional = answer_data.media_optional;
                              // //console.log(answer_data);
                              //  //console.log(media_optional);
                              // Store it into question list array
                              target_answer.media_optional = answer_data.media_optional ;
                              // Store it into scope object
                              $scope.answer_media = target_answer.media_optional ;
                              //console.log(target_answer.media_optional);
                          }

                      }

                    $(".media-imgvid-uploader").fadeOut();
                   } , function(error_data){
                        //console.log(error_data);
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
           // //console.log(found_qs);
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
                 //console.log(err);
               });
         });
       };
    // $scope.store_into_answer_array = function (targetIndex , targetRedactorData){
    //
    // };



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
                               choice_style : false , // ==> inline or block
                               is_randomized : false,
                               is_required : false,
                               single_choice : true,
                               super_size : false
                           },
                           answers_format : []
                         };

                         //console.log(new_question);
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
                         //console.log("answer_obj --- " + questionType);
                          //console.log(answer_obj);
                         new_question.answers_format.push(answer_obj);
                          //console.log(new_question.answers_format);
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
                               //console.log(err);
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

                                // Refresh iframe
                                var targetIframe = document.getElementById("live-preview-iframe");
                                if(targetIframe.length != 0){
                                  targetIframe.contentWindow.location.reload();
                                }

                                 $scope.question_object_that_added = new_question ;
                                 $scope.edit_this_question(resp.data._id , evt.newIndex  );
                             } , function(err){
                               //console.log(err);
                             });
                           });
                         }
                       } , 300 );

                     },function(err){
                       //console.log(err);
                   });


               };
    $scope.edit_this_question = function ( qs_id  , qsCurrIndex , nextIndex = null){


          if($scope.check_unsaved_data())
            $scope.timeFrame = 10000000000003000;
            else
            $scope.timeFrame = 0 ;
          // =========================

          // ==> Slide Into This index
           if($scope.iframe_object != null ){
            $($scope.iframe_object).find('input#cross_iframe_qs_index_value').val(qsCurrIndex + 1);
            $($scope.iframe_object).find('button#cross_iframe_qs_index_button').trigger('click');
           }
          $timeout(function(){
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

           $scope.question_id = taget_question._id;
           $scope.question_type = taget_question.question_type;
           $scope.old_question_data = taget_question.question_body ;

           // 2 ==> media parts
           $scope.question_media = taget_question.media_question ;
           $scope.quest_media_parts = taget_question.media_question ;
           // 3 ==> answer part
           $scope.asnwers = taget_question.answers_format;
           //console.log($scope.asnwers );
           $scope.question_settings = {
              is_required           : taget_question.answer_settings.is_required ,
              single_choice   : taget_question.answer_settings.single_choice ,
              is_randomized          : taget_question.answer_settings.is_randomized ,
              super_size         : taget_question.answer_settings.super_size ,
              choice_style      : taget_question.answer_settings.choice_style
            }

          // 4 ==> store rating scale values  to ui desing

          if($scope.question_type == 3 ){
              $timeout(function (){
                 if( $("#docQuestions").children('li').length <= 1  )
                  $scope.questionIndex = 0;
                  $scope.change_rating_scale_value($scope.questions_list[$scope.questionIndex].answers_format[0].step_numbers);
              } , 50 );
          }

          var media_block = $(".media-x-preview"); // => preview div
          var show_media_link = $(".show_media_link"); // => input
          media_block.html('');
          show_media_link.val('') ;
          show_media_link.css("display","none");


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
                 //console.log(err);
             });

             $timeout(function () {
                $('.redactor-in').each(function(i){
                  var thisAnswer = $(this);
                  if(i >= 2 ){
                      if(thisAnswer.hasClass('redactor-in-'+i)){
                        thisAnswer.html ( $scope.questions_list[$scope.questionIndex].answers_format[i - 2].value )
                      }
                    }
                });

                $scope.loading_redactor_models();

                $('.redactor-in-0 , .redactor-in-1').html('');
                $('.redactor-in-0').html(taget_question.question_body);
                $('.redactor-in-1').html(taget_question.question_description);

             }, 200);
          } , $scope.timeFrame );
          // =========================
      }; // ==> End edit this question
    $scope.rating_scale_values = function (){
      $timeout(function (){
        if($scope.question_type == 3 ){
           $scope.change_rating_scale_value($scope.questions_list[$scope.questionIndex].answers_format[0].step_numbers);
        }
      } , 5000 );
    };
    $scope.check_unsaved_data = function (){
      if($scope.unsaved_question == true ){
        $scope.swal_message();
        $scope.unsaved_question = false;
        return true ;
      }else
      return false ;
    };



    // ==> do an action with scope object
    $scope.window_navigation.on("load" , function (){
        $scope.close_iconx.trigger("click");
        $timeout(function (){
          $scope.settings_menu.css("display" , "block" );
        }, 500);
    });

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
    // $scope.window_navigation.bind("beforeunload" , function (e){
    //     if( $scope.unsaved_question != false ){
    //       return false ;
    //     }else
    //     return true ;
    // });
    $scope.window_navigation.bind("load" , function (){



            $timeout(function (){
              console.log($scope.questions_list[0]);
              if($scope.questions_list[0] != null && $scope.questions_list != null && $scope.questions_list.length > 0){
                var first_question = $scope.questions_list[0];
                $scope.edit_this_question  ( first_question._id  , 0 ) ;
              }


            } , 2000 );
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


    $("#editor-question-body").on('input' , function (){
         $scope.unsaved_question = true ;
      });
    $("#show-labels").on("input,change" , function (){
        var checked_value = $scope.questions_list[$scope.questionIndex].answers_format[0].show_labels ;
        //console.log(checked_value);
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
         //console.log(all_answers);
         for (var i = 0; i < all_answers.length; i++) {
             all_answers[i].is_correct = false;
         }
       }

       $scope.questions_list.splice(targetIndex, 0, question_selected);
       //console.log($scope.questions_list);
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
    $(".text-loader , .loading-data").delay(6000).fadeOut();

    // ==> excute an actions with timeframes
    $timeout(function (){
      $('input[type=range]').on('change input click' , function (){
          $scope.unsaved_question = true ;
      });
      $scope.style_of_answers = ($scope.question_settings.choice_style ) ? "Two columns per row" : "One column per row";
      } , 1500 );
      $scope.change_rating_scale_value = function (val , is_changed = null){
        if(is_changed != null && is_changed == true ){
          $scope.unsaved_question = true ;
        }
        var rating_value = val;
        $scope.rating_scale_elements = [];
        for( i=0; i<rating_value; i++){
          $scope.rating_scale_elements.push({
             index : i
          });
        }
      };


    // ==> Do an action
    $scope.status_of_questions();

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
         $scope.questions_list.splice( newIndex ,0,  newPosition );
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
                 //console.log(err);
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
                //console.log(err);
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



        $scope.loading_redactor_models = function (is_answer = null){

          try {
              $R(".answer-redactor-editors-x , #editor-question-body , #editor-question-desc"  ,{
            paragraphize: false,
            replaceDivs: false,
            linebreaks: false,
            enterKey: false ,
            air : true ,
            buttonsAddBefore : {
              before: 'html',
              buttons: ['bold','italic','link','deleted','underline']
            } ,
            plugins: ['fontcolor' , 'fontsize'] ,
            buttonsHide: ['format' , 'lists'] ,
            callbacks: {
              airOpened : function (){
                var app = $(this);
                var elems = $(app[0].component.toolbar.$toolbar.nodes[0]);

                elems.css({
                  left: '-330px'
                });
                if(elems.find(".re-bold").length > 1 )
                elems.find(".re-bold").eq(elems.find(".re-bold").length - 1).css('display','none')

                if(elems.find(".re-italic").length > 1 )
                elems.find(".re-italic").eq(elems.find(".re-italic").length - 1).css('display','none')

                if(elems.find(".re-deleted").length > 1 )
                elems.find(".re-deleted").eq(elems.find(".re-deleted").length - 1).css('display','none')

                if(elems.find(".re-link").length > 1 )
                elems.find(".re-link").eq(elems.find(".re-link").length - 1).css('display','none')
              }
            }
          });


            } catch (e) {

            }
          // Add Event fo each one
          $('.redactor-in').on("keyup keydown change click input" , function (){
            $scope.unsaved_question = true ;
             var model_type = $(this).prop('className').split(' ').pop() ;
             var redactor_value = $R(".answer-redactor-editors-x , #editor-question-body , #editor-question-desc" ,'source.getCode' );

              if( model_type == 'redactor-in-0' ){ //=> Question
                  // live preview for text when edit it
                  var currentQsUi = $("#docQuestions").children("li").eq($scope.questionIndex).find(".qs-body") ;
                  var thisValues ;
                  var thisLength = 35 ;

                  // ==> Loading questions into ifram object
                  // => Question Body
                  var question_body = $(".redactor-in-0").html() ;
                  $($scope.iframe_object).find('.question-body-text').eq($scope.questionIndex).html(question_body);

                  // ==> Loading question data into questions list
                  if($(".redactor-in-0").text().length <= thisLength )
                    thisValues = $(".redactor-in-0").text();
                    if($(".redactor-in-0").text().length == thisLength ) {
                        thisValues = $(".redactor-in-0").text() + ' ...';
                    }

                  $("#docQuestions").children("li").eq($scope.questionIndex).find(".qs-body").html(thisValues);

                  // $('.'+model_type).html();
              } else if (model_type == 'redactor-in-1'){ //=> Description

              } else { //=> answers
                // ==> in this case we need to check about answer index
                var answerIndex = model_type.split('-').pop();
                var answer_target_index = Math.round((parseInt(answerIndex)) - 2) ;


                // $scope.store_into_answer_array ( answer_target_index , redactor_value[answerIndex]) ;

              }
          });
        };

        $timeout(function(){
          $scope.loading_redactor_models();

          // $(".screen-redactors-strt-txt , .screen-redactors-end-txt , .screen-redactors-scs-txt , .screen-redactors-fld-txt").redactor ({
          //    buttons : ["format","lists"  , "bold" , "italic" , "html"] ,
          //    plugins : ['fontcolor' , 'fontsize', 'fontfamily']
          // });
        } , 6000 );

      } catch (e) {}


    $scope.load_application_keys();


    $scope.switching_editor_preview = () => {

        if($scope.switching_editor_preview_value == false ) { // => Editor
          $(".editor-container").css({
            position: 'relative' ,
            right: '0%'
          });
          $(".preview-container").css({
            position: 'relative' ,
            left: '-105%'
          });
            $('.question-editor , .question-preview').addClass('overflow_hidden');
            $timeout(function () {
                $('.question-editor , .question-preview').removeClass("overflow_hidden");
            }, 400);
          $timeout(function(){
            $(".editor-container").css({display: 'block'});
            $(".preview-container").css({display: 'none'});

          } , 200 );
        }else { // => Preview
          $(".editor-container").css({
            position: 'relative' ,
            right: '-105%'
          });
          $(".preview-container").css({
            position: 'relative' ,
            left: '0%'
          });

          $timeout(function(){
            $(".editor-container").css({display: 'none'});
            $(".preview-container").css({display: 'block'});
            $('.question-editor , .question-preview').removeClass("overflow_hidden");
          } , 200 );
        }

    };

    // ==> Loading Iframe
    $timeout(function(){ //     transform: translate3d(100%, 0px, 0px);
      // $(".slick-container-block").slick();
      $scope.iframe_object = document.getElementById("live-preview-iframe").contentWindow.frames.document ;

    },1000 );

}]);
