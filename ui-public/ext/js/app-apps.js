Array.prototype.are_all_questions_tracked = function( solved_questions ){
  var required_questions =  this.filter(x => x.answer_settings.is_required == true );
  return required_questions.filter(function(i){
    return solved_questions.findIndex(x => x.question_id == i._id ) === -1 ;
  });
}
Array.prototype.get_unused_ids = function ( answer_list ) {
  return this.filter(function(i){
    return answer_list.findIndex(x => x._id == i._id) === -1
  });
}
Array.prototype.is_tracked = function(answer){
  return this.filter(function(i){
    return answer.findIndex (x => x._id == i._id ) === -1
  });
}
Array.prototype.is_completed_quiz_option = function (question_answers){
  return this.filter(function(i){
    return question_answers.findIndex(x => x.question_id == i._id ) === -1 ;
  });
}

// Array.prototype.are_all_questions_tracked = function( solved_questions ){
//   return this.filter(function(i){
//     return solved_questions.findIndex(x => x.question_id == i._id ) === -1 ;
//   });
// }

Array.prototype.are_all_questions_tracked = function( solved_questions ){
  try {

      var required_questions =  this.filter(x => x.answer_settings.is_required == true );
      return required_questions.filter(function(i){
        return solved_questions.findIndex(x => x.question_id == i._id ) === -1 ;
      });
  } catch (e) {

  }
}
Array.prototype.get_unsolved_questions = function( solved_questions ){
    return this.filter(function(i){
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
apps.filter("time_style" , () => {
  return (time) => {
    // // // // console.log(time.toString().length);
    if(time.toString().length == 1 )
      time = "0" + time ;
    return time ;
  }
})
apps.filter( 'apply_html' , ['$sce' , ( $sce ) => {
  return ( returned_values ) => {
    if(returned_values  == '' ) returned_values = "Add your question here !"
    return $sce.trustAsHtml(returned_values);
   };
}]);
apps.filter("make_it_zero" , () => {
  return (score_value) => {
    // // console.log(score_value);
     if ( score_value == undefined )
     return 0 ;
     else return score_value ;
  }
});


// ==> Setting
apps.directive('ngRetrieveData', [ '$rootScope' , '$timeout' , function ( $rootScope , $timeout ){
  return {
    link : function( $scope, element, attrs ){
      $timeout(function(){
      // // console.log($(element).next().prop("className"));
    } , 500 );
    }
  }
}]);

apps.directive('ngCustomMessageEditors', ['$parse' , '$rootScope' , '$timeout', function($parse , $rootScope , $timeout ){
  return {
    restrict: 'A',
    compile: function( $element, attr) {
      return function( scope , element, attr , index ) {
        // var message-name="expiry-warning"


        element.summernote({
          disableDragAndDrop: true ,
          airMode : true ,
          popover : {
            air : [
              ['color', ['color']],
              ['fontsize', ['fontsize']],
              ['font', ['bold', 'underline', 'italic'  , 'strikethrough', 'clear' ]]
            ]
          } ,
          callbacks : {
            onInit : function(){

              $timeout(function(){
                // console.log($rootScope._settings_);
                if( attr.messageName == "expiry-warning"){
                  var expire_warning = $rootScope._settings_.expiration.expire_warning ;
                  $("div[message-name='expiry-warning']").next('.note-editor').find('.note-editable').html("");
                  $("div[message-name='expiry-warning']").next('.note-editor').find('.note-editable').html(expire_warning);
                  $rootScope.storing_placholder_if_item_empty(expire_warning , attr.messageName );
                }
                if( attr.messageName == "expiry-message" ){
                  var expiry_msg = $rootScope._settings_.expiration.expire_message ;
                  $("div[message-name='expiry-message']").next('.note-editor').find('.note-editable').html("");
                  $("div[message-name='expiry-message']").next('.note-editor').find('.note-editable').html(expiry_msg);
                  $rootScope.storing_placholder_if_item_empty(expiry_msg , attr.messageName );
                }
                if( attr.messageName == "welcome-screen"){
                  var welcome_screen_text = $rootScope._settings_.titles.title_start_with ;
                  $("div[message-name='welcome-screen']").next('.note-editor').find('.note-editable').html("");
                  $("div[message-name='welcome-screen']").next('.note-editor').find('.note-editable').html(welcome_screen_text);
                  $rootScope.storing_placholder_if_item_empty( welcome_screen_text , attr.messageName );
                }

                if( attr.messageName == "ending-screen"){
                  var title_end_with = $rootScope._settings_.titles.title_end_with  ;
                  $("div[message-name='ending-screen']").next('.note-editor').find('.note-editable').html("");
                  $("div[message-name='ending-screen']").next('.note-editor').find('.note-editable').html(title_end_with);
                  $rootScope.storing_placholder_if_item_empty( title_end_with , attr.messageName );
                }

                if( attr.messageName == "pass-quiz-screen"){
                  var pass = $rootScope._settings_.titles.title_success_with ;
                  $("div[message-name='pass-quiz-screen']").next('.note-editor').find('.note-editable').html("");
                  $("div[message-name='pass-quiz-screen']").next('.note-editor').find('.note-editable').html(pass);
                  $rootScope.storing_placholder_if_item_empty( pass , attr.messageName );
                }


                if( attr.messageName == "failed-quiz-screen"){
                  var failed = $rootScope._settings_.titles.title_failed_with;
                  $("div[message-name='failed-quiz-screen']").next('.note-editor').find('.note-editable').html("");
                  $("div[message-name='failed-quiz-screen']").next('.note-editor').find('.note-editable').html(failed);
                  $rootScope.storing_placholder_if_item_empty( failed , attr.messageName );
                }


                if( attr.messageName == "resume-screen"){
                  var resume = $rootScope._settings_.titles.title_resume ;
                  $("div[message-name='resume-screen']").next('.note-editor').find('.note-editable').html("");
                  $("div[message-name='resume-screen']").next('.note-editor').find('.note-editable').html(resume);
                  $rootScope.storing_placholder_if_item_empty( resume , attr.messageName );
                }

                if( attr.messageName == "complete-survey"){
                  var completed_survey = $rootScope._settings_.titles.title_completed_survey ;
                  $("div[message-name='complete-survey']").next('.note-editor').find('.note-editable').html("");
                  $("div[message-name='complete-survey']").next('.note-editor').find('.note-editable').html(completed_survey);
                  $rootScope.storing_placholder_if_item_empty( resume , attr.messageName );
                }



              } , 5000 );
            } ,
            onChange : function (content){
              // ==> Switch into preview
              $(".preview-btn").trigger("click");
              if( attr.messageName == "expiry-warning")
                {
                  $rootScope._settings_.expiration.expire_warning = content ;
                  $rootScope.screen_type = 4 ;
                  $rootScope.storing_placholder_if_item_empty($rootScope._settings_.expiration.expire_warning , attr.messageName );
                }

              if( attr.messageName == "expiry-message" )
                {
                  $rootScope._settings_.expiration.expire_message = content ;
                  $rootScope.screen_type = 5 ;
                  $rootScope.storing_placholder_if_item_empty($rootScope._settings_.expiration.expire_message , attr.messageName );
                }

              if( attr.messageName == "welcome-screen" )
                {
                  $rootScope._settings_.titles.title_start_with = content ;
                  $rootScope.screen_type = 0 ;
                  $rootScope.storing_placholder_if_item_empty($rootScope._settings_.titles.title_start_with , attr.messageName );
                }

              if( attr.messageName == "ending-screen" )
                {
                  $rootScope._settings_.titles.title_end_with = content ;
                  $rootScope.screen_type = 1 ;
                  $rootScope.storing_placholder_if_item_empty($rootScope._settings_.titles.title_end_with , attr.messageName );
                }

              if( attr.messageName == "pass-quiz-screen" )
                {
                  $rootScope._settings_.titles.title_success_with = content ;
                  $rootScope.screen_type = 2 ;
                  $rootScope.storing_placholder_if_item_empty($rootScope._settings_.titles.title_success_with , attr.messageName );
                }


              if( attr.messageName == "failed-quiz-screen" )
                 {
                   $rootScope._settings_.titles.title_failed_with = content ;
                   $rootScope.screen_type = 2 ;
                   $rootScope.storing_placholder_if_item_empty( $rootScope._settings_.titles.title_failed_with , attr.messageName );
                 }

                 if( attr.messageName == "resume-screen" )
                    {
                      $rootScope._settings_.titles.title_resume = content ;
                      $rootScope.screen_type = 4 ;
                      $rootScope.storing_placholder_if_item_empty( $rootScope._settings_.titles.title_resume , attr.messageName );
                    }

                    if( attr.messageName == "complete-survey" )
                       {
                         $rootScope._settings_.titles.title_completed_survey = content ;
                         $rootScope.screen_type = 2 ;
                         $rootScope.storing_placholder_if_item_empty( $rootScope._settings_.titles.title_completed_survey , attr.messageName );
                       }

              $timeout(function(){ $rootScope.$apply(); } , 300 )
            }
          }
        });


      }
    }
  }
}]);
apps.directive('ngCustomEditor', ['$parse' , '$rootScope' , '$timeout', function($parse , $rootScope , $timeout ){
  return {
          /* elementType - question_id -answer_id   */
           restrict: 'A',
           compile: function( $element, attr) {

               return function( scope , element, attr , index ) {

                  $rootScope.redactor_object = {
                   airMode: true ,
                   disableDragAndDrop: true ,
                   popover : {
                     air : [
                       ['color', ['color']],
                       ['fontsize', ['fontsize']],
                       ['font', ['bold', 'underline', 'italic'  , 'strikethrough', 'clear' ]]
                     ]
                   } ,
                   callbacks : {

                     onChange : ( content ) => {
                       $rootScope.is_unsaved_data = true ;
                       var this_question = $rootScope._questions_.find(x => x._id == attr.questionId ) ;

                        if( attr.elementType == 'question' ){
                          // ==> currQuestion
                            if( this_question != undefined )
                            this_question.question_body = content ;
                            // load redactor data
                            if( content == '')
                            $rootScope.load_redactor_data_questions(this_question._id);
                            var question_editor = $(".question-redactor") ;
                            var question_field = question_editor.next('.note-editor').find('.note-editable');
                            // console.log();
                            if(this_question.question_body =="")
                            question_field.css("color" , "#999")
                            else
                            question_field.css("color" , "#000")
                        }
                        if( attr.elementType == 'description' ){
                            if( this_question != undefined )
                              this_question.question_description.value = content ;
                            // load redactor data
                            if( content == '')
                            $rootScope.load_redactor_data_questions(this_question._id);
                            var description_editor = $(".description-redactor");
                            var description_field = description_editor.next('.note-editor').find('.note-editable');
                            if(this_question.question_description.value == "")
                            description_field.css("color" , "#999")
                            else
                            description_field.css("color" , "#000")
                         }
                        if( attr.elementType == 'answer' ){
                          if( this_question != undefined ){
                            var this_answer = this_question.answers_format.find(x => x._id == attr.answerId)
                            if(this_answer != undefined )
                            {
                                this_answer.value = content ;
                                if(this_answer.value =="")
                                 element.next(".note-editor").children(".note-editing-area").children(".note-editable").css("color","#999");
                                 else
                                 element.next(".note-editor").children(".note-editing-area").children(".note-editable").css("color","#000");

                            }


                          }
                        }
                        $timeout(function(){ $rootScope.$apply() } , 100 );
                     }
                   }
                 };

                 element.summernote( $rootScope.redactor_object );
               };
           }
    }
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

   var dd_mm_yyyy = splited_date[2] + "/" + calculated_date.getMonth() + "/" + calculated_date.getFullYear() ;
   var mm_dd_yyyy = calculated_date.getMonth() + "/" + splited_date[2] + "/" +  calculated_date.getFullYear() ;

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

       case "{{ date | dd/mm/yyyy }}" :
       return dd_mm_yyyy ;
       break;
       case "{{ date | mm/dd/yyyy }}" :
       return mm_dd_yyyy ;

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
      "{{ day_counts }}" ,
      "{{ date | dd/mm/yyyy }}" ,
      "{{ date | mm/dd/yyyy }}" ,
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
//         // console.log( origin_formative + ' >> '+ origin_formative.length);
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
  $rootScope.question_labels = {
    label_0 : ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ],
    label_1 : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50]
  }
  $rootScope.answer_labels = {
    label_0 : ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ],
    label_1 : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50]
  }
  $rootScope.image_uploader_proceed = {
    show_progress : false ,
    progress : 0 ,
    status_code : undefined ,
    message : undefined
  };
  $rootScope.is_unsaved_data = false ;
  $rootScope.is_unsaved_data_func = () => {
    $rootScope.is_unsaved_data = true ;
  }
  $rootScope.nav_status = 0 ;
  $rootScope.media_current_upload = false ;
  $rootScope.show_apply_changes = false ;
  $scope.apply_in_all_slides = true ;
  $rootScope.is_submitted = false ;
  $rootScope.is_reviewed  = false ;
  $rootScope.progress_value = 0 ;
  $rootScope.progress_message = "";
  $rootScope.numbers = [0];
  $rootScope.current_progress = ( type = 1 ) => {
    var all_questions = $rootScope._questions_;
    var solved_questions = $rootScope._user_activity_;
    if( solved_questions == null ) return  { current_score : 0 , main_score : all_questions.length } ;
    var solved = ( solved_questions.report_questions.question_answers == undefined ) ? [] : solved_questions.report_questions.question_answers ;

    if(type == 1 ){
      var calcs = Math.round(solved.length * 100 / all_questions.length );
      return  { current_score : calcs  , main_score : 100 } ;
    }
    if(type == 2 ){
      return  { current_score : solved.length , main_score : all_questions.length } ;
    }

  };
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
        // $rootScope.draw_radial_progression(0/100);
      }
    }
    if(model_type == 1){
      $rootScope._settings_.time_settings.timer_layout = model_index;
      $rootScope.time_models = "/time-progress-temps/time-"+model_index+".hbs";
    }
  };

  $rootScope.current_mode = (is_view) => {
    var classes = "";
      if( is_view == 0 ) classes = "editor_mode_type";
      if( is_view == 1 ) classes = "preview_mode_type";
    return classes ;
  }
  $rootScope.changed_day_numbers = (number) => {
    time_epiration.expiration_day_counts = number ;
   };

  $rootScope.redactor_object = new Object();
  $rootScope._user_activity_ = null ;
  $rootScope.is_view = 0 ;
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
  $rootScope.on_drag_status = false ;
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
  $rootScope._application_draft_ =  {} ;
  $rootScope._settings_draft_    =  {} ;
  $rootScope.question_ids_draft  =  [];
  $rootScope.answer_ids_draft    =  [] ;
  // // console.log($rootScope.retrieve_data_url);
  $rootScope._questions_draft_   =  [];
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
    // // console.log($rootScope.retrieve_data_url);
    $rootScope._questions_   =  $rootScope._application_.questions;
    // $rootScope.randomize_sorting_questions($rootScope._settings_.randomize_settings);



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
        // if($rootScope._questions_ != null && $rootScope._questions_.length != 0 )
        // $rootScope.load_question_redactor($rootScope._questions_[0].question_body)
        // $rootScope.load_description_redactor( $rootScope._questions_[0].question_description.value ) ;
      } , 400)
    } , 600);
  });



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

