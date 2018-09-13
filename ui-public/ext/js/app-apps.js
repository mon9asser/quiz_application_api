Array.prototype.are_all_questions_tracked = function( solved_questions ){
  var required_questions =  this.filter(x => x.answer_settings.is_required == true );
  return required_questions.filter(function(i){
    return solved_questions.findIndex(x => x.question_id == i._id ) === -1 ;
  });
}

// var start_expiration_date , expiration_day_counts ;
var time_epiration = {
    expiration_day_counts : 0
};
// Array.track_unsolved_and_required_questions = function( solved_questions ) {
//   return this.filter(function(i){
//     return solved_questions.findIndex ( x => x.answer_settings.is_required == true && x => x._id == i._id ) === -1
//   });
// }
apps.filter( 'apply_html' , ['$sce' , ( $sce ) => {
  return ( returned_values ) => {
    if(returned_values  == '' ) returned_values = "Add your question here !"
    return $sce.trustAsHtml(returned_values);
   };
}]);
apps.filter("apply_html_with_date_filtering" , ['$sce'  , ( $sce  ) => {
  return ( returned_values ) => {
    var time_hr = (date) => {
          var hours = date.getHours();
          var minutes = date.getMinutes();
          var ampm = hours >= 12 ? 'pm' : 'am';
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          minutes = minutes < 10 ? '0'+minutes : minutes;
          var strTime = hours + ':' + minutes + ' ' + ampm;
          return strTime;
    }
    var monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
    ];

    var day_counts = time_epiration.expiration_day_counts;
    var date_in_timestamps = new Date().getTime();
    var calculated_date = new Date ( date_in_timestamps + ( day_counts * 24 * 60 * 60 * 1000 ) )

    var splited_date = calculated_date.toString().split(" ");
    var calculate_time_ago = new Date().getTime() - calculated_date.getTime() ;
    var time_ago_hrs = (((calculate_time_ago / 1000 ) / 60 ) / 60 ) ;
    if( time_ago_hrs < 0 ) time_ago_hrs = "<span class='notexpired'><span class='small-note'>as an example</span>9</span>";
    else time_ago_hrs = time_ago_hrs + " hour(s)";

    var date_time = splited_date[0] + ' ' +  splited_date[2]   + ' ' +  splited_date[1]  + ' ' +  splited_date[3] ;
   var date_long = splited_date[2] + ' ' + splited_date[1] + ' , ' + splited_date[3] + " "+ time_hr(calculated_date) ;
   var date_short =splited_date[2] + ' ' +  monthNames[calculated_date.getMonth()];
   var date_american = calculated_date.getMonth() + "/" +splited_date[2] + "/" +calculated_date.getFullYear() ;
   var hr_sys = ( day_counts * 24 )

   var filter_date_format = (formative_date) => {

     switch (formative_date) {

       case "{{ date | long }}" :
         return date_long ;
       break;
       case "{{ date | short }}" :
         return date_short ;
       break;
       case "{{ date | american }}" :
         return date_american ;
       break;
       case "{{ hour_counts }}" :
         return hr_sys ;
       break;
       case "{{ day_counts }}" :
           return day_counts ;
       break;
       case "{{ time_ago }}" :
         return time_ago_hrs ;
       break;
       case "{{ date }}" :
         return date_time ;
     }
   };
    var formative_text = "";
    var existing_formative = [] ;
    var formative_array = [
      "{{ date }}" ,
      "{{ date | long }}" ,
      "{{ date | short }}" ,
      "{{ date | american }}" ,
      "{{ hour_counts }}" ,
      "{{ time_ago }}" ,
      "{{ day_counts }}"

    ];

    for (var i = 0; i < formative_array.length; i++) {
      var date_format = formative_array[i];
      if(returned_values.toString().includes(date_format.toString()))
        existing_formative.push(date_format) ;
    }

    for (var i = 0; i < existing_formative.length; i++) {
      var date = existing_formative[i] ;
      returned_values = returned_values.replace(date , filter_date_format(date) );
    }

    return $sce.trustAsHtml(returned_values) ;
  };
}]);
// apps.filter("apply_html_with_date_filtering" , ['$sce'  , ( $sce  ) => {
//   return ( returned_values ) => {
//
//
//
//     var formative = returned_values.match("{{(.*)}}") ;
//
//
//     if(formative != null ){
//
//
//       var origin_formative = formative[0];
//       var returned_data = '';
//       var use_this_formate  = () => {
//         // var timestamps = new Date().getTime() + ( 6 * 24 * 60 * 60 * 1000 ) ;
//         var date_now = new Date();
//         var date_after_day_counts = new Date(new Date().getTime() + ( time_epiration.expiration_day_counts * 24 * 60 * 60 * 1000 ));
//         var time_hr = (date) => {
//           var hours = date.getHours();
//           var minutes = date.getMinutes();
//           var ampm = hours >= 12 ? 'pm' : 'am';
//           hours = hours % 12;
//           hours = hours ? hours : 12; // the hour '0' should be '12'
//           minutes = minutes < 10 ? '0'+minutes : minutes;
//           var strTime = hours + ':' + minutes + ' ' + ampm;
//           return strTime;
//         }
//         const monthNames = ["January", "February", "March", "April", "May", "June",
//           "July", "August", "September", "October", "November", "December"
//         ];
//         // long => 05 Jun 2018 12:00 pm
//         // short => 05 Jun
//         // american => 12/25/2018
//         var splited_date = date_after_day_counts.toString().split(" ") ;
//         var american_date = date_after_day_counts.getMonth() + "/" +date_after_day_counts.getDay() + "/" +date_after_day_counts.getFullYear() ;
//         var long = date_after_day_counts.getDay() + ' '  + monthNames[date_after_day_counts.getMonth()] + ' , ' + date_after_day_counts.getFullYear() + ' ' + time_hr(date_after_day_counts);
//         var short = date_after_day_counts.getDay() + ' ' +  monthNames[date_after_day_counts.getMonth()];
//
//         // if( origin_formative.toString().includes("date") && !origin_formative.includes("|") && origin_formative.length <= 10)
//         // {
//         //   return new Date() ;
//         // }else
//         origin_formative = origin_formative.replace("&nbsp;" , " ");
//         console.log( origin_formative + ' >> '+ origin_formative.length);
//         if( origin_formative.length > 22 ) return "<span class='warn-expression'> You can not use more than one expression ! </span>" ;
//         if ( origin_formative.toString().toLowerCase().includes("time_ago") && origin_formative.length == 14) {   return time_epiration.expiration_day_counts ; }
//         else if ( origin_formative.toString().toLowerCase().includes("day_counts") && origin_formative.length == 16) {  return time_epiration.expiration_day_counts ; }
//         else if ( origin_formative.toString().toLowerCase().includes("date") && origin_formative.includes("|") && origin_formative.toLowerCase().includes("long") && origin_formative.length == 17) {   return long ; }
//         else if ( origin_formative.toString().toLowerCase().includes("date") && origin_formative.includes("|") && origin_formative.toLowerCase().includes("short") && origin_formative.length == 18) {  return short ; }
//         else if ( origin_formative.toString().toLowerCase().includes("in_next_time") &&  origin_formative.length == 18) { return date_after_day_counts ; ; }
//         else if ( origin_formative.toString().toLowerCase().includes("date") && origin_formative.includes("|") && origin_formative.toString().toLowerCase().includes("american") &&  origin_formative.length == 21) { return american_date; }
//         else { return ".." ; }
//
//       } ;
//         returned_values = returned_values.replace(origin_formative , use_this_formate());
//     }
//      return $sce.trustAsHtml(returned_values) ;
//    };
// }]);

