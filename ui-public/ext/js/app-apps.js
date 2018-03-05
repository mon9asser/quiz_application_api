// console.warn("QUIZ APPLICATION");
// // Warn if overriding existing method
// if(Array.prototype.equals)
//     console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// // attach the .equals method to Array's prototype to call it on any array
// Array.prototype.equals = function (array) {
//     // if the other array is a falsy value, return
//     if (!array)
//         return false;
//
//     // compare lengths - can save a lot of time
//     if (this.length != array.length)
//         return false;
//
//     for (var i = 0, l=this.length; i < l; i++) {
//
//         // Check if we have nested arrays
//         if (this[i] instanceof Array && array[i] instanceof Array) {
//             // recurse into the nested arrays
//             if (!this[i].equals(array[i]))
//                 return false;
//         }
//         else if (this[i] != array[i]) {
//             // Warning - two different object instances will never be equal: {x:20} != {x:20}
//             return false;
//         }
//     }
//     return true;
// }
// // Hide method from for-in loops
// Object.defineProperty(Array.prototype, "equals", {enumerable: false});



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
    return function (media_object){ // media_object.embed_path
      // alert(media_object);

      // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      // console.log(" Values :-- ");
      // console.log(media_object);
      // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

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

// ==> Main Controller
apps.controller("apps-controller" , ['$scope','$http' , '$timeout' , function ($scope , $http , $timeout){
  //---------------------------------------
  // Window init objects + menu settings
  //---------------------------------------
    $scope.window_navigation = $(window);
    $scope.generated_media_box_handler = $(".box-data");
    $scope.close_iconx = $(".setting-iconx");
    $scope.settings_menu = $(".settings_menu") ;
    $scope.questions_list_box = $(".left_part");
    $scope.questions_editor_preview_box = $(".left_part");
    $scope.quest_media_parts = null ;
    $scope.left_part_position  = $scope.questions_list_box.width() + 21 ;
    $scope.questPreiouseId = null ;
    $scope.window_navigation.on("load" , function (){
        $scope.close_iconx.trigger("click");
        $timeout(function (){
          $scope.settings_menu.css("display" , "block" );
        }, 500);
    });
    $scope.window = {
      // ===========> Width
      current_window  : $(window).width()  ,
      settings_menu   : $(".left_part").width() - 28
    };
    $scope.data_object   = null ;
    $scope.answer_object = null ;
    $scope.question_object_that_added = null ;
    $scope.headers = new Object() ;
    // =>> On load window
    $scope.settings_menu.css({width:$scope.window.settings_menu});
    // on resize window
    $scope.window_navigation.resize(function(){
      $scope.window = {
        current_window  : $(window).width()  ,
        settings_menu   : $(".left_part").width() - 28
      };
      $scope.settings_menu.css({width:$scope.window.settings_menu});
    });

  // ----------------------------------------
  // => Close Settings menu
  //-----------------------------------------

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
  $scope.close_settings_menu_handler = $(".setting-iconx");
  $scope.close_settings_menu_handler.on("click" , function (){
    var target_iconx = $(".close-menu-icon");
    if(target_iconx.hasClass("fa-times") == true )
      $scope.collapse_menu_settings(target_iconx) ;
      else
      $scope.expand_menu_settings(target_iconx) ;
  });
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
  //--------------------------------------------------------
  // ==>  Callback Finder
  //--------------------------------------------------------
  $scope.deleted_question_id
  $scope.question_id = null ;
  $scope.question_media = null ;
  $scope.callback_index = function (object){
    if(object == null )
      return false;
    return object._id == $scope.question_id ;
  };
  // $scope.callback_old_index = function (object){
  //   if($scope.questPreiouseId == null )
  //   $scope.questPreiouseId =   $scope.question_id ;
  //
  //   if(object == null )
  //     return false ;
  //   return object._id == $scope.questPreiouseId ;
  // };
  $scope.answer_id = null ;
  $scope.callback_answer_index = function (object){
    return object._id == $scope.answer_id ;
  };
  $scope.file_object = {
    "media_type" : null ,
    "file"       : null ,
    "link"       : null
  }
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
    } // end randomization
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
   // ==> Randomize Answers
   //--------------------------------------------------------
   $("#Randomize-option").on("change" , function (){
      // $scope.answer_old_status;
      //$scope.question_id
      var found_qs = $scope.questions_list.find($scope.callback_index)
      var questionInex = $scope.questions_list.indexOf(found_qs);
      if(questionInex == -1)
        return false ;

      $scope.answer_old_status = $scope.questions_list[questionInex].answers_format;
      var all_answers = $scope.questions_list[questionInex].answers_format;


      $scope.questions_list[questionInex].answers_format = $scope.randomize_arries(all_answers);
      $scope.save_changes_in_angular_backend();

   });

   //--------------------------------------------------------
   // ==> Delete Question
   //--------------------------------------------------------
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
   //--------------------------------------------------------
   // ==> Create Question
   //--------------------------------------------------------
   // Sorting the exisitng questions
   $scope.sort_handler = document.getElementById("docQuestions");
   Sortable.create($scope.sort_handler , {
     ghostClass: 'shadow_element' ,
     group: "question-list" ,
     disabled: false ,
     animation: 250 ,
     handle: '.drag-handler',
     onStart : function (evt){
       $scope.hide_loader ();

      //  console.log(evt.item);
      // var targetEl = $(evt.item).hasClass("draggable-x");
     } ,
     onEnd : function (evt){

       var itemEl = evt.item;  // dragged HTMLElement
       var newIndex = evt.newIndex;
       var oldIndex = evt.oldIndex;


       $scope.question_id = $(itemEl).attr("data-question-id");
       var question_sor = $scope.questions_list.find($scope.callback_index);

       $scope.edit_this_question ( $scope.question_id  , newIndex ) ;

       $scope.highlighted_question_and_show_data (newIndex , itemEl);
       //-------------------------------------------------
       // highlighted-questions
       //-------------------------------------------------
        $("#docQuestions").children("li").each(function (){
          ($(this).hasClass("highlighted-question")) ?
            $(this).removeClass("highlighted-question") : null ;
        })

      // var question_id_x = $("#docQuestions");

      //  var currIndex = $("li").index(".qs-"+$scope.question_id);
      //  alert(currIndex);
      // question_id_x.children.addClass("highlighted-question");
      //  question_id_x.children("li").each(function (i){
      //      $(this).removeClass("highlighted-question");
      //  });
      //
      //  question_id_x.children("li").eq(4).addClass("highlighted-question");
      // ==> send highlighted-question to target qs
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

        var dragged = evt.dragged; // dragged HTMLElement
     		var draggedRect = evt.draggedRect; // TextRectangle {left, top, right и bottom}
     		var related = evt.related; // HTMLElement on which have guided
     		var relatedRect = evt.relatedRect; // TextRectangle

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
            new_question.answers_format.push(answer_obj);

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


  };
  $scope.onclick_items = function (elementId){
    var evt = {
      item      :  $("#"+elementId) ,
      newIndex  :  ( $("#docQuestions li" ).length - 1 )
    }
    return $scope.dragged_items(evt);
  };



  //--------------------------------------------------------
  // ==> Edit Current Question     color: #89d7d7;
  //--------------------------------------------------------
  // => Issue #100
  $scope.edit_this_question = function ( qs_id  , qsCurrIndex , nextIndex = null){
    // alert( qs_id  +','+ qsCurrIndex  +','+ nextIndex ) ;
    // // check if backend array == mongoDb array
    // // ==> arrg1.equals(arrg2)
    // alert("Would you like to save changes ?");

    // ==> Doing request into our db
    // $.getJSON( , function (){});
    // alert(qs_id);
    // Target ID
    $scope.question_id = qs_id ;
    // var backend_question = $scope.questions_list.find($scope.callback_old_index);
    // var mongoo_question = $scope.mongodb_questions.find($scope.callback_index);
      // console.log("MONGO QUESTION");
      // console.log(mongoo_question);
      // console.log("BACKEND QUESTION");
      // console.log(backend_question);
      // console.log($scope.changed_data_in_draged(mongoo_question ,backend_question ) == false );

    // if( $scope.changed_data_in_draged ( mongoo_question , backend_question ) == false ){
    //   alert("This question need to save firstly !!");
    // }

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

    // init Vars ===========>>>>
    // if(drag_drop_items != null ) {
    //   new_question
    // }
    // console.log(new_question);

    var taget_question = $scope.questions_list.find($scope.callback_index);

    if (taget_question == undefined )
      taget_question = $scope.question_object_that_added ;

    if( taget_question.answers_format.length > 1 ){
        $scope.indexes = taget_question.answers_format.length ;
    }


     $scope.question_id = taget_question._id;
     $scope.question_type = taget_question.question_type;

     // 2 ==> media parts
     $scope.question_media = taget_question.media_question ;
     $scope.quest_media_parts = taget_question.media_question ;
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
    //$(".question-li-x").removeClass("highlighted-question");
    // $(".qs-"+$scope.question_id).addClass("highlighted-question");

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
    // console.log($scope.questions_list);
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
  $("#editor-question-body").on('keydown' , function (){
    // store edited question into scope object
    if($scope.question_id != null )
      $scope.questPreiouseId = $scope.question_id ;

  });
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
  // $scope.settings_menu_handler = $(".setting-menu-handler");
  // $scope.settings_menu_handler.on("click" , function (){
  //
  //   if($scope.settings_menu_handler.hasClass("open") == true )
  //   {
  //     $scope.settings_menu_handler.removeClass("open");
  //     $scope.close_settgins_menu();
  //   }
  //   else
  //   {
  //     $scope.settings_menu_handler.addClass("open");
  //     $scope.open_settgins_menu();
  //   }
  // });
  //
  // -------------------------------------------
  // collapsed - expanded options
  // --------------------------------------
  $scope.expand_collapse_handler =   $(".app-settings li .control-item-header") ;
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


// ===============================
// => Upload & save in mongoDB
// ===============================
$(".media-changeable-img-case").on("click" , function (){
    $(".box-overlay").fadeIn();
});


$scope.close_media_box = function (){
  $(".box-overlay").fadeOut();
}; // => beside qs Preview



  /*
  =========================================
  ==========>>>>>> Text Options
  =========================================
  */
  // --> Selected texts
  $scope.show_selected_text = $("#editor-question-body");
  $scope.show_selected_text.on("keyup mousedown mousemove mouseup" , function (e){
    var range = $(this).getSelection();
    $scope.selected_text = range.text ;
  });

  // --> Option ==> BOLD
  $scope.text_bold_option = function (qsIndex){
    var questionIndex = qsIndex ;
     if (questionIndex == -1 )
        return false ;

     if($scope.selected_text == null || $scope.selected_text.length == 0 ){
       alert("You didn't select text !");
       return false ;
     }

     var bold_option = "<b>" + $scope.selected_text + "</b>" ;
     $scope.questions_list[questionIndex].question_body = $scope.questions_list[questionIndex].question_body.replace(new RegExp($scope.selected_text , 'g'), bold_option);;

  }





    // --> Option ==> ITALIC
    $scope.text_italic_option = function (qsIndex){
      var questionIndex = qsIndex ;
       if (questionIndex == -1 )
          return false ;

       if($scope.selected_text == null || $scope.selected_text.length == 0 ){
         alert("You didn't select text !");
         return false ;
       }

       var bold_option = "<i>" + $scope.selected_text + "</i>" ;
       $scope.questions_list[questionIndex].question_body = $scope.questions_list[questionIndex].question_body.replace(new RegExp($scope.selected_text , 'g'), bold_option);;

    }









    // --> Option ==> ITALIC
    $scope.text_underline_option = function (qsIndex){
      var questionIndex = qsIndex ;
       if (questionIndex == -1 )
          return false ;

       if($scope.selected_text == null || $scope.selected_text.length == 0 ){
         alert("You didn't select text !");
         return false ;
       }

       var bold_option = "<u>" + $scope.selected_text + "</u>" ;
       $scope.questions_list[questionIndex].question_body = $scope.questions_list[questionIndex].question_body.replace(new RegExp($scope.selected_text , 'g'), bold_option);;

    }





    // --> Option ==> ANCHOR
    $scope.text_anchor_option = function (qsIndex){
      var questionIndex = qsIndex ;
       if (questionIndex == -1 )
          return false ;

       if($scope.selected_text == null || $scope.selected_text.length == 0 ){
         alert("You didn't select text !");
         return false ;
       }

       $(".text-formats > ul > li.ri").css({"display":"inline"});
       //.text-formats > ul > li.ri
      //  var bold_option = "<u>" + $scope.selected_text + "</u>" ;
      //  $scope.questions_list[questionIndex].question_body = $scope.questions_list[questionIndex].question_body.replace(new RegExp($scope.selected_text , 'g'), bold_option);;
    };


    $scope.save_text_anchor_option = function (qsIndex){
       var questionIndex = qsIndex ;
       if (questionIndex == -1 )
          return false ;

       if($scope.selected_text == null || $scope.selected_text.length == 0 ){
         alert("You didn't select text !");
         return false ;
       }

       $(".text-formats > ul > li.ri").css({"display":"none"});
       var anchorVal = $("#text-anchor-link").val();
       var  option = "<a href='"+anchorVal+"'>" + $scope.selected_text + "</a>" ;
       $scope.questions_list[questionIndex].question_body = $scope.questions_list[questionIndex].question_body.replace(new RegExp($scope.selected_text , 'g'), option);;


    };





// ==============================================
// ==============>>> Welcome | End Screens
// ==============================================
// $scope.sort_handlerxc = document.getElementById("appMessages");
// Sortable.create($scope.sort_handlerxc , {
//   ghostClass: 'shadow_element' ,
//   group: "message-list" ,
//   disabled: false ,
//   onStart : function (evt){
//
//    //  console.log(evt.item);
//    // var targetEl = $(evt.item).hasClass("draggable-x");
//   }
// });
//
//
// $scope.sort_handler3 = document.getElementById("msg-list");
// Sortable.create($scope.sort_handler3 , {
//     ghostClass: 'shadow_element' ,
//     sort: false,
//     group: {
//        name: "message-list",
//        pull: "clone",
//        revertClone: false,
//     }
// });
/*
// List with handle
Sortable.create(listWithHandle, {
  handle: '.my-handle',
  animation: 3000
});

*/



// ===============================================================>
// =========>>> Extract Media Input field ( youtube vimeo mp4 )
// =========================================================>
// ==> keyup keydown keypress
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



// ==========================================>
// =========>>> Extract Media when choose it
// ==========================================>
$scope.upload_handler = $(".image-uploader-x");
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

// ========> Saving Media
$scope.save_media_with = function (type){
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

            var target_answer = target_question.answers_format.find($scope.callback_answer_index);
            if( target_question.question_type == 1 ){
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
}

  //----------------------------------------
  // ==> End Loader
  //----------------------------------------
  $(".text-loader , .loading-data").delay(5000).fadeOut();

  //----------------------------------------
  // ==> highlighted question and show target data
  //----------------------------------------
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

// ==> detect changes between db and
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

// Loading the existing questions
$scope.status_of_questions();

$scope.changed_data_in_draged = function (question_db , question_backend){
  // console.log(question_db['question_body']  + '...........'+  question_backend['question_body']);
  // console.log (  question_backend['question_body'] );
  // if(question_db!= undefined){
  //   if (question_db['question_body'] !=  question_backend['question_body']){
  //       // alert("This question didn't save !!");
  //   }
  // }


  // var premObject  ;
  // for (var property in question_db) {
  //     if (  question_db.hasOwnProperty(property) ) {
  //         if(question_db[property] !=  question_backend[property] )
  //           premObject = false
  //         console.log(property);
  //         console.log("QS DB " + question_db[property] + " QS BK " + question_backend[property]);
  //     }
  // }
  // if(premObject == false )
  //   return false ;
  //   else
  //   return true ;
};



}]);