/*HERE +++++*/
$rootScope.loading_application_data = () => {
  $http({ method : "GET" , url : $rootScope.retrieve_data_url }).then(( resp )=>{
    $rootScope._application_draft_ =  resp.data ;
    $rootScope._settings_draft_    =  resp.data.settings;
    $rootScope.question_ids_draft  =  resp.data.question_ids;
    $rootScope.answer_ids_draft    =  resp.data.answer_ids;
    // // console.log($rootScope.retrieve_data_url);
    $rootScope._questions_draft_   =  resp.data.questions;
    // $rootScope.randomize_sorting_questions($rootScope._settings_.randomize_settings);
  });
}

  $rootScope.loading_application_data();
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
      //   $(".redactor-in-2").bind("change , input , keyup" , function(){
      //   // $(".resume-text ,.expired_message_block").hide();
      //   // $timeout(function(){ $(".expire-warning-text").show(); } , 5);
      //    $timeout(function(){
      //      $("#docQuestions > li").each(function(){
      //        $(this).removeClass("marked_question")
      //      });
      //      $rootScope.switch_int_mode(1);
      //      // var expire_warning_val = $R(".set_redactor" , "source.getCode")[0];
      //      var expire_warning_val = "";
      //      $rootScope.screen_type = 4 ;
      //      $rootScope.storing_redactor_values('expire_warning' , expire_warning_val  )
      //   } , 200 );
      // });
      // ==> expire message
      // $(".redactor-in-3").bind("change , input, keyup" , function(){
      //    $timeout(function(){
      //      $("#docQuestions > li").each(function(){
      //        $(this).removeClass("marked_question")
      //      });
      //      $rootScope.screen_type = 5 ;
      //      $rootScope.switch_int_mode(1);
      //      $(".resume-text , .expire-warning-text").hide();
      //      $(".expired_message_block").show();
      //      // var expire_message_val = $R(".set_redactor" , "source.getCode")[1];
      //       var expire_message_val = ""
      //          $rootScope.storing_redactor_values( 'expire_message' , expire_message_val  );
      //    }, 200 );
      // });
      // ==> starting messages
      // $(".redactor-in-4").bind("change , input, keyup" , function(){
      //    $timeout(function(){
      //      $("#docQuestions > li").each(function(){
      //        $(this).removeClass("marked_question")
      //      });
      //      $rootScope.switch_int_mode(1);
      //      $rootScope.screen_type = 0 ;
      //      // var starting_text = $R(".set_redactor" , "source.getCode")[2];
      //       var starting_text = "";
      //       $rootScope._settings_.titles.title_start_with = starting_text;
      //    }, 200 );
      // });
      // ==> ending message
      // $(".redactor-in-5").bind("change , input, keyup" , function(){
      //    $timeout(function(){
      //      $rootScope.switch_int_mode(1);
      //      $rootScope.screen_type = 1 ;
      //      // var ending_text = $R(".set_redactor" , "source.getCode")[3];
      //       var ending_text = "";
      //       $rootScope._settings_.titles.title_end_with = ending_text;
      //    }, 200 );
      // });
      // ==> success message
      // $(".redactor-in-6").bind("change , input, keyup" , function(){
      //    $timeout(function(){
      //      $("#docQuestions > li").each(function(){
      //        $(this).removeClass("marked_question")
      //      });
      //      $rootScope.switch_int_mode(1);
      //       $rootScope.screen_type = 2 ;
      //       $rootScope.text_result_screens = true ;
      //       // var pass_text = $R(".set_redactor" , "source.getCode")[4];
      //       var pass_text = ""
      //       $rootScope._settings_.titles.title_success_with = pass_text;
      //    }, 200 );
      // });
      // ==> failed message
      // $(".redactor-in-7").bind("change , input, keyup" , function(){
      //    $timeout(function(){
      //      $("#docQuestions > li").each(function(){
      //        $(this).removeClass("marked_question")
      //      });
      //     $rootScope.switch_int_mode(1);
      //       $rootScope.screen_type = 2 ;
      //       $rootScope.text_result_screens = false ;
      //       // var fail_text = $R(".set_redactor" , "source.getCode")[5];
      //       var fail_text =""
      //       $rootScope._settings_.titles.title_failed_with = fail_text;
      //    }, 200 );
      // });
      // ==> resume message
      /*
      .resume-text ,
      .expired_message_block
      */
      // $(".redactor-in-8").bind("change , input, keyup" , function(){
      //   $(".expire-warning-text , .expired_message_block").hide();
      //   $timeout(function(){ $(".resume-text").show(); } , 5);
      //
      //   $rootScope.screen_type = 4 ;
      //    $timeout(function(){
      //      $("#docQuestions > li").each(function(){
      //        $(this).removeClass("marked_question")
      //      });
      //      $rootScope.switch_int_mode(1);
      //      // var title_resume = $R(".set_redactor" , "source.getCode")[6];
      //       var title_resume =""
      //       $rootScope._settings_.titles.title_resume = title_resume;
      //       $timeout(function(){ /*// console.log($rootScope._settings_.titles);*/ } , 201);
      //    }, 200 );
      // });

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
    // // console.log(answer);
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
    // // console.log($rootScope.video_object);
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