apps.filter('math_around_it' , [
'$sce' , function(){
  return (round_p) => {
    return ( Math.round(round_p) ) ? Math.round(round_p): 0  ;
  }
}
]);
apps.filter('read_image' , ($sce) => {
  return function (media_object){
    var this_time = new Date(media_object.image_updated_date).getTime() / 1000 ;
    return media_object.Media_directory + '?' + this_time;
  };
});
apps.filter( 'set_as_placehoder' , ( $sce )=>{
  return function(text){

    if( text == '' )
     text = "Add your question here !";

    return  text ;
  }
});
apps.filter( 'striphtmltags' , ($sce) => {
  return function (specs){
    var spesificChars = '' ;

    if(specs != '' || specs != null ){
      var div = $("<div>"+ specs + "</div>");
      var text_values = div.text() ;
      var char_counts = 20 ;

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
    }

    if(specs == '')
    spesificChars = "Add your question here !"
    // spesificChars =  spesificChars.textContent || spesificChars.innerText || "";
    // remove ( &nbsp; ) from text

     return spesificChars ;
  }
});
apps.filter('trust_iframe_url' , ( $sce ) => {
  return function (url){
    return  $sce.trustAsResourceUrl(url);
  };
});
apps.controller("apps-controller" , [
'$scope','$http' , '$timeout','$window','$rootScope' , '$sce' ,
( $scope , $http , $timeout , $window , $rootScope , $sce  ) => {
  $scope.question_labels = {
    label_0 : ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ],
    label_1 : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50]
  }
  $scope.answer_labels = {
    label_0 : ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ],
    label_1 : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50]
  }
  $scope.numbers = [0];
  $rootScope.isEmpty = (obj) => {
      for(var key in obj) {
          if(obj.hasOwnProperty(key))
              return false;
      }
      return true;
  }
  $rootScope.set_model_type = ( model_index , model_type) => {
    if(model_type == 0 ){
      $rootScope._settings_.progression_bar.progression_bar_layout = model_index;
      $rootScope.progressbar_models = "/time-progress-temps/progressbar-"+model_index+".hbs";
      if(model_index == 2 ){
        $rootScope.draw_radial_progression(0/100);
      }
    }
    if(model_type == 1){
      $rootScope._settings_.time_settings.timer_layout = model_index;
      $rootScope.time_models = "/time-progress-temps/time-"+model_index+".hbs";
    }
  };

  $rootScope.changed_day_numbers = (number) => {
    time_epiration.expiration_day_counts = number ;
   };
  $rootScope.unsolved_questions = [];
  $rootScope.theme_stylesheet = new Array();
  $rootScope.progressbar_models = "/time-progress-temps/progressbar-1.hbs" ;
  $rootScope.time_models = "/time-progress-temps/time-1.hbs" ;
  $rootScope.this_attendee_draft = {};
  $rootScope.media_type = 0 ;
  $rootScope.server_ip = $("#serverIp").val();
  $rootScope.user_id = $("#userId").val();
  $rootScope.app_id = $("#applicationId").val();
  $rootScope.stylesheet_uri = $rootScope.server_ip + 'themes/stylesheet_of_app_' + $rootScope.app_id + '.css';
  $rootScope.text_result_screens = true ;
  $rootScope.serial_numbers = (serial) => {
      return serial + 1 ;
  };

  $rootScope.serial_letters = (serial) =>{
    var charset , times , at_serial , new_serial
    new_serial = "a"
    charset  = "abcdefghijklmnopqrstuvwxyz";
    times = parseInt(serial / charset.length);
    at_serial = serial - ( times * charset.length ) ;
    new_serial = charset.charAt(times) + charset.charAt(at_serial) ;
    if( times == 0 ) new_serial = charset.charAt(at_serial) ;
    return new_serial;
  }

  // alert($rootScope.stylesheet_uri);
  $rootScope.json_source = $rootScope.server_ip + "ext/json/json-keys.json";
  $rootScope.default_player =  $rootScope.server_ip + "ext/css/default-player.css";
  $rootScope.default_theme =  $rootScope.server_ip + "ext/css/default-themes.css";
  $rootScope.selector_class = undefined ;
  // $rootScope.swiper_data = null ;
  $rootScope.switching_editor_preview_value = false ;
  $rootScope.is_add_new_unsaved = false;
  // $rootScope.is_unsaved_data = false ;
  $rootScope.media_for = 'questions' ;
  $rootScope.enable_css_mode = false;
  $rootScope._application_ = null ;
  $rootScope._questions_ = [] ;
  $rootScope._settings_ = null ;
  $rootScope.database_data = [] ;
  $rootScope.question_ids  = [] ;
  $rootScope.answer_ids  = [] ;
  $rootScope.question_id   = $("#question_id").val()  ;
  $rootScope.retrieve_data_url = $rootScope.server_ip + "api/"+$rootScope.app_id+"/application/get/all";
  $rootScope.question_index = null;
  $rootScope.media_image_uploader = $('.image-uploader-x');
  $rootScope.nav_status = 0;
  $rootScope.image_view_source = null ;
  $rootScope.header_data = null ;
  $rootScope._application_ = null ;
  $rootScope._settings_    =  null;
  $rootScope.question_ids  =  null;
  $rootScope.answer_ids    = null;
  $rootScope.video_object = new Object();
  $rootScope.cropper = null ;
  $rootScope.cropper_results = new Object() ;
  $rootScope.current_answer_id = null ;
  $rootScope.current_media_video = new Object();
  $rootScope.screen_type = 3 ;
  $rootScope.media_data = undefined // => to display media in uploader box
  $rootScope.go_to_screen_number = (screen_number) => {
    $rootScope.screen_type = screen_number ;
  }

  $rootScope.show_question_answer_serials = (serial , type ) =>{
    // {> question_labels['label_' + _settings_.indexes.questions.toString()][question_index] | uppercase <}
    if(type == 0 )
      return $rootScope.serial_letters(serial) ;
      else
      return $rootScope.serial_numbers(serial) ;
  }

  $rootScope.show_expiration_screen = (isTrue) => {
    if(isTrue) $rootScope.screen_type = 4 ;
    else $rootScope.screen_type = 3 ;
  }
  $rootScope.css_pellet_mode = {
    background:false,
    color:false,
    fontSize:false,
    fontFamily:false,
    border:false,
    width : false ,

    // ==> Case Hover answers
    hover_background : false,
    hover_border : false,
    hover_color : false,

    // ==> Case Selected canswers
    selected_background : false,
    selected_borde : false,
    selected_color : false ,

    correct_background : false ,
    correct_border : false ,
    correct_color : false ,
    correct_icon_background : false ,
    correct_icon_border : false ,
    correct_icon_color : false ,

    wrong_background : false ,
    wrong_border : false ,
    wrong_color : false ,
    wrong_icon_background : false ,
    wrong_icon_border : false ,
    wrong_icon_color : false ,

    rating_color : false ,
    scale_color : false ,
    scale_hover_color : false ,
    scale_background : false ,
    scale_hover_background : false ,

    free_boxtext_background: false ,
    free_boxtext_color: false ,

    radial_text_color: false ,
    radial_fill: false ,
    radial_strock: false ,
  };

  // $rootScope.selecotor_name = "block"
  // $rootScope.background_models = '#fff';
  // $rootScope.border_models = '1px solid #fff';
  // $rootScope.color_models = '#fff';
  // $rootScope.font_size_models = '18px';
  // $rootScope.font_family_models = 'OpenSansRegular';
  // $rootScope.width_models = '25%';
  // $.getJSON( $rootScope.json_source , function ( api_key_data ){
  //   $rootScope.header_data = {
  //      "X-api-keys": api_key_data.API_KEY ,
  //      "X-api-app-name": api_key_data.APP_NAME
  //    };
  // });
  // ==> Loading Applications
  $http({ method : "GET" , url : $rootScope.retrieve_data_url }).then(( resp )=>{
    $rootScope._application_ =  resp.data ;
    $rootScope._settings_    =  $rootScope._application_.settings;
    $rootScope.question_ids  =  $rootScope._application_.question_ids;
    $rootScope.answer_ids    =  $rootScope._application_.answer_ids;

    $rootScope._questions_   =  $rootScope._application_.questions;
    $rootScope.randomize_sorting_questions($rootScope._settings_.randomize_settings);


    if($rootScope._application_.theme_style != undefined )
    $rootScope.theme_stylesheet = $rootScope._application_.theme_style;

    $rootScope.progressbar_models = "/time-progress-temps/progressbar-"+$rootScope._settings_.progression_bar.progression_bar_layout+".hbs" ;
    $rootScope.time_models = "/time-progress-temps/time-"+$rootScope._settings_.time_settings.timer_layout+".hbs" ;

    time_epiration.expiration_day_counts = $rootScope._settings_.expiration.through_time ;
    // ==> Calling Funcs
    $timeout(function(){
      $rootScope.init_first_question();
      $(".modal-content-overlay").fadeOut();
      $timeout(function(){
        $rootScope.loading_redactor_for_message();
      } , 400)
    } , 600);
  });
  $rootScope.storing_redactor_values = ( property , value ) => {
      $rootScope._settings_.expiration[property] = value ;
  }
  $rootScope.loading_redactor_for_message = () => {
    // ==> Redactor
    $R('.set_redactor' , {
       plugins: ['fontcolor']  ,
       buttons : ['html', 'format', 'bold', 'italic', 'underline', 'deleted' , 'link']
     });
    // ==> build event
    $timeout(function(){
      // ==> expire warning
      $(".redactor-in-2").bind("change , input , keyup" , function(){
        // $(".resume-text ,.expired_message_block").hide();
        // $timeout(function(){ $(".expire-warning-text").show(); } , 5);
         $timeout(function(){
           $("#docQuestions > li").each(function(){
             $(this).removeClass("marked_question")
           });
           $rootScope.switching_editor_preview(true);
           var expire_warning_val = $R(".set_redactor" , "source.getCode")[0];
           $rootScope.screen_type = 4 ;
           $rootScope.storing_redactor_values('expire_warning' , expire_warning_val  )
        } , 200 );
      });
      // ==> expire message
      $(".redactor-in-3").bind("change , input, keyup" , function(){
         $timeout(function(){
           $("#docQuestions > li").each(function(){
             $(this).removeClass("marked_question")
           });
           $rootScope.screen_type = 5 ;
           $rootScope.switching_editor_preview(true);
           $(".resume-text , .expire-warning-text").hide();
           $(".expired_message_block").show();
            var expire_message_val = $R(".set_redactor" , "source.getCode")[1];
               $rootScope.storing_redactor_values( 'expire_message' , expire_message_val  );
         }, 200 );
      });
      // ==> starting messages
      $(".redactor-in-4").bind("change , input, keyup" , function(){
         $timeout(function(){
           $("#docQuestions > li").each(function(){
             $(this).removeClass("marked_question")
           });
           $rootScope.switching_editor_preview(true);
           $rootScope.screen_type = 0 ;
            var starting_text = $R(".set_redactor" , "source.getCode")[2];
            $rootScope._settings_.titles.title_start_with = starting_text;
         }, 200 );
      });
      // ==> ending message
      $(".redactor-in-5").bind("change , input, keyup" , function(){
         $timeout(function(){
           $rootScope.switching_editor_preview(true);
           $rootScope.screen_type = 1 ;
            var ending_text = $R(".set_redactor" , "source.getCode")[3];
            $rootScope._settings_.titles.title_end_with = ending_text;
         }, 200 );
      });
      // ==> success message
      $(".redactor-in-6").bind("change , input, keyup" , function(){
         $timeout(function(){
           $("#docQuestions > li").each(function(){
             $(this).removeClass("marked_question")
           });
           $rootScope.switching_editor_preview(true);
            $rootScope.screen_type = 2 ;
            $rootScope.text_result_screens = true ;
            var pass_text = $R(".set_redactor" , "source.getCode")[4];
            $rootScope._settings_.titles.title_success_with = pass_text;
         }, 200 );
      });
      // ==> failed message
      $(".redactor-in-7").bind("change , input, keyup" , function(){
         $timeout(function(){
           $("#docQuestions > li").each(function(){
             $(this).removeClass("marked_question")
           });
           $rootScope.switching_editor_preview(true);
            $rootScope.screen_type = 2 ;
            $rootScope.text_result_screens = false ;
            var fail_text = $R(".set_redactor" , "source.getCode")[5];
            $rootScope._settings_.titles.title_failed_with = fail_text;
         }, 200 );
      });
      // ==> resume message
      /*
      .resume-text ,
      .expired_message_block
      */
      $(".redactor-in-8").bind("change , input, keyup" , function(){
        $(".expire-warning-text , .expired_message_block").hide();
        $timeout(function(){ $(".resume-text").show(); } , 5);

        $rootScope.screen_type = 4 ;
         $timeout(function(){
           $("#docQuestions > li").each(function(){
             $(this).removeClass("marked_question")
           });
           $rootScope.switching_editor_preview(true);
            var title_resume = $R(".set_redactor" , "source.getCode")[6];
            $rootScope._settings_.titles.title_resume = title_resume;
            $timeout(function(){ console.log($rootScope._settings_.titles);} , 201);
         }, 200 );
      });

    } , 200 );
  }
  $rootScope.list_answer_classes = () => {
    var classes = "";
    if( $rootScope._questions_[$rootScope.question_index].answer_settings.super_size == true || $rootScope. _questions_[$rootScope.question_index].question_type == 2)
    classes += "super_size_class ";


     return classes ;
  }
  // ==> Load color spectrum
  $rootScope.load_spectrum_plugin = () => {

    $('.border_models_color , .color_models , .background_models , .hover_border_models_color, .hover_background_models , .hover_color_models , .selected_border_models_color , .selected_background_models , .selected_color_models , .radial_storck_colors , .radial_fill_colors , .radial_text_colors').spectrum(
      {
        showPaletteOnly: true,
         togglePaletteOnly: true,
         togglePaletteMoreText: 'more',
         togglePaletteLessText: 'less',
         color: 'blanchedalmond',
         palette: [
             ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
             ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
             ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
             ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
             ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
             ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
             ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
             ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
         ]
      }
     );
  }
  // ==> Check if answer with media for Tooltip
  $rootScope.case_it_with_media = ( question , answer ) => {
    console.log(answer);
    if(question.question_type == 0 ){

      var value ;
      if( answer.media_optional == undefined ){
        value : '100%'
      }else {
        value : '110%'
      }
      return {
        bottom : value
      };
    }
    if(question.question_type == 1 ){

    }
  };
  // ==> Media Links are changed
  $rootScope.media_links_are_changed = () => {
    var media_url = $(".show_media_link").val();
    var youtube =   media_url.toLowerCase().includes("youtube") ;
    var vimeo =   media_url.toLowerCase().includes("vimeo") ;
    var mp4 =   media_url.toLowerCase().includes(".mp4") ;
    var video = media_url ;
    $rootScope.video_object = new Object();
    var videoType = -1  , video_src_value , videoId  ;
    if( youtube == true ){
      var videoType = 0 ;
      var idWithLastSplit = video.lastIndexOf('?');
      var videos = video.substr(idWithLastSplit + 1);
      var lastId = video.substr(0, video.indexOf('&'));
      if(lastId != '' || lastId )
       videoId = lastId ;
       else
       videoId = videos ;
       var afterEqualChar = video.lastIndexOf('=');
       videoId = video.substring(afterEqualChar + 1);
       video_src_value = "http://youtube.com/embed/"+ videoId ;
    }
    if( vimeo == true ){
      var videoType = 1 ;
      var n = video.lastIndexOf('/');
      videoId = video.substring(n + 1);
      video_src_value = "https://player.vimeo.com/video/"+ videoId;;
    }
    if( mp4 == true ){
      var videoType = 2 ;
      videoType = 2 ;
      videoId = null;
      video_src_value = video.substring(0, video.lastIndexOf('.'));
    }
    if(videoType == -1 ) return false ;

    $rootScope.video_object['video_type'] = videoType ;
    $rootScope.video_object['video_id'] = videoId ;
    $rootScope.video_object['embed_url'] = video_src_value ;
    console.log($rootScope.video_object);
    $rootScope.extracting_videos( video_src_value , videoType , video , videoId );

  }
  $rootScope.extracting_videos = (video_src , video_type , urlInput , videoId ) => {
    $rootScope.current_media_video = new Object();
    // $rootScope.video_object
    var questionId = $("#question_id").val();
    var this_question = $rootScope._questions_.find (x => x._id == questionId );
    if(this_question == undefined) return false ;
      // ==> if it question
      if( $rootScope.media_for == 'questions' ) {
        if ($rootScope.current_media_video.media_question == undefined)
          $rootScope.current_media_video['media_question'] = new Object();
          $rootScope.current_media_video.media_question['media_src'] = urlInput;
          $rootScope.current_media_video.media_question['Media_directory'] = urlInput ;
          $rootScope.current_media_video.media_question['media_type'] = 1 ;
          $rootScope.current_media_video.media_question['media_name'] = urlInput;
          $rootScope.current_media_video.media_question['video_id'] = videoId;
          $rootScope.current_media_video.media_question['video_type'] = video_type ;
          $rootScope.current_media_video.media_question['embed_path'] = video_src
          if (video_type == 2 ) {
                $rootScope.current_media_video.media_question['mp4_option'] = {
                  mp4_url: video_src +'.mp4' ,
                  ogg_url : video_src +'.ogg'
                };
          }



          $timeout(function(){
            $rootScope.$apply();
          } , 300 );


      }
      if( $rootScope.media_for ==  'answer' ) {
        if( this_question.question_type == 0 ){
          if ($rootScope.current_media_video.media_optional == undefined)
            $rootScope.current_media_video['media_optional'] = new Object();
            $rootScope.current_media_video.media_optional['media_src'] = urlInput;
            $rootScope.current_media_video.media_optional['Media_directory'] = urlInput ;
            $rootScope.current_media_video.media_optional['media_type'] = 1 ;
            $rootScope.current_media_video.media_optional['media_name'] = urlInput;
            $rootScope.current_media_video.media_optional['video_id'] = videoId;
            $rootScope.current_media_video.media_optional['video_type'] = video_type ;
            $rootScope.current_media_video.media_optional['embed_path'] = video_src
            if (video_type == 2 ) {
                  $rootScope.current_media_video.media_optional['mp4_option'] = {
                    mp4_url: video_src +'.mp4' ,
                    ogg_url : video_src +'.ogg'
                  };
            }
            $timeout(function(){
              $rootScope.$apply();
            } , 300 );
        }
        if( this_question.question_type == 1 ){
              $rootScope.current_media_video['media_src'] = urlInput;
              $rootScope.current_media_video['Media_directory'] = urlInput ;
              $rootScope.current_media_video['media_type'] = 1 ;
              $rootScope.current_media_video['media_name'] = urlInput;
              $rootScope.current_media_video['video_id'] = videoId;
              $rootScope.current_media_video['video_type'] = video_type ;
              $rootScope.current_media_video['embed_path'] = video_src
              if ( video_type == 2 ){
                    $rootScope.current_media_video['mp4_option'] = {
                      mp4_url: video_src +'.mp4' ,
                      ogg_url : video_src +'.ogg'
                    };
              }
              $timeout(function(){
                $rootScope.$apply();
              } , 300 );
        }
      }

  };
  // ==> Calculate the momory size of
  $rootScope.memory_size_of_object  = ( obj ) => {
    var bytes = 0;
     function sizeOf(obj) {
       if(obj !== null && obj !== undefined) {
                 switch(typeof obj) {
                 case 'number':
                     bytes += 8;
                     break;
                 case 'string':
                     bytes += obj.length * 2;
                     break;
                 case 'boolean':
                     bytes += 4;
                     break;
                 case 'object':
                     var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                     if(objClass === 'Object' || objClass === 'Array') {
                         for(var key in obj) {
                             if(!obj.hasOwnProperty(key)) continue;
                             sizeOf(obj[key]);
                         }
                     } else bytes += obj.toString().length * 2;
                     break;
                 }
             }
             return bytes;
         };

         function formatByteSize(bytes) {
             if(bytes < 1024) return bytes + " bytes";
             else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
             else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
             else return(bytes / 1073741824).toFixed(3) + " GiB";
         };

         return formatByteSize(sizeOf(obj));
       }

  $rootScope.switching_editor_previewd = (is_view) => {
        if( is_view == true)
        {
          // ==>
          document.getElementById("switch-editor").checked = true ;
          $rootScope.is_view = true ;
          $(".editor-page").css({ "transform" : "translate3d(-100% , 0 , 0)" , height : '0px'});
          $(".preview-page").css({ "transform" : "translate3d(-100%, 0px, 0px)" ,  height : 'auto'});
        }
        else if ( is_view == false ){
          document.getElementById("switch-editor").checked = false ;
          $rootScope.is_view = false ;
          $(".editor-page").css({"transform" : "translate3d(0% , 0 , 0)" , height : 'auto'});
          $(".preview-page").css({"transform" : "translate3d(0% , 0 , 0)" , height : '0px'});
        }
        // $rootScope.swiper_data.slideTo(0);
        $timeout(function(){
          $rootScope.$apply();
        } , 50 );
  };

  $rootScope.switching_editor_preview = (is_view) => {
    var checkbox = document.getElementById("switch-editor") ;
    if( is_view == true ){
      if(checkbox != null )
      checkbox.checked = true ;
      $(".editor-page").css({ "transform" : "translate3d(-100% , 0 , 0)" , height : '0px'});
      $(".preview-page").css({ "transform" : "translate3d(-100%, 0px, 0px)" ,  height : 'auto'});
    }else {
      if(checkbox != null )
      checkbox.checked = false ;
      $(".editor-page").css({"transform" : "translate3d(0% , 0 , 0)" , height : 'auto'});
      $(".preview-page").css({"transform" : "translate3d(0% , 0 , 0)" , height : '0px'});
    }
  }
  // => Add new question (click-event)
  $rootScope.add_new_question = ( question_type , atIndex = null ,  other_types = null ) => {
    if($rootScope._questions_.length > 200 )
    return false ;
    var question_object = new Object() , answer_object = new Object() ;
    // => Build Default Question
    question_object['_id'] = $rootScope.question_ids['id_' +  $rootScope._questions_.length  ];
    question_object['question_body'] =  '' ;
    question_object['answers_format'] = new Array();
    question_object['question_type'] =  parseInt(question_type);
    question_object['created_at'] = new Date();
    question_object['question_description'] = {
     'value' :'' ,
     'is_enabled': false
    }
    // question_object['media_question'] =
    question_object['answer_settings'] = new Object();
    answer_object['_id'] = $rootScope.answer_ids[ 'id_' + question_object.answers_format.length] + '' + $rootScope._questions_.length ;
    if( question_type == 0 ) {
      answer_object['value'] = "Answer " + ( question_object.answers_format.length + 1 )
      if ( $rootScope._application_.app_type == 1 )
      answer_object['is_correct'] = false ;
      // => Push To Answer Array
      question_object.answers_format.push( answer_object );
      $rootScope.build_question_settings ( 'is_randomized' , false , question_object._id );
      $rootScope.build_question_settings ( 'is_required' , false , question_object._id );
      $rootScope.build_question_settings ( 'single_choice' , true , question_object._id );
      $rootScope.build_question_settings ( 'super_size' , false , question_object._id );
    }
    if( question_type == 1 ){
       // answer_object['_id'] = $rootScope.answer_ids[ 'id_' + question_object.answers_format.length ];
       answer_object['media_src'] = "No Media Here !";
       if ( $rootScope._application_.app_type == 1 )
       answer_object['is_correct'] = false ;
       // => Push To Answer Array
       question_object.answers_format.push( answer_object );
       $rootScope.build_question_settings ( 'is_randomized' , false , question_object._id );
       $rootScope.build_question_settings ( 'is_required' , false , question_object._id );
       $rootScope.build_question_settings ( 'single_choice' , true , question_object._id );
       $rootScope.build_question_settings ( 'super_size' , false , question_object._id );
    }
    if( question_type == 2 ){
       answer_object = new Object();
       answer_object['_id'] = $rootScope.answer_ids[ 'id_' + question_object.answers_format.length ] + '' + $rootScope._questions_.length +'_a';
       answer_object['boolean_type'] = "true/false";
       answer_object['boolean_value'] = "True" ;
       if ( $rootScope._application_.app_type == 1 )
       answer_object['is_correct'] = false ;
       // => Push To Answer Array
       question_object.answers_format.push( answer_object );

       var answer_object_2 = new Object();
       answer_object_2['_id'] = $rootScope.answer_ids[ 'id_' + question_object.answers_format.length ] + '' + $rootScope._questions_.length +'_b';;
       answer_object_2['boolean_type'] = "true/false";
       answer_object_2['boolean_value'] = "False" ;
       if ( $rootScope._application_.app_type == 1 )
       answer_object_2['is_correct'] = true ;
       $rootScope.build_question_settings ( 'is_randomized' , false , question_object._id );
       $rootScope.build_question_settings ( 'is_required' , false , question_object._id );
       // => Push To Answer Array
       question_object.answers_format.push( answer_object_2 );
    }
    if( question_type == 3 ){
          answer_object['ratscal_type'] = other_types ;
          answer_object['step_numbers'] = 5 ;
          answer_object['rating_scale_answers'] =  new Array(
           { _id : answer_object['_id'] + '_' + 1  , rat_scl_value : 1 } ,
           { _id : answer_object['_id'] + '_' + 2  , rat_scl_value : 2 } ,
           { _id : answer_object['_id'] + '_' + 3  , rat_scl_value : 3 } ,
           { _id : answer_object['_id'] + '_' + 4  , rat_scl_value : 4 } ,
           { _id : answer_object['_id'] + '_' + 5  , rat_scl_value : 5 }
          )
        if( other_types == 0  ) {
         answer_object['show_labels'] = false ;
         answer_object['started_at']  = 'Bad' ;
         answer_object['centered_at']  = 'Good' ;
         answer_object['ended_at']  = 'Excellent' ;
        }
        // => Push To Answer Array
        question_object.answers_format.push( answer_object );
        $rootScope.build_question_settings ( 'is_randomized' , false , question_object._id );
        $rootScope.build_question_settings ( 'is_required' , false , question_object._id );
    }
    if( question_type == 4 ){
      var answer_object = new Object()
      answer_object['_id'] = $rootScope.answer_ids[ 'id_' + question_object.answers_format.length ];;
      question_object.answers_format.push( answer_object );
    }

    // => Push To Question Array
     if( atIndex == null )
       $rootScope._questions_.push( question_object );
       else
       $rootScope._questions_.splice( atIndex , 0 ,  question_object );
       // ==> Selecting according to question index
        $timeout(function(){
          $rootScope.highlighted_question(question_object._id);
          // ==> Slide To Bottom
          var scroll_top = 0 ;
          if($rootScope._questions_.length >= 8 ){
          scroll_top = 1000000000000
          }else  scroll_top = 0
          $(".qsdragged-list , html , body").animate({
          scrollTop: scroll_top
          }, 10 );
          // ==> Storing Question into DB
           $rootScope.storing_questions_into_database();
           $timeout(function(){
             $rootScope.$apply();
           } , 300 )
        });

  };
  // ==> Expan collapse between editor
  $rootScope.expand_collapsed_items = function (id){
          var targetId = $(id) ;
          var all_edit_sections = $("#question-pt , #Description-pt , #answers-pt , #Settings-pt");
          $("#question-pt , #Description-pt , #answers-pt , #Settings-pt").each(function(){
            var this_element = $(this);
            if(this_element.prop('id') != targetId.prop('id')){
                this_element.slideUp();
            }else {
               targetId.slideDown();
            }

          });

          if(targetId.prop('id') == 'Settings-pt'){
            $('html , body').animate({
              scrollTop: 1000000000000
            }, 500 );
          }
        };
  $rootScope.image_source_link = (src) => {
    return src ;
  }
  // => Mark Selected Question
  $rootScope.highlighted_question = (questionId) => {
      $rootScope.screen_type = 3;
        // => detect current question is exists or not
        var questionIndex = $rootScope._questions_.findIndex( x=> x._id == questionId );
        if( questionIndex == -1 ) return false ;


        $("#docQuestions").children("li").each(function(){
           if( $(this).hasClass('marked_question') )
           $(this).removeClass('marked_question');
        });

        $timeout(function(){
          $("#docQuestions").children('li.qs-'+questionId.toString()).addClass('marked_question');
        });

        $rootScope.question_index = questionIndex ;
        $("#question_id").val(questionId)

        // ==> Fill and binding event handler with textarea box

        $timeout(function(){
          $rootScope.fill_boxes_with_question_objects(questionId);
          $rootScope.init_bootstrap_tooltip();
        } , 300 );
        $('.right_part').fadeIn();
        // ==> Detect if Unsaved data is happened
        // $rootScope.detect_if_there_unsaved_data (// $rootScope.is_unsaved_data )
      }
    $rootScope.saving_this_question = () => {
      $("#saving-changes").html("Saving ...")
      $timeout(function(){
        $("#saving-changes").html("Save Changes");
      } , 200);
      $rootScope.storing_questions_into_database();
    };
    $rootScope.delete_the_current_question = () => {
      var currently = $rootScope._questions_[$rootScope.question_index]._id;
      if(currently == undefined ) return false ;
      $rootScope._questions_.splice( $rootScope.question_index , 1 );
      $('.right_part').hide();
      $rootScope.storing_questions_into_database();
      $('#docQuestions > li.marked_question').removeClass('marked_question');
    }
  // ==> Fill Question Boxes
  $rootScope.fill_boxes_with_question_objects = ( questionId ) => {

            var questionIndex = $rootScope._questions_.findIndex( x=> x._id == questionId );
            if( questionIndex == -1 ) return false ;

            var question = $rootScope._questions_.find ( x => x._id == questionId );
            if(question == undefined ) return false;

            // $rootScope.current_media_question = ( question.media_question == undefined ) ? undefined : question.media_question ;
            // $rootScope._questions_[$rootScope.question_index].media_question
            // ==> Distrbute question data
            // ==> Question Text
            $(".redactor-in-0").html(question.question_body);
            $(".redactor-in-1").html(question.question_description.value);
            $(".redactor-in-0 , #editor-quest-data").bind("input" , function (){

                $timeout(function(){
                    $rootScope._questions_[$rootScope.question_index].question_body = $R('#editor-quest-data' , 'source.getCode');
                    // $rootScope.is_unsaved_data = true ;
                } , 500 );
            });

            $(".redactor-in-1 , #editor-desc-data").bind("input" , function (){
                $timeout(function(){
                    $rootScope._questions_[$rootScope.question_index].question_description.value = $R('#editor-desc-data' , 'source.getCode');
                    // $rootScope.is_unsaved_data = true ;
                } , 500 );
            });

            $timeout(function(){
              $rootScope.$apply();
            });
            if($rootScope._questions_[$rootScope.question_index].answer_settings.is_randomized != undefined )
            $rootScope.is_randomized_answer_with($rootScope._questions_[$rootScope.question_index].answer_settings.is_randomized);
          }
  //==> Show Media Link in input
  $rootScope.show_media_link = () => {
      $rootScope.media_type = 1;
      $(".media-inputs").css("display" , "block");
  }
  // => Image Uploader
  $rootScope.upload_image_handler = () => {
      $rootScope.media_image_model = '';
      $rootScope.media_type = 0 ;
      return $rootScope.media_image_uploader.trigger('click');
  }

  // ==> Setting Changes
  $rootScope.randomize_sorting_questions = (setting_changes) => {
    if(setting_changes == true) {
      // ==> Randmoize it
      $rootScope._questions_ = $rootScope.randomize_arries( $rootScope._questions_);
    }else {
      // => sorting it
      $rootScope._questions_ = $rootScope.sorting_arries( $rootScope._questions_  , "_id");
    }
  }

  $rootScope.saving_quiz_stylesheet = () => {
    $("#save_css_change").html("Saving Changes ...");
    $http({
      method : "POST" ,
      url    : $rootScope.server_ip+ 'api/' +$rootScope.app_id + "/stylesheet/add/files" ,
      data : {
        styles : $rootScope.theme_stylesheet
      }
    }).then(()=>{
      $("#save_css_change").html("Apply Changes");
    });
  }
  $rootScope.saving_quiz_settings = () => {


    // ==> Send request to saving
    $("#save_setting_change").html("Saving Changes ...");

      url = $rootScope.server_ip + "api/" + $rootScope.app_id + "/app/setup_settings/storing" ;
       $http({
         method : "PATCH" ,
         url    : url ,
         data : {
           creator_id : $rootScope.user_id ,
           settings : $rootScope._settings_ ,
           questionnaire_title : $rootScope._application_.questionnaire_title
         }
       }).then(()=>{
         $rootScope.storing_questions_into_database();
         $("#save_setting_change").html("Apply Changes");
       });

  }
  // => Show Image
  $rootScope.image_uploader_is_touched = () => {
      console.log($rootScope.media_image_model[0].files[0]);
  }

  $rootScope.collect_hour_params = () => {
    var hours = $rootScope._settings_.time_settings.hours;
    var minutes = $rootScope._settings_.time_settings.minutes;
    var seconds = $rootScope._settings_.time_settings.seconds;

    var collected_time = parseInt( hours * 60 * 60 ) + parseInt( minutes * 60) + parseInt(seconds);
    $rootScope._settings_.time_settings.value = collected_time;
  }
  $rootScope.time_hrs_is_changed = (hours) => {
    $rootScope.collect_hour_params()
  }
  $rootScope.time_mins_is_changed = (mins) => {
    $rootScope.collect_hour_params()
  }
  $rootScope.time_hrs_is_changed = (secs) => {
    $rootScope.collect_hour_params() ;
  }
  $rootScope.sorting_arries = function (arr , propert_field){
    var compare = (a,b) => {
      if (a[propert_field] < b[propert_field])
        return -1;
      if (a[propert_field] > b[propert_field])
        return 1;
      return 0;
    }
    return arr.sort(compare);
  }
  $rootScope.randomize_arries = function (array) {
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
  $rootScope.is_randomized_answer_with = (is_randomizing) => {
    if( is_randomizing == true )
      $rootScope._questions_[$rootScope.question_index].answers_format = $rootScope.randomize_arries( $rootScope._questions_[$rootScope.question_index].answers_format );
    else
      $rootScope._questions_[$rootScope.question_index].answers_format = $rootScope.sorting_arries( $rootScope._questions_[$rootScope.question_index].answers_format , "_id");
  }
  // Init swiperJs
  $rootScope.init_swiperJs = () => {
         // $rootScope.swiper_data = new Swiper ('.swiper-data' , {
         //   allowTouchMove : false
         // });
         // $rootScope.swiper_data.update();
  }

  $rootScope.init_first_question = () => {
            if($rootScope._questions_.length != 0 ){
              $timeout(function(){
                $rootScope.highlighted_question($rootScope._questions_[0]._id);
                $rootScope.expand_collapsed_items('#question-pt');
                 $rootScope.fill_boxes_with_question_objects($rootScope._questions_[$rootScope.question_index]._id);
                if($rootScope._questions_[$rootScope.question_index].question_type != 2 )
                 {
                   if($rootScope._questions_[0].question_type == 1 || $rootScope._questions_[0].question_type == 0)
                   $timeout(function(){ $rootScope.sorting_answers_in_list(); } , 700  );
                 }
              })
              // $rootScope.current_media_question = ( $rootScope._questions_[0].media_question == undefined ) ? undefined : $rootScope._questions_[0].media_question ;
            }
          }
  // ==> Display media data
  $rootScope.calling_media_uploader = () => {
                $(".media-imgvid-uploader").fadeIn();
              }
  // ==> Display Image in question
  $rootScope.loading_question_image = (img_src) => {
  };
  $rootScope.detect_if_it_correct_answer = (is_correct) => {
    // $('[data-toggle="tooltip"]').tooltip();
    if(is_correct == false) return "Make it 'Correct Answer'" ;
    else return "Remove 'Correct Answer'" ;
  }
  // ==> Make it correct answer
  $rootScope.make_answer_classes = ( answer , questionType ) => {
    var classes = '';
    var settings = $rootScope._questions_[$rootScope.question_index].answer_settings;
    // => correct answer
    if(  answer.is_correct == true )  classes += 'choices_correct_answer ';
    // => super_size
    if(settings != undefined ){
      if( questionType <= 1 && settings.super_size == true ){
         classes += 'super_size_class ';
      }
    }
    return classes ;
  }
  $rootScope.change_answer_of_single_choices = (is_single_choice) => {
    if(is_single_choice == true){
      var answers = $rootScope._questions_[$rootScope.question_index].answers_format;
      var only_one = answers[answers.length - 1];
      only_one.is_correct = true;
      if(answers != undefined ){
        for (var i = 0; i < answers.length; i++) {
          if(only_one._id != answers[i]._id)
          answers[i].is_correct = false ;
        }
      }
    }
  }
  // ===> Delete This Answer
  $rootScope.make_this_correct_incorrect_answer = (answerId) => {

    var question = $rootScope._questions_[$rootScope.question_index];
    if(question._id == undefined) return false ;
    var answer = question.answers_format.find(x => x._id == answerId);
    if(answer == undefined ) return false ;
    answer.is_correct = ! answer.is_correct ;

    if(question.question_type <= 1 && question.answer_settings.single_choice == true){
      for (var i = 0; i < question.answers_format.length; i++) {
        if(answer._id != question.answers_format[i]._id)
        question.answers_format[i].is_correct = false;
      }
    }
    if( question.question_type == 2 ){
      for (var i = 0; i < question.answers_format.length; i++) {
        if(answer._id != question.answers_format[i]._id)
        question.answers_format[i].is_correct = false;
      }
    }

  }
  // ===> Delete This Answer
  $rootScope.delete_this_answer = (answerId) => {
    var question = $rootScope._questions_[$rootScope.question_index];
    if(question._id == undefined) return false ;
    var answer_index = question.answers_format.findIndex(x => x._id == answerId);
    if(answer_index == -1) return false ;
    question.answers_format.splice (answer_index , 1);
  }
  // destory cropper

  // ==> Add New Answer
  $rootScope.add_new_media_for_question = () => {
        $rootScope.media_data = new Object();
        $rootScope.media_for = 'questions' ; // => Question
        $(".box-data").css({ top :'148px'});
        $('.box-overlay').height($(document).height());
        $(".media-uploader").fadeIn();

        // ==> Show Current Media if it found
        var existing_question = $rootScope._questions_[$rootScope.question_index];
        if(existing_question.media_question != null ){
          if( existing_question.media_question.media_type == 0 )
            $rootScope.media_data['media_src'] = existing_question.media_question.Media_directory + '?' +  existing_question.media_question.image_updated_date;
          if ( existing_question.media_question.media_type == 1 ){
              if( existing_question.media_question.video_type == 0 || existing_question.media_question.video_type == 1 )
                $rootScope.media_data['media_src'] = existing_question.media_question.embed_path;
              if( existing_question.media_question.video_type == 2 )
                $rootScope.media_data['media_src'] = existing_question.media_question.media_field;

                  $rootScope.media_data['video_type'] = existing_question.media_question.video_type ;
          }
          $rootScope.media_data['media_type'] = existing_question.media_question.media_type ;
        }
  }
  // ==> Add media for question
  $rootScope.add_new_media_for_answer = (answer_id , thisElem) => {
    var main_answer_blocks = $('.answer-pt-controller');
    var current_box = main_answer_blocks.children("li").eq(thisElem.$index);
    $(".box-data").css({ top : ( parseInt(current_box.offset().top - 110) ) + 'px'});

    $rootScope.media_for = 'answer' ; // => Question
    $rootScope.current_answer_id = answer_id ;
      $('.box-overlay').height($(document).height());
    $(".media-uploader").fadeIn();


      // ==> Show Current Media if it found
      var existing_question = $rootScope._questions_[$rootScope.question_index];
      if(existing_question != undefined ){ //answer_id
        var this_answer = existing_question.answers_format.find( x => x._id == answer_id );
        if(this_answer != undefined){
          $rootScope.media_data = new Object();
          if(existing_question.question_type == 0 ){
            if(this_answer.media_optional != undefined )
              {
                if ( this_answer.media_optional.media_type == 0 ){
                   $rootScope.media_data['media_src'] = this_answer.media_optional.Media_directory;
                   $rootScope.media_data['media_type'] = this_answer.media_optional.media_type;
                }
                if ( this_answer.media_optional.media_type == 1 ){
                  if( this_answer.media_optional.video_type == 0 || this_answer.media_optional.video_type == 1 )
                  $rootScope.media_data['media_src'] = this_answer.media_optional.embed_path;
                  if( this_answer.media_optional.video_type == 2 )
                  $rootScope.media_data['media_src'] = this_answer.media_optional.Media_directory
                  $rootScope.media_data['video_type'] = this_answer.media_optional.video_type;
                  $rootScope.media_data['media_type'] = this_answer.media_optional.media_type;
                }
              }
          }
          if(existing_question.question_type == 1 ){
            if(this_answer.media_type != undefined )
              {
                if ( this_answer.media_type == 0 ){
                    $rootScope.media_data['media_src'] = this_answer.Media_directory;
                    $rootScope.media_data['media_type'] = this_answer.media_type;
                }
                if ( this_answer.media_type == 1 ){
                  if( this_answer.video_type == 0 || this_answer.video_type == 1 )
                  $rootScope.media_data['media_src'] = this_answer.embed_path;
                  if( this_answer.video_type == 2 )
                  $rootScope.media_data['media_src'] = this_answer.Media_directory
                  $rootScope.media_data['video_type'] = this_answer.video_type;
                  $rootScope.media_data['media_type'] = this_answer.media_type;
                }
              }
          }
        }
      }

      console.log($rootScope.media_data);
   }
  // => Close Current window
  $rootScope.close_current_image_uploader = () => {
        $('.image-uploader-x , .show_media_link').val('');
        return $(".media-uploader , .live_preview_image , .progrbar ").fadeOut();
     };
  // => Start cropping image
  $rootScope.init_cropping_image = () => {
                    $timeout(function(){
                      var image_data = document.getElementById("cropping_system");

                      $rootScope.cropper =  new Cropper ( image_data , {
                        aspectRatio : 145 / 120 ,
                        initialAspectRatio : 145 / 120 ,
                        dragMode: 'none' ,
                        center : true ,
                        // responsive : true ,
                        // movable :false ,
                        // rotatable : false ,
                        // minContainerWidth : 145 ,
                        // minContainerHeight: 120 ,
                        minCropBoxWidth:145,
                        minCropBoxWHeight:120 ,
                        background : false ,
                        zoomable : false ,
                        crop : (event) => {
                          $rootScope.store_cropping_data (event);
                           //  $rootScope.cropper_results['x'] = event.detail.x;
                           // $rootScope.cropper_results['y'] = event.detail.y;
                           // $rootScope.cropper_results['width'] = event.detail.width;
                           // $rootScope.cropper_results['height'] = event.detail.height;
                           // // $rootScope.cropper_results['rotate'] = event.detail.rotate;
                           // $rootScope.cropper_results['scaleX'] = event.detail.scaleX;
                           // $rootScope.cropper_results['scaleY'] = event.detail.scaleY;
                        }
                      } );

                    }, 250 );
                  };
  // => Storing Copping results
  $rootScope.store_cropping_data = (evt) => {
                        $('#cropping-image-x').val(evt.detail.x - 1);
                        $('#cropping-image-y').val(evt.detail.y - 1);
                        $('#cropping-image-width').val(evt.detail.width - 1);
                        $('#cropping-image-height').val(evt.detail.height - 1);

                        // $rootScope.cropper_results['rotate'] = event.detail.rotate;
                        // $rootScope.cropper_results['scaleX'] = evt.detail.scaleX;
                        // $rootScope.cropper_results['scaleY'] = evt.detail.scaleY;
                      };
  // ==> Reading current Image then blob
  $rootScope.read_image_file = (image_file) => {

        $rootScope.image_view_source = null ;
        var file = image_file[0].files[0] ;
        if(file == undefined) return false ;
        $rootScope.cropper_results['file'] = file ;

          $rootScope.media_data = new Object();
          var reader = new FileReader();
          var read_file = reader.readAsDataURL(file);
           if( file.type != "image/jpeg" && file.type != "image/png" && file.type != "image/jpg" )
            return false;
          reader.onload = ( e ) => {
            $rootScope.image_view_source =  e.target.result  ;
            // ==> Preview Image
            $rootScope.media_data['media_type'] = 0 ;
            $rootScope.media_data['media_src'] = e.target.result;
            $('.loading_data').fadeOut(1000);
            $('.box-overlay').height($(document).height() + 50);
            $rootScope.$apply();
          }

        // console.log($rootScope.media_image_uploader[0].files[0]);
  };

  $rootScope.active_this_label = (index_number ) => {
    $rootScope._settings_.indexes.questions = index_number ;
  }
  $rootScope.active_this_answer_label =   (index_number ) => {
    $rootScope._settings_.indexes.answers = index_number ;
  }


  $rootScope.loading_answer_media_image = (image , date) => {
    console.log(image + ' ' +  date);
    return {
      backgroundImage : 'url("'+image +'?' + date +'")'
    } ;
  }
  $rootScope.loading_answer_media_image_media_choices = (image , date) => {
    console.log(image + ' ' +  date);
    return {
      backgroundImage : 'url("'+image +'?' + date +'")'
    } ;
  }
  // => Image Uploader Changes and inputs
  $rootScope.media_image_uploader.on('change , input' , function(){
          // ==> Detect if question is in exists
          var question_id = $("#question_id").val() ;
          var question = $rootScope._questions_.find(x => x._id == question_id );
          if(question == undefined ) return false ;
          $(".live_preview_image , .progrbar").fadeIn();
          // ==> Reading Image file
          if( $(this)[0].files[0].type != "image/jpeg" && $(this)[0].files[0].type != "image/png" && $(this)[0].files[0].type != "image/jpg" )
           return false;

          $rootScope.read_image_file($(this));


          // ==> Calling Cropping liberary
          $rootScope.init_cropping_image();

          $timeout(function(){
            $rootScope.$apply();
          });
 });






   $rootScope.fileExists = (url) =>
       {
           var http = new XMLHttpRequest();
           http.open('HEAD', url, false);
           http.send();
           return http.status != 404;
       }







   $rootScope.answer_classes_cases = (question_settings) =>  {
     // if(question_settings == undefined ) return ;
     return 'super_size';
   }
  // => load_image_media
  $rootScope.load_image_media = () => {
    var img = $rootScope._questions_[$rootScope.question_index].media_question.Media_directory;
    var image_data = $rootScope._questions_[$rootScope.question_index].media_question.image_updated_date;
    var img_src = $sce.trustAsResourceUrl(img) +'?' + image_data ;

    return  {
       'background-image':'url("'+img_src+'")'
     };
  }
  // ==> Remove Question Media
  $rootScope.remove_question_media = (question_id) => {
    var Question = $rootScope._questions_.find(x => x._id == question_id );
    if(Question == undefined ) return false ;
    if(Question.media_question == undefined ) return false ;

    return Question.media_question = undefined ;
  };
  $rootScope.add_new_answer = ( question_id ) => {
    if(question_id == undefined) return false ;
    var question = $rootScope._questions_.find(x => x._id == question_id );
    if(question == undefined ) return false ;
    var answer_object_data = new Object();
    // ==> Fill according to question type
    answer_object_data['_id'] = $rootScope.answer_ids[ 'id_' + question.answers_format.length] + '' + $rootScope._questions_.length ;
    if ( question.question_type == 0 ){
      answer_object_data['value'] = "Answer " + ( question.answers_format.length + 1 )
      if ( $rootScope._application_.app_type == 1 )
      answer_object_data['is_correct'] = false ;
    }
    if ( question.question_type == 1 ){
      answer_object_data['media_src'] = "No Media Here !";
      if ( $rootScope._application_.app_type == 1 )
      answer_object_data['is_correct'] = false ;
    }

    question.answers_format.push(answer_object_data);
    $timeout(function(){
      $rootScope.sorting_answers_in_list();
      $rootScope.init_bootstrap_tooltip();
      $timeout(function(){ $rootScope.storing_questions_into_database(); } , 500 );
    } , 300);
  };
  // => Storing Data of questions into db
  $rootScope.storing_questions_into_database = () => {
     $http({
      url : $rootScope.server_ip + 'api/' + $rootScope.app_id + "/add/questions" ,
      method : "POST" ,
      data : { data : $rootScope._questions_ }
     }).then((response)=>{
       $rootScope._questions_ = response.data ;
       $timeout(function(){
         $rootScope.$apply();
       } , 300 );
    });
  };
/*,
ghostClass: 'shadow_element',
handle: '.drag-tool',
sort: false  */
  // => init tooltip
  $rootScope.init_bootstrap_tooltip = ( ) => {
      return $('[data-toggle="tooltip"]').tooltip();
         }

  $rootScope.sorting_answers_in_list = () => {
    var answers = $rootScope._questions_[$rootScope.question_index].answers_format;
    $timeout(function(){
      Sortable.create( document.getElementById('block-answers') , {
        animation: 150 ,
        handle: '.drag-tools',
        ghostClass: 'shadow_element' ,
        onEnd : (evt) => {

          var old_index = evt.oldIndex ;
          var new_index = evt.newIndex;
          var target_answer = answers[old_index];
          // ==> Remove in Old index
          answers.splice(old_index , 1);
          // ==> Send it into new index
          $timeout(function(){
            answers.splice( new_index ,0,  target_answer );
            $timeout(function(){ $rootScope.init_bootstrap_tooltip(); }  , 300)
          }, 300 );
        }
      });
    } , 300 )
  }
  // ==> Sorting Questions
  $rootScope.init_drag_drop = () => {
    Sortable.create (document.getElementById("qs-sortable") , {
       disabled: false,
       sort: false,
       animation: 180 ,
       group: {
           name: "question-list",
           pull: "clone",
           revertClone: false,
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
             // ParentEl.find(dragged).addClass("animated wobble");
             ParentEl.find(dragged).css({
               minHeight : '40px' ,
               background : "ghostwhite"
             });
             ParentEl.find(dragged).remove();
           }

        } ,
       onEnd  : function (evt) {
           var Item = evt.item;
           evt.oldIndex;
  		     evt.newIndex;
           var question_type = Item.getAttribute('data-question-type') ;
           // ==> Remove current gost
           var isScaleRating = null ;
           if( question_type == 3 ){
              isScaleRating = Item.getAttribute('data-is-scale');
            }
            $rootScope.add_new_question ( question_type , evt.newIndex ,  isScaleRating ) ;
           $timeout(function(){
             $("#docQuestions").find("li.question_bult_in").remove();
           } , 10);
       }
    })

    Sortable.create( document.getElementById("docQuestions") , {
        ghostClass: 'shadow_element' ,
        group: "question-list" ,
        disabled: false ,
        animation: 250 ,
        handle: '.drag-handler',
        onStart : function (evt) {} ,
        onEnd  : function (evt) {}
    });

  };
$rootScope.step_number_of_rating_scale = (step_number) => {
  $rootScope._questions_[$rootScope.question_index].answers_format[0].rating_scale_answers = new Array();

  for (var i = 0; i < step_number ; i++) {
    $rootScope._questions_[$rootScope.question_index].answers_format[0].rating_scale_answers.push({
      _id : $rootScope._questions_[$rootScope.question_index].answers_format[0]._id + '_' +  (i + 1 )   ,
      rat_scl_value : (i + 1 )
    });
    if( i == 10 ) break ;
  }
}
$rootScope.select_rating_scale__ = function ( index , type , question_id = null  , answer_id = null , question_type = null ){
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
     if( type == 0 ) { // ==> Scale .scalet-o li span
        if($('.scalet-o').children("li").eq(index).children("span").hasClass("highlighted_scale")){
          $('.scalet-o').children("li").eq(index).children("span").removeClass("highlighted_scale");
        }else {
          $('.scalet-o').children("li").each(function (){
            $(this).children("span").removeClass("highlighted_scale");
          });
          $('.scalet-o').children("li").eq(index).children("span").addClass("highlighted_scale");
        }
     }


 };
 $rootScope.select_this_rating_value = (index , class_name , answer_id , question_id , rs_type  ) => {



   var get_answers = $(".ul_scal_"+ question_id).children("li");
   get_answers.each(function(){
     $(this).children('.spanex').css({
       background : 'transparent' ,
       color :'#999'
     })
   });

   get_answers.eq(index).children(".spanex").css({
     background : '#c17c7e' ,
     color :'#fff'
   })

 };