$rootScope.detect_media_status = ( question_type , question_object ) => {
  return true;
};
  $rootScope.switching_editor_previewd = (is_view) => {
        if( is_view == true)
        {
          // ==>
          document.getElementById("switch-editor").checked = true ;
          $rootScope.is_view = 1 ;
          $(".editor-page").css({ "transform" : "translate3d(-100% , 0 , 0)" , height : '0px'});
          $(".preview-page").css({ "transform" : "translate3d(-100%, 0px, 0px)" ,  height : 'auto'});
        }
        else if ( is_view == false ){
          document.getElementById("switch-editor").checked = false ;
          $rootScope.is_view = 0 ;
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

   ;

    var answer_tab = $(".answer-sc-block").next(".x-editor-x-body");
    var question_tab = $(".question-opener").next(".x-editor-x-body");

    $timeout(function(){
      if( question_tab.css("display") == 'none' ) {
        $rootScope.expand_collapsed_items('#question-pt')
       }
      if( answer_tab.css("display") == 'none' ) {
        $rootScope.expand_collapsed_items('#answers-pt');
       }
    } , 500)

    $rootScope.switch_int_mode(0);
    var question_object = new Object() , answer_object = new Object() ;
    // => Build Default Question
    question_object['_id'] = $rootScope.question_ids['id_' +  $rootScope._questions_.length  ];
    question_object['question_body'] =  '' ;
    question_object['answers_format'] = new Array();
    question_object.answers_format = [] ;
    question_object['question_type'] =  parseInt(question_type);
    question_object['created_at'] = new Date();
    question_object['question_description'] = {
     'value' :'' ,
     'is_enabled': false
    }
    // question_object['media_question'] =
    question_object['answer_settings'] = new Object();
    answer_object['_id'] = $rootScope.answer_ids[question_object.answers_format.length]._id ;
    answer_object['answer_serial'] = 1 ;

    if( question_type == 0 ){
      answer_object['value'] = "Answer 1";
      if ( $rootScope._application_.app_type == 1 )
      answer_object['is_correct'] = false ;
      // => Push To Answer Array
      question_object.answers_format.push( answer_object );
      $rootScope.build_question_settings ( 'is_randomized' , false , question_object._id );
      $rootScope.build_question_settings ( 'is_required' , false , question_object._id );
      $rootScope.build_question_settings ( 'single_choice' , true , question_object._id );
      $rootScope.build_question_settings ( 'super_size' , false , question_object._id );
      $rootScope.build_question_settings ( 'answer_style' , false , question_object._id );
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
       $rootScope.build_question_settings ( 'super_size' , false , question_object._id );
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
      var answer_object = new Object();
      console.log($rootScope.answer_ids[question_object.answers_format.length]);
       answer_object['_id'] = $rootScope.answer_ids[question_object.answers_format.length]._id ;
      if( question_object.answer_settings == undefined )
      question_object['answer_settings'] = new Object();
      if( question_object.answer_settings.character_counts == undefined)
      question_object.answer_settings['character_counts'] = 200 ;
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
  $rootScope.expand_collapsed_items = function ( id ){
    var targetId = $(id) ;
    if(targetId.css("display") == 'none')
      targetId.slideDown();
      else
      targetId.slideUp();
  };
  $rootScope.image_source_link = (src) => {
    return src ;
  }
  $rootScope.question_list_classes = () => {
    var classes = "";
    if($rootScope.screen_type != 3 ){
      classes = "remove_marked_question"
    }
    return classes ;
  }
  $rootScope.detect_chars = (answer_val , char_counts) => {

    // $rootScope._questions_[$rootScope.question_index].answers_format[0].is_disabled = true ;

    if($rootScope._questions_[$rootScope.question_index].answers_format[0].answer_val.length > char_counts )
     $rootScope._questions_[$rootScope.question_index].answers_format[0].is_disabled = true ;

     // console.log(char_counts);
  }
  // => Mark Selected Question
  $rootScope.highlighted_question = (questionId) => {

    if($rootScope.is_unsaved_data == true ){
      swal({
        title: "Save it ?",
        text: "Would you like to Save the last changes ?",
        icon: "warning",
        buttons: ["No!", "Yes"],
        dangerMode: true,
      }).then((will_do)=>{
        if(will_do){
          $rootScope.saving_this_question();
          swal("Question is saved successfully", {
            icon: "success",
          }).then(()=>{
            // var questionIndex = $rootScope._questions_.findIndex( x=> x._id == questionId );
            $rootScope.highlighted_question(questionId);
          });
        } else {
          // $rootScope._questions_ = [] ;
          $rootScope.loading_application_data();
          // ==> Restore old data
          $rootScope._questions_[$rootScope.question_index] = $rootScope._questions_draft_[$rootScope.question_index] ;
          var db_qs_data = $rootScope._questions_draft_[$rootScope.question_index] ;
          var current_qs = $rootScope._questions_[$rootScope.question_index] ;

          $timeout(function(){
            $(".question-redactor").next(".note-editor").children(".note-editing-area").find(".note-editable").html(db_qs_data.question_body);
            $(".description-redactor").next(".note-editor").children(".note-editing-area").find(".note-editable").html(db_qs_data.question_description);
            $rootScope.load_redactor_data_answers( db_qs_data._id , db_qs_data.answers_format)
            $rootScope.$apply();
            $timeout(function(){
                // $rootScope.highlighted_question(questionId);
            } , 200 ) ;
          } , 300 )
          $rootScope.is_unsaved_data = false ;
        }
      })
      // if( confirm("Would you like to discard the changes ? ")){
      //   $rootScope.loading_application_data();
      //   // ==> Restore old data
      //   $rootScope._questions_[$rootScope.question_index] = $rootScope._questions_draft_[$rootScope.question_index] ;
      //   var db_qs_data = $rootScope._questions_draft_[$rootScope.question_index] ;
      //   var current_qs = $rootScope._questions_[$rootScope.question_index] ;
      //
      //   $timeout(function(){
      //     $rootScope.$apply();
      //   } , 300 )
      //   $rootScope.is_unsaved_data = false ;
      // }else
      return false ;
    }

      $rootScope.is_reviewed = false ;
      $rootScope.screen_type = 3;
        // => detect current question is exists or not
        var questionIndex = $rootScope._questions_.findIndex( x=> x._id == questionId );
        if( questionIndex == -1 ) return false ;


        $('.marked_question').removeClass('marked_question');

        $timeout(function(){
          $("#docQuestions , ul.all-mobile-question-lists").children('li.qs-'+questionId.toString()).addClass('marked_question');
        });

        $rootScope.question_index = questionIndex ;
        $("#question_id").val(questionId)

        // ==> Fill and binding event handler with textarea box
        $rootScope.init_bootstrap_tooltip();
        // ==> Question redactors
        $rootScope.load_redactor_data_questions(questionId);
        // ==> answer redactors
      $timeout(function(){
        if( $rootScope._questions_[questionIndex].question_type == 0 )
        $rootScope.load_redactor_data_answers(questionId , $rootScope._questions_[questionIndex].answers_format );
      })


        $('.right_part').fadeIn();
        // ==> Detect if Unsaved data is happened
        // $rootScope.detect_if_there_unsaved_data (// $rootScope.is_unsaved_data )
      }
    $rootScope.saving_this_question = () => {
      $rootScope.is_unsaved_data = false ;
      $("#saving-changes").html("Saving ...")
      $timeout(function(){
        $("#saving-changes").html("Save Changes");
      } , 200);
      $rootScope.storing_questions_into_database();
    };
    $rootScope.delete_the_current_question = () => {
      if(confirm("Are sure that you want to delete this question ?")){
          var currently = $rootScope._questions_[$rootScope.question_index]._id;
          if(currently == undefined ) return false ;
          $rootScope._questions_.splice( $rootScope.question_index , 1 );
          $('.right_part').hide();
          $rootScope.storing_questions_into_database();
          $('#docQuestions > li.marked_question').removeClass('marked_question');
        }
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
            // $(".redactor-in-0").html(question.question_body);
            // $(".redactor-in-1").html(question.question_description.value);
            // $(".redactor-in-0 , #editor-quest-data").bind("input" , function (){
            //
            //     $timeout(function(){
            //       // $rootScope._questions_[$rootScope.question_index].question_body = $R('#editor-quest-data' , 'source.getCode');
            //         // $rootScope._questions_[$rootScope.question_index].question_body = $R('#editor-quest-data' , 'source.getCode');
            //         // $rootScope.is_unsaved_data = true ;
            //     } , 500 );
            // });

            // $(".redactor-in-1 , #editor-desc-data").bind("input" , function (){
            //     $timeout(function(){
            //         // $rootScope._questions_[$rootScope.question_index].question_description.value = $R('#editor-desc-data' , 'source.getCode');
            //         // $rootScope.is_unsaved_data = true ;
            //     } , 500 );
            // });

            $timeout(function(){
              $rootScope.$apply();
            });
            if($rootScope._questions_[$rootScope.question_index].question_type ==0 || $rootScope._questions_[$rootScope.question_index].question_type == 1){
              if($rootScope._questions_[$rootScope.question_index].answer_settings.is_randomized != undefined )
              $rootScope.is_randomized_answer_with($rootScope._questions_[$rootScope.question_index].answer_settings.is_randomized);
            }
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

  $rootScope.load_dtr = () => {
    // console.log("Loaded !!!!! ------------------------------------------ ");
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
      // // console.log($rootScope.media_image_model[0].files[0]);
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
    // if( is_randomizing == true )
    //   $rootScope._questions_[$rootScope.question_index].answers_format = $rootScope.randomize_arries( $rootScope._questions_[$rootScope.question_index].answers_format );
    // else
    //   $rootScope._questions_[$rootScope.question_index].answers_format = $rootScope.sorting_arries( $rootScope._questions_[$rootScope.question_index].answers_format , "_id");
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

                //  $rootScope.fill_boxes_with_question_objects($rootScope._questions_[$rootScope.question_index]._id);
                // if($rootScope._questions_[$rootScope.question_index].question_type != 2 )
                //  {
                //    if($rootScope._questions_[0].question_type == 1 || $rootScope._questions_[0].question_type == 0)
                //    $timeout(function(){ $rootScope.sorting_answers_in_list(); } , 700  );
                //  }
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
    $rootScope.is_unsaved_data = true;
    if(is_single_choice == true){
      var answers = $rootScope._questions_[$rootScope.question_index].answers_format;
      var only_one = answers[answers.length - 1];
      if( $rootScope._application_.app_type == 1 )
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
  $rootScope.delete_this_answer = (questionId , answerId) => {


    var this_question = $rootScope._questions_.find(x => x._id == questionId ) ;
    if(this_question != undefined ){
      var this_answer = this_question.answers_format.find(x => x._id == answerId )
      if(this_answer != undefined ){
        var index = this_question.answers_format.findIndex(x => x._id == answerId )
        if(index != -1 )
          {
            var target_answer_id = this_question.answers_format[index]._id;
            if( target_answer_id == answerId )
                this_question.answers_format.splice( index , 1 );
          }
      }
    }

    // => Save Deletion into db
    $timeout(function(){   $rootScope.storing_questions_into_database(); } , 100 );
  }
  // destory cropper

  // ==> Add New Answer
  $rootScope.add_new_media_for_question = () => {
        $rootScope.media_data = new Object();
        $rootScope.media_for = 'questions' ; // => Question
        $(".box-data").css({ top :'148px'});
        $('.box-overlay').height($(document).height());
        $(".media-uploader").fadeIn();

        if($('.box-overlay').height() == 0 ){
          $('.box-overlay').height($(document).height() );
        }
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
    // console.log(answer_id);
    var main_answer_blocks = $('.answer-pt-controller');
    var current_box = main_answer_blocks.children("li").eq(thisElem.$index);
    $(".box-data").css({ top : ( parseInt(current_box.offset().top - 110) ) + 'px'});

    $rootScope.media_for = 'answer' ; // => Question
    $rootScope.current_answer_id = answer_id ;
      $('.box-overlay').height($(document).height());

      if($('.box-overlay').height() == 0 ){
        $('.box-overlay').height( $(document).height() );
      }
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


      // ==> animate to target box
      $("html , body").animate({
        scrollTop : $(".box-data").offset().top - 200
      } , 200 );
      // // console.log($rootScope.media_data);
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


            // ======================= Testing images
            var imgd = document.createElement("img")
            imgd.src = e.target.result ;

            imgd.onload = function (){

              // ==> Resize and Storing
               var scaler = 2 ;
               if(imgd.width < 1000 ) scaler = 2 ;
               if(imgd.width > 1000  && imgd.width < 2000) scaler = 4 ;
               if(imgd.width > 2000  && imgd.width < 3000 ) scaler = 8 ;
               if(imgd.width > 3000  && imgd.width < 4000 ) scaler = 12 ;
               if(imgd.width > 4000  && imgd.width < 5000 ) scaler = 16 ;
               if(imgd.width > 5000   ) scaler = 25 ;

               var new_width = imgd.width / scaler ;
               var new_height = imgd.height / scaler ;

               var block =  e.target.result.split(";");
               var contentType = block[0].split(":")[1];// In this case "image/gif"
               var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."

               /*
               var canvas = document.createElement("canvas");
               canvas.width = width;
               canvas.height = height;
               var context = canvas.getContext("2d");
               img.src =   "data:image/gif;base64," + base64  ;
               context.drawImage(img, 0, 0, width, height);
               // console.log(context);
               */

               $rootScope.image_view_source =  e.target.result  ;
               // ==> Preview Image
               $rootScope.media_data['media_type'] = 0 ;
               $rootScope.media_data['media_src'] = e.target.result;
               $('.loading_data').fadeOut(1000);
               $('.box-overlay').height($(document).height() + 50);
               $rootScope.$apply();


               // ==> Calling Cropping liberary
               $rootScope.init_cropping_image();

            };
            // ========================== End Testing


          }

        // // console.log($rootScope.media_image_uploader[0].files[0]);
  };

  $rootScope.active_this_label = (index_number ) => {
    $rootScope._settings_.indexes.questions = index_number ;
  }
  $rootScope.active_this_answer_label =   (index_number ) => {
    $rootScope._settings_.indexes.answers = index_number ;
  }


  $rootScope.loading_answer_media_image = (image , date) => {
    // // console.log(image + ' ' +  date);
    return {
      backgroundImage : 'url("'+image +'?' + date +'")'
    } ;
  }
  $rootScope.loading_answer_media_image_media_choices = (image , date) => {
    // // console.log(image + ' ' +  date);
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
  $rootScope.create_unexisting_answer_id = (ids , answer_array ) => {
    var unused_ids = ids.get_unused_ids(answer_array);
    if(unused_ids[0] != undefined && unused_ids[0]._id != undefined ){
      return unused_ids[0]._id ;
    }else {
      return null ;
    }

    return null ;
  };
  $rootScope.add_new_answer = ( question_id ) => {
    if(question_id == undefined) return false ;
    var question = $rootScope._questions_.find(x => x._id == question_id );
    if(question == undefined ) return false ;
    var answer_object_data = new Object();

    // ==> Get unexisting id
    // ==> Fill according to question type
    var get_id = $rootScope.create_unexisting_answer_id($rootScope.answer_ids , question.answers_format  );
    if( get_id == null ) return false ;
    answer_object_data['_id'] = get_id ; // + '' + $rootScope._questions_.length ;



    answer_object_data['answer_serial'] = parseInt( ( question.answers_format[question.answers_format.length - 1] != undefined ) ? question.answers_format[question.answers_format.length - 1].answer_serial : 0 ) + 1 ;

    if ( question.question_type == 0 ){
      answer_object_data['value'] = "Answer " + parseInt( (question.answers_format[question.answers_format.length - 1]) ? question.answers_format[question.answers_format.length - 1].answer_serial + 1 : 1 )
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
      if ( question.question_type == 0 )
      $rootScope.load_redactor_data_answers(question_id , question.answers_format );
    })
    $timeout(function(){
      // $rootScope.sorting_answers_in_list();
      $rootScope.init_bootstrap_tooltip();
    } , 300);
  };
  // => Storing Data of questions into db
  $rootScope.storing_questions_into_database = () => {

     $http({
      url : $rootScope.server_ip + 'api/' + $rootScope.app_id + "/add/questions" ,
      method : "POST" ,
      data : { data : $rootScope._questions_ }
     }).then((response)=>{
       $rootScope.loading_application_data();
       // // console.log(response);
       //  // console.log("Updated +++++++++++++++");
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

  $rootScope.switch_int_mode = ( mode_type ) => {
    /*
    .button-switcher > span.editor-btn { color: #fff; }
    .button-switcher > span.preview-btn { color: #999; }
    */
    $rootScope.is_view = mode_type ;
     if ( mode_type == 0 ){
       $('.button-switcher > span.editor-btn').css({ color : '#fff' })
       $('.button-switcher > span.preview-btn').css({ color : '#999' })
       $rootScope.switching_editor_preview(mode_type)
     }
     if ( mode_type == 1 ){
       $('.button-switcher > span.preview-btn').css({ color : '#fff' })
       $('.button-switcher > span.editor-btn').css({ color : '#999' })
       $rootScope.switching_editor_preview(mode_type)
     }
  };

//   $rootScope.update_answers = (arr, old_index, new_index) => {
//     if (new_index >= arr.length) {
//         var k = new_index - arr.length + 1;
//         while (k--) {
//             arr.push(undefined);
//         }
//     }
//     arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
//     return arr;
// };
$rootScope.update_answers = (arr, old_index, new_index) => {
  if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
          arr.push(undefined);
      }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
};


  $rootScope.sorting_answers_in_list = () => {
    // var question = $rootScope._questions_[$rootScope.question_index];
    // $timeout(function(){
      Sortable.create( document.getElementById('block-answers') , {
        animation: 150 ,
        handle: '.drag-tools',
        ghostClass: 'shadow_element' ,
        onEnd : (evt) => {
         //   var old_index = evt.oldIndex ;
         //   var new_index = evt.newIndex;
         //   var answer_list = question.answers_format;
         //   $rootScope._questions_[$rootScope.question_index].answers_format = $rootScope.update_answers(answer_list , old_index , new_index);
         //    // question.answers_format = $rootScope.update_answers(answer_list , old_index , new_index);
         // $timeout( function(){ $rootScope.init_bootstrap_tooltip(); $rootScope.$apply() ; }  , 300 );
        }
      });
    // } , 300 )
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
           put: false,
           revertClone: false,
       },
       onChoose : function (){
         if($rootScope.is_unsaved_data == true ){
           swal({
             title: "Save it ?",
             text: "Would you like to Save the last changes ?",
             icon: "warning",
             buttons: ["No!", "Yes"],
             dangerMode: true,
           }).then((will_do)=>{
             if(will_do){
               $rootScope.saving_this_question();
               swal("Question is saved successfully", {
                 icon: "success",
               }).then(()=>{
                 // var questionIndex = $rootScope._questions_.findIndex( x=> x._id == questionId );
                  var questionId = $rootScope._questions_[$rootScope.question_index]._id ;
                 if(questionId != undefined )
                 $rootScope.highlighted_question(questionId);
               });
             } else{
               $rootScope.loading_application_data();
               // ==> Restore old data
               $rootScope._questions_[$rootScope.question_index] = $rootScope._questions_draft_[$rootScope.question_index] ;
               var db_qs_data = $rootScope._questions_draft_[$rootScope.question_index] ;
               var current_qs = $rootScope._questions_[$rootScope.question_index] ;

               $timeout(function(){
                 $(".question-redactor").next(".note-editor").children(".note-editing-area").find(".note-editable").html(db_qs_data.question_body);
                 $(".description-redactor").next(".note-editor").children(".note-editing-area").find(".note-editable").html(db_qs_data.question_description);
                 $rootScope.load_redactor_data_answers( db_qs_data._id , db_qs_data.answers_format)
                 $rootScope.$apply();
                 $timeout(function(){
                     // $rootScope.highlighted_question(questionId);
                 } , 200 ) ;
               } , 300 )
               $rootScope.is_unsaved_data = false ;

             }
           })
           // if( confirm("Would you like to discard the changes ? ")){
           //   $rootScope.loading_application_data();
           //   // ==> Restore old data
           //   $rootScope._questions_[$rootScope.question_index] = $rootScope._questions_draft_[$rootScope.question_index] ;
           //   var db_qs_data = $rootScope._questions_draft_[$rootScope.question_index] ;
           //   var current_qs = $rootScope._questions_[$rootScope.question_index] ;
           //
           //   $timeout(function(){
           //     $rootScope.$apply();
           //   } , 300 )
           //   $rootScope.is_unsaved_data = false ;
           // }else
           return false ;
         }
       } ,
       onStart : function (){
         $rootScope.on_drag_status = true ;
       } ,
       onMove : function (evt){
          $rootScope.on_drag_status = true ;
          $timeout(function(){ $rootScope.$apply(); } , 300 )
          var dragged = evt.dragged;
          var draggedRect = evt.draggedRect;
          var related = evt.related;

          var relatedRect = evt.relatedRect;
          var ParentID = $(dragged).parent().prop("id");
          var ParentEl = $(dragged).parent();

          // var eldata = ParentEl.find(dragged).html();

          // ParentEl.find(dragged).html("");
           // set animation
           // ParentEl.find(dragged).addClass("animated wobble");
           ParentEl.find(dragged).css({
             minHeight : '40px' ,
             background : "ghostwhite" ,
             lineHeight : '3.2',
             paddingLeft:'14px'
           });
           // ParentEl.find(dragged).remove();

        }
        ,
       onEnd  : function (evt) {

          var dragged = evt.to.getAttribute("id");

          if( dragged == "docQuestions" )
            {
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


            $rootScope.on_drag_status = false ;
            $timeout(function(){ $rootScope.$apply(); } , 300 )
       }
    })

    Sortable.create( document.getElementById("docQuestions") , {
        ghostClass: 'shadow_element' ,
        group: "question-list" ,
        disabled: false ,
        animation: 250 ,
        handle: '.drag-handler',
        onStart : function (evt) {

        } ,
        onEnd  : function (evt) {
          // issue here
          var block = evt
          var new_index = block.newIndex ;
          var old_index = block.oldIndex ;
          var question_id = block.item.getAttribute('id').split('_').pop();
          var question_object = $rootScope._questions_.find(x => x._id == question_id );
          if( question_object != undefined ){
            var question_index = $rootScope._questions_.findIndex(x => x._id == question_id );
            $rootScope._questions_.splice(question_index , 1 );
            $timeout(function(){
              $rootScope._questions_.splice( new_index ,  0 ,  question_object );
              $rootScope.highlighted_question( question_id );
              $rootScope.storing_questions_into_database();
            } , 30 );
          }
        }
    });

  };
$rootScope.step_number_of_rating_scale = (step_number) => {
  $rootScope._questions_[$rootScope.question_index].answers_format[0].rating_scale_answers = new Array();
  $rootScope.is_unsaved_data = true ;
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
       alert();
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
 $rootScope.mark_scale_number =  function ( index , type , question_id = null  , answer_id = null , question_type = null ){


      var question = $scope._questions_.find(x => x._id == question_id)
      var answer = question.answers_format.find(x => x._id == answer_id );
      var rat_answer_val = (index + 1 );

      $rootScope.select_answer(question , answer  , null , rat_answer_val );
      $timeout( function(){
        $scope.$apply();
      },300 )
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
        // // console.log(question);
        if( question.answer_settings == undefined ) question['answer_settings'] = new Object();
        question.answer_settings[setting_name] = setting_value ;
      })

  };

  window.onresize = ( event ) => {
    // $rootScope.navbar_menu_init();
      var nav_menu = $(".nav-container");
    // var body_window = $(".row-x-body");
      var question_list_left = $(".left_part");
    // body_window.css({ transform : 'translate3d(0px , 0,0)'})
    // nav_menu.css({ transform : 'translate3d('+( question_list_left.width() + 17 )+'px , 0,0)'})
    nav_menu.css({width : question_list_left.width() + 17 + 'px'});
    nav_menu.css({ transform : 'translate3d('+( question_list_left.width() + 17 )+'px , 0,0)'})


  };
  $rootScope.nav_container_manager = ( nav_status ) => {

        $rootScope.nav_status = nav_status ;
        var question_list_left = $(".left_part");
        var nav_menu = $(".nav-container");
        var body_window = $(".row-x-body");
        var fixed_number = 23 ;
        var translate_number_negative = -(question_list_left.width() +fixed_number ) ;
        // alert(question_list_left.width());
        var translate_number_positive =  0 ;
        // ==> Open The nav menu
        if(nav_status == 0 ){
          // alert(translate_number_negative);
          body_window.css({ transform : 'translate3d('+translate_number_negative+'px , 0,0)'})
          nav_menu.css({ transform : 'translate3d('+translate_number_positive+'px , 0,0)'})
          // ==> Change Nav number of status
          $rootScope.nav_status = 1;
        }
        // ==> Close The nav menu 19
        if(nav_status == 1 ){
            // alert( question_list_left.width() );
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

  $rootScope.build_question_lists = ( question , answer , question_reports ) => {


    // // console.log( $rootScope._user_activity_ );

    // ==> Get solved questions
    var usr = ( $rootScope._user_activity_ == undefined ||  $rootScope._user_activity_ == null) ?  undefined : $rootScope._user_activity_ ;
    // // console.log(usr);
    if( usr == undefined ) return false ;

    // ==> Report questions
    // usr.report_questions.all_questions = new Array();
    // usr.report_questions.right_questions = new Array();
    // usr.report_questions.wrong_questions = new Array();
    // ==> Question Data
    var question_data = $rootScope._user_activity_.questions_data ;

    var question_and_answers = usr.report_questions.question_answers;
    var qs_data_exists = question_data.find(x => x.question_id == question._id );
    if(qs_data_exists != undefined ){
      var solved_questions = question_and_answers.find(x => x.question_id == question._id );
      qs_data_exists.answer_ids = new Array();
      if( solved_questions == undefined ) usr.questions_data = new Array();
    }
    // ==> Attendee questions
    var attendee_questions = usr.attendee_questions ;
    var att_qs_exists = attendee_questions.find(x => x.question_id == question._id );
    if(att_qs_exists != undefined ){
      var solved_questions = question_and_answers.find(x => x.question_id == question._id );
      att_qs_exists.attendee_answers = new Array();
      if( solved_questions == undefined ) usr.attendee_questions = new Array();
    }
    // ==> report_attendees
    if( usr.report_attendees == undefined )
    {
        var solved_questions = question_and_answers.find(x => x.question_id == question._id );
      usr.report_attendees = new Object();
      if( usr.report_attendees.survey_quiz_answers == undefined )
        usr.report_attendees['survey_quiz_answers'] = new Array();
        if(solved_questions == undefined ) usr.report_attendees.survey_quiz_answers = new Array();
    }




    var qs_id = question._id;
    var solved_questions = question_and_answers.find(x => x.question_id == qs_id );
    if( solved_questions == undefined ) return false ;
    var solved_question_id = solved_questions.question_id ;



      var zoom_in_usr_answers = (solved_answer) => {

        // ==> Start zooming
        var answer_id = solved_answer._id ;
        var answer_object = question.answers_format.find(x => x._id == answer_id );
        var question_object = question ;
        if(answer_object == undefined ) return false;

         // =========================[ report_questions ]
          var question_answer_exists = usr.report_questions.question_answers
          var qs_exists_aq = question_answer_exists.find(x => x.question_id == question_object._id );
          if(qs_exists_aq == undefined ) return false ;
          var isWrong_solved_answer = ( qs_exists_aq.user_answers.filter(x => x.is_correct == false ).length > 0 ) ;
          if(isWrong_solved_answer ){
            // ==> Wrong Answers
            if(usr.report_questions.wrong_questions.indexOf(question_object._id) == -1)
              usr.report_questions.wrong_questions.push(question_object._id);
            if(usr.report_questions.right_questions.indexOf(question_object._id) != -1)
              usr.report_questions.right_questions.splice(usr.report_questions.right_questions.indexOf(question_object._id) , 1 );
          }else {
            // ==> Correct Answers
            var app_question = $rootScope._questions_.find(x => x._id == question_object._id);
            var user_question = usr.report_questions.question_answers.find(x => x.question_id == question_object._id );
            var correct_answers = app_question.answers_format.filter(x => x.is_correct == true );
            var user_answers = user_question.user_answers
            var is_correct_answer = correct_answers.is_tracked(user_answers);
            if(is_correct_answer.length != 0 ){
              // wrong answer
              // ==> Wrong Answers
              if(usr.report_questions.wrong_questions.indexOf(question_object._id) == -1)
                usr.report_questions.wrong_questions.push(question_object._id);
              if(usr.report_questions.right_questions.indexOf(question_object._id) != -1)
                usr.report_questions.right_questions.splice(usr.report_questions.right_questions.indexOf(question_object._id) , 1 );
            }else {
              // right answer
              if(usr.report_questions.right_questions.indexOf(question_object._id) == -1 )
                usr.report_questions.right_questions.push(question_object._id);
              if(usr.report_questions.wrong_questions.indexOf(question_object._id) != -1)
                usr.report_questions.wrong_questions.splice(usr.report_questions.wrong_questions.indexOf(question_object._id) , 1 );
            }

          }
          if(usr.report_questions.all_questions.indexOf(question_object._id) == -1 )
            usr.report_questions.all_questions.push(question_object._id);

          // ===========================[Question Data]
          // ==> Question Data
          var question_dt_exists = question_data.find(x => x.question_id == question_object._id ) ;
          if(question_dt_exists == undefined ){

            var question_data_object = {
              "question_id" : question_object._id ,
              "question_index" : 0 ,
              "question_type" : question_object.question_type ,
              "question_text" : question_object.question_body  ,
              "answer_ids" : new Array({answer_id : answer_id , is_correct : answer_object.is_correct , answer_object : answer_object , answer_index : 0 }) ,
              "correct_answers" : question_object.answers_format.filter(x => x.is_correct == true)  ,
              "updated_date" :  new Date()
            };
            question_data.push(question_data_object);
          }else {
            if(question_dt_exists.answer_ids.find(x => x.answer_id == answer_id ) == undefined )
            question_dt_exists.answer_ids.push({answer_id : answer_id , is_correct : answer_object.is_correct , answer_object : answer_object , answer_index : 0 });
          }
          // ===========================[Attendee question]
          var att_question_dt_exists = attendee_questions.find(x => x.question_id == question_object._id ) ;
          if(att_question_dt_exists == undefined ){
            var answer_value ;
            if(question_object.question_type == 0 ) answer_value = answer_object.value;
            if(question_object.question_type == 1 ) answer_value = answer_object.Media_directory;
            if(question_object.question_type == 2 ) answer_value = answer_object.boolean_value;

            var question_data_object = {
              "question_id" : question_object._id ,
              "question_type" : question_object.question_type ,
              "question_text" : question_object.question_body  ,
              "attendee_answers" : new Array({answer_id : answer_id , is_correct : answer_object.is_correct , answer_object : answer_object , answer_value : answer_value })
            };
            attendee_questions.push(question_data_object);
          }else {
            if(att_question_dt_exists.attendee_answers.find(x => x.answer_id == answer_id ) == undefined )
            att_question_dt_exists.attendee_answers.push({answer_id : answer_id , is_correct : answer_object.is_correct , answer_object : answer_object , answer_value : answer_value });
          }



         // // // // // console.log(solved_question_id);
         // // // // // console.log(solved_questions);
         // // // // console.log(usr.report_questions);
        // ==> End Zooming
      }
      solved_questions.user_answers.map(zoom_in_usr_answers)
      // // // // console.log("Bulding attendee online report");
      }
    // ==> Storing Anwers
  $rootScope.show_solved_answers  = (  question_id , answer_id , is_correct ) => {
    var app_settings = $rootScope._settings_ ;

    // ==> List super size
    var classes = "";


    index = $rootScope._questions_.findIndex(x => x._id == question_id );


    if( index != -1 && $rootScope._questions_[index].answer_settings.super_size == true || ( $rootScope._questions_[index] != undefined && $rootScope._questions_[index].question_type == 2 && $rootScope._questions_[index].answer_settings.super_size == true ) )
    classes += "super_size_class ";


    // if( index != -1 && $rootScope._questions_[index].question_type == 2 && $rootScope._questions_[index].answer_settings.super_size == true )
    // classes += "super_size_class ";
    // console.log(classes);
    // ==> List solved questions
    if( $rootScope._user_activity_ != undefined && $rootScope._user_activity_ != null ){
      var user_index =   $rootScope._user_activity_;
      if( user_index != -1 ){
        var usr_act = $rootScope._user_activity_ ;
        if(usr_act.report_questions != undefined )
        {
          var current_question = usr_act.report_questions.question_answers.find(x => x.question_id == question_id );
          if(current_question != undefined )
          {

            if( app_settings.show_results_per_qs && $rootScope._user_activity_.report_questions != undefined ){

               var this_question = $rootScope._user_activity_.report_questions.question_answers.find(x => x.question_id == question_id );
               if(this_question != undefined){
                 if( this_question.is_correct == false ){
                   // ==> Solved "wrong answers";
                    // .... Show all right answers
                    var basic_question = $rootScope._questions_.find(x => x._id == question_id) ;
                    var basic_answer = basic_question.answers_format.find(x => x._id == answer_id ) ;
                    if( basic_answer.is_correct == true ) classes += "right_answer ";
                    // .... Show Solved wrong answer
                    var all_wrong_answers = this_question.user_answers.filter(x => x.is_correct == false );
                    var these_wrong_answers = all_wrong_answers.find(x => x._id == answer_id) ;
                    if(these_wrong_answers != undefined) classes += "wrong_answer ";
                 }else {
                   // ==> Solved "right answers";
                   // .... Show only solved answer
                   var basic_question = $rootScope._questions_.find(x => x._id == question_id) ;
                   var basic_answer = basic_question.answers_format.find(x => x._id == answer_id ) ;
                   // if( basic_answer.is_correct == true ) classes += "right_answer ";
                   var solved_right_answers = this_question.user_answers.filter(x => x.is_correct == true );
                    var these_right_answers = solved_right_answers.find(x => x._id == answer_id) ;
                    if(these_right_answers != undefined ) classes += "right_answer ";
                 }
               }
            }else {
              var current_answer = current_question.user_answers.find(x => x._id == answer_id) ;
              if(current_answer != undefined )
                classes += "selected_answer ";
            }
          }
        }
      }
    }


   return classes ;
  };

  $rootScope.list_classes_of_this_rating = (question_id , answer_id , rating_object ) => {
    // var classes = {
    //   'fa-star-o' : true,
    //   'fa-star':false
    // };
    //
    //
    // if($scope._user_activity_ != null && $scope._user_activity_.questions_data != undefined && $scope._user_activity_.questions_data.length != 0){
    //    var current_question = $scope._user_activity_.questions_data.find( x => x.question_id == question_id );
    //
    //    if( current_question != undefined ){
    //       var answer_rat_scale_id = current_question.answer_ids[0].answer_id_val;
    //       var answer_scale_value = current_question.answer_ids[0].answer_object.rating_scale_answers.find(x => x._id == answer_rat_scale_id ).rat_scl_value ;
    //
    //        if (rating_object.rat_scl_value <= answer_scale_value) {
    //
    //          classes = {
    //            'fa-star-o' : false ,
    //            'fa-star': true
    //          };
    //        }
    //    }
    // }
    //
    // return classes ;
  }
  $rootScope.select_answer = ( question , answer , css_mode , rat_scale_answer_val = null ) => {
    if ( css_mode == true ) return false;
    if( $rootScope.is_reviewed == true ) return false ;

       var app_type = $rootScope._application_.app_type;
       var app_settings = $rootScope._settings_;
       var question_settings = question.answer_settings ;
       var question_type = question.question_type ;
       var question_id = question._id ;
       var answer_id = answer._id ;
       var user_id = $rootScope.user_id ;
       var app_id = $rootScope.application_id ;

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

       $rootScope._user_activity_ = $rootScope.this_attendee_draft.att_draft[0];




       if( $rootScope._user_activity_.questions_data == undefined )
       $rootScope._user_activity_['questions_data'] = new Array();
       if( $rootScope._user_activity_.report_questions == undefined )
       $rootScope._user_activity_['report_questions'] = new Object();
       if( $rootScope._user_activity_.attendee_questions == undefined )
       $rootScope._user_activity_['attendee_questions'] = new Array();
       if( $rootScope._user_activity_.report_attendee_details == undefined )
       $rootScope._user_activity_['report_attendee_details'] = new Object();
       if( $rootScope._user_activity_.report_attendees == undefined )
       $rootScope._user_activity_['report_attendees'] = new Object();


       // ==> Building Answers
       var is_show_result = app_settings.show_results_per_qs;
       var is_enable_review = app_settings.review_setting;
       var is_single_choice ;
       if(question_settings != undefined)
         is_single_choice = question_settings.single_choice;
       var autoslide_when_answer = app_settings.auto_slide; // => completed


       // ==> Building question status (report_questions)
       var report_questions = $rootScope._user_activity_.report_questions ;
       if( report_questions.all_questions == undefined )
       report_questions['all_questions'] = new Array();
       if( report_questions.right_questions == undefined )
       report_questions['right_questions'] = new Array();
       if( report_questions.wrong_questions == undefined )
       report_questions['wrong_questions'] = new Array();
       if( report_questions.question_answers == undefined )
       report_questions['question_answers'] = new Array();

       var all_questions = report_questions.all_questions ;
       var right_questions = report_questions.right_questions;
       var wrong_questions = report_questions.wrong_questions;

       var qs_index = report_questions.question_answers.findIndex(x => x.question_id == question_id);


       if( $rootScope._user_activity_ != null && $rootScope._user_activity_.user_completed_status != undefined && $rootScope._user_activity_.user_completed_status == true)
       return false;


       if( $rootScope._user_activity_ != undefined && $rootScope._user_activity_.report_questions != undefined){
          var solved_questions = $rootScope._user_activity_.report_questions.question_answers.find(x => x.question_id == question_id );
          var answer_exists = -1 ;
          if( solved_questions != undefined )
          answer_exists =  solved_questions.user_answers.findIndex(x => x._id == answer_id );

          if ( $rootScope._settings_.show_results_per_qs == true  && solved_questions != undefined && question_type == 2 && solved_questions.user_answers.length != 0 ) return false;
          if ( $rootScope._settings_.show_results_per_qs == true  && solved_questions != undefined && ( question_type == 1 || question_type == 0  ) && solved_questions.user_answers.length != 0  && is_single_choice == true ) return false;
          if ( $rootScope._settings_.show_results_per_qs == true  && solved_questions != undefined && ( question_type == 1 || question_type == 0  ) && solved_questions.user_answers.length != 0  && is_single_choice == false && answer_exists != -1 ) return false;
      }




      // ==> Multiple choices && Media choices
      if( question_type == 0 || question_type == 1 ){

        // ==> Attendee answers
        if( is_single_choice ){
          if( qs_index == -1 ){
              var answer_bd = {
                question_id : question_id ,
                user_answers : [{ _id : answer_id }]
              }


              if( app_type == 1 )
              answer_bd.user_answers[answer_bd.user_answers.length - 1]['is_correct'] = answer.is_correct ;

              report_questions.question_answers.push(answer_bd);
              if( app_type == 1 ){
                  // ==> Mark if this question is right
                  var filter_wrong_answers = answer_bd.user_answers.filter(x => x.is_correct == false ) ;
                  if(filter_wrong_answers.length != 0){
                     // wrong question
                     if( answer_bd.is_correct == undefined )
                       answer_bd['is_correct'] = false;
                       answer_bd.is_correct = false;
                  }else {
                    // correct answer
                    if( answer_bd.is_correct == undefined )
                      answer_bd['is_correct'] = true;
                      answer_bd.is_correct = true;
                  }
              }
            }else {
              var ans_index = report_questions.question_answers[qs_index].user_answers.findIndex( x => x._id == answer_id );
              if( ans_index == -1 ){
                var answer_obk = { _id : answer_id  }

                if(app_type == 1 )
                  answer_obk['is_correct'] = answer.is_correct;
                 report_questions.question_answers[qs_index].user_answers =[answer_obk] ;


                 if( app_type == 1 ){
                     // ==> Mark if this question is right
                     var filter_wrong_answers = report_questions.question_answers[qs_index].user_answers.filter(x => x.is_correct == false ) ;
                     if(filter_wrong_answers.length != 0){
                        // wrong question
                        if( report_questions.question_answers[qs_index].is_correct == undefined )
                          report_questions.question_answers[qs_index]['is_correct'] = false;
                          report_questions.question_answers[qs_index].is_correct = false;
                     }else {
                       // correct answer
                       if( report_questions.question_answers[qs_index].is_correct == undefined )
                         report_questions.question_answers[qs_index]['is_correct'] = true;
                         report_questions.question_answers[qs_index].is_correct = true;
                     }
                 }

              }else {
                report_questions.question_answers[qs_index].user_answers.splice( ans_index , 1 )
                if(report_questions.question_answers[qs_index].user_answers.length == 0 )
                report_questions.question_answers.splice(qs_index , 1 );


                if( app_type == 1 && report_questions.question_answers.length != 0 &&  report_questions.question_answers[qs_index] != undefined){
                    // ==> Mark if this question is right

                    var filter_wrong_answers = report_questions.question_answers[qs_index].user_answers.filter(x => x.is_correct == false ) ;
                    if(filter_wrong_answers.length != 0){
                       // wrong question
                       if( report_questions.question_answers[qs_index].is_correct == undefined )
                         report_questions.question_answers[qs_index]['is_correct'] = false;
                         report_questions.question_answers[qs_index].is_correct = false;
                    }else {
                      // correct answer
                      if( report_questions.question_answers[qs_index].is_correct == undefined )
                        report_questions.question_answers[qs_index]['is_correct'] = true;
                        report_questions.question_answers[qs_index].is_correct = true;
                    }
                }
              }
            }
        }else{
           if( qs_index == -1 ){
              var answer_obj = { _id : answer_id  };
              if(app_type == 1 ) answer_obj['is_correct'] = answer.is_correct
              var ans_data = {
                question_id : question_id ,
                user_answers : [answer_obj]
              };
              report_questions.question_answers.push(ans_data);

              if( app_type == 1 ){
                var this_question = report_questions.question_answers.find(x => x.question_id == question_id );
                if(this_question != undefined ){
                  // ==> Mark if this question is right
                  var filter_wrong_answers = this_question.user_answers.filter(x => x.is_correct == false ) ;
                  if(filter_wrong_answers.length != 0){
                     // wrong question
                     if( this_question.is_correct == undefined )
                       this_question['is_correct'] = false;
                       this_question.is_correct = false;
                  }else {
                    // correct answer
                    if(this_question.is_correct == undefined )
                      this_question['is_correct'] = true;
                      this_question.is_correct = true;
                  }
                }

              }
            }else {
              var ans_index = report_questions.question_answers[qs_index].user_answers.findIndex( x => x._id == answer_id );
              if( ans_index == -1 ){
                var answer_obj = { _id : answer_id  };
                if(app_type == 1 ) answer_obj['is_correct'] = answer.is_correct

                report_questions.question_answers[qs_index].user_answers.push(answer_obj);
              }else {
                report_questions.question_answers[qs_index].user_answers.splice( ans_index , 1 )
                if(report_questions.question_answers[qs_index].user_answers.length == 0 )
                report_questions.question_answers.splice(qs_index , 1 );
              }
            }


            if( app_type == 1 ){
              var this_question = report_questions.question_answers.find(x => x.question_id == question_id );
              if(this_question != undefined ){
                // ==> Mark if this question is right
                var filter_wrong_answers = this_question.user_answers.filter(x => x.is_correct == false ) ;
                if(filter_wrong_answers.length != 0){
                   // wrong question
                   if( this_question.is_correct == undefined )
                     this_question['is_correct'] = false;
                     this_question.is_correct = false;
                }else {
                  // correct answer
                  if(this_question.is_correct == undefined )
                    this_question['is_correct'] = true;
                    this_question.is_correct = true;
                }
              }

            }
        }
      }
      // ==> True And false
      if( question_type == 2 ){
           if( qs_index == -1 ){
              var answer_obj = { _id : answer_id  };
              if(app_type == 1 ) answer_obj['is_correct'] = answer.is_correct

              report_questions.question_answers.push({
                question_id : question_id ,
                user_answers : [answer_obj]
              });
            }else {
              var ans_index = report_questions.question_answers[qs_index].user_answers.findIndex( x => x._id == answer_id );
              if( ans_index == -1 ){
                var answer_obj = { _id : answer_id  };
                if(app_type == 1 ) answer_obj['is_correct'] = answer.is_correct

                report_questions.question_answers[qs_index].user_answers =[answer_obj] ;
              }else {
                report_questions.question_answers[qs_index].user_answers.splice( ans_index , 1 )
                if(report_questions.question_answers[qs_index].user_answers.length == 0 )
                report_questions.question_answers.splice(qs_index , 1 );
              }
            }



            if( app_type == 1 ){
              var this_question = report_questions.question_answers.find(x => x.question_id == question_id );
              if(this_question != undefined ){
                // ==> Mark if this question is right
                var filter_wrong_answers = this_question.user_answers.filter(x => x.is_correct == false ) ;
                if(filter_wrong_answers.length != 0){
                   // wrong question
                   if( this_question.is_correct == undefined )
                     this_question['is_correct'] = false;
                     this_question.is_correct = false;
                }else {
                  // correct answer
                  if(this_question.is_correct == undefined )
                    this_question['is_correct'] = true;
                    this_question.is_correct = true;
                }
              }

            }
       }


       if( question_type == 3 ){
               var questionIndex= $rootScope._questions_.findIndex(x => x._id == question_id );
               if(questionIndex != -1){
                   var answer_ratScale = $rootScope._questions_[questionIndex].answers_format[0].rating_scale_answers.find(x => x.rat_scl_value == rat_scale_answer_val) ;
                   if(answer_ratScale != undefined){
                       // => {_id: "5b904d575faa2a368f1ae5225_3", rat_scl_value: 3}
                       var report_question = report_questions.question_answers.findIndex(x => x.question_id == question_id );
                       if(report_question == -1){
                         report_questions.all_questions.push(question_id)
                         report_questions.question_answers.push({ question_id :question_id , user_answers : new Array({ _id : answer_ratScale._id }) })
                       }else {
                         report_questions.question_answers[report_question].user_answers = new Array();
                         report_questions.question_answers[report_question].user_answers.push({ _id : answer_ratScale._id });
                       }
                   }
               }


               // ==> Build Question Data
               // // console.log(answer_ratScale);

               var usr = $rootScope._user_activity_ ;
               var question_data_index = usr.questions_data.findIndex(x => x.question_id == question_id);
               var answer_ratScale = $rootScope._questions_[questionIndex].answers_format[0].rating_scale_answers.find(x => x.rat_scl_value == rat_scale_answer_val) ;
               var ratsclaeoptions = $rootScope._questions_[questionIndex].answers_format[0] ;
               ratsclaeoptions['answer_value'] = answer_ratScale.rat_scl_value ;
               var rating_scale_answer = {answer_id : ratsclaeoptions._id , answer_id_val :  answer_ratScale._id ,  answer_object :   ratsclaeoptions , answer_index : 0}
               var question_exists = usr.questions_data.findIndex(x => x.question_id == question_id );

               if(question_exists == -1){
                 usr.questions_data.push({
                   question_id: question_id,
                   question_index:0 ,
                   question_type: question_type,
                   question_text: question.question_body ,
                   updated_date : new Date(),
                   answer_ids :  [rating_scale_answer]
                 })
               }else {
                 usr.questions_data[question_exists].answer_ids = new Array();
                 usr.questions_data[question_exists].answer_ids.push(rating_scale_answer);
               } }



               if(question_type != 3 && question_type != 4)
               $rootScope.build_question_lists(question , answer , report_questions);
               $timeout(function(){
        $rootScope.build_attendee_reports(question , answer , report_questions);
        if($rootScope._user_activity_ != undefined )
            {
              var usr = $rootScope._user_activity_ ;
              $rootScope._user_activity_ = usr ;

              if( $rootScope.finished_is_clicked == true && $rootScope._application_.app_type == 1)
                 $rootScope.show_unsolved_question_message();
            }

            // console.log($rootScope._user_activity_);
       }, 100 );

  };


  $rootScope.list_classes_of_this_scale = (question_id , answer_id , rating_object ) => {
    var classes = '';
      if($scope._user_activity_ != null && $scope._user_activity_.questions_data != undefined && $scope._user_activity_.questions_data.length != 0){
         var current_question = $scope._user_activity_.questions_data.find( x => x.question_id == question_id );
         if( current_question != undefined ){
            var answer_rat_scale_id = current_question.answer_ids[0].answer_id_val;
            var answer_scale_value = current_question.answer_ids[0].answer_object.rating_scale_answers.find(x => x._id == answer_rat_scale_id ).rat_scl_value ;
            if (rating_object.rat_scl_value == answer_scale_value) classes  = "selected-scale-number"
         }
      }

      return classes ;
  }
  $rootScope.show_unsolved_question_message = () => {
    // if( $rootScope._user_activity_.report_questions == undefined ){
    //   // $rootScope.join_this_quiz();
    //   var is_required = $rootScope._questions_.filter(x => x.answer_settings.is_required == true ) ;
    //   if(is_required.length != 0 ){
    //     $rootScope.unsolved_questions = is_required ;
    //   }
    // } else {
    //   $rootScope.unsolved_questions = new Array();
    //   var questions = $rootScope._questions_ ;
    //   var solved_questions = $rootScope._user_activity_.report_questions.question_answers ;
    //   $rootScope.unsolved_questions = questions.are_all_questions_tracked(solved_questions);
    // }
  };
  $rootScope.build_attendee_reports = ( question , answer , question_reports ) => {
    if($rootScope._user_activity_ == null) return false ;

    // ======================================[report_attendee_details]
    var usr = $rootScope._user_activity_;
    if( usr == undefined ) return false ;

    if(usr.report_attendee_details == undefined || usr.report_attendee_details == null )
      usr.report_attendee_details  = new Object();

      var app_grade_value = parseInt($rootScope._settings_.grade_settings.value);
      var total_app_questions = parseInt($rootScope._questions_.length);
      var correct_questions = parseInt(question_reports.right_questions.length);
      var wrong_questions  = parseInt(question_reports.wrong_questions.length);
      var percentage = Math.round(correct_questions * 100 ) / total_app_questions ;
      var isPassed = ( percentage >= app_grade_value ) ? true : false ;
      // var is_completed =  ( total_app_questions == question_reports.question_answers.length )   ;


      usr.report_attendee_details['attendee_id'] = $rootScope.user_id ;
      usr.report_attendee_details['attendee_information'] = $rootScope.user_id ;
      usr.report_attendee_details['total_questions'] = question_reports.question_answers.length ;
      if( $rootScope._application_.app_type == 1 )
      usr.report_attendee_details['pass_mark'] = isPassed
      if( $rootScope._application_.app_type == 1 )
      usr.report_attendee_details['correct_answers'] = correct_questions ;
      if( $rootScope._application_.app_type == 1 )
      usr.report_attendee_details['wrong_answers'] = wrong_questions ;
      if( $rootScope._application_.app_type == 1 )
      usr.report_attendee_details['status'] = ( isPassed == true ) ? "Passed": "Failed";
      usr.report_attendee_details['completed_status'] = is_completed ;
      if($rootScope._application_.app_type == 1 )
      usr.report_attendee_details['score'] = percentage;
      usr.report_attendee_details['created_at'] = new Date();
      usr.report_attendee_details['completed_date'] = new Date();


      // ======================================[report_attendees]
      if(usr.report_attendees == undefined || usr.report_attendees == null )
        usr.report_attendees  = new Object();

        var dif_question_is_completed = $rootScope._questions_.is_completed_quiz_option(question_reports.question_answers);
        var is_completed =  ( dif_question_is_completed.length == 0 )   ;

        usr.report_attendees['created_at'] = new Date();
        usr.report_attendees['updated_at'] = new Date();
        usr.report_attendees['attendee_id'] = $rootScope.user_id ;
        usr.report_attendees['user_information'] = $rootScope.user_id;
        usr.report_attendees['is_completed'] = is_completed ;
        if($rootScope._application_.app_type == 1)
        usr.report_attendees['passed_the_grade'] = isPassed ;
        if($rootScope._application_.app_type == 1)
        usr.report_attendees['results'] = new Object()
        if(usr.report_attendees.survey_quiz_answers == undefined )
        usr.report_attendees['survey_quiz_answers'] = new Array();
        if($rootScope._application_.app_type == 1)
        usr.report_attendees.results['wrong_answers'] = wrong_questions ;
        if($rootScope._application_.app_type == 1)
        usr.report_attendees.results['correct_answers'] = correct_questions ;
        if($rootScope._application_.app_type == 1)
        usr.report_attendees.results['count_of_questions'] = question_reports.question_answers.length ;
        if($rootScope._application_.app_type == 1)
        usr.report_attendees.results['result'] =  new Object();

        if($rootScope._application_.app_type == 1)
        usr.report_attendees.results.result = new Object();
        if($rootScope._application_.app_type == 1)
        usr.report_attendees.results.result.percentage_value = percentage ;
        if($rootScope._application_.app_type == 1)
        usr.report_attendees.results.result.raw_value = correct_questions ;
        usr.is_completed = is_completed ;
        $rootScope._user_activity_ = usr ;
        // // // console.log($rootScope._user_activity_);
        if( $rootScope.is_submitted == true ){
            var usr_ = $rootScope._user_activity_ ;
            $rootScope.unsolved_questions = $rootScope._questions_.are_all_questions_tracked( usr_.questions_data );
        }
        $timeout(function(){  $rootScope.current_progress();  } , 100)
        $timeout(function(){ $rootScope.$apply(); } , 50 );
  };
  $rootScope.storing_answer_into_online_report = () => {
    // // console.log("storing is disabled !");
  }
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
                                  if(  show_results_setting == false ){
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

                                  }else if (   show_results_setting ) {
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

                                  } else if (   show_results_setting == false ) {
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

                                  } else if (  show_results_setting ) {
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
                                  if(  show_results_setting == false ){
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
                                  }else if(  show_results_setting ) {
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
                                  } else if (   show_results_setting == false ) {
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
                                  } else if (  show_results_setting ) {
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
                     if (   show_results_setting ) {
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

                       } else if (   show_results_setting ){
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

                       } else if (   show_results_setting == false ){
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

                     } else if (   show_results_setting  == false ){
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
                      // // console.log({attendeeInfo : attendeeInfo});
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
                             // // console.log({attendeeInfo: attendeeInfo});
                            // // console.log(attendeeInfo);
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
                // // console.log({
                //   currAttendee : $rootScope.this_attendee_draft
                // });
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
          $rootScope.is_view = 1;
        }
        if ( question_index == 0 ) {
          if($rootScope._settings_.enable_screens == true ){
            $rootScope.screen_type = 0;
            $rootScope.is_view = 1;
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
    // // console.log(question_index == ( $rootScope._questions_.length - 1 ) );
    if( question_index == ( $rootScope._questions_.length - 1 ) )
      {
        if($rootScope._settings_.enable_screens == true )
          {
            $rootScope.is_view = 1;
            $rootScope.screen_type = 1;
            // $("#docQuestions").children("li").each(function(){
            //    if( $(this).hasClass('marked_question') )
            //    $(this).removeClass('marked_question');
            // });
          }else {
            $rootScope.is_view = 1;
            $rootScope.screen_type = 2;
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
      $rootScope.is_view = 1;
      $rootScope.question_index = 0 ;
      $rootScope.highlighted_by_color_only();
      $timeout(function(){$rootScope.$apply()} , 300);
      $(".preview-page, .swiper-wrapper").css({  height : 'auto'});
  }
  $rootScope.review_this_survey = ( css_mode ) => {
    if ( css_mode == true ) return false;
    $rootScope.is_reviewed = true ;
    $(".review-result-box").children(".fa").removeClass("fa-reply-all");
    $(".review-result-box").children(".fa").addClass("fa-refresh fa-spin");

    $timeout(function(){
      $rootScope.screen_type = 3 ;
      $rootScope.question_index = 0 ;
      $rootScope.is_submitted = false ;
      $rootScope.highlighted_question($rootScope._questions_[0]._id);
      $(".review-result-box").children(".fa").addClass("fa-reply-all");
      $(".review-result-box").children(".fa").removeClass("fa-refresh fa-spin");
    } , 1000 );
  }
  $rootScope.review_this_quiz = (css_mode) => {
    if ( css_mode == true ) return false;
    $rootScope.is_reviewed = true ;
    $rootScope._settings_.show_results_per_qs = true ;
    $(".review-result-box").children(".fa").removeClass("fa-reply-all");
    $(".review-result-box").children(".fa").addClass("fa-refresh fa-spin");

    $timeout(function(){
      $rootScope.screen_type = 3 ;
      $rootScope.question_index = 0 ;
      $rootScope.is_submitted = false ;
      $rootScope.highlighted_question($rootScope._questions_[0]._id);
      $(".review-result-box").children(".fa").addClass("fa-reply-all");
      $(".review-result-box").children(".fa").removeClass("fa-refresh fa-spin");
    } , 1000 );
  };
  $rootScope.retake_this_survey = (css_mode) => {
      if ( css_mode == true ) return false;
      $rootScope.is_reviewed = false ;
    $(".retake-result-box").children(".fa").addClass("fa-spin");
    // ==> Randmoize Questions
    $rootScope.randomize_sorting_questions(true);
    $rootScope._settings_.show_results_per_qs = false ;
    // ==> Randomize answers
    $rootScope._questions_.filter((object) => {
      return object.answers_format = $rootScope.randomize_arries(object.answers_format);
    });

    $timeout(function(){

      $rootScope.this_attendee_draft = undefined ;
      $rootScope.screen_type = 3 ;
      $rootScope.question_index = 0 ;
      $rootScope.is_submitted = false ;
      $rootScope.highlighted_question($rootScope._questions_[0]._id);
      $rootScope._user_activity_ = null ;
      $(".retake-result-box").children(".fa").removeClass("fa-spin");
    } , 1000 );
  };
  $rootScope.retake_this_quiz = (css_mode) => {
      if ( css_mode == true ) return false;
    $(".retake-result-box").children(".fa").addClass("fa-spin");
    // ==> Randmoize Questions
    $rootScope.randomize_sorting_questions(true);
    $rootScope._settings_.show_results_per_qs = false ;
    // ==> Randomize answers
    $rootScope._questions_.filter((object) => {
      return object.answers_format = $rootScope.randomize_arries(object.answers_format);
    });

    $timeout(function(){
      $rootScope.this_attendee_draft = undefined ;
      $rootScope.screen_type = 3 ;
      $rootScope.question_index = 0 ;
      $rootScope.is_submitted = false ;
      $rootScope.highlighted_question($rootScope._questions_[0]._id);
      $rootScope._user_activity_ = null ;
      $(".retake-result-box").children(".fa").removeClass("fa-spin");
    } , 1000 );
  };
  $rootScope.go_to_unsolved_questions = (css_mode) => {
    if ( css_mode == true ) return false;
    if($rootScope.unsolved_questions.length == 0 ) return false ;
    // get index
    var this_index = $rootScope.unsolved_questions[0];
    var target_index = $rootScope._questions_.findIndex( x => x._id == this_index._id );
    if(target_index != -1 ){
      $rootScope.highlighted_question(this_index._id);
      $rootScope.question_index = target_index ;
      $rootScope.screen_type = 3 ;
    }
  }
   $rootScope.submit_the_quiz = ( css_mode ) => {
     // disable answer if there is unsolved questions
     if ( css_mode == true ) return false;
     $rootScope.is_submitted = true ;
      var usr = $rootScope._user_activity_ ;;
      var is_required_qs = $rootScope._questions_.filter(x => x.answer_settings.is_required == true ) ;
      if( is_required_qs.length != 0 && ( usr == null || usr == undefined ) ){
        $rootScope.unsolved_questions  = is_required_qs ;
      }else
      {
        if(usr != null )
        $rootScope.unsolved_questions = $rootScope._questions_.are_all_questions_tracked( usr.questions_data );
      }

      if($rootScope.unsolved_questions.length != 0 )
      return false;

      $rootScope.is_view = 1;
      $rootScope.screen_type = 2;
      $(".preview-page , .swiper-wrapper").css({  height : 'auto'});
     // $rootScope._questions_.are_all_questions_tracked( attended_questions );
   };
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
    if(is_enabeld == true)
    $rootScope.change_in_view(3);
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
    $rootScope.switch_int_mode(1);
    if(question_index != null ){
      $rootScope.question_index = question_index ;
    }
  }
  $rootScope.apply_css_changes = (is_apply) => {
     //=> class for all
     // => class for spesific question .this_slide_ID //

    // ==> if it false , apply it for only one slide
    // ==> apply for all slides
    if(is_apply == false )
    {
      var this_class = 'this_slide_' + $rootScope._questions_[$rootScope.question_index]._id ;
      // ==> Apply styles for selected slide ( current question )
      if( $("div[box-question-slide]").hasClass( this_class ) ){
        // console.log(this_class);
      }
    }else {
      // apply in all slides
    }
  }
  $rootScope.enable_css_mode_func = ( is_enabled ) => {
    $("#enabled_css").val( is_enabled );
    // $rootScope.switching_editor_preview(true);

   if(is_enabled == true ){

     $(".switch").trigger('click');

     $timeout(function(){
        $(".player-body-screen").trigger("click");
     } , 300 );

     $rootScope.switch_int_mode(1);
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


            $rootScope.show_apply_changes = false; ;

            if( e.target.getAttribute('box-question-slide') != undefined )
            {

               // ==> Show options ( all slides or spesific slide )
               $rootScope.show_apply_changes = true ;
               // ==> Apply on slide
                var this_slide = $("."+e.target.getAttribute('box-question-slide'));

                if( e.target.getAttribute('box-target-type') == 'box-containers' ){
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
            }else {
              // ==> Show Options
              if( e.target.getAttribute('box-target-type') == 'box-buttons' ){

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
              if( e.target.getAttribute('box-target-type') == 'box-player' ){
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
              if( e.target.getAttribute('box-target-type') == 'box-containers' ){
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
              if( e.target.getAttribute('box-target-type') == 'box-answers' ){
                  // ==> Fetch Style results

                  // Basic answers
                  // var current_class = e.target.getAttribute('box-target-class');
                  // // console.log(current_class);
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
              if( e.target.getAttribute('box-target-type') == 'box-texts' ){
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
              if( e.target.getAttribute('box-target-type') == "box-media" ){
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
              if( e.target.getAttribute('box-target-type') == 'box-labels' ){

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
              if( e.target.getAttribute('box-target-type') == 'box-svg-container' ){
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
              if( e.target.getAttribute('box-target-type') == 'box-timer' ){
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

    $timeout(function(){ $rootScope.storing_questions_into_database(); } , 500 );

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
    $rootScope.image_uploader_proceed = {
        show_progress : false ,
        progress : 0 ,
        status_code : undefined ,
        message : undefined
    };

    var questionId = $("#question_id").val();
    var x = $('#cropping-image-x').val();
    var y = $('#cropping-image-y').val();
    var width = $('#cropping-image-width').val();
    var height = $('#cropping-image-height').val();
    $("#file_extension").val( $rootScope.media_image_uploader[0].files[0].name.split('.').pop());

    var cropping_url = $rootScope.server_ip + "api/" + $rootScope.app_id + "/question/" + questionId + "/cropping_system" ;
    var formImageData = new FormData();
    formImageData.append('media_field' , $rootScope.media_image_uploader[0].files[0]   );
    formImageData.append('height' , height  );
    formImageData.append('width' , width  );
    formImageData.append('x' ,x  );
    formImageData.append('y' , y  );
    formImageData.append('questions' , $rootScope._questions_ );

    // ==> Http angular request
    var before_start = function () {
      $rootScope.progress_value = 0 ;
      $(".prog-part").fadeIn();
      $(".progress-perc-ui").html("<span class='percentage-val'>" + 0 + "%</span>");
      $(".progress-bar-proccess").html("<div class='currprcees' style='width:"+ 0 +"%'></div>");
    }

    var request = $.ajax({
        url : cropping_url ,
        type : "POST",
        data : formImageData ,
        contentType: false,
        cache: false,
        processData:false,
        beforeSend : before_start ,
        xhr : function () {
          var xhr = $.ajaxSettings.xhr();
          if (xhr.upload){

             // ==> ui actions
             $("html , body").animate({
               scrollTop : $(".box-data").offset().top - 100
             })

              xhr.upload.addEventListener('progress' , function(event){
                var percent = 0 , position = event.loaded || event.position , total = event.total ;
                if (event.lengthComputable) {
                  percent = Math.ceil(position / total * 100);
                }
                $(".progress-perc-ui").html("<span class='percentage-val'>" + percent + "%</span>");
                $(".progress-bar-proccess").html("<div class='currprcees' style='width:"+ percent +"%'></div>");

              } , true );
          }
          return xhr ;
        } ,
    });
    request.done(function (response){
      //progress_message
      if(response.status_code == 0 ) $rootScope.progress_message = response.error
      if(response.status_code == 1 ){
        $rootScope.progress_message = "Uploaded successfully" ;

        // Fill and mark data
        response = response.data;
        if( response.questions == undefined ) return false ;
        var all_questions = response.questions ;
        var target_question = all_questions.find(x => x._id == questionId ) ;
        if(target_question == undefined && target_question.media_question == undefined ) return false ;

        // = 2 ui question object
        var ui_question = $rootScope._questions_.find(x => x._id == questionId );
        if(ui_question == undefined ) return false ;
        if(ui_question.media_question == undefined )  ui_question['media_question'] = target_question.media_question ;

        var image_object = new Image();
        image_object.src = target_question.media_question.Media_directory ;
        image_object.onload = () => {
          ui_question['media_question'] = target_question.media_question ;
          $timeout( function(){ $rootScope.$apply(); } , 150 );
          $timeout( function(){ $rootScope.close_current_image_uploader();  } , 500 );
        }
      }
      $timeout(function(){$(".prog-part").fadeOut(); } , 500 );
    });
  };














 $rootScope.storing_cropped_image_for_media_answer = () => {
   $rootScope.image_uploader_proceed = {
       show_progress : false ,
       progress : 0 ,
       status_code : undefined ,
       message : undefined
   };
   $("#file_extension").val( $rootScope.media_image_uploader[0].files[0].name.split('.').pop());
   var questionId = $("#question_id").val();
   var answerId = $rootScope.current_answer_id ;
   var x = $('#cropping-image-x').val();
   var y = $('#cropping-image-y').val();
   var width = $('#cropping-image-width').val();
   var height = $('#cropping-image-height').val();






   var cropping_url = $rootScope.server_ip + "api/" + $rootScope.app_id +"/question/"+ questionId +  "/answer/" + answerId + "/cropping_system" ;
   var formImageData = new FormData();
   formImageData.append('media_field' , $rootScope.media_image_uploader[0].files[0]   );
   formImageData.append('height' , height  );
   formImageData.append('width' , width  );
   formImageData.append('x' ,x  );
   formImageData.append('y' , y  );
   formImageData.append('questions' , $rootScope._questions_ );

   // ==> Http angular request
   var before_start = function () {
     $rootScope.progress_value = 0 ;
     $(".prog-part").fadeIn();
     $(".progress-perc-ui").html("<span class='percentage-val'>" + 0 + "%</span>");
     $(".progress-bar-proccess").html("<div class='currprcees' style='width:"+ 0 +"%'></div>");
   }

   var request = $.ajax({
       url : cropping_url ,
       type : "POST",
       data : formImageData ,
       contentType: false,
       cache: false,
       processData:false,
       beforeSend : before_start ,
       xhr : function () {
         var xhr = $.ajaxSettings.xhr();
         if (xhr.upload){

            // ==> ui actions
            $("html , body").animate({
              scrollTop : $(".box-data").offset().top - 100
            })

             xhr.upload.addEventListener('progress' , function(event){
               var percent = 0 , position = event.loaded || event.position , total = event.total ;
               if (event.lengthComputable) {
                 percent = Math.ceil(position / total * 100);
               }
               $(".progress-perc-ui").html("<span class='percentage-val'>" + percent + "%</span>");
               $(".progress-bar-proccess").html("<div class='currprcees' style='width:"+ percent +"%'></div>");

             } , true );
         }
         return xhr ;
       } ,
   });
   request.done(function (response){
     //progress_message
     if(response.status_code == 0 ) $rootScope.progress_message = response.error
     if(response.status_code == 1 ){


       $rootScope.progress_message = "Uploaded successfully" ;

       // ==> Fill and mark data
       response = response.data;
       var questions = response.questions ;
       var target_uploaded_qs = questions.find(x => x._id == questionId )
       var question_scope = $rootScope._questions_.find(x => x._id == questionId)
       if( target_uploaded_qs == undefined || question_scope == undefined ) return false ;
       var answers = target_uploaded_qs.answers_format ;
       var scope_answer = question_scope.answers_format ;

       var target_answer = answers.find(x => x._id == answerId )
       var target_answer_scope = scope_answer.find(x => x._id == answerId )
       if( target_answer == undefined || target_answer_scope == undefined ) return false;

        var media_dir = '';
       // ==> Get answer From scopt object
       if( target_uploaded_qs.question_type == 0 ) {
          if( target_answer_scope.media_optional == undefined )
              target_answer_scope['media_optional'] = target_answer.media_optional ;
              media_dir = target_answer.media_optional.Media_directory ;
        }
       if( target_uploaded_qs.question_type == 1 ) {
         target_answer_scope['Media_directory'] = target_answer.Media_directory ;
         target_answer_scope['image_cropped'] = target_answer.image_cropped ;
         target_answer_scope['image_full'] = target_answer.image_full ;
         target_answer_scope['image_updated_date'] = target_answer.image_updated_date ;
         target_answer_scope['media_name'] = target_answer.media_name ;
         target_answer_scope['media_type'] = target_answer.media_type ;
         media_dir = target_answer.Media_directory ;
       }




       var image = new Image() ;
       image.src = media_dir ;
       image.onload = () => {
         if( target_uploaded_qs.question_type == 0 )
         target_answer_scope['media_optional'] = target_answer.media_optional ;
         if( target_uploaded_qs.question_type == 1 )
         target_answer_scope['Media_directory'] = target_answer.Media_directory ;

         $timeout(function(){ $rootScope.$apply(); } , 200)
         $timeout(function(){ $rootScope.close_current_image_uploader(); } , 600 );
       }
     }

     $timeout(function(){$(".prog-part").fadeOut(); } , 500 );
   });

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

  $rootScope.storing_video_for_media_answer = (   ) => {
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

  $timeout(function(){

    $("#question-pt , #answers-pt").slideDown();
    // $rootScope.draw_radial_progression(0/100);
    // $rootScope.init_swiperJs();
    $rootScope.init_bootstrap_tooltip();
    $rootScope.init_drag_drop();
    $rootScope.load_spectrum_plugin();
    // $rootScope.switching_editor_preview(true);
  }, 500 );


// description-redactor
$rootScope.load_description_redactor = ( description_text ) => {
    var description_redactor_object = {
      airMode: true ,
      popover : {
        air : [
          ['color', ['color']],
          ['fontsize', ['fontsize']],
          ['font', ['bold', 'underline', 'italic'  , 'strikethrough', 'clear' ]]
        ]
      } ,
      callbacks : {
        onChange : ( content ) => {
          $rootScope.is_unsaved_data = true ;
          // ==> STORING IT TEXT
          $rootScope._questions_[$rootScope.question_index].question_description.value = content ;
          // ==> Placeholder
          if(content == ''){
            $(".description-redactor").next('.note-editor').find('.note-editable').children('').html('');
            $(".description-redactor").next('.note-editor').find(".note-editable").attr("data-text" , "Question Description ... ");
          }

          $timeout(function(){ $rootScope.$apply(); } , 150 )
        }
      }
    };

     $(".description-redactor").summernote(  description_redactor_object );

     if( description_text != '' )
     {
       // ==> Question Texts
       $(".description-redactor").next('.note-editor').find(".note-editable").html(description_text);
     }
     else
     {
       // ==> Placeholder
       $(".description-redactor").next('.note-editor').find(".note-editable").html('');
       $(".description-redactor").next('.note-editor').find(".note-editable").attr("data-text" , "Question Description ...");
     }
}
 $rootScope.load_question_redactor = ( question_text ) => {
     var question_redactor_object = {
       airMode: true ,
       popover : {
         air : [
           ['color', ['color']],
           ['fontsize', ['fontsize']],
           ['font', ['bold', 'underline', 'italic'  , 'strikethrough', 'clear' ]]
         ]
       } ,
       callbacks : {
         onChange : ( content ) => {
           $rootScope.is_unsaved_data = true ;
           // ==> STORING IT TEXT
           $rootScope._questions_[$rootScope.question_index].question_body = content ;
           // ==> Placeholder
           if(content == ''){
             $(".question-redactor").next('.note-editor').find(".note-editable").html('');
             $(".question-redactor").next('.note-editor').find(".note-editable").attr("data-text" , "Add your question here !");
           }

           $timeout(function(){ $rootScope.$apply(); } , 150 )
         }
       }
     };

      $(".question-redactor").summernote(  question_redactor_object);

      if( question_text != '' )
      {
        // ==> Question Texts
         $(".question-redactor").next('.note-editor').find(".note-editable").html(question_text);
      }
      else
      {
        // ==> Placeholder
         $(".question-redactor").next('.note-editor').find(".note-editable").html('');
         $(".question-redactor").next('.note-editor').find(".note-editable").attr("data-text" , "Add your question here !");
      }
 }

$rootScope.load_redactor_data_answers = ( question_id  , answer_lists  ) => {
   var answers = answer_lists ;
   var answer_zooming = (answer) => {
     var answer_element = $('.answer_id_'+ answer._id) ;
     var answer_editor = answer_element.next('.note-editor').find(".note-editable") ;
     answer_editor.html('')

     var splited_answer =  ( answer.value != undefined ) ? answer.value.split(" ") : [];

     /*
      element.next(".note-editor").children(".note-editing-area").children(".note-editable").css("color","#000");
     */
     // console.log(splited_answer);
       if(answer.value != undefined && ( answer.value == '' || (answer.value.toLowerCase().includes('answer') == true && splited_answer.length == 2 && !isNaN(splited_answer[1])) ) )
       {
         answer_editor.attr("data-text" , answer.value )
         answer_editor.css({color : "#999"});
       }
       else
       {
         if(answer.value != undefined ){
           answer_editor.html( answer.value );
           answer_editor.css({color : "#000"});
          }
       }
   };
   answers.map(answer_zooming)
}
 $rootScope.storing_placholder_if_item_empty = (contents , element) => {
   // console.log(contents == element);
   if(contents == '')
   {
     $("div[message-name='"+element+"']").next('.note-editor').find('.note-editable').attr("data-text" , "Write your text here !");
     if($("div[message-name='"+element+"']").next('.note-editor').find('.note-editable').hasClass('msg-placeholder-field') == false)
     $("div[message-name='"+element+"']").next('.note-editor').find('.note-editable').addClass("msg-placeholder-field");
   }else {
     if($("div[message-name='"+element+"']").next('.note-editor').find('.note-editable').hasClass('msg-placeholder-field') )
     $("div[message-name='"+element+"']").next('.note-editor').find('.note-editable').removeClass('msg-placeholder-field')
   }
 }
 $rootScope.slide_to_expiry_screen = ( is_enabled ) => {
   if(is_enabled == true ){
     $rootScope.change_in_view(4);
   }
 };
 $rootScope.load_redactor_data_questions = ( question_id = null ) => {
   if(question_id == null )
   question_id = $rootScope._questions_[$rootScope.question_index];

   var question_editor = $(".question-redactor") ;
   var description_editor = $(".description-redactor");
   var question_data = $rootScope._questions_.find( x => x._id == question_id );
   if( question_data != undefined ){

     var question_field = question_editor.next('.note-editor').find('.note-editable');
     var description_field = description_editor.next('.note-editor').find('.note-editable');

     // ==> Question text
     if(question_data.question_body == '')
      {
        question_field.html('');
        question_field.attr('data-text' , 'Add your question here !');
        question_field.css({color : '#999'})
      }
      else
      {
        question_field.html(question_data.question_body);
          question_field.css({color : '#000'})
      }

      // ==> question description
      if(question_data.question_description.value == '')
      {
        description_field.html('');
        description_field.attr('data-text' , 'Write your question description here  !');
          description_field.css({color : '#999'})
      }
      else
        {
          description_field.html(question_data.question_description.value);
          description_field.css({color : '#000'})
        }
   }
 };


 $rootScope.drag_is_started = (answer_object , index) => {
   $(".choices-part").css({
     background : "rgba(255, 241, 71, 0.11)",
     border: "1px solid #fde04d"
   }); 
    $timeout(function(){
      $(".choices-part > li.dndPlaceholder").css({
        padding : "5px"
      })
    } , 100)
 }
 $rootScope.dropCallback = function(index, item, external, type) {
        $scope.logListEvent('dropped at', index, external, type);
        // Return false here to cancel drop. Return true if you insert the item yourself.
        return item;
    };
 $rootScope.drag_is_ended =    ( answer_object )  =>  {
   $(".choices-part").css({
     background : "transparent",
     border: "0px solid transparent"
   })
   var answer = answer_object ;
    var splited_answer =  ( answer.value != undefined ) ? answer.value.split(" ") : [];
   $rootScope.is_unsaved_data = true ;
   var question_type = $rootScope._questions_[$rootScope.question_index].question_type ;
   if( question_type == 0 ) {
     var answer_li = $("li[data-answer-id='"+answer_object._id+"']");

     if(answer.value != undefined && ( answer.value == '' || (answer.value.toLowerCase().includes('answer') == true && splited_answer.length == 2 && !isNaN(splited_answer[1])) ) )
     {
       answer_li.find('.note-editable').html('');
       answer_li.find('.note-editable').attr("data-text" , answer.value )
       answer_li.find('.note-editable').css({color : "#999"});
     }
     else
     {
       if(answer.value != undefined ){
         answer_li.find('.note-editable').html( answer.value );
         answer_li.find('.note-editable').css({color : "#000"});
        }
     }
     // answer_li.find('.note-editable').html(answer_object.value);
   }
 }


  $timeout(function(){
    $(".mobile-menu-qs").on("click" , function(){
       var question_menu = $(".side-left-bar");

       if( question_menu.offset().left != 0){
           $(".side-left-bar").css({
             left : "0px"
           });
           $(".update-rows").css({
             marginLeft : "130px" ,
             marginRight : "-130px"
           });
       }else {

           $(".side-left-bar").css({
             left : "-126px"
           });
           $(".update-rows").css({
             marginLeft : "0px" ,
             marginRight : "0px"
           });
       }

    })
  } , 500 )
}]);