$rootScope.mark_rating_scale = (rat_scale_type , currIndex) => {
  if( rat_scale_type == 1 ){
    var object_in_jQuery = $(".rating-scale-list").children('li').eq(currIndex);
    $(".rating-scale-list").children("li").each(function(i){
      if( i <= currIndex ){
        if($(this).children('span').hasClass("fa-star-o"))
        $(this).children('span').removeClass("fa-star-o")
        $(this).children('span').addClass("fa-star")
      }else {
        if($(this).children('span').hasClass("fa-star"))
        $(this).children('span').removeClass("fa-star")
        $(this).children('span').addClass("fa-star-o")
      }
    })
  }else {
    $(".rating-scale-list").children("li").each(function(){
      $(this).children("span.scales").css({"background" : 'transparent' , color : "#222"});
    })
    $(".rating-scale-list").children("li").eq(currIndex).children("span.scales").css({"background" : '#00a8ff' , color : "#fff"});

  }
}
  $rootScope.build_question_settings = (setting_name , setting_value , question_id) => {

      $timeout(function(){
        var question = $rootScope._questions_.find(x => x._id == question_id);
        if( question == undefined ) return false;
        console.log(question);
        if( question.answer_settings == undefined ) question['answer_settings'] = new Object();
        question.answer_settings[setting_name] = setting_value ;
      })

  };


  $rootScope.nav_container_manager = ( nav_status ) => {
    var question_list_left = $(".left_part");
    var nav_menu = $(".nav-container");
    var body_window = $(".row-x-body");
    var fixed_number = 23 ;
    var translate_number_negative = -(question_list_left.width() +fixed_number ) ;
    var translate_number_positive =  0 ;
    // ==> Open The nav menu
    if(nav_status == 0 ){
      body_window.css({ transform : 'translate3d('+translate_number_negative+'px , 0,0)'})
      nav_menu.css({ transform : 'translate3d('+translate_number_positive+'px , 0,0)'})
      // ==> Change Nav number of status
      $rootScope.nav_status = 1;
    }
    // ==> Close The nav menu 19
    if(nav_status == 1 ){
      body_window.css({ transform : 'translate3d(0px , 0,0)'})
      nav_menu.css({ transform : 'translate3d('+( question_list_left.width() + 17 )+'px , 0,0)'})
      // ==> Change Nav number of status
      $rootScope.nav_status = 0
    }

  };
  $rootScope.navigation_menu_manger = () => {

      // ==> Options
      $rootScope.navigation_options = {
        drag_drop_box_width : $('.qsdragged-list').width() ,
        left_part_question_type : $('side-left-bar') ,
        settings_menu : $('.slider_menu')
      };



  }

  $rootScope.translate_number = 0

  $rootScope.navbar_menu_init = () => {
    // ==> Set Width
    var nav_bar = $(".nav-container");
    var question_lists = $(".left_part");
    nav_bar.width(question_lists.width())
    nav_bar.css({transform : "translate3d("+(question_lists.width() + 19 )+"px , 0 , 0)" , width : question_lists.width() + 23 + 'px' })
    // ==> Change current translate3d
  };

  //     transform: rotate(90deg);
  $rootScope.navbar_menu_init();

  $(".nav-parent > a").on("click" , function(){
    var current_navig = $(this);
    var target_index = current_navig.parent().index();

    $("li.nav-parent").each(function(iCounter){
      if(target_index != iCounter){
        $(this).children('a').children('.nav-next').css({
          transform: 'rotate(0deg)'
        })
        $(this).children('.items').slideUp();
      }
    })
     var this_item = $(this).next('.items');
     $(this).children('.nav-next').css({
       transform: 'rotate(90deg)'
     })
     this_item.slideDown();
  });

  $rootScope.select_this_answer=( questionId , answerId , question , answer , app_id , user_id , is_correct , answerIndex , css_mode )=>{

      if ( css_mode == true ) return false;
     if( $rootScope.isEmpty( $rootScope.this_attendee_draft ) ){
          $rootScope.this_attendee_draft = new Object();
          $rootScope.this_attendee_draft['att_draft'] = new Array();
          $rootScope.this_attendee_draft['application_id'] = $rootScope.app_id;
          $rootScope.this_attendee_draft['questionnaire_info'] = $rootScope.app_id;
          var cuIndex = $rootScope.this_attendee_draft.att_draft.findIndex (x => x.user_id == $rootScope.user_id) ;
          if(cuIndex == -1 ){
            var all_seconds = parseInt( $rootScope._settings_.time_settings.hours * 60 * 60 ) + parseInt(  $rootScope._settings_.time_settings.minutes * 60  ) + parseInt($rootScope._settings_.time_settings.seconds )
            $rootScope._settings_.time_settings.value = all_seconds ;
            $rootScope.this_attendee_draft.att_draft.push({
              'questions_data' : new Array() ,
              'is_loaded':true ,
              'start_expiration_time' : new Date() ,
              'user_id' : $rootScope.user_id ,
              'user_info':$rootScope.user_id ,
              'is_completed':false ,
              'impr_application_object':$rootScope._application_
            });
          }
     }
     // => consider ( show results per qs setting ) => ?
     var show_results_setting =  ( $rootScope._settings_ != undefined ) ?  $rootScope._settings_.show_results_per_qs : false ;
     // => consider ( review setting )
     var review_setting =  ( $rootScope._settings_ != undefined ) ?  $rootScope._settings_.review_setting : false ;
     // => consider ( multi answers  )
     var is_single_choice_setting = ( question.answer_settings.single_choice != undefined) ?  question.answer_settings.single_choice : true ;
     // => consider auto slide when answer select if it only single answer
     var auto_slide_setting = ( $rootScope._settings_ != undefined ) ?  $rootScope._settings_.auto_slide : false ;

     var answer_iu_list = $('#question_' + questionId).children('li');
     var this_answer = $('.answer_'+answerId) ;

     var stored_object = {
                 question_id : questionId ,
                 answer_id : answerId ,
                 question : question ,
                 answer: answer ,
                 app_id : app_id ,
                 user_id : user_id ,
                 is_correct : is_correct ,
                 answer_index : answerIndex
    };

    if( question.question_type == 0 || question.question_type == 1 )
                        {
                            if( is_single_choice_setting ){ // 1 - case this question has single answer
                                            // =====> Single Answer
                                  if(review_setting && show_results_setting == false ){
                                                /* Many clicks ! */
                                               // => Delete the-old highlited answer and Highlight the new selected answer
                                               answer_iu_list.removeClass('selected_answer animated shake');
                                               this_answer.addClass('selected_answer animated shake');

                                                if($rootScope.this_attendee_draft.att_draft != undefined){
                                                  // remove old answer answer_ids
                                                  var question_id = stored_object.question_id ;
                                                  // question_id
                                                  var attendee_part = $rootScope.this_attendee_draft.att_draft.find(x => x.user_id == $rootScope.user_id);
                                                  if(attendee_part != undefined){
                                                    var target_question = attendee_part.questions_data.find(x => x.question_id == question_id);
                                                    if(target_question != undefined)
                                                    target_question.answer_ids = new Array();
                                                  }
                                                }
                                               // => No need to show the correct answer here
                                               // => Angular backend ( attendee_draft  ) do this --->  allow attendee change the answer
                                               // => Mongo status => move the data into mongo ( attendee draft )
                                               $rootScope.store_into_attendee_draft(stored_object); // => Mongo VS Angular

                                  }else if ( review_setting == false && show_results_setting ) {
                                              /* One Click ! */
                                              // => Highlight the selected answer for some moments ( timeframe )
                                              var there_is_highlighted_answer = false ;
                                              answer_iu_list.each(function (i){
                                                var there = $(this).hasClass('selected_answer');
                                                if(there) there_is_highlighted_answer = true;
                                              });
                                              if(there_is_highlighted_answer == false )
                                              this_answer.addClass('selected_answer animated shake');
                                              else
                                                return false ; // => Prevent user from correct or edit his answer

                                              // => Show the correct answer if selected is wrong show the wrong style + right style ( answer )
                                                  // if user select the correct answer only need to show the right style in the selected answer
                                              var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                                              if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                                                // =>> Show The correct
                                                this_answer.addClass('right_answer');
                                              }else {
                                                // => show wrong answer
                                                this_answer.addClass('wrong_answer');
                                                // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                                                answer_iu_list.each(function (i){
                                                  var currentAnswer = $(this);
                                                  var answers_inBackend = question.answers_format[i].is_correct ;
                                                  if(answers_inBackend){
                                                    currentAnswer.addClass('right_answer');
                                                  }
                                                });
                                              }
                                              // => Angular backend ( attendee_draft  ) do this ---> don't allow attendee change the selected answer
                                              // => Mongo status => move the data into mongo ( attendee draft )
                                              $rootScope.store_into_attendee_draft(stored_object); // => Mongo VS Angular
                                              // => Auto slide status ( true ) => move to next slide directly after few moments ( timeframe )

                                  } else if ( review_setting == false && show_results_setting == false ) {
                                              /* One Click ! */
                                              // => Highlight the selected answer
                                              var there_is_highlighted_answer = false ;
                                              answer_iu_list.each(function (i){
                                                var there = $(this).hasClass('selected_answer');
                                                if(there) there_is_highlighted_answer = true;
                                              });
                                              if(there_is_highlighted_answer == false )
                                              this_answer.addClass('selected_answer animated shake');
                                              else
                                                return false ;
                                              // => No need to show the correct answer here
                                              // => Angular backend ( attendee_draft  ) do this ---> don't allow attendee change the selected answer
                                              // => Mongo status => move the data into mongo ( attendee draft )
                                              $rootScope.store_into_attendee_draft(stored_object); // => Mongo VS Angular
                                              // => Auto slide status ( true ) => move to next slide directly

                                  } else if (review_setting   && show_results_setting ) {
                                              /* Many clicks ! */
                                              // => Delete the-old highlited answer and Highlight the new selected answer for some moments ( timeframe )
                                              var there_is_highlighted_answer = false ;
                                              answer_iu_list.each(function (i){
                                                var there = $(this).hasClass('selected_answer');
                                                if(there) there_is_highlighted_answer = true;
                                              });
                                              if(there_is_highlighted_answer == false )
                                              this_answer.addClass('selected_answer animated shake');
                                              // => Show the correct answer if selected is wrong show the wrong style + right style ( answer )
                                              // if user select the correct answer only need to show the right style in the selected answer
                                              var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                                              if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                                                // =>> Show The correct
                                                this_answer.addClass('right_answer');
                                              }else {
                                                // => Show wrong answer
                                                this_answer.addClass('wrong_answer');
                                                // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                                                answer_iu_list.each(function (i){
                                                  var currentAnswer = $(this);
                                                  var answers_inBackend = question.answers_format[i].is_correct ;
                                                  if(answers_inBackend){
                                                    currentAnswer.addClass('right_answer');
                                                  }
                                                });
                                              }



                                              // => Angular backend ( attendee_draft  ) do this ---> allow attendee change the selected answer
                                              $rootScope.store_into_attendee_draft(stored_object); // => Mongo VS Angular
                                              // => Auto slide status ( true ) => move to next slide directly after few moments ( timeframe )

                                  }

                            }else { // 2 - case this question has many answers
                                          // =====> Many answer cases
                                  if(review_setting && show_results_setting == false ){
                                            /* Many clicks ! */
                                            /*
                                              if attendee clicked on selected answer
                                                ( Delete the highlighted style ) => from { UI - AngulrBD  - Mongo }
                                            */
                                            /*
                                              if attendee clicked on unselected answer
                                                ( Add the highlighted style ) => into { UI - AngulrBD  - Mongo }
                                            */
                                            if(this_answer.hasClass('selected_answer animated shake')){
                                              this_answer.removeClass('selected_answer animated shake');
                                            }else {
                                              this_answer.addClass('selected_answer animated shake');
                                            }

                                            // ===================> Updates

                                            // => No need to show the correct answers
                                            // => Angular backend ( attendee_draft  ) do this --->  allow attendee change or add the answer
                                            // => Mongo status => move the data into mongo ( attendee draft )
                                            $rootScope.store_into_attendee_draft( stored_object , false );
                                            // => Auto slide status ( NO need to go to the next slide ) onlu continue button do this action
                                  }else if(review_setting == false && show_results_setting ) {
                                            /* One Click for each answer ! */
                                            var has_wrong_answer = false ;
                                            answer_iu_list.each(function(i){
                                              var there = $(this);
                                              if(there.hasClass('wrong_answer'))
                                                has_wrong_answer = true;
                                            });
                                            if(has_wrong_answer ) return false ;
                                            /*
                                              if attendee clicked on selected answer
                                              ( Add the highlighted style ) => into { UI } ==> consider ( timeframe )
                                                Show the correct answers if attendee selected any wrong answer from many correct answers
                                            */
                                            if(!this_answer.hasClass('selected_answer'))
                                            this_answer.addClass('selected_answer animated shake');
                                            else return false ;


                                            // => Show the correct answers ( Case all correct answers are selected ) without wrong style
                                            var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                                            if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                                              // =>> Show The correct
                                              this_answer.addClass('right_answer');
                                            }else {
                                              // => show wrong answer
                                              this_answer.addClass('wrong_answer');
                                              // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                                              answer_iu_list.each(function (i){
                                                var currentAnswer = $(this);
                                                var answers_inBackend = question.answers_format[i].is_correct ;
                                                if(answers_inBackend){
                                                  currentAnswer.addClass('right_answer');
                                                }
                                              });
                                            }
                                            // => Angular backend ( attendee_draft  ) do this ---> dont allow attendee change the selected answer only add new answer !
                                            // => Mongo status => move the data into mongo ( attendee draft )
                                            $rootScope.store_into_attendee_draft( stored_object , false );
                                            // => Auto slide status ( NO need to go to the next slide ) only continue button do this action
                                  } else if ( review_setting == false && show_results_setting == false ) {
                                            /* One Click for each answer ! */
                                            /*
                                              if attendee clicked on selected answer
                                              ( Add the highlighted style ) => into { UI }
                                            */
                                            if(!this_answer.hasClass('selected_answer'))
                                            this_answer.addClass('selected_answer animated shake');
                                            else return false ;
                                            // => No need to show the correct answers
                                            // => Angular backend ( attendee_draft  ) do this ---> dont allow attendee change the selected answer only add new answer !
                                            // => Mongo status => move the data into mongo ( attendee draft )
                                            $rootScope.store_into_attendee_draft( stored_object , false );
                                            // => Auto slide status ( NO need to go to the next slide ) only continue button do this action
                                  } else if (review_setting   && show_results_setting ) {
                                            /* Many clicks ! */
                                            /*
                                              if attendee clicked on selected answer
                                                ( Delete the highlighted style ) => from  { UI } => with timeframe

                                                => case the sleceted answer is wrong - show the correct results with wrong answer style
                                            */
                                            /*
                                              if attendee clicked on unselected answer
                                                ( Add the highlighted style ) => into { UI } => with timeframe

                                                => case the sleceted answer is right - show the correct results
                                            */

                                             if(!this_answer.hasClass('selected_answer'))
                                              this_answer.addClass('selected_answer animated shake');
                                              else this_answer.removeClass('selected_answer animated shake');

                                              var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                                              if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                                                // =>> Show The correct
                                                this_answer.addClass('right_answer');
                                              }else {
                                                // => show wrong answer
                                                this_answer.addClass('wrong_answer');
                                                // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                                                answer_iu_list.each(function (i){
                                                  var currentAnswer = $(this);
                                                  var answers_inBackend = question.answers_format[i].is_correct ;
                                                  if(answers_inBackend){
                                                    currentAnswer.addClass('right_answer');
                                                  }
                                                });
                                              }
                                            // => Angular backend ( attendee_draft  ) do this --->  allow attendee change the selected answer Or add new answer !
                                            // => Mongo status => move the data into mongo ( attendee draft )
                                            $rootScope.store_into_attendee_draft( stored_object , false );
                                            // => Auto slide status ( NO need to go to the next slide ) only continue button do this action
                                  }
                            }  //  => ( End multi answers With single answer )
      }


      if( question.question_type == 2 ){ // => True False
                     if ( review_setting && show_results_setting ) {
                         /* Many clicks ! */
                         // => Delete the-old highlighted answer and Highlight the new selected answer
                         if(!this_answer.hasClass('selected_answer')){
                           answer_iu_list.each(function(i){
                             var there = $(this);
                              there.removeClass('selected_answer animated shake')
                           });
                          this_answer.addClass('selected_answer animated shake');
                         }

                         // => show the correct answer here
                         var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                         if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                           // =>> Show The correct
                           this_answer.addClass('right_answer');
                         }else {
                           // => show wrong answer
                           this_answer.addClass('wrong_answer');
                           // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                           answer_iu_list.each(function (i){
                             var currentAnswer = $(this);
                             var answers_inBackend = question.answers_format[i].is_correct ;
                             if(answers_inBackend){
                               currentAnswer.addClass('right_answer');
                             }
                           });
                         }

                         var has_wrong_answer = false ;
                         answer_iu_list.each(function(i){
                           var there = $(this);
                          if(there.hasClass('wrong_answer')) has_wrong_answer = true ;
                         });
                         if(has_wrong_answer) return false ;
                         // => Review Old answer
                         // => Angular backend ( attendee_draft  ) do this --->  allow attendee change the answer
                         // => Mongo status => move the data into mongo ( attendee draft )
                         $rootScope.store_into_attendee_draft( stored_object );
                         // => Auto slide status ( true ) => move to next slide directly

                       } else if ( review_setting == false && show_results_setting ){
                         /* One Click ! */
                         // => Highlight the selected answer for some moments ( timeframe )
                         var has_wrong_answer = false ;
                         answer_iu_list.each(function(i){
                           var there = $(this);
                          if(there.hasClass('wrong_answer') || there.hasClass('right_answer')) has_wrong_answer = true ;
                         });
                         if(has_wrong_answer) return false;
                         // => Show the correct answer if selected is wrong show the wrong style + right style ( answer )
                             // if user select the correct answer only need to show the right style in the selected answer
                             var isCorrectAnswer = question.answers_format.find(x => x._id == answerId );
                             if(isCorrectAnswer.is_correct != undefined && isCorrectAnswer.is_correct) {
                               // =>> Show The correct
                               this_answer.addClass('right_answer');
                             }else {
                               // => show wrong answer
                               this_answer.addClass('wrong_answer');
                               // => show the right answer ==> answer_5abd8c6a72eccf3923c9b4bd
                               answer_iu_list.each(function (i){
                                 var currentAnswer = $(this);
                                 var answers_inBackend = question.answers_format[i].is_correct ;
                                 if(answers_inBackend){
                                   currentAnswer.addClass('right_answer');
                                 }
                               });
                             }

                         // => Angular backend ( attendee_draft  ) do this ---> don't allow attendee change the selected answer
                         // => Mongo status => move the data into mongo ( attendee draft )
                         $rootScope.store_into_attendee_draft( stored_object );
                         // => Auto slide status ( true ) => move to next slide directly after few moments ( timeframe )

                       } else if ( review_setting && show_results_setting == false ){
                         /* Many clicks ! */
                        // => Delete the-old highlited answer and Highlight the new selected answer
                         answer_iu_list.each(function(i){
                            var there = $(this);
                              if(there.hasClass('selected_answer'))
                             there.removeClass('selected_answer animated shake')
                         });
                        this_answer.addClass('selected_answer animated shake');

                        // ==> Review old Answer
                        // ===================> Updates
                        if($rootScope.this_attendee_draft.att_draft != undefined){
                            // remove old answer answer_ids
                            var question_id = stored_object.question_id ;
                            // question_id
                            var attendee_part = $rootScope.this_attendee_draft.att_draft.find(x => x.user_id == $rootScope.user_id);
                            var attendee_inx = $rootScope.this_attendee_draft.att_draft.findIndex(x => x.user_id == $rootScope.user_id);

                            if(attendee_inx != -1 ){
                                var target_question = attendee_part.questions_data.find(x => x.question_id == question_id);
                                if(target_question != undefined)
                                  target_question.answer_ids = new Array();
                             }
                          }
                        // => No need to show the correct answer here
                        // => Angular backend ( attendee_draft  ) do this --->  allow attendee change the answer
                        // => Mongo status => move the data into mongo ( attendee draft )
                        $rootScope.store_into_attendee_draft( stored_object );
                        // => Auto slide status ( true ) => move to next slide directly

                     } else if ( review_setting == false && show_results_setting  == false ){
                         var is_selected_answer = false ;
                          answer_iu_list.each(function(){
                            var there = $(this);
                            if(there.hasClass('selected_answer')) is_selected_answer = true ;
                          });
                          if(is_selected_answer) return false ;
                         this_answer.addClass('selected_answer animated shake');
                         $rootScope.store_into_attendee_draft(stored_object);

                     }
              }

      } ;
      $rootScope.store_into_attendee_draft = (object) => {

             if (  $rootScope.this_attendee_draft != null && $rootScope.this_attendee_draft.application_id != undefined)
                { // ==> attendee_draft is not empty

                    var findAttendeeIndex = $rootScope.this_attendee_draft.att_draft.findIndex(x => x.user_id == $rootScope.user_id );
                    var findAttendee = $rootScope.this_attendee_draft.att_draft.find(x => x.user_id == $rootScope.user_id );

                    if(findAttendeeIndex != - 1){
                      // ==> Attendee Object [FOUND]
                      var attendeeInfo = $rootScope.this_attendee_draft.att_draft[findAttendeeIndex];
                      console.log({attendeeInfo : attendeeInfo});
                      if(attendeeInfo.questions_data == undefined )
                      attendeeInfo.questions_data = new Array();
                      var findQuestionIndex = attendeeInfo.questions_data.findIndex(x => x.question_id == object.question_id);
                      var findQuestion = attendeeInfo.questions_data.find(x => x.question_id == object.question_id);
                      if(findQuestionIndex == -1){

                        // ==> Question UNFOUND
                        attendeeInfo.questions_data.push({
                          question_id : object.question_id ,
                          question_index : 0 ,
                          question_type : object.question.question_type,
                          question_text : object.question.question_body,
                          answer_ids : new Array({answer_id : object.answer_id , is_correct : object.is_correct , answer_object : object.answer , answer_index : object.answer_index }) ,
                          correct_answers : object.question.answers_format.filter(x => x.is_correct == true) ,
                          updated_date : new Date()
                        });


                        // ==============================>> Report Questions ( all_questions , right_questions , wrong_questions )
                        if(attendeeInfo.report_questions == undefined)
                        attendeeInfo.report_questions = new Object();

                        if(attendeeInfo.report_questions.all_questions == undefined )
                          attendeeInfo.report_questions.all_questions = new Array();
                          // ==> Store the questions here plz
                          attendeeInfo.report_questions.all_questions.push(object.question_id);


                        // ==> store correct answers that solved
                        if(attendeeInfo.report_questions.right_questions == undefined )
                          attendeeInfo.report_questions.right_questions = new Array();

                        // ==> store wrong answers that solved
                        if(attendeeInfo.report_questions.wrong_questions == undefined )
                          attendeeInfo.report_questions.wrong_questions = new Array();


                        var answerIndexVal = object.question.answers_format.findIndex(x => x._id == object.answer_id );
                        if(answerIndexVal != -1 ){
                          answerObject = object.question.answers_format.find(x => x._id == object.answer_id );
                          if(answerObject.is_correct == true )
                            attendeeInfo.report_questions.right_questions.push(object.question_id) ;
                          else
                            attendeeInfo.report_questions.wrong_questions.push(object.question_id) ;
                        }

                        // ==============================>> Report attendee_details
                        if(attendeeInfo.report_attendee_details == undefined )
                          attendeeInfo.report_attendee_details = new Object();

                          // ==> Calculations
                          if( $rootScope._settings_  == undefined || $rootScope._settings_ == null )
                            alert("Something went wrong !")

                          var app_grade_value = parseInt($rootScope._settings_.grade_settings.value);
                          var total_app_questions = parseInt($rootScope._questions_.length);
                          var correct_questions = parseInt(attendeeInfo.report_questions.right_questions.length);
                          var wrong_questions  = parseInt(attendeeInfo.report_questions.wrong_questions.length);
                          var percentage = Math.round(correct_questions * 100 ) / total_app_questions ;
                          var isPassed = ( percentage >= app_grade_value )? true : false ;
                          var is_completed = ( total_app_questions == attendeeInfo.questions_data.length ) ? true : false ;

                          attendeeInfo.is_completed = is_completed ;
                          attendeeInfo.report_attendee_details.attendee_id = $rootScope.user_id ;
                          attendeeInfo.report_attendee_details.attendee_information = $rootScope.user_id ;
                          attendeeInfo.report_attendee_details.total_questions = attendeeInfo.questions_data.length ;
                          attendeeInfo.report_attendee_details.pass_mark = isPassed ,
                          attendeeInfo.report_attendee_details.correct_answers =  correct_questions ,
                          attendeeInfo.report_attendee_details.wrong_answers = wrong_questions ;
                          attendeeInfo.report_attendee_details.status= (isPassed == true ) ? "Passed": "Failed";
                          attendeeInfo.report_attendee_details.score= percentage;
                          attendeeInfo.report_attendee_details.completed_status= is_completed;
                          attendeeInfo.report_attendee_details.created_at= new Date();
                          attendeeInfo.report_attendee_details.completed_date= new Date();


                          // ==============================>> Report report_attendees
                          if(attendeeInfo.report_attendees == undefined )
                            attendeeInfo.report_attendees = new Object();

                            attendeeInfo.report_attendees.created_at = new Date()
                            attendeeInfo.report_attendees.updated_at = new Date()
                            attendeeInfo.report_attendees.attendee_id = $rootScope.user_id;
                            attendeeInfo.report_attendees.user_information = $rootScope.user_id;
                            attendeeInfo.report_attendees.is_completed = is_completed ;
                            attendeeInfo.report_attendees.passed_the_grade = isPassed ;
                            attendeeInfo.report_attendees.survey_quiz_answers = new Array();
                            attendeeInfo.report_attendees.results = new Object();
                            attendeeInfo.report_attendees.results['wrong_answers'] = wrong_questions;
                            attendeeInfo.report_attendees.results['correct_answers'] = correct_questions ;
                            attendeeInfo.report_attendees.results['count_of_questions'] = attendeeInfo.questions_data.length ;
                            attendeeInfo.report_attendees.results['result'] = new Object();
                            attendeeInfo.report_attendees.results['result']['percentage_value'] = percentage;
                            attendeeInfo.report_attendees.results['result']['raw_value'] = correct_questions ;
                            attendeeInfo.report_attendees.survey_quiz_answers.push({
                              question_id :  object.question_id  ,
                              questions : {
                                question_id : object.question_id,
                                question_body :object.question.question_body ,
                                question_type : object.question.question_type
                              } ,
                              answers : {
                                answer_id : new Array (object.answer_id) ,
                                answer_body :  new Object() ,
                                is_correct : object.is_correct
                              }
                            });
                            attendeeInfo.report_attendees.survey_quiz_answers[attendeeInfo.report_attendees.survey_quiz_answers.length - 1 ].
                            answers.answer_body["answer_id_"+object.answer_id] = {
                                     answer_id : object.answer_id ,
                                     answer_body : object.answer ,
                                     is_correct : object.is_correct
                             }
                             console.log({attendeeInfo: attendeeInfo});
                            // console.log(attendeeInfo);
                      }else {
                        // ==> Question FOUND ==> Update here !
                         var findAnswer = findQuestion.answer_ids.find(x => x.answer_id == object.answer_id);
                         var findAnswerIndex = findQuestion.answer_ids.findIndex(x => x.answer_id == object.answer_id);
                         if(findAnswerIndex == -1 ){
                           findQuestion.answer_ids.push({
                              answer_id : object.answer_id , is_correct : object.is_correct , answer_object : object.answer , answer_index : object.answer_index
                            });
                         }else{
                           findQuestion.answer_ids.splice(findAnswerIndex, 1);
                         }


                         var app_correct_answers =  findQuestion.correct_answers
                         var attendee_solved_answers =  findQuestion.answer_ids
                         var question_status = function (a, b) {
                              var correct_answers = a.map( function(x){ return x._id; } );
                              var solved_answers = b.map( function(x){ return x.answer_id; } );
                              var is_right_question =  (solved_answers.sort().join('') == correct_answers.sort().join(''));
                              return is_right_question ;
                            };
                         var isCorrect =  question_status (app_correct_answers , attendee_solved_answers);

                         if(findQuestion.answer_ids.length != 0){
                                 var all_report_questions_index = attendeeInfo.report_questions.all_questions.findIndex(x => x == object.question_id);
                                 if(all_report_questions_index != -1 ){

                                   var wrong_exists =  attendeeInfo.report_questions.wrong_questions.findIndex(x => x == object.question_id);
                                   var right_exists =  attendeeInfo.report_questions.right_questions.findIndex(x => x == object.question_id);

                                   if(isCorrect == false ){
                                     if( wrong_exists == -1 )  // add  here
                                       attendeeInfo.report_questions.wrong_questions.push(object.question_id);

                                     if(right_exists != -1 )  // delete it from here
                                       attendeeInfo.report_questions.right_questions.splice(right_exists , 1 );
                                   }else {
                                     if(right_exists == -1 )  // add  here
                                        attendeeInfo.report_questions.right_questions.push(object.question_id);

                                     if( wrong_exists != -1 ){ // delete it from here
                                        attendeeInfo.report_questions.wrong_questions.splice(wrong_exists , 1);
                                     }
                                   }
                                 } // => End all questions
                          }else if(findQuestion.answer_ids.length == 0){
                           var qsIndex_all = attendeeInfo.report_questions.all_questions.findIndex( x => x == object.question_id);
                           var qsIndex_wrong = attendeeInfo.report_questions.wrong_questions.findIndex(x => x == object.question_id);
                           var qsIndex_right = attendeeInfo.report_questions.right_questions.findIndex(x => x == object.question_id);

                           if(qsIndex_wrong != -1)
                           attendeeInfo.report_questions.wrong_questions.splice(qsIndex_wrong , 1);

                           if(qsIndex_right != -1)
                           attendeeInfo.report_questions.right_questions.splice(qsIndex_right , 1);

                           if(qsIndex_all != -1)
                           attendeeInfo.report_questions.all_questions.splice(qsIndex_all , 1);
                         } // End store answer question



                         var app_grade_value = parseInt($rootScope._settings_.grade_settings.value);
                         var total_app_questions = parseInt($rootScope._questions_.length);
                         var correct_questions = parseInt(attendeeInfo.report_questions.right_questions.length);
                         var wrong_questions  = parseInt(attendeeInfo.report_questions.wrong_questions.length);
                         var percentage = Math.round(correct_questions * 100 ) / total_app_questions ;
                         var isPassed = ( percentage >= app_grade_value )? true : false ;
                         var is_completed = ( total_app_questions == attendeeInfo.questions_data.length ) ? true : false ;

                         attendeeInfo.is_completed = is_completed ;
                         attendeeInfo.report_attendee_details.total_questions = attendeeInfo.questions_data.length ;
                         attendeeInfo.report_attendee_details.pass_mark = isPassed ,
                         attendeeInfo.report_attendee_details.correct_answers =  correct_questions ,
                         attendeeInfo.report_attendee_details.wrong_answers = wrong_questions ;
                         attendeeInfo.report_attendee_details.status= (isPassed == true ) ? "Passed": "Failed";
                         attendeeInfo.report_attendee_details.score= percentage;
                         attendeeInfo.report_attendee_details.completed_status= is_completed;
                         attendeeInfo.report_attendee_details.completed_date= new Date();


                         attendeeInfo.report_attendees.updated_at = new Date()
                         attendeeInfo.report_attendees.attendee_id = $rootScope.user_id;
                         attendeeInfo.report_attendees.user_information = $rootScope.user_id;
                         attendeeInfo.report_attendees.is_completed = is_completed ;
                         attendeeInfo.report_attendees.passed_the_grade = isPassed ;

                         attendeeInfo.report_attendees.results['wrong_answers'] = wrong_questions;
                         attendeeInfo.report_attendees.results['correct_answers'] = correct_questions ;
                         attendeeInfo.report_attendees.results['count_of_questions'] = attendeeInfo.questions_data.length ;
                         attendeeInfo.report_attendees.results['result']['percentage_value'] = percentage;
                         attendeeInfo.report_attendees.results['result']['raw_value'] = correct_questions ;
                         var qsIndex_x = attendeeInfo.report_attendees.survey_quiz_answers.findIndex(x => x.question_id == object.question_id);
                         var question_obj_val ;
                         if(qsIndex_x != -1 ){
                            question_obj_val = {
                              question_id :  object.question_id  ,
                              questions : {
                                question_id : object.question_id,
                                question_body :object.question.question_body ,
                                question_type : object.question.question_type
                              } ,
                              answers : {
                                answer_id : new Array (object.answer_id) ,
                                answer_body :  new Object() ,
                                is_correct : object.is_correct
                              }
                            }; // end question object

                             question_obj_val.answers.answer_body["answer_id_"+object.answer_id] = {
                                     answer_id : object.answer_id ,
                                     answer_body : object.answer ,
                                     is_correct : object.is_correct
                             }

                             attendeeInfo.report_attendees.survey_quiz_answers[qsIndex_x] = question_obj_val ;

                         }
                      }
                    }else {
                      // ==> Attenee Object [UNFOUND]

                    }
                }else {
                  // ==> attendee_draft is empty

                }

                $timeout(function(){  $rootScope.$apply(); } , 300);
                console.log({
                  currAttendee : $rootScope.this_attendee_draft
                });
    }

  $rootScope.back_to_previouse_slide = (css_mode) => {
    if ( css_mode == true ) return false;
      var question_index = $rootScope.question_index;



    // if( question_index == ( $rootScope._questions_.length - 1 ) ) $rootScope.screen_type = 1;
    if( question_index != 0  && ( question_index == ( $rootScope._questions_.length - 1 ) && $rootScope.screen_type == 3 ))
      $rootScope.question_index = $rootScope.question_index - 1;
      if( question_index != 0 &&  question_index < ( $rootScope._questions_.length - 1 ) )
      $rootScope.question_index = $rootScope.question_index - 1;
      if(question_index != 0 )
        $rootScope.highlighted_by_color_only();

        if ( $rootScope.screen_type == 1 )
        {
          $rootScope.question_index = ( $rootScope._questions_.length - 1 );
          $rootScope.screen_type = 3 ;
          $rootScope.is_view = true;
        }
        if ( question_index == 0 ) {
          if($rootScope._settings_.enable_screens == true ){
            $rootScope.screen_type = 0;
            $rootScope.is_view = true;
            $("#docQuestions > li").each(function(){
              $(this).removeClass('marked_question');
            })
          }
        };
        $(".preview-page , .swiper-wrapper").css({  height : 'auto'});
  }
  $rootScope.go_to_next_slide = (css_mode) => {
    if(css_mode == true ) return false;
    var question_index = $rootScope.question_index;
    console.log(question_index == ( $rootScope._questions_.length - 1 ) );
    if( question_index == ( $rootScope._questions_.length - 1 ) )
      {
        if($rootScope._settings_.enable_screens == true )
          {
            $rootScope.is_view = true;
            $rootScope.screen_type = 1;
            $("#docQuestions").children("li").each(function(){
               if( $(this).hasClass('marked_question') )
               $(this).removeClass('marked_question');
            });
          }
      }
    else
    {
      $rootScope.question_index = $rootScope.question_index + 1;
      $rootScope.highlighted_by_color_only();
    }
    $(".preview-page , .swiper-wrapper").css({  height : 'auto'});
    $timeout(function(){$rootScope.$apply()} , 300);
  }
  $rootScope.start_the_quiz = (css_mode) => {
      if(css_mode == true ) return false;
      $rootScope.screen_type = 3 ;
      $rootScope.is_view = true;
      $rootScope.question_index = 0 ;
      $rootScope.highlighted_by_color_only();
      $timeout(function(){$rootScope.$apply()} , 300);
      $(".preview-page, .swiper-wrapper").css({  height : 'auto'});
  }
  $rootScope.submit_the_quiz = (css_mode) => {
    if(css_mode == true ) return false;
    // ==> if There a required question
    // are_all_questions_tracked
    if($rootScope.this_attendee_draft == undefined || $rootScope.this_attendee_draft.att_draft == undefined ){
      $rootScope.unsolved_questions = $rootScope._questions_ ;
    }
    else {
      var usr = $rootScope.this_attendee_draft.att_draft.find(x => x.user_id == $rootScope.user_id );
      if(usr != undefined ){
        $rootScope.unsolved_questions = $rootScope._questions_.are_all_questions_tracked( usr.questions_data );
      }
    }
    if($rootScope.unsolved_questions.length != 0 )
      return false;
    // ==> Go to screen
    if( $rootScope.screen_type == 1 ){
      $rootScope.is_view = true;
      $rootScope.screen_type = 2;
    }
    $(".preview-page , .swiper-wrapper").css({  height : 'auto'});
  }
  $rootScope.go_back_to_first_qs = (css_mode) => {
    if(css_mode == true ) return false;
    if($rootScope._questions_.length != 0 )
    $rootScope.question_index = 0 ;
    $rootScope.screen_type = 3;
  }
  $rootScope.highlighted_by_color_only = () => {
    var questionId = $rootScope._questions_[$rootScope.question_index]._id;

    $("#docQuestions").children("li").each(function(){
       if( $(this).hasClass('marked_question') )
       $(this).removeClass('marked_question');
    });
    $timeout(function(){
      $("#docQuestions").children('li.qs-'+questionId.toString()).addClass('marked_question');
    });
  }
  $rootScope.timer_is_enabled = (is_enabeld) => {
    if(is_enabeld == true )
    $(".time-frames > input, .time-frames > input , .time-frames > span").css("color" , "#fff")
    else $(".time-frames > input, .time-frames > input  , .time-frames > span").css("color" , "#b3b3b3")
  }
  $rootScope.enable_screen_func = (is_enabled_screen) => {
    if( is_enabled_screen == false )
      $rootScope.screen_type = 3 ;
      else
      $rootScope.screen_type = 0 ;
  };
  $rootScope.changing_into_we_screen = (scType) => {
    if(scType == false ) $rootScope.screen_type = 3 ;
    else $rootScope.screen_type = 0 ;
  }
  $rootScope.change_in_view = (screen_number , question_index = null , setting_name = null , setting_val = null ) => {
    if(setting_name != null && setting_val != null ){
      if(setting_name == 'randomize')
      $rootScope.randomize_sorting_questions(setting_val);
    }

    $rootScope.screen_type = screen_number ;
    $rootScope.switching_editor_preview(true);
    if(question_index != null ){
      $rootScope.question_index = question_index ;
    }
  }
  $rootScope.enable_css_mode_func = ( is_enabled ) => {
    $("#enabled_css").val( is_enabled );
   if(is_enabled == true ){
     $rootScope.switching_editor_preview(true)
     $rootScope.enable_css_mode = true;
      $('body , html').bind('mouseover' , function(e){
        var target = e.target;
        $('.selector').each(function(){
          $(this).removeClass('selector_line');
        });

        if( typeof(target.className) == 'object')
        return false;

        if(target.className.indexOf('selector') != -1 ){  ;
          $(target).addClass('selector_line');
        }
      });
      $('body , html').click(function(e){
        // box-svg-container
        if( typeof(e.target.className) == 'object')
        return false;

        if(e.target.className.indexOf('selector') != -1 ){

            $( '.selector' ).prop('contenteditable', false );
            $( '*' ).each(function(e){
              $(this).css ({outlineColor : "transparent"});
            })
            e.target.contentEditable = true ;
            e.target.setAttribute("onkeydown","if(event.metaKey) return true; return false;");
            e.target.style.outline = "#20fdb9 solid 3px";
            if(e.target.getAttribute('box-target-type') == 'box-player')
            e.target.style.outlineOffset = "-4px";
            else
            e.target.style.outlineOffset = "4px";
            e.target.focus();
            $( '.selector' ).attr('disabled');


            var current_class = $("."+e.target.getAttribute('box-target-class')) ;
            $rootScope.selector_class = "." + e.target.getAttribute('box-target-class')
            // ==> Show Options
            if(e.target.getAttribute('box-target-type') == 'box-buttons'){

              $rootScope.border_models_color = current_class.css("border-color");
              $('.border_models_color').spectrum('set' , $rootScope.border_models_color );

              $rootScope.color_models = current_class.css("color");
              $('.color_models').spectrum('set' , $rootScope.color_models );

              $rootScope.background_models = current_class.css("background-color");
              $('.background_models').spectrum('set' , $rootScope.background_models );

              $rootScope.font_size_models = parseInt(current_class.css("font-size"));
              var current_class = $("."+e.target.getAttribute('box-target-class')) ;;

              $rootScope.font_family_models = current_class.css("font-family").toString().toLowerCase();

              $rootScope.border_style_models = current_class.css("border-style").toString();
              $rootScope.border_left_models = current_class.css("border-left-width").toString();
              $rootScope.border_right_models = current_class.css("border-right-width").toString();
              $rootScope.border_top_models = current_class.css("border-top-width").toString();
              $rootScope.border_bottom_models = current_class.css("border-bottom-width").toString();

              $rootScope.selecotor_name = ".Buttons";
              $rootScope.css_pellet_mode.background = true;
              $rootScope.css_pellet_mode.border = true;
              $rootScope.css_pellet_mode.color = true ;
              $rootScope.css_pellet_mode.fontSize = true ;
              $rootScope.css_pellet_mode.fontFamily = true ;
              $rootScope.css_pellet_mode.width = false ;

              $rootScope.css_pellet_mode.hover_background = false ;
              $rootScope.css_pellet_mode.hover_border = false ;
              $rootScope.css_pellet_mode.hover_color = false ;
              $rootScope.css_pellet_mode.selected_background = false ;
              $rootScope.css_pellet_mode.selected_border = false ;
              $rootScope.css_pellet_mode.selected_color = false ;
              $rootScope.css_pellet_mode.correct_background = false ;
              $rootScope.css_pellet_mode.correct_border = false ;
              $rootScope.css_pellet_mode.correct_color = false ;
              $rootScope.css_pellet_mode.correct_icon_background = false ;
              $rootScope.css_pellet_mode.correct_icon_border = false ;
              $rootScope.css_pellet_mode.correct_icon_color = false ;
              $rootScope.css_pellet_mode.wrong_background = false ;
              $rootScope.css_pellet_mode.wrong_border = false ;
              $rootScope.css_pellet_mode.wrong_color = false ;
              $rootScope.css_pellet_mode.wrong_icon_background = false ;
              $rootScope.css_pellet_mode.wrong_icon_border = false ;
              $rootScope.css_pellet_mode.wrong_icon_color = false ;
              $rootScope.css_pellet_mode.rating_color = false ;
              $rootScope.css_pellet_mode.scale_color = false ;
              $rootScope.css_pellet_mode.scale_hover_color = false ;
              $rootScope.css_pellet_mode.scale_background = false ;
              $rootScope.css_pellet_mode.scale_hover_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_color = false ;

              $rootScope.css_pellet_mode.radial_strock = false ;
              $rootScope.css_pellet_mode.radial_fill = false ;
              $rootScope.css_pellet_mode.radial_text_color = false ;
            }
            if(e.target.getAttribute('box-target-type') == 'box-player'){
              // ==> fill colors
              $rootScope.background_models = current_class.css("background-color");
              $('.background_models').spectrum('set' , $rootScope.background_models );

              // ==> show inputs
              $rootScope.selecotor_name = ".Player-Page";
              $rootScope.css_pellet_mode.background = true;
              $rootScope.css_pellet_mode.border = false;
              $rootScope.css_pellet_mode.color = false ;
              $rootScope.css_pellet_mode.fontSize = false ;
              $rootScope.css_pellet_mode.fontFamily = false ;
              $rootScope.css_pellet_mode.width = false ;

              $rootScope.css_pellet_mode.hover_background = false ;
              $rootScope.css_pellet_mode.hover_border = false ;
              $rootScope.css_pellet_mode.hover_color = false ;
              $rootScope.css_pellet_mode.selected_background = false ;
              $rootScope.css_pellet_mode.selected_border = false ;
              $rootScope.css_pellet_mode.selected_color = false ;
              $rootScope.css_pellet_mode.correct_background = false ;
              $rootScope.css_pellet_mode.correct_border = false ;
              $rootScope.css_pellet_mode.correct_color = false ;
              $rootScope.css_pellet_mode.correct_icon_background = false ;
              $rootScope.css_pellet_mode.correct_icon_border = false ;
              $rootScope.css_pellet_mode.correct_icon_color = false ;
              $rootScope.css_pellet_mode.wrong_background = false ;
              $rootScope.css_pellet_mode.wrong_border = false ;
              $rootScope.css_pellet_mode.wrong_color = false ;
              $rootScope.css_pellet_mode.wrong_icon_background = false ;
              $rootScope.css_pellet_mode.wrong_icon_border = false ;
              $rootScope.css_pellet_mode.wrong_icon_color = false ;
              $rootScope.css_pellet_mode.rating_color = false ;
              $rootScope.css_pellet_mode.scale_color = false ;
              $rootScope.css_pellet_mode.scale_hover_color = false ;
              $rootScope.css_pellet_mode.scale_background = false ;
              $rootScope.css_pellet_mode.scale_hover_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_color = false ;

              $rootScope.css_pellet_mode.radial_strock = false ;
              $rootScope.css_pellet_mode.radial_fill = false ;
              $rootScope.css_pellet_mode.radial_text_color = false ;

            }
            if(e.target.getAttribute('box-target-type') == 'box-containers'){
              // ==> fill colors

              $rootScope.background_models = current_class.css("background-color");
              $rootScope.border_models_color = current_class.css("border-color");

              $('.border_models_color').spectrum('set' , $rootScope.border_models_color );
              $('.background_models').spectrum('set' , $rootScope.background_models );
              if(current_class.css("border-style") == undefined ) {

                // alert("is Working only when you set 'Single Response' to false !");
                return false ;
              }
              $rootScope.border_style_models = current_class.css("border-style").toString();
              $rootScope.border_left_models = current_class.css("border-left-width").toString();
              $rootScope.border_right_models = current_class.css("border-right-width").toString();
              $rootScope.border_top_models = current_class.css("border-top-width").toString();
              $rootScope.border_bottom_models = current_class.css("border-bottom-width").toString();

              // ==> show inputs
              $rootScope.selecotor_name = ".Container";
              $rootScope.css_pellet_mode.background = true;
              $rootScope.css_pellet_mode.border = true;
              $rootScope.css_pellet_mode.width = false ;
              $rootScope.css_pellet_mode.color = false ;
              $rootScope.css_pellet_mode.fontSize = false ;
              $rootScope.css_pellet_mode.fontFamily = false ;

              $rootScope.css_pellet_mode.hover_background = false ;
              $rootScope.css_pellet_mode.hover_border = false ;
              $rootScope.css_pellet_mode.hover_color = false ;
              $rootScope.css_pellet_mode.selected_background = false ;
              $rootScope.css_pellet_mode.selected_border = false ;
              $rootScope.css_pellet_mode.selected_color = false ;
              $rootScope.css_pellet_mode.correct_background = false ;
              $rootScope.css_pellet_mode.correct_border = false ;
              $rootScope.css_pellet_mode.correct_color = false ;
              $rootScope.css_pellet_mode.correct_icon_background = false ;
              $rootScope.css_pellet_mode.correct_icon_border = false ;
              $rootScope.css_pellet_mode.correct_icon_color = false ;
              $rootScope.css_pellet_mode.wrong_background = false ;
              $rootScope.css_pellet_mode.wrong_border = false ;
              $rootScope.css_pellet_mode.wrong_color = false ;
              $rootScope.css_pellet_mode.wrong_icon_background = false ;
              $rootScope.css_pellet_mode.wrong_icon_border = false ;
              $rootScope.css_pellet_mode.wrong_icon_color = false ;
              $rootScope.css_pellet_mode.rating_color = false ;
              $rootScope.css_pellet_mode.scale_color = false ;
              $rootScope.css_pellet_mode.scale_hover_color = false ;
              $rootScope.css_pellet_mode.scale_background = false ;
              $rootScope.css_pellet_mode.scale_hover_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_color = false ;

              $rootScope.css_pellet_mode.radial_strock = false ;
              $rootScope.css_pellet_mode.radial_fill = false ;
              $rootScope.css_pellet_mode.radial_text_color = false ;
            }
            if(e.target.getAttribute('box-target-type') == 'box-answers'){
                // ==> Fetch Style results

                // Basic answers
                // var current_class = e.target.getAttribute('box-target-class');
                // console.log(current_class);
                $rootScope.selecotor_name = ".Answers";
                $rootScope.background_models = current_class.css("background-color");
                $rootScope.border_models_color = current_class.css("border-color");
                $rootScope.color_models = current_class.css("color");
                $rootScope.font_size_models = parseInt(current_class.css("font-size"));

                $rootScope.font_family_models = (current_class.css("font-family") != undefined )? current_class.css("font-family").toString().toLowerCase():'';
                $rootScope.border_style_models = (current_class.css("border-style") != undefined ) ? current_class.css("border-style").toString() : '';
                $rootScope.border_left_models = (current_class.css("border-left-width") != undefined ) ? current_class.css("border-left-width").toString() : '';
                $rootScope.border_right_models = (current_class.css("border-right-width") != undefined ) ? current_class.css("border-right-width").toString() : '';
                $rootScope.border_top_models = (current_class.css("border-top-width") != undefined ) ? current_class.css("border-top-width").toString() : '';
                $rootScope.border_bottom_models = (current_class.css("border-bottom-width") != undefined ) ? current_class.css("border-bottom-width").toString() : '';
                $('.border_models_color').spectrum('set' , $rootScope.border_models_color );
                $('.background_models').spectrum('set' , $rootScope.background_models );
                $('.color_models').spectrum('set' , $rootScope.color_models );


                // ==> Hover answers
                var hover_classes = $('.'+e.target.getAttribute('box-target-class') +':hover');
                $rootScope.hover_border_models_color = hover_classes.css('border-color');
                $rootScope.hover_background_models  = hover_classes.css('background-color');
                $rootScope.hover_color_models = hover_classes.css('color');
                $rootScope.hover_border_style_models = hover_classes.css('border-style');
                $rootScope.hover_border_left_models = hover_classes.css('border-left-width');
                $rootScope.hover_border_right_models = hover_classes.css('border-right-width');
                $rootScope.hover_border_top_models = hover_classes.css('border-top-width');
                $rootScope.hover_border_bottom_models = hover_classes.css('border-bottom-width');
                $('.hover_border_models_color').spectrum('set' , $rootScope.hover_border_models_color );
                $('.hover_background_models').spectrum('set' , $rootScope.hover_background_models );
                $('.hover_color_models').spectrum('set' , $rootScope.hover_color_models );

                // ==> Selected Answers (selected_answer) =>
                var selected_classes = $('.'+e.target.getAttribute('box-target-class') +'.selected_answer');
                $rootScope.selected_border_models_color = selected_classes.css('border-color');
                $rootScope.selected_background_models  = selected_classes.css('background-color');
                $rootScope.selected_color_models = selected_classes.css('color');
                $rootScope.selected_border_style_models = selected_classes.css('border-style');
                $rootScope.selected_border_left_models = selected_classes.css('border-left-width');
                $rootScope.selected_border_right_models = selected_classes.css('border-right-width');
                $rootScope.selected_border_top_models = selected_classes.css('border-top-width');
                $rootScope.selected_border_bottom_models = selected_classes.css('border-bottom-width');
                $('.selected_border_models_color').spectrum('set' , $rootScope.selected_border_models_color );
                $('.selected_background_models').spectrum('set' , $rootScope.selected_background_models );
                $('.selected_color_models').spectrum('set' , $rootScope.selected_color_models );


                var question_type = $rootScope._questions_[$rootScope.question_index].question_type ;
                if(question_type == undefined) return false ;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.background = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.border = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.color = true ;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.fontSize = true ;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.fontFamily = true ;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.width = false ;


                /* Consider the following cases +++++ */
                // ==> Case Hover in answer
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.hover_background = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.hover_border = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.hover_color = true ;

                // ==> Case select answer
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.selected_background = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.selected_border = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.selected_color = true ;

                // ==> Case correct answer
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.correct_background = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.correct_border = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.correct_color = true ;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.correct_icon_background = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.correct_icon_border = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.correct_icon_color = true ;

                // ==> Case wrong answer
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.wrong_background = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.wrong_border = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.wrong_color = true ;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.wrong_icon_background = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.wrong_icon_border = true;
                if( question_type == 0 || question_type == 1 || question_type == 2)
                $rootScope.css_pellet_mode.wrong_icon_color = true ;

                // ==> rating and scale answers
                if( question_type == 3 )
                $rootScope.css_pellet_mode.rating_color = false;
                // ==> Do border for scale answers
                if( question_type == 3 )
                $rootScope.css_pellet_mode.scale_color = false ;
                if( question_type == 3 )
                $rootScope.css_pellet_mode.scale_hover_color = false ;
                if( question_type == 3 )
                $rootScope.css_pellet_mode.scale_background = false;
                if( question_type == 3 )
                $rootScope.css_pellet_mode.scale_hover_background = false;

                // ==> Free texts answers
                if( question_type == 4 )
                $rootScope.css_pellet_mode.free_boxtext_background = false;
                if( question_type == 4 )
                $rootScope.css_pellet_mode.free_boxtext_color = false;
                // ==> consider to set border in this option


                $rootScope.css_pellet_mode.radial_strock = false ;
                $rootScope.css_pellet_mode.radial_fill = false ;
                $rootScope.css_pellet_mode.radial_text_color = false ;
            }
            if(e.target.getAttribute('box-target-type') == 'box-texts'){
              // ==> fill colors
              $rootScope.color_models = current_class.css("color");
              $('.color_models').spectrum('set' , $rootScope.color_models );

              $rootScope.font_size_models = parseInt(current_class.css("font-size"));
              $rootScope.font_family_models = current_class.css("font-family").toString().toLowerCase();

              $rootScope.selecotor_name = ".Texts";
              $rootScope.css_pellet_mode.background = false;
              $rootScope.css_pellet_mode.border = false;
              $rootScope.css_pellet_mode.color = true ;
              $rootScope.css_pellet_mode.fontSize = true ;
              $rootScope.css_pellet_mode.fontFamily = true ;
              $rootScope.css_pellet_mode.width = false ;

              $rootScope.css_pellet_mode.hover_background = false ;
              $rootScope.css_pellet_mode.hover_border = false ;
              $rootScope.css_pellet_mode.hover_color = false ;
              $rootScope.css_pellet_mode.selected_background = false ;
              $rootScope.css_pellet_mode.selected_border = false ;
              $rootScope.css_pellet_mode.selected_color = false ;
              $rootScope.css_pellet_mode.correct_background = false ;
              $rootScope.css_pellet_mode.correct_border = false ;
              $rootScope.css_pellet_mode.correct_color = false ;
              $rootScope.css_pellet_mode.correct_icon_background = false ;
              $rootScope.css_pellet_mode.correct_icon_border = false ;
              $rootScope.css_pellet_mode.correct_icon_color = false ;
              $rootScope.css_pellet_mode.wrong_background = false ;
              $rootScope.css_pellet_mode.wrong_border = false ;
              $rootScope.css_pellet_mode.wrong_color = false ;
              $rootScope.css_pellet_mode.wrong_icon_background = false ;
              $rootScope.css_pellet_mode.wrong_icon_border = false ;
              $rootScope.css_pellet_mode.wrong_icon_color = false ;
              $rootScope.css_pellet_mode.rating_color = false ;
              $rootScope.css_pellet_mode.scale_color = false ;
              $rootScope.css_pellet_mode.scale_hover_color = false ;
              $rootScope.css_pellet_mode.scale_background = false ;
              $rootScope.css_pellet_mode.scale_hover_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_color = false ;

              $rootScope.css_pellet_mode.radial_strock = false ;
              $rootScope.css_pellet_mode.radial_fill = false ;
              $rootScope.css_pellet_mode.radial_text_color = false ;
            }
            if(e.target.getAttribute('box-target-type') == "box-media"){
              $rootScope.selecotor_name = ".Media Container";
              $rootScope.media_container = parseInt(current_class.width());

              $rootScope.css_pellet_mode.background = false;
              $rootScope.css_pellet_mode.border = false;
              $rootScope.css_pellet_mode.color = false ;
              $rootScope.css_pellet_mode.fontSize = false ;
              $rootScope.css_pellet_mode.fontFamily = false ;
              $rootScope.css_pellet_mode.width = true ;

              $rootScope.css_pellet_mode.hover_background = false ;
              $rootScope.css_pellet_mode.hover_border = false ;
              $rootScope.css_pellet_mode.hover_color = false ;
              $rootScope.css_pellet_mode.selected_background = false ;
              $rootScope.css_pellet_mode.selected_border = false ;
              $rootScope.css_pellet_mode.selected_color = false ;
              $rootScope.css_pellet_mode.correct_background = false ;
              $rootScope.css_pellet_mode.correct_border = false ;
              $rootScope.css_pellet_mode.correct_color = false ;
              $rootScope.css_pellet_mode.correct_icon_background = false ;
              $rootScope.css_pellet_mode.correct_icon_border = false ;
              $rootScope.css_pellet_mode.correct_icon_color = false ;
              $rootScope.css_pellet_mode.wrong_background = false ;
              $rootScope.css_pellet_mode.wrong_border = false ;
              $rootScope.css_pellet_mode.wrong_color = false ;
              $rootScope.css_pellet_mode.wrong_icon_background = false ;
              $rootScope.css_pellet_mode.wrong_icon_border = false ;
              $rootScope.css_pellet_mode.wrong_icon_color = false ;
              $rootScope.css_pellet_mode.rating_color = false ;
              $rootScope.css_pellet_mode.scale_color = false ;
              $rootScope.css_pellet_mode.scale_hover_color = false ;
              $rootScope.css_pellet_mode.scale_background = false ;
              $rootScope.css_pellet_mode.scale_hover_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_color = false ;

              $rootScope.css_pellet_mode.radial_strock = false ;
              $rootScope.css_pellet_mode.radial_fill = false ;
              $rootScope.css_pellet_mode.radial_text_color = false ;
            }
            if(e.target.getAttribute('box-target-type') == 'box-labels'){

              $rootScope.border_models_color = current_class.css("border-color");
              $('.border_models_color').spectrum('set' , $rootScope.border_models_color );

              $rootScope.color_models = current_class.css("color");
              $('.color_models').spectrum('set' , $rootScope.color_models );

              $rootScope.background_models = current_class.css("background-color");
              $('.background_models').spectrum('set' , $rootScope.background_models );

              $rootScope.selecotor_name = ".Box";
              $rootScope.css_pellet_mode.background = true;
              $rootScope.css_pellet_mode.border = true;
              $rootScope.css_pellet_mode.color = true ;
              $rootScope.css_pellet_mode.fontSize = false ;
              $rootScope.css_pellet_mode.fontFamily = false ;
              $rootScope.css_pellet_mode.width = false ;

              $rootScope.css_pellet_mode.hover_background = false ;
              $rootScope.css_pellet_mode.hover_border = false ;
              $rootScope.css_pellet_mode.hover_color = false ;
              $rootScope.css_pellet_mode.selected_background = false ;
              $rootScope.css_pellet_mode.selected_border = false ;
              $rootScope.css_pellet_mode.selected_color = false ;
              $rootScope.css_pellet_mode.correct_background = false ;
              $rootScope.css_pellet_mode.correct_border = false ;
              $rootScope.css_pellet_mode.correct_color = false ;
              $rootScope.css_pellet_mode.correct_icon_background = false ;
              $rootScope.css_pellet_mode.correct_icon_border = false ;
              $rootScope.css_pellet_mode.correct_icon_color = false ;
              $rootScope.css_pellet_mode.wrong_background = false ;
              $rootScope.css_pellet_mode.wrong_border = false ;
              $rootScope.css_pellet_mode.wrong_color = false ;
              $rootScope.css_pellet_mode.wrong_icon_background = false ;
              $rootScope.css_pellet_mode.wrong_icon_border = false ;
              $rootScope.css_pellet_mode.wrong_icon_color = false ;
              $rootScope.css_pellet_mode.rating_color = false ;
              $rootScope.css_pellet_mode.scale_color = false ;
              $rootScope.css_pellet_mode.scale_hover_color = false ;
              $rootScope.css_pellet_mode.scale_background = false ;
              $rootScope.css_pellet_mode.scale_hover_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_color = false ;

              $rootScope.css_pellet_mode.radial_strock = false ;
              $rootScope.css_pellet_mode.radial_fill = false ;
              $rootScope.css_pellet_mode.radial_text_color = false ;
            }
            if(e.target.getAttribute('box-target-type') == 'box-svg-container'){
              $rootScope.selecotor_name = ".Radial";
              $rootScope.css_pellet_mode.background = false;
              $rootScope.css_pellet_mode.border = false;
              $rootScope.css_pellet_mode.color = false ;
              $rootScope.css_pellet_mode.fontSize = false ;
              $rootScope.css_pellet_mode.fontFamily = false ;
              $rootScope.css_pellet_mode.width = false ;

              $rootScope.css_pellet_mode.hover_background = false ;
              $rootScope.css_pellet_mode.hover_border = false ;
              $rootScope.css_pellet_mode.hover_color = false ;
              $rootScope.css_pellet_mode.selected_background = false ;
              $rootScope.css_pellet_mode.selected_border = false ;
              $rootScope.css_pellet_mode.selected_color = false ;
              $rootScope.css_pellet_mode.correct_background = false ;
              $rootScope.css_pellet_mode.correct_border = false ;
              $rootScope.css_pellet_mode.correct_color = false ;
              $rootScope.css_pellet_mode.correct_icon_background = false ;
              $rootScope.css_pellet_mode.correct_icon_border = false ;
              $rootScope.css_pellet_mode.correct_icon_color = false ;
              $rootScope.css_pellet_mode.wrong_background = false ;
              $rootScope.css_pellet_mode.wrong_border = false ;
              $rootScope.css_pellet_mode.wrong_color = false ;
              $rootScope.css_pellet_mode.wrong_icon_background = false ;
              $rootScope.css_pellet_mode.wrong_icon_border = false ;
              $rootScope.css_pellet_mode.wrong_icon_color = false ;
              $rootScope.css_pellet_mode.rating_color = false ;
              $rootScope.css_pellet_mode.scale_color = false ;
              $rootScope.css_pellet_mode.scale_hover_color = false ;
              $rootScope.css_pellet_mode.scale_background = false ;
              $rootScope.css_pellet_mode.scale_hover_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_color = false ;

              // ==> Fill colors
              // HERE++++++
              var number = e.target.getAttribute('box-target-number') ;
              var class_text_color = ".track-text";
              var class_fill_track = ".track-progress";
              var class_stroke_track = ".track-all";

              var target_class_text = class_text_color+'-'+number;
              var target_fill_track = class_fill_track+'-'+number;
              var target_stroke_track = class_stroke_track+'-'+number;

              // ==> Case it Progress
              $rootScope.radial_text_colors = $(target_class_text).css("fill");
              $('.radial_text_colors').spectrum('set' , $rootScope.radial_text_colors );

              $rootScope.radial_fill_colors = $(target_fill_track).css("fill");
              $('.radial_fill_colors').spectrum('set' , $rootScope.radial_fill_colors );

              $rootScope.radial_storck_colors = $(target_stroke_track).css("fill");
              $('.radial_storck_colors').spectrum('set' , $rootScope.radial_storck_colors );


              $rootScope.css_pellet_mode.radial_strock = true ;
              $rootScope.css_pellet_mode.radial_fill = true ;
              $rootScope.css_pellet_mode.radial_text_color = true ;
            }
            if(e.target.getAttribute('box-target-type') == 'box-timer'){
              $rootScope.selecotor_name = ".Timer";
              $rootScope.css_pellet_mode.background = true;
              $rootScope.css_pellet_mode.border = true;
              $rootScope.css_pellet_mode.color = true ;
              $rootScope.css_pellet_mode.fontSize = false ;
              $rootScope.css_pellet_mode.fontFamily = false ;
              $rootScope.css_pellet_mode.width = false ;
              $rootScope.css_pellet_mode.hover_background = false ;
              $rootScope.css_pellet_mode.hover_border = false ;
              $rootScope.css_pellet_mode.hover_color = false ;
              $rootScope.css_pellet_mode.selected_background = false ;
              $rootScope.css_pellet_mode.selected_border = false ;
              $rootScope.css_pellet_mode.selected_color = false ;
              $rootScope.css_pellet_mode.correct_background = false ;
              $rootScope.css_pellet_mode.correct_border = false ;
              $rootScope.css_pellet_mode.correct_color = false ;
              $rootScope.css_pellet_mode.correct_icon_background = false ;
              $rootScope.css_pellet_mode.correct_icon_border = false ;
              $rootScope.css_pellet_mode.correct_icon_color = false ;
              $rootScope.css_pellet_mode.wrong_background = false ;
              $rootScope.css_pellet_mode.wrong_border = false ;
              $rootScope.css_pellet_mode.wrong_color = false ;
              $rootScope.css_pellet_mode.wrong_icon_background = false ;
              $rootScope.css_pellet_mode.wrong_icon_border = false ;
              $rootScope.css_pellet_mode.wrong_icon_color = false ;
              $rootScope.css_pellet_mode.rating_color = false ;
              $rootScope.css_pellet_mode.scale_color = false ;
              $rootScope.css_pellet_mode.scale_hover_color = false ;
              $rootScope.css_pellet_mode.scale_background = false ;
              $rootScope.css_pellet_mode.scale_hover_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_background = false ;
              $rootScope.css_pellet_mode.free_boxtext_color = false ;

              // ==> Get current colors
              $rootScope.color_models = current_class.css("color");
              $('.color_models').spectrum('set' , $rootScope.color_models );
              $rootScope.background_models = current_class.css("background-color");
              $rootScope.border_models_color = current_class.css("border-color");

              $('.border_models_color').spectrum('set' , $rootScope.border_models_color );
              $('.background_models').spectrum('set' , $rootScope.background_models );

              $rootScope.border_style_models = current_class.css("border-style").toString();
              $rootScope.border_left_models = current_class.css("border-left-width").toString();
              $rootScope.border_right_models = current_class.css("border-right-width").toString();
              $rootScope.border_top_models = current_class.css("border-top-width").toString();
              $rootScope.border_bottom_models = current_class.css("border-bottom-width").toString();

            }
            $timeout(function(){
              $rootScope.$apply();
            } , 50);
        }
      });

    }else {
      $("body , html , .selector").unbind('mouseenter mouseover mouseleave');
      $("body , html").unbind('click');
      $( '.selector , .selector_line' ).prop('contenteditable', false );
      $( '.selector , .selector_line' ).removeClass('selector_line');

      $( '*' ).each(function(e){
        $(this).css ({outlineColor : "transparent"});
      })
    }
  }



  // ==> Upload Image
  $rootScope.storing_image_with_cropped_data = () => {
    if ( $rootScope.media_for == 'questions' ) {
      if ( $rootScope.media_type == 0 ) $rootScope.storing_cropped_image_for_media_question();
      if ( $rootScope.media_type == 1 ) $rootScope.storing_video_for_media_question();
     }
    if ( $rootScope.media_for == 'answer' ) {
      if ( $rootScope.media_type == 0 ) $rootScope.storing_cropped_image_for_media_answer();
      if ( $rootScope.media_type == 1 ) $rootScope.storing_video_for_media_answer( );
    }
  };
  $rootScope.grep_progress_width = () => {

    // {> ( question_index + 1 ) * 100 /  _questions_.length | math_around_it <} %
    var percentage_value = Math.round(( parseInt( $rootScope.question_index + 1 ) * 100  ) / $rootScope._questions_.length )  ;
    // alert(percentage_value)
    if( $rootScope.screen_type == 0 )
      percentage_value = 0;
    return {
      width : percentage_value + '%'
    }
  }
  $rootScope.storing_cropped_image_for_media_question = () => {
    $("#file_extension").val( $rootScope.media_image_uploader[0].files[0].name.split('.').pop());
    var questionId = $("#question_id").val();
    var x = $('#cropping-image-x').val();
    var y = $('#cropping-image-y').val();
    var width = $('#cropping-image-width').val();
    var height = $('#cropping-image-height').val();
    var after_uploaded_image_callback = (media) => {
     var current_question = $rootScope._questions_[$rootScope.question_index] ;
       if(current_question.media_question == undefined )
        current_question['media_question'] = new Object();
       current_question.media_question = media ;
       $timeout(function(){ $rootScope.$apply(); });
    };
    var formImageData = new FormData();
    formImageData.append('media_field' , $rootScope.media_image_uploader[0].files[0]   );
    formImageData.append('height' , height  );
    formImageData.append('width' , width  );
    formImageData.append('x' ,x  );
    formImageData.append('y' , y  );
    formImageData.append('questions' , $rootScope._questions_ );
    var cropping_url = $rootScope.server_ip + "api/" + $rootScope.app_id + "/question/" + questionId + "/cropping_system" ;
    $http({
      url : cropping_url,
      method : "POST" ,
      data : formImageData ,
      headers : { 'Content-Type' : undefined} ,
      uploadEventHandlers : {
        progress : ( event ) => {
          var percent = Math.round (event.loaded / event.total) * 100;
          $('.highlighted_progress').css({width : percent + '%' });
          if (event.loaded == event.total) {
            // upload_image_is_completed()
          }
        }
      }
    }).then((respons)=>{
      var questions = respons.data.questions ;
      var current_qs = questions.find(x => x._id == questionId );
      if(current_qs.media_question != undefined ){
        $timeout(function(){
            after_uploaded_image_callback(current_qs.media_question);
            $timeout(function(){
              $rootScope.close_current_image_uploader();
              $timeout(function(){ $(".progrbar > .highlighted_progress").css('width' , 0 ); } , 500);
            },100);
        } , 500 );
      }
    }).catch((err)=>{ console.log(err);});
  }
  $rootScope.storing_cropped_image_for_media_answer = () => {
      $("#file_extension").val( $rootScope.media_image_uploader[0].files[0].name.split('.').pop() );
      var questionId = $("#question_id").val();
      var answerId = $rootScope.current_answer_id ;
      var x = $('#cropping-image-x').val();
      var y = $('#cropping-image-y').val();
      var width = $('#cropping-image-width').val();
      var height = $('#cropping-image-height').val();
      var formImageData = new FormData();
      var after_uploaded_image_callback = ( media_object ) => {
        var current_question = $rootScope._questions_[$rootScope.question_index] ;
        var answer_obka =   current_question.answers_format.find(x => x._id == answerId )

        if(answer_obka != undefined  ){
          if(current_question.question_type == 0 ){
           if(answer_obka.media_optional == undefined )
            answer_obka['media_optional'] = new Object();
            answer_obka.media_optional = media_object;
          }
          if(current_question.question_type == 1 ){
            answer_obka['Media_directory'] = media_object.Media_directory
            answer_obka['image_cropped'] = media_object.image_cropped
            answer_obka['image_full'] = media_object.image_full
            answer_obka['image_updated_date'] = media_object.image_updated_date
            answer_obka['media_name'] = media_object.media_name;
            answer_obka['media_src'] = media_object.media_src;
            answer_obka['media_type'] = media_object.media_type ;
            answer_obka['is_correct'] = media_object.is_correct;
          }
        }
        $timeout(function(){ $rootScope.$apply(); });
      };
      formImageData.append('media_field' , $rootScope.media_image_uploader[0].files[0]   );
      formImageData.append('height' , height  );
      formImageData.append('width' , width  );
      formImageData.append('x' ,x  );
      formImageData.append('y' , y  );
      formImageData.append('questions' , $rootScope._questions_ );
      var cropping_url = $rootScope.server_ip + "api/" + $rootScope.app_id +"/question/"+ questionId +  "/answer/" + answerId + "/cropping_system" ;
      $http({
        url : cropping_url ,
        method : "POST" ,
        data : formImageData ,
        headers : { 'Content-Type' : undefined} ,
        uploadEventHandlers : {
          progress : (event) => {
              var percent = Math.round (event.loaded / event.total) * 100;
              $('.highlighted_progress').css({width : percent + '%' });
              if (event.loaded == event.total) {

              }
          }
        }
      }).then(( response )=>{
        var questions = response.data.questions ;
        var current_qs = questions.find(x => x._id == questionId );
        if(current_qs != undefined){
          var current_answer = current_qs.answers_format.find(x => x._id == answerId );
          if( current_answer != undefined ){
            if(current_answer.media_optional != undefined && current_qs.question_type == 0 ){
              $timeout(function(){
                    after_uploaded_image_callback(current_answer.media_optional);
                    $timeout(function(){
                      $rootScope.close_current_image_uploader();
                      $timeout(function(){ $(".progrbar > .highlighted_progress").css('width' , 0 ); } , 500);
                    },100);
                } , 500 );
            }
            if(current_answer.media_type != undefined && current_qs.question_type == 1 ){
              $timeout(function(){
                  var media_okh = new Object();

                  media_okh['Media_directory'] = current_answer.Media_directory
                  media_okh['image_cropped'] = current_answer.image_cropped
                  media_okh['image_full'] = current_answer.image_full
                  media_okh['image_updated_date'] = current_answer.image_updated_date
                  media_okh['media_name'] = current_answer.media_name;
                  media_okh['media_src'] = current_answer.media_src;
                  media_okh['media_type'] = current_answer.media_type ;
                  media_okh['is_correct'] = current_answer.is_correct;

                    after_uploaded_image_callback(media_okh);
                    $timeout(function(){
                      $rootScope.close_current_image_uploader();
                      $timeout(function(){ $(".progrbar > .highlighted_progress").css('width' , 0 ); } , 500);
                    },100);
                } , 500 );
            }
          }
        }

        // if(current_qs.media_question != undefined ){
        //   $timeout(function(){
        //       after_uploaded_image_callback(current_qs.media_question);
        //       $timeout(function(){
        //         $rootScope.close_current_image_uploader();
        //         $timeout(function(){ $(".progrbar > .highlighted_progress").css('width' , 0 ); } , 500);
        //       },100);
        //   } , 500 );
        // }
      }).catch((err)=>{ console.log(err); });
  }



  $rootScope.storing_video_for_media_question = (   )         => {
    var video_object = $rootScope.current_media_video ;
    var target_question = $rootScope._questions_[$rootScope.question_index] ;
    if( target_question.media_question == undefined ) target_question['media_question'] = new Object();
    target_question.media_question = video_object.media_question;

    // ==> Saving Data
    $timeout(function(){
      $rootScope.storing_questions_into_database();
      $timeout(function(){ $rootScope.close_current_image_uploader() } , 300)
    } , 300);
  };

  $rootScope.storing_video_for_media_answer = (   )           => {
 var video_object = $rootScope.current_media_video ;
 var target_question = $rootScope._questions_[$rootScope.question_index] ;
 var answerId = $rootScope.current_answer_id ;
 var current_answer = target_question.answers_format.find(x => x._id == answerId);
 if( current_answer == undefined ) return false ;

 if( target_question.question_type == 0 ){
   if( current_answer.media_optional == undefined ) current_answer['media_optional'] = new Object();
   current_answer.media_optional['media_src'] = video_object.media_optional.media_src;
   current_answer.media_optional['Media_directory'] = video_object.media_optional.Media_directory;
   current_answer.media_optional['media_type'] = video_object.media_optional.media_type;
   current_answer.media_optional['media_name'] = video_object.media_optional.media_name;
   current_answer.media_optional['video_id'] = video_object.media_optional.video_id;
   current_answer.media_optional['video_type'] = video_object.media_optional.video_type;
   current_answer.media_optional['embed_path'] = video_object.media_optional.embed_path;
   if ( video_object.media_optional.video_type == 2 )
     current_answer.media_optional['mp4_option'] =  video_object.media_optional.mp4_option;
 }
 if( target_question.question_type == 1 ){
   current_answer['media_src'] = video_object.media_src;
   current_answer['Media_directory'] = video_object.Media_directory;
   current_answer['media_type'] = video_object.media_type;
   current_answer['media_name'] = video_object.media_name;
   current_answer['video_id'] = video_object.video_id;
   current_answer['video_type'] = video_object.video_type;
   current_answer['embed_path'] = video_object.embed_path ;
   if ( video_object.video_type == 2 )
     current_answer['mp4_option'] =  video_object.mp4_option;
 }

 // ==> Saving Data
 $timeout(function(){
   $rootScope.storing_questions_into_database();
   $timeout(function(){ $rootScope.close_current_image_uploader() } , 300)
 } , 300);
};

  // ==> Draw Progress Radial
  var svg ;
  $rootScope.draw_radial_progression = (precentage_value) => {
    d3.select("svg").remove()
				  if(svg){
				  svg.selectAll("*").remove();

				}
				var wrapper = document.getElementById('radialprogress');
				var start = 0;

				var colours = {
				  fill: "#c17c7e" ,
				  track: '#c17c7e36',
				  text: '#c17c7e',
				  stroke: 'transparent',
				}

				var radius = 25;
				var border = 2;
				var strokeSpacing = 5;
				var endAngle = Math.PI * 2;
				var formatText = d3.format('.0%');
				var boxSize = radius * 2;
				var count = precentage_value;
				var progress = start;
				var step = precentage_value < start ? -0.01 : 0.01;

				//Define the circle
				var circle = d3.svg.arc()
				  .startAngle(0)
				  .innerRadius(radius)
				  .outerRadius(radius - border);

				//setup SVG wrapper
				svg = d3.select(wrapper)
				  .append('svg')
				  .attr('width', boxSize)
				  .attr('height', boxSize);


				// ADD Group container
				var g = svg.append('g')
				  .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')');

				//Setup track
				var track = g.append('g').attr('class', 'radial-progress');
				track.append('path')
          .attr("class" , "track-all-1")
          .attr('d', circle.endAngle(endAngle))
				  // .attr('fill', colours.track)
				  // .attr('stroke', colours.stroke)
				  // .attr('stroke-width', strokeSpacing + 'px');



				//Add colour fill
				var value = track.append('path')
          .attr("class" , "track-progress-1");
				  // .attr('fill', colours.fill)
				  // .attr('stroke', colours.stroke)
				  // .attr('stroke-width', strokeSpacing + 'px');

				//Add text value
				var numberText = track.append('text')
        .attr("class" , "track-text-1")
        .attr('text-anchor', 'middle')
        .attr('dy', '.5rem')
				// .attr('fill', colours.text);

				  //update position of endAngle
				  value.attr('d', circle.endAngle(endAngle * precentage_value));
				  //update text value
				  numberText.text(formatText(precentage_value));
  }
  $rootScope.store_in_root_stylesheet_object = (class_name , property_name , property_value ) => {
      /*
      [
        {
        class_name
        properties : [
          {
            property_name : '' ,
            property_value : ''
          }
        ]
       }
      ]
      */
      var style_exists = $rootScope.theme_stylesheet.find( x => x.class_name ==  class_name );

      if(style_exists == undefined){
        var new_cls = {
          class_name :class_name ,
          properties : [{ property_name : property_name , property_value : property_value  }]
        }
        $rootScope.theme_stylesheet.push(new_cls);
      }else {
        // ==> it there
        var  property_existing = style_exists.properties.find(x => x.property_name == property_name );
        if(property_existing == undefined ){
          style_exists.properties.push({
            property_name : property_name , property_value : property_value
          })
        }else {
          // it there
          property_existing.property_name = property_name
          property_existing.property_value = property_value
        }
      }

      // $rootScope.theme_stylesheet
  };
  $rootScope.apply_stylesheet_in_views = ( css_attribute ,  css_value , type = null , selected_class = null ) => {
    // $rootScope.theme_stylesheet
    if($rootScope.selector_class != undefined)
    {
      /*
      [
        {
        class_name
        properties : [
          {
            property_name : '' ,
            property_value : ''
          }
        ]
       }
      ]
      */

       // ==> Custom Selector case property is hover , selected_class , etc
      if(selected_class =='selected_answer')
        $rootScope.selector_class = ".answer-container ul li.selected_answer, .answer-container ul li.selected_answer:hover";

      if(type == 'hover')
        $rootScope.selector_class = ".answer-container ul li:hover" ;

      if(css_attribute == 'font-size' || css_attribute == 'width')
      css_value = css_value +'px';

      $( $rootScope.selector_class ).css (css_attribute , css_value)  ;
      if($rootScope.selector_class == '.question-label-box' && css_attribute != 'color'){
        $('.question-label-box-brd').css('border-left-color' , css_value);
        $rootScope.store_in_root_stylesheet_object(".question-label-box-brd" ,"border-left-color" , css_value);
      }
      $rootScope.store_in_root_stylesheet_object($rootScope.selector_class , css_attribute , css_value );
    }
  };
  $rootScope.build_answer_text_value = (answer_value , answer_id , className ) => {
    var current_question = $rootScope._questions_[$rootScope.question_index];
    if(current_question != undefined){
      var answer = current_question.answers_format.find(x => x._id == answer_id );
      answer.value = answer_value ;
      $timeout(function(){
        $(className).focus();
       } , 5)
    }
  }
  // ==> Calling all function according timeout
  $timeout(function(){
    $rootScope.draw_radial_progression(0/100);
    // $rootScope.init_swiperJs();
    $rootScope.init_bootstrap_tooltip();
    $rootScope.init_drag_drop();
    $rootScope.load_spectrum_plugin();
    // $rootScope.switching_editor_preview(true);
  }, 500 );
}]);
