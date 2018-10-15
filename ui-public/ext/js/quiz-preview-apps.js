
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
var application_exception = {
  expire_through : 0 ,
  date_started : 0
};

apps.filter('filter_by_zero' , [
  ()=>{
    return (val) => {
      if( val == undefined || val == '' ) val = 0 ;
      return val ;
    }
  }
]);
apps.filter("detect_zero_issue" , [
  ()=>{
    return (val) => {
      if(val == undefined) val = 0 ;
      return val ;
    }
  }
]);
apps.filter('math_around_it' , [
  '$sce' , function(){
    return (round_p) => { //
      var  rounded = ( Math.round(round_p) ) ? Math.round(round_p): 0  ;
      return  rounded.toFixed(1) ;
    }
  }
]);
apps.filter("filter_completed_time" , ($sce) => {
  return (time_object) => {
    var timer = '';
    if(time_object.type == 0 ) // => Mins
      timer = ( time_object.time.toString().length > 1 ) ? time_object.time :  "0" + time_object.time ;
    if(time_object.type == 1 ) // => Secs
      timer =   ( time_object.time.toString().length > 1 ) ? time_object.time :  "0" + time_object.time;

      if(time_object.type == 0 )
      timer = timer.toString() + ":00";
      if(time_object.type == 1 )
      timer = "00:" + timer.toString() ;

      return timer;
  }
});
apps.filter("time_style" , () => {
  return (time) => {
    // // // console.log(time.toString().length);
    if(time.toString().length == 1 )
      time = "0" + time ;
    return time ;
  }
})
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
    var day_counts = application_exception.expire_through;
    var started_date = new Date(application_exception.date_started);



    var date_in_timestamps = started_date.getTime();
    var calculated_date = new Date (( day_counts * 24 * 60 * 60 * 1000 ) + date_in_timestamps ) ;
    var splited_date = calculated_date.toString().split(" ");

    var calculate_time_ago = new Date().getTime() - calculated_date.getTime() ;
    var time_ago_hrs = (((calculate_time_ago / 1000 ) / 60 ) / 60 ) ;
    if( time_ago_hrs < 0 ) time_ago_hrs = "<span class='notexpired'>Not Expired</span>";
    else time_ago_hrs = time_ago_hrs + " hour(s)";

    var get_day_numbers =  ( day_counts * 1000 * 60 * 60 * 24 ) - ( new Date().getTime() - started_date.getTime() )    ;
    var hours_cn = parseInt ( ( ( get_day_numbers / 1000  ) / 60 ) / 60 ) ;
    var days_cn =   ( ( ( get_day_numbers / 1000  ) / 60 ) / 60 / 24 ) ;


    var date_time = splited_date[0] + ' ' +  splited_date[2]   + ' ' +  splited_date[1]  + ' ' +  splited_date[3] ;
    var date_long = splited_date[2] + ' ' + splited_date[1] + ' , ' + splited_date[3] + " "+ time_hr(calculated_date) ;
    var date_short =splited_date[2] + ' ' +  monthNames[calculated_date.getMonth()];
    var date_american = calculated_date.getMonth() + "/" +splited_date[2] + "/" +calculated_date.getFullYear() ;

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
        case "{{ hour_counts }}" :
          return hours_cn ;
        break;
        case "{{ day_counts }}" :
            return days_cn.toFixed(1) ;
        break;
        case "{{ date | dd/mm/yyyy }}" :
        return dd_mm_yyyy ;
        break;
        case "{{ date | mm/dd/yyyy }}" :
        return mm_dd_yyyy ;
        break;

        case "{{ time_ago }}" :
            var hrs = time_ago_hrs ;
            if( time_ago_hrs.length > 2 )
            hrs = parseInt(time_ago_hrs);
          return hrs ;
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
      "{{ day_counts }}" ,
      "{{ time_ago }}",
      "{{ date | mm/dd/yyyy }}" ,
      "{{ date | dd/mm/yyyy }}"
    ];

    for (var i = 0; i < formative_array.length; i++) {
      var date_format = formative_array[i];
       if(returned_values != undefined ){
         if(returned_values.toString().includes(date_format.toString()))
           existing_formative.push(date_format) ;
       }

    }

    for (var i = 0; i < existing_formative.length; i++) {
      var date = existing_formative[i] ;
      returned_values = returned_values.replace(date , filter_date_format(date) );
    }

    return $sce.trustAsHtml(returned_values) ;
   };
}]);
apps.filter("apply_html" , ($sce) => {
  return (val) => {
    if( val == '' ) val = "Add your question here !";
    return $sce.trustAsHtml(val)
  };
});
apps.filter('trust_iframe_url' , ( $sce ) => {
  return function (url){
    return  $sce.trustAsResourceUrl(url);
  };
});
apps.controller("player", [
'$rootScope','$scope' , '$http' , '$timeout' , 'settings' , '$window' , function ( $rootScope , $scope , $http , $timeout , settings , $window ) {
    $scope.row_unsolved_question = [] ;
    $scope.server_ip = settings.server_ip ;
    var url_data = $window.location.href.split('/') ;
    var index_ = url_data.indexOf("live_preview")  ;

    $scope.application_id = url_data[index_ - 1] ;
    $scope.user_id = url_data[index_+1] ;
    $scope.disable_funcs = false ;
    $scope.auto_slide_delay = 0 ;
    $scope.current_slide = 0 ;
    $scope.is_retake = false ;
    $scope.chars = ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] ;
    $scope.is_resume = false;

    $scope.question_labels = {
      label_0 : ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] ,
      //  ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ,       'aa', 'ab', 'ac', 'ad', 'ae',  'af', 'ag', 'ah', 'ai', 'aj', 'ak', 'am', 'al', 'an', 'ao', 'ap', 'aq',  'ar', 'as', 'at', 'au', 'av', 'aw', 'ax', 'ay', 'az'   'ba', 'bb', 'bc', 'bd', 'be',  'bf', 'bg', 'bh', 'bi', 'bb', 'bk', 'bm', 'bl', 'bn', 'bo', 'bp', 'bq',  'br', 'bs', 'bt', 'bu', 'bv', 'bw', 'bx', 'by', 'bz'],
      label_1 : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50]
    }
    $scope.answer_labels = {
      label_0 : ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ],
      label_1 : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50]
    }

    // ==> Veriable scopes
    $scope.timer_proc = null ;
    $scope.unsolved_questions = [] ;
    $scope.finished_is_clicked = false ;
    $scope.percentage_progress = 0 ;
    $scope.question_number = 0 ;
    $scope.starting_screens = 0 ; // ==> (0) welcome screen (1) resume screen
    $scope._application_   = {} ;
    $scope._questions_      = null ;
    $scope._settings_       = null ;
    $scope._online_report_  = null ;
    $scope._offline_report_ = null ;
    $rootScope._stylesheet_ = null ;
    $scope._user_activity_  = {} ;
    $scope.is_expired = false ;
    $scope.swipperJs = null;

    // ==> Funcs
    $scope.isEmpty = ( obj ) => {
      for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
      }
      return true;
    };
    $scope.list_classes_of_this_rating = (question_id , answer_id , rating_object ) => {
      var classes = {
        'fa-star-o' : true,
        'fa-star':false
      };

      if($scope._user_activity_.questions_data != undefined && $scope._user_activity_.questions_data.length != 0){
         var current_question = $scope._user_activity_.questions_data.find( x => x.question_id == question_id );
         if( current_question != undefined ){
            var answer_rat_scale_id = current_question.answer_ids[0].answer_id_val;
            var answer_scale_value = current_question.answer_ids[0].answer_object.rating_scale_answers.find(x => x._id == answer_rat_scale_id ).rat_scl_value ;
             if (rating_object.rat_scl_value <= answer_scale_value) {
               classes = {
                 'fa-star-o' : false ,
                 'fa-star': true
               };
             }
         }
      }

      return classes ;
    }


    $scope.list_classes_of_this_scale = (question_id , answer_id , rating_object ) => {
      var classes = '';
        if($scope._user_activity_.questions_data != undefined && $scope._user_activity_.questions_data.length != 0){
           var current_question = $scope._user_activity_.questions_data.find( x => x.question_id == question_id );
           if( current_question != undefined ){
              var answer_rat_scale_id = current_question.answer_ids[0].answer_id_val;
              var answer_scale_value = current_question.answer_ids[0].answer_object.rating_scale_answers.find(x => x._id == answer_rat_scale_id ).rat_scl_value ;
              if (rating_object.rat_scl_value == answer_scale_value) classes  = "selected-scale-number"
           }
        }

        return classes ;
    }


    $scope.select_rating_scale__ = function ( index , type , question_id = null  , answer_id = null , question_type = null ){
         var question = $scope._questions_.find(x => x._id == question_id)
         var answer = question.answers_format.find(x => x._id == answer_id );
         var rat_answer_val = (index + 1 );

         $scope.select_answer(question , answer  , rat_answer_val );
         $timeout( function(){
           $scope.$apply();
         },300 )
     };
    $scope.select_this_rating_value = (index , class_name , answer_id , question_id , rs_type  ) => {



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
    // ==> Loading Application
    $scope.loading_application_data = () => {
      var url =  $scope.server_ip + 'api/'+ $scope.application_id +'/player/data' ;
      // console.log(url);
        $http({
          url : url
        }).then((results) => {
          $timeout(function(){
            $(".Loading-contents").fadeOut();
          } , 1000);
            var app = results.data;
            // console.log(app);

            $scope._application_ = app;
            $scope._questions_ = $scope._application_.questions;
            $scope._settings_ = $scope._application_.settings;
            $scope._online_report_ = $scope._application_.att__draft;
            $scope._offline_report_ = $scope._application_.app_report;
            $rootScope._stylesheet_ = $scope.server_ip + "themes/stylesheet_of_app_" + $scope.application_id +'.css';

            if( $scope.isEmpty($scope._user_activity_) == true || $scope.is_retake == true )
            {
              // ==> Questions
              $scope.randomize_sorting_questions($scope._settings_.randomize_settings);
              // ==> Answers

            }
            if( $scope.is_retake == true )
            {
              $scope.is_retake = false ;
            }

            // ==> Storing current attendee draft
            if( $scope._online_report_ != undefined && $scope._online_report_.att_draft != undefined && $scope._online_report_.att_draft != null )
              {

                var usr = $scope._online_report_.att_draft.find( x => x.user_id == $scope.user_id ) ;
                if(usr!= undefined ){
                   $scope._user_activity_ =  usr ;   ;
                   application_exception.expire_through =   $scope._user_activity_.impr_application_object.settings.expiration.through_time;
                   application_exception.date_started = $scope._user_activity_.start_expiration_time ;
                 } ;
              }


            // ==> Detect if this quiz is expired && expiration sys is enabled
            var expire_options = $scope._settings_.expiration;
            // ==> Case window is loaded
            if( $scope.isEmpty( $scope._user_activity_ ) == false  && $scope._user_activity_.is_loaded != undefined  ){
               $scope.starting_screens = 1 ; // ==> Resume screen
               // ==> Loading From his object
               $scope._questions_ = $scope._user_activity_.impr_application_object.questions;
               $scope._settings_ = $scope._user_activity_.impr_application_object.settings;

            }
            // ==> Case it first time
            else if (  $scope.isEmpty( $scope._user_activity_ ) == true &&  $scope._user_activity_.is_loaded == undefined ){
               $scope.starting_screens = 0 ; // ==> welcome screen
            }

            // ==> Show Result Screen if quiz is compelted
            if($scope._application_.app_report  != undefined ){
              if($scope._application_.app_report.attendee_details != undefined){
                var thisUsr = $scope._application_.app_report.attendees.find(x => x.attendee_id == $scope.user_id ) ;
                if(thisUsr != undefined )
                $scope.starting_screens = 2 // => user Result Screen ;
                $timeout(function(){
                  $scope.swipperJs = new Swiper('.swiper-container' , {
                    allowTouchMove : false ,
                    allowSlideNext : false ,
                    allowSlidePrev : false ,
                    noSwiping : false
                  });

                } , 1000 )
              }
            }

            // ==> Case it expired ! => is_expired
             var started_date = new Date($scope._user_activity_.start_expiration_time);
             var count_of_days = $scope._settings_.expiration.through_time
             var calc_date = new Date(started_date.getTime() + ( count_of_days * 24 * 60 * 60 * 1000 )) ;
             $scope.is_expired = (( new Date()  > calc_date ) && $scope._settings_.expiration.is_set == true ) ;

            // ==> resume the quiz message

            // ==> Enable swipperJs

            // ==> Hide loading div

            // ==> Loading swipperJs


            $timeout(function(){
              try {
                  // $scope.swipperJs.allowTouchMove = $scope._settings_.allow_touch_move;
                  $scope.swipperJs = new Swiper('.swiper-container' , {
                    allowTouchMove : $scope._settings_.allow_touch_move
                  });

                  $scope.swipperJs.on('slideChange' , function(){
                    var this_slide  = $(this);
                    var current_index = this_slide[0].activeIndex;
                    var previous_index = this_slide[0].previousIndex;
                    if(current_index == 1 && previous_index == 0 && ( $scope._user_activity_ != null && $scope._user_activity_.user_completed_status != undefined || $scope._user_activity_.user_completed_status == false )){
                      if($scope._settings_.navigation_btns == false && ( $scope._user_activity_ == null ))
                       $scope.start_the_quiz();
                    }
                    if($scope._user_activity_ != null && $scope._user_activity_.is_completed == true ){
                      if( $scope._settings_.time_settings.is_with_time == true )
                        {
                          if ( $scope.is_resume == false )
                          $timeout.cancel($scope.timer_proc);

                          if( $scope._settings_.navigation_btns == false && $scope._user_activity_ != null && $scope._user_activity_.user_completed_status == false) {
                              $scope.submit_the_quiz_into_reports(1);
                          }
                        }
                    }
                    $timeout(function(){
                      var current_slider = $(".swiper-wrapper").find(".swiper-slide-active");
                      var element_id = current_slider.prop("id") ;

                      if(element_id != ''){
                        if(element_id.split("-") != undefined && element_id.split("-").pop() != undefined ){
                          var questionId = element_id.split("-").pop();
                          var thisQuestion  = $scope._questions_.find(x => x._id == questionId);
                          var thisQuestionIndex  = $scope._questions_.findIndex(x => x._id == questionId);
                          if(thisQuestionIndex != -1 ){

                            // ==> Progress proccess
                            if( $scope._settings_.progression_bar.is_available == true )
                            $scope.progress_proccess(thisQuestionIndex);


                            if(thisQuestion.answer_settings != undefined && thisQuestion.answer_settings.is_randomized != undefined && thisQuestion.answer_settings.is_randomized == true )
                            $rootScope.is_randomized_answer_with(thisQuestion.answer_settings.is_randomized , thisQuestionIndex );


                            if(thisQuestion.question_type == 0 || thisQuestion.question_type == 1 ){
                              var answer_settings = thisQuestion.answer_settings ;
                              // answer_settings.is_randomized
                              $scope.is_randomized_answer_with(answer_settings.is_randomized ,thisQuestionIndex );
                            }
                          }
                        }
                      }else {
                        // ==> Progress proccess
                        if( $scope._settings_.progression_bar.is_available == true )
                        $scope.progress_proccess(undefined);
                      }
                    } , 150);



                    if( $scope._settings_.allow_touch_move == true && $scope._settings_.navigation_btns == false )
                      {
                        // ==> case it first slide
                        if( current_index == 1 && previous_index == 0 )
                          $scope.join_this_quiz();
                      }
                  });


              } catch (e){}
            } , 1000 ) ;



            $timeout(function(){

              if( $scope._settings_.enable_screens == false && $scope.isEmpty($scope._user_activity_) )
                {
                    $scope.start_the_quiz_();

                }






            } , 1000 );
        }).catch((error) => {
          // // // console.log(error);
        });



    };
    // ==> Loading Application
    $scope.loading_application_data();
    $scope.grep_progress_width = (question_index) => {

      // {> ( question_index + 1 ) * 100 /  _questions_.length | math_around_it <} %
      var percentage_value = Math.round(( parseInt( question_index ) * 100  ) / $rootScope._questions_.length )  ;

      return {
        width : percentage_value + '%'
      }
    }
    $rootScope.is_randomized_answer_with = ( is_randomizing , qs_index ) => {
      if( is_randomizing == true )
        $scope._questions_[qs_index].answers_format = $scope.randomize_arries( $scope._questions_[qs_index].answers_format );
      else
        $scope._questions_[qs_index].answers_format = $scope.sorting_arries( $scope._questions_[qs_index].answers_format , "_id");
    }
    $scope.show_question_answer_serials = (serial , type ) =>{
      // {> question_labels['label_' + _settings_.indexes.questions.toString()][question_index] | uppercase <}
      if(type == 0 )
        return $scope.serial_letters(serial) ;
        else
        return $scope.serial_numbers(serial) ;
    }
    $scope.serial_letters = (serial) =>{
      var charset , times , at_serial , new_serial
      new_serial = "a"
      charset  = "abcdefghijklmnopqrstuvwxyz";
      times = parseInt(serial / charset.length);
      at_serial = serial - ( times * charset.length ) ;
      new_serial = charset.charAt(times) + charset.charAt(at_serial) ;
      if( times == 0 ) new_serial = charset.charAt(at_serial) ;
      return new_serial;
    }
    $scope.serial_numbers = (serial) => {
        return serial + 1 ;
    };
    $scope.randomize_sorting_questions = (setting_changes) => {

      if(setting_changes == true) {
        // ==> Randmoize it
        $scope._questions_ = $scope.randomize_arries( $scope._questions_);

      }else {
        // => sorting it
        $scope._questions_ = $scope.sorting_arries( $scope._questions_  , "_id");

      }
      $timeout(function(){
        $scope.$apply();
      } , 300 )
    }
    $scope.sorting_arries = function (arr , propert_field){
      var compare = (a,b) => {
        if (a[propert_field] < b[propert_field])
          return -1;
        if (a[propert_field] > b[propert_field])
          return 1;
        return 0;
      }

      return arr.sort(compare);
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
      }
      $scope.join_this_quiz = () => {

      if( $scope.isEmpty( $scope._online_report_ ) == true ) {
        $scope._online_report_ = new Object();
        $scope._online_report_['att_draft'] = new Array();
        $scope._online_report_['application_id'] =  $scope.application_id ;
        $scope._online_report_['questionnaire_info'] = $scope.application_id;
      }

      if ($scope._online_report_.att_draft == undefined)
        $scope._online_report_.att_draft = new Array();

      var _user_activity_ = $scope._online_report_.att_draft.findIndex ( x => x.user_id == $scope.user_id) ;
      if( _user_activity_ == -1 ){
        $scope._online_report_.att_draft.push({
          'questions_data' : new Array() ,
          'is_loaded':true ,
          'start_expiration_time' : new Date() ,
          'user_id' : $scope.user_id ,
          'user_info':$scope.user_id ,
          'is_completed':false ,
          'user_completed_status' : false ,
          'impr_application_object': $scope._application_
        });
      }

      // ==> Storing _user_activity_ in scope object
      $scope._user_activity_ = $scope._online_report_.att_draft.find(x => x.user_id == $scope.user_id);

      // ====> Storing into database
      $scope._online_report_collection();

    }
    $scope.progress_proccess = (currentIndex) => {
      $scope.question_number = ( currentIndex + 1 )
      if(currentIndex == undefined )
      $scope.question_number = $scope._questions_.length ;


      // if(currentIndex == undefined )
      //   {
      //     currentWidth = 0;
      //     $(".highlighted-progress").css({
      //       width : currentWidth  + '%'
      //     }) ;
      //     $scope.percentage_progress = currentWidth ;
      //     return false ;
      //   }
      currentIndex = currentIndex + 1 ;
      var question = $scope._questions_ ;
      var currentWidth , currentIndex;
      var counts = question.length;
      currentWidth = (Math.round (currentIndex * 100 / ( counts  ))) ;
      // $(".highlighted-progress").css({
      //   width : currentWidth  + '%'
      // }) ;
      $scope.percentage_progress = currentWidth ;
    }
    $scope.review_the_quiz = (currentIndex) => {
      $scope.disable_funcs = true ;
      $(".review-result-box").children(".fa").removeClass("fa-reply-all fa-arrow-right");
      $(".review-result-box").children(".fa").addClass("fa-spin fa-refresh");
      $timeout(function(){

        $(".review-result-box").children(".fa").removeClass("fa-refresh fa-spin");
        $(".review-result-box").children(".fa").addClass("fa-reply-all");


        if($scope._settings_.enable_screens == true ) currentIndex = 1 ;
        if($scope._settings_.enable_screens == false ) currentIndex = 1 ;
        // if($scope.starting_screens != 1  ) currentIndex = currentIndex - 1 ;
          $scope.swipperJs.slideTo(currentIndex);



         // ==> Show Correct answers
        if($scope._application_.app_type == 1 )
        $scope._settings_.show_results_per_qs = true;
      } , 1000 );

    }
    $scope.retake_the_quiz = (currentIndex) => {
      $scope.disable_funcs = false ;
      $scope.is_retake = true ;
      $(".retake-result-box").children("i.fa").removeClass("fa-arrow-right");
      $(".retake-result-box").children("i.fa").addClass("fa-repeat fa-spin");


      $timeout(function(){
        $(".retake-result-box").children("i.fa").removeClass("fa-spin");
        if( $scope._settings_.enable_screens == true ) currentIndex = 1 ;
        if( $scope._settings_.enable_screens == false ) currentIndex = 1 ;
        // fa fa-repeat


        $scope.truncate_attendee_data(currentIndex);

        $scope.swipperJs.slideTo(0);
      } , 1000 );
    }


    $scope.truncate_attendee_data = (currentIndex) => {
      // console.log("Retake , truncate data ... ");
      $scope.finished_is_clicked = false ;
      $scope._user_activity_ = new Object();
      $scope._online_report_ = undefined ;

      $scope.loading_application_data();
    };
    $scope.timer_proccess = () => {

     var start_the_quiz_timer = () => {

       $scope._settings_.time_settings.seconds-- ;
       if( $scope._settings_.time_settings.seconds < 0 ){
         $scope._settings_.time_settings.seconds = 59 ;
         $scope._settings_.time_settings.minutes-- ;
       }

       // ==> Case it with hour
       if($scope._settings_.time_settings.timer_type == true ){
            if( $scope._settings_.time_settings.minutes < 0 && $scope._settings_.time_settings.hours > 0 ) {
                 $scope._settings_.time_settings.minutes = 59;
                 $scope._settings_.time_settings.hours--;
            }
       }

       // ==> Update value property
       $scope.storing_excuted_time_in_db();

       // ==> Update Settings of this user

       // Timer machine
        $scope.timer_proc = $timeout(function(){
          // ==> Case Time is completed
          if(( $scope._settings_.time_settings.timer_type == false || ($scope._settings_.time_settings.timer_type == true && $scope._settings_.time_settings.hours == 0)) &&  $scope._settings_.time_settings.minutes == 0 && $scope._settings_.time_settings.seconds == 0 )
           {
             $scope.submit_the_quiz();
             return false;
           }
         start_the_quiz_timer();
       } , 1000);
     }
          start_the_quiz_timer();
    }
    $scope.go_to_prev = () => {
      if( $scope.swipperJs != null )
        $scope.swipperJs.slidePrev();
    };
    $scope.go_to_next = () => {
      // // // console.log($scope.swipperJs);
      if( $scope.swipperJs != null )
        $scope.swipperJs.slideNext();
    };
    $scope._offline_report_collection = () => {
      // console.log("Offline report ...");
    };
    $scope._online_report_collection = () => {
      // console.log($scope._online_report_);
       var url = $scope.server_ip+"api/"+$scope.application_id+"/attendee_collection/"+$scope.user_id ;
       var dataString = new Object();
       if( $scope._user_activity_ != null && $scope._user_activity_.impr_application_object != undefined )
        $scope._user_activity_.impr_application_object.att__draft = $scope.user_id ;

    };
    $scope.go_to_next_question = () => {
      // $scope.start_the_quiz();
      $scope.go_to_next();
    };

    $scope.resume_and_go_to_unsolved_question = () => {
      // ==> Go to next unsolved question
      if($scope._user_activity_.report_questions == undefined )
      {
        // $scope.swipperJs.slideNext();
      }
      else {
          var solved_questions = $scope._user_activity_.report_questions.question_answers ;
          var questions = $scope._questions_ ;
          var solved_questions = $scope._user_activity_.report_questions.question_answers ;
          var unsolved_questions = questions.are_all_questions_tracked(solved_questions);
          if(unsolved_questions.length != 0 ){
            var qs_id = unsolved_questions[0]._id ;
            var question_index =  $scope._questions_.findIndex(x => x._id == qs_id);

            var at_this_index = ( question_index  + 1 );
            if($scope._settings_.enable_screens == false )
              at_this_index = ( question_index  );
            // $scope.swipperJs.slideTo(at_this_index);
          }
          // else
          //     $scope.swipperJs.slideTo($scope._questions_.length + 1 );


          if( $scope._settings_.time_settings.is_with_time == true )
            $scope.timer_proccess();

      }
    };

    $scope.go_to_next_unsolved_question = () => {
      // ==> Go to next unsolved question
      if($scope._user_activity_.report_questions == undefined )
      {
        $scope.swipperJs.slideNext();
      }
      else {
          var solved_questions = $scope._user_activity_.report_questions.question_answers ;
          var questions = $scope._questions_ ;
          var solved_questions = $scope._user_activity_.report_questions.question_answers ;
          var unsolved_questions = questions.are_all_questions_tracked(solved_questions);
          if( unsolved_questions != undefined && unsolved_questions.length != 0 ){
            var qs_id = unsolved_questions[0]._id ;
            var question_index =  $scope._questions_.findIndex(x => x._id == qs_id);

            var at_this_index = ( question_index  + 1 );
            if($scope._settings_.enable_screens == false )
              at_this_index = ( question_index  );
            $scope.swipperJs.slideTo(at_this_index);
          }
           else
           $scope.swipperJs.slideTo($scope._questions_.length + 1 );


      }
    };
    $scope.start_the_quiz_ = () => {
      $scope.is_resume = true ;
      // ==> Joing to quiz
      $scope.join_this_quiz();
      // ==> Start timer
      if( $scope._settings_.time_settings.is_with_time == true )
      $scope.timer_proccess();
      // ==> Slide to

    }
    $scope.start_the_quiz = () => {
      $scope.is_resume = true ;
      // ==> Joing to quiz
      $scope.join_this_quiz();
      // ==> Start timer
      if( $scope._settings_.time_settings.is_with_time == true )
      $scope.timer_proccess();

      // ==> Go to next slide
      $scope.go_to_next();
    };

    $scope.start_this_quiz = () => {
      $scope.is_resume = true ;
      // ==> Joing to quiz
      $scope.join_this_quiz();
      // ==> Start timer
      if( $scope._settings_.time_settings.is_with_time == true )
      $scope.timer_proccess();
      // ==> Go to next slide
      $scope.swipperJs.slideNext();
    }

    $scope.resume_current_quiz = () => {
      $scope.is_resume = true ;
      // ==> Joing to quiz
      $scope.join_this_quiz();
      // ==> Start timer
      if( $scope._settings_.time_settings.is_with_time == true )
      $scope.timer_proccess();
      // ==> Slide to unsolved quition
      var solved_question = ($scope._user_activity_.report_questions == undefined || $scope._user_activity_.report_questions.question_answers == undefined ) ? [] : $scope._user_activity_.report_questions.question_answers ;
      $scope.row_unsolved_question = $scope._questions_.get_unsolved_questions(solved_question)
       if($scope.row_unsolved_question.length == 0 )
          $scope.swipperJs.slideTo($scope.row_unsolved_question.length + 1);
      else
        {
          var index = $scope._questions_.findIndex(x => x._id == $scope.row_unsolved_question[0]._id) ;
          $scope.swipperJs.slideTo(index + 1 )
        }
    }

    $scope.resume_to_next = () => {
      $scope.is_resume = true ;
      // ==> Joing to quiz
      $scope.join_this_quiz();
      // ==> Start timer
      if( $scope._settings_.time_settings.is_with_time == true )
      $scope.timer_proccess();

      // ==> Go to next slide
      $scope.go_to_next();
    };

    // ==> Setup application data with ui
    $timeout( function(){
      // // // console.log( $scope._application_ );
    } , 120 );

    // ==> Storing Anwers
    $scope.select_answer = ( question , answer , rat_scale_answer_val = null ) => {
      if( $scope.disable_funcs == true )
        return false ;
       // ==> Givens
       var app_type = $scope._application_.app_type;
       var app_settings = $scope._settings_;
       var question_settings = question.answer_settings ;
       var question_type = question.question_type ;
       var question_id = question._id ;
       var answer_id = answer._id ;
       var user_id = $scope.user_id ;
       var app_id = $scope.application_id ;

       // ==> Build application in online reportObject
       if( $scope._online_report_  == null || $scope._online_report_ == undefined ) {
         $scope._online_report_ = new Object();
         $scope._online_report_['att_draft'] = new Array();
         $scope._online_report_['application_id'] = app_id;
         $scope._online_report_['questionnaire_info'] = app_id;
       }
       if( $scope._online_report_.att_draft == undefined )
        $scope._online_report_['att_draft'] = new Array();
       var user_activity = $scope._online_report_.att_draft.find  ( x => x.user_id == user_id ) ;
       if( user_activity == undefined ){
            $scope._online_report_.att_draft.push({
            "questions_data" : new Array() ,
            "is_loaded":true ,
            "start_expiration_time" : new Date() ,
            "user_id" : $scope.user_id ,
            "user_info":$scope.user_id ,
            "is_completed":false ,
            "user_completed_status":false ,
            "impr_application_object": $scope._application_
           })
       }

       // ==> Building Objects and array
       var attendee_index = $scope._online_report_.att_draft.findIndex(x => x.user_id == user_id );
       if(attendee_index == -1 ) return false ;

       if( $scope._online_report_.att_draft[attendee_index].questions_data == undefined )
       $scope._online_report_.att_draft[attendee_index]['questions_data'] = new Array();
       if( $scope._online_report_.att_draft[attendee_index].report_questions == undefined )
       $scope._online_report_.att_draft[attendee_index]['report_questions'] = new Object();
       if( $scope._online_report_.att_draft[attendee_index].attendee_questions == undefined )
       $scope._online_report_.att_draft[attendee_index]['attendee_questions'] = new Array();
       if( $scope._online_report_.att_draft[attendee_index].report_attendee_details == undefined )
       $scope._online_report_.att_draft[attendee_index]['report_attendee_details'] = new Object();
       if( $scope._online_report_.att_draft[attendee_index].report_attendees == undefined )
       $scope._online_report_.att_draft[attendee_index]['report_attendees'] = new Object();

       // ==> Building Answers
       var is_show_result = app_settings.show_results_per_qs;
       var is_enable_review = app_settings.review_setting;
       var is_single_choice ;
       if(question_settings != undefined)
         is_single_choice = question_settings.single_choice;
       var autoslide_when_answer = app_settings.auto_slide; // => completed

       // ==> Building question status (report_questions)
       var report_questions = $scope._online_report_.att_draft[attendee_index].report_questions ;
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

       if( $scope._user_activity_ != null && $scope._user_activity_.user_completed_status != undefined && $scope._user_activity_.user_completed_status == true)
       return false;

       if( $scope._user_activity_ != undefined && $scope._user_activity_.report_questions != undefined){
         var solved_questions = $scope._user_activity_.report_questions.question_answers.find(x => x.question_id == question_id );
         var answer_exists = -1 ;
         if( solved_questions != undefined )
         answer_exists =  solved_questions.user_answers.findIndex(x => x._id == answer_id );

         if ( $scope._settings_.show_results_per_qs == true  && solved_questions != undefined && question_type == 2 && solved_questions.user_answers.length != 0 ) return false;
         if ( $scope._settings_.show_results_per_qs == true  && solved_questions != undefined && ( question_type == 1 || question_type == 0  ) && solved_questions.user_answers.length != 0  && is_single_choice == true ) return false;
         if ( $scope._settings_.show_results_per_qs == true  && solved_questions != undefined && ( question_type == 1 || question_type == 0  ) && solved_questions.user_answers.length != 0  && is_single_choice == false && answer_exists != -1 ) return false;
       }


       /**** ======================== Questions ****/
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
       // ==> Rating | Scale Answers
       if( question_type == 3 ){ // question_id
         if( attendee_index == -1 )
          return false ;
          // console.log("----------------------------------");
          var questionIndex = $scope._questions_.findIndex(x => x._id == question_id );

          // ===> Question Report ...
          var answer_ratScale = $scope._questions_[questionIndex].answers_format[0]
          var rat_scale_answer = $scope._questions_[questionIndex].answers_format[0].rating_scale_answers.find(x => x.rat_scl_value == rat_scale_answer_val) ;
          if( report_questions.all_questions.indexOf(question_id) != -1 )
            report_questions.all_questions.splice( report_questions.all_questions.indexOf(question_id) , 1 );
          report_questions.all_questions.push(question_id);

          // ===> Questions Data ...
          var usr = $scope._online_report_.att_draft[attendee_index];
          var question_data_exists = usr.questions_data.findIndex(x => x.question_id == question_id);
          if( question_data_exists != -1 )
          usr.questions_data.splice(question_data_exists , 1 );
          var answer_object = $scope._questions_[questionIndex].answers_format[0] ;
          var answer_rating_scale_object = $scope._questions_[questionIndex].answers_format[0].rating_scale_answers.find(x => x.rat_scl_value == rat_scale_answer_val) ;

          usr.questions_data.push({
            question_id : question_id ,
            question_index : 0 ,
            question_type : question_type,
            question_text : question.question_body ,
            updated_date : new Date(),
            answer_ids : new Array({ answer_id : answer_object._id , answer_id_val :  answer_rating_scale_object._id ,  answer_object :   answer_object  , answer_index : 0 })
          })
       }

       // ==> auto slide case
       $scope.auto_slide_delay = 500;
       if(autoslide_when_answer){
         $timeout(function(){
           if ( ( is_single_choice && ( question_type == 0 || question_type == 1 ) ) || (question_type == 2 ) || (question_type == 3)  )
              $scope.swipperJs.slideNext();
         } , $scope.auto_slide_delay)
       }



       if(question_type != 3 && question_type != 4)
       $scope.build_question_lists(question , answer , report_questions);


       if ( question_type == 3 || question_type == 4 )
       $scope.build_question_lists_for_these_questions ( question , answer , report_questions );


      $timeout(function(){
        $scope.build_attendee_reports(question , answer , report_questions);
        if($scope._online_report_.att_draft != undefined )
            {
              var usr = $scope._online_report_.att_draft.find(x => x.user_id == $scope.user_id );
              $scope._user_activity_ = usr ;

              // if( $scope.finished_is_clicked == true && $scope._application_.app_type == 1)
              if( $scope.finished_is_clicked == true)
                 $scope.show_unsolved_question_message();
            }

       }, 100 );

       $timeout(function(){
         $scope.storing_answer_into_online_report();
       } , 150 );
    };

    $scope.build_free_text_data = (question) => {
      var question_ = $scope._user_activity_.questions_data.find(x => x.question_id == question._id );
      var answer_id =   question.answers_format[0]._id;
      var answer_val =  question.answers_format[0].answer_value;

      if(question_ == undefined){
        $scope._user_activity_.questions_data.push({
          answer_ids : new Array({
            answer_id : answer_id ,
            answer_object : { answer_id : answer_id , answer_value : answer_val  },
            answer_index: 0
          }) ,
          question_id : question._id ,
          question_text : question.question_body ,
          question_type : question.question_type ,
          updated_date : new Date()
        });
      }else {
        question_.answer_ids = new Array({
          answer_id :'' ,
          answer_object : { answer_id : answer_id , answer_value : answer_val  },
          answer_index: 0
        });
      }

      // ==> Saving in db
      $scope.select_answer ( question , question.answers_format[0] );
    }

    $scope.build_question_lists_for_these_questions = ( question , answer , report_questions ) => {
      if(report_questions.question_answers == undefined )
        report_questions['question_answers'] = new Array();

        console.log(report_questions);
      var question_finder = report_questions.question_answers.find(x => x.question_id == question._id ) ;
      if(question_finder == undefined){
        report_questions.question_answers.push({
          question_id : question._id ,
          user_answers :[{ _id : answer._id }]
        });
      }else
        question_finder.user_answers = new Array({ _id : answer._id });
    }
    $scope.show_solved_answers = (index , question_id , answer_id , is_correct) => {
        var app_settings = $scope._settings_ ;

        // ==> List super size
        var classes = "";


        index = $scope._questions_.findIndex(x => x._id == question_id );


        if( index != -1 && $scope._questions_[index].answer_settings.super_size == true || ( $scope._questions_[index] != undefined && $scope._questions_[index].question_type == 2 ) )
        classes += "super_size_class ";

        // ==> List solved questions
        if( $scope._online_report_ != undefined && $scope._online_report_.att_draft != undefined && $scope._online_report_.att_draft != null ){
          var user_index =   $scope._online_report_.att_draft.findIndex(x => x.user_id == $scope.user_id );
          if( user_index != -1 ){
            var usr_act = $scope._online_report_.att_draft[user_index];
            if(usr_act.report_questions != undefined )
            {
              var current_question = usr_act.report_questions.question_answers.find(x => x.question_id == question_id );
              if(current_question != undefined )
              {

                if( app_settings.show_results_per_qs && $scope._user_activity_.report_questions != undefined ){

                   var this_question = $scope._user_activity_.report_questions.question_answers.find(x => x.question_id == question_id );
                   if(this_question != undefined){
                     if( this_question.is_correct == false ){
                       // ==> Solved "wrong answers";
                        // .... Show all right answers
                        var basic_question = $scope._questions_.find(x => x._id == question_id) ;
                        var basic_answer = basic_question.answers_format.find(x => x._id == answer_id ) ;
                        if( basic_answer.is_correct == true ) classes += "right_answer ";
                        // .... Show Solved wrong answer
                        var all_wrong_answers = this_question.user_answers.filter(x => x.is_correct == false );
                        var these_wrong_answers = all_wrong_answers.find(x => x._id == answer_id) ;
                        if(these_wrong_answers != undefined) classes += "wrong_answer ";
                     }else {
                       // ==> Solved "right answers";
                       // .... Show only solved answer
                       var basic_question = $scope._questions_.find(x => x._id == question_id) ;
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
    $scope.show_right_answers = ( question_id ,  answer_lists ) => {
       for (var i = 0; i < answer_lists.length; i++) {
         var this_answer = answer_lists[i] ;
         if(this_answer.is_correct){
           $("#question-ul-"+question_id).children("li.answer-" + this_answer._id).addClass("right_answer");
         }
       }
    }
    $scope.next_finish_the_quiz = (thisIndex) => {

      if($scope._settings_.enable_screens == true ){ $scope.swipperJs.slideNext(); }
      if($scope._settings_.enable_screens == false ){
        if ( thisIndex != $scope._questions_.length - 1 )
        $scope.go_to_next();
      }
    };
    // $scope.next_finish_the_quiz = (thisIndex) => {
    //   if( $scope._application_.app_type == 1 ){
    //
    //       if(thisIndex != ( $scope._questions_.length - 1 ) )
    //         $scope.go_to_next();
    //        else
    //        {
    //
    //          if($scope._user_activity_ == undefined || $scope._user_activity_.is_completed == undefined || $scope._user_activity_.is_completed == false && $scope._application_.app_type == 1){
    //            $scope.finished_is_clicked = true ;
    //            if($scope._application_.app_type == 1 )
    //            $scope.show_unsolved_question_message()
    //          }
    //
    //          if( $scope._user_activity_.is_completed ) {
    //            $scope.go_to_next();
    //          } else if ($scope._user_activity_.is_completed == false && $scope._application_.app_type == 1 ){
    //            $scope.finished_is_clicked = true ;
    //
    //            $scope.show_unsolved_question_message()
    //          }
    //        }
    //   }else {
    //     if( $scope._settings_.enable_screens ==  true ){
    //         $scope.swipperJs.slideNext();
    //     }else {
    //       $scope.swipperJs.slideNext();
    //
    //       $scope._settings_.label_btns.lbl_finish_with = $scope._settings_.label_btns.lbl_submit_quiz_with ;
    //       if( thisIndex == ( $scope._questions_.length - 1 ))
    //           $scope.submit_the_quiz_into_reports();
    //     }
    //   }
    // };

    $scope.build_attendee_reports = ( question , answer , question_reports ) => {
      if($scope._online_report_ == null) return false ;

      // ======================================[report_attendee_details]
      var usr = $scope._online_report_.att_draft.find(x => x.user_id == $scope.user_id );
      if( usr == undefined ) return false ;

      if(usr.report_attendee_details == undefined || usr.report_attendee_details == null )
        usr.report_attendee_details  = new Object();

        var app_grade_value = parseInt($scope._settings_.grade_settings.value);
        var total_app_questions = parseInt($scope._questions_.length);
        var correct_questions = parseInt(question_reports.right_questions.length);
        var wrong_questions  = parseInt(question_reports.wrong_questions.length);
        var percentage = Math.round(correct_questions * 100 ) / total_app_questions ;
        var isPassed = ( percentage >= app_grade_value ) ? true : false ;
        // var is_completed =  ( total_app_questions == question_reports.question_answers.length )   ;


        usr.report_attendee_details['attendee_id'] = $scope.user_id ;
        usr.report_attendee_details['attendee_information'] = $scope.user_id ;
        usr.report_attendee_details['total_questions'] = question_reports.question_answers.length ;
        if($scope._application_.app_type == 1 )
        usr.report_attendee_details['pass_mark'] = isPassed
        if($scope._application_.app_type == 1 )
        usr.report_attendee_details['correct_answers'] = correct_questions ;
        if($scope._application_.app_type == 1 )
        usr.report_attendee_details['wrong_answers'] = wrong_questions ;
        if($scope._application_.app_type == 1 )
        usr.report_attendee_details['status'] = ( isPassed == true ) ? "Passed": "Failed";
        usr.report_attendee_details['completed_status'] = is_completed ;
        if($scope._application_.app_type == 1 )
        usr.report_attendee_details['score'] = percentage;
        usr.report_attendee_details['created_at'] = new Date();
        usr.report_attendee_details['completed_date'] = new Date();


        // ======================================[report_attendees]
        if(usr.report_attendees == undefined || usr.report_attendees == null )
          usr.report_attendees  = new Object();

          var dif_question_is_completed = $scope._questions_.is_completed_quiz_option(question_reports.question_answers);
          var is_completed =  ( dif_question_is_completed.length == 0 )   ;

          usr.report_attendees['created_at'] = new Date();
          usr.report_attendees['updated_at'] = new Date();
          usr.report_attendees['attendee_id'] = $scope.user_id ;
          usr.report_attendees['user_information'] = $scope.user_id;
          usr.report_attendees['is_completed'] = is_completed ;
          if($scope._application_.app_type == 1)
          usr.report_attendees['passed_the_grade'] = isPassed ;
          if($scope._application_.app_type == 1)
          usr.report_attendees['results'] = new Object()
          if(usr.report_attendees.survey_quiz_answers == undefined )
          usr.report_attendees['survey_quiz_answers'] = new Array();
          if($scope._application_.app_type == 1)
          usr.report_attendees.results['wrong_answers'] = wrong_questions ;
          if($scope._application_.app_type == 1)
          usr.report_attendees.results['correct_answers'] = correct_questions ;
          if($scope._application_.app_type == 1)
          usr.report_attendees.results['count_of_questions'] = question_reports.question_answers.length ;
          if($scope._application_.app_type == 1)
          usr.report_attendees.results['result'] =  new Object();

          if($scope._application_.app_type == 1)
          usr.report_attendees.results.result = new Object();
          if($scope._application_.app_type == 1)
          usr.report_attendees.results.result.percentage_value = percentage ;
          if($scope._application_.app_type == 1)
          usr.report_attendees.results.result.raw_value = correct_questions ;
          usr.is_completed = is_completed ;
          $scope._user_activity_ = usr ;
          // // console.log($scope._user_activity_);

          $timeout(function(){ $scope.$apply(); } , 50 );
    };
    $scope.build_question_lists = ( question , answer , question_reports ) => {




      // ==> Get solved questions
      var usr = $scope._online_report_.att_draft.find(x => x.user_id == $scope.user_id );
      if( usr == undefined ) return false ;

      // ==> Report questions
      // usr.report_questions.all_questions = new Array();
      // usr.report_questions.right_questions = new Array();
      // usr.report_questions.wrong_questions = new Array();
      // ==> Question Data
      var question_data = usr.questions_data ;
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
            var app_question = $scope._questions_.find(x => x._id == question_object._id);
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



         // // // // console.log(solved_question_id);
         // // // // console.log(solved_questions);
         // // // console.log(usr.report_questions);
        // ==> End Zooming
      }
      solved_questions.user_answers.map(zoom_in_usr_answers)
      // // // console.log("Bulding attendee online report");
    }

    // ==> inProgress funcs
    $scope.show_unsolved_question_message = () => {
      if( $scope._user_activity_.report_questions == undefined ){
        // $scope.join_this_quiz();
        var is_required = $scope._questions_.filter(x => x.answer_settings.is_required == true ) ;
        if(is_required.length != 0 ){
          $scope.unsolved_questions = is_required ;
        }
      } else {
        $scope.unsolved_questions = new Array();
        var questions = $scope._questions_ ;
        var solved_questions = $scope._user_activity_.report_questions.question_answers ;
        $scope.unsolved_questions = questions.are_all_questions_tracked(solved_questions);
      }
    }
    $scope.go_to_this_unsolved_question = () => {
      if($scope.unsolved_questions.length > 0 ){
        var question_id = $scope.unsolved_questions[0]._id ;
        var question_index = $scope._questions_.findIndex ( x => x._id == question_id )
        if(question_index != -1){
          var next_unsolved_question_index =   (question_index + 1);
          if($scope._settings_.enable_screens == false )
          next_unsolved_question_index = question_index ;
          // $scope.swipperJs.slideTo(next_unsolved_question_index);
        }
      }
    }
    $scope.storing_answer_into_online_report = () => {
      // ==> Online Report ...
      $scope._online_report_collection();

    };
    $scope.go_to_this_unsolved_question = () => {

      if($scope.unsolved_questions.length != 0 ){

        var question_id = $scope.unsolved_questions[0]._id ;
        var question_index = $scope._questions_.findIndex ( x => x._id == question_id )
        if(question_index != -1){
          var next_unsolved_question_index =   (question_index + 1);
          if($scope._settings_.enable_screens == false )
          next_unsolved_question_index = question_index ;
          $scope.swipperJs.slideTo(next_unsolved_question_index);
        }
      }
    };
    $scope.submit_the_quiz_into_reports = () => {

      $scope.finished_is_clicked = true ;
      var solved_questions = ( $scope._user_activity_ != null && $scope._user_activity_.report_questions != undefined )  ? $scope._user_activity_.report_questions.question_answers : [] ;
      var questions = $scope._questions_ ;
      $scope.unsolved_questions = questions.are_all_questions_tracked(solved_questions);

      if( $scope.unsolved_questions != undefined && $scope.unsolved_questions.length != 0 )
      return false;

      if( $scope._settings_.enable_screens == false )
        {
          if( $scope.isEmpty( $scope._online_report_ ) == true ) {
            $scope._online_report_ = new Object();
            $scope._online_report_['att_draft'] = new Array();
            $scope._online_report_['application_id'] =  $scope.application_id ;
            $scope._online_report_['questionnaire_info'] = $scope.application_id;
          }

          if ($scope._online_report_.att_draft == undefined)
            $scope._online_report_.att_draft = new Array();

          var _user_activity_ = $scope._online_report_.att_draft.findIndex ( x => x.user_id == $scope.user_id) ;
          if( _user_activity_ == -1 ){
            $scope._online_report_.att_draft.push({
              'questions_data' : new Array() ,
              'is_loaded':true ,
              'start_expiration_time' : new Date() ,
              'user_id' : $scope.user_id ,
              'user_info':$scope.user_id ,
              'is_completed':false ,
              'user_completed_status' : false ,
              'impr_application_object': $scope._application_
            });
          }

          // ==> Storing _user_activity_ in scope object
          $scope._user_activity_ = $scope._online_report_.att_draft.find(x => x.user_id == $scope.user_id);

        }

      $(".submit-button-goodbye-screen").children(".x-isc-up").removeClass("fa-arrow-right");
      $(".submit-button-goodbye-screen").children(".x-isc-up").addClass("fa-refresh fa-spin");

      $(".submit-in-qsa").children(".x-isc-up").removeClass("fa-arrow-right");
      $(".submit-in-qsa").children(".x-isc-up").addClass("fa-refresh fa-spin");


      $timeout(function(){
        // ==> Offline Report ...
        $scope._offline_report_collection();




        if( $scope._settings_.time_settings.is_with_time == true )
        $timeout.cancel($scope.timer_proc);

        $timeout(function(){
          $(".submit-button-goodbye-screen").children(".fa").removeClass("fa-refresh fa-spin");
          $(".submit-button-goodbye-screen").children(".fa").addClass("fa-arrow-right");
          $(".submit-in-qsa").children(".fa").removeClass("fa-refresh fa-spin");
          $(".submit-in-qsa").children(".fa").addClass("fa-arrow-right");

          if($scope._settings_.enable_screens == false )
          { $scope.swipperJs.slideNext(); }
          else
          $scope.swipperJs.slideTo($scope._questions_.length + 2);
        } , 1000 )
      } , 100)
    }
    $scope.submit_the_quiz = () => {
      // ==> submit-btn-qusu
      $scope.finished_is_clicked = false;
      // console.log("Submit the quiz into report and attedee draft");
      $scope.submit_the_quiz_into_reports();
    };
    $scope.storing_excuted_time_in_db = () => {
       $scope._online_report_collection();
    }
    $scope.calculating_completed_time = () => {
      var excuted_sec , excuted_min_to_sec , excuted_hr_to_sec = 0 , main_time_in_sec , time_proceed;

       main_time_in_sec = $scope._settings_.time_settings.value;

       excuted_sec = $scope._settings_.time_settings.seconds;
       excuted_min_to_sec = ( $scope._settings_.time_settings.minutes * 60 ) ;
       if( $scope._settings_.time_settings.timer_type == true )
       excuted_hr_to_sec = ( $scope._settings_.time_settings.hours * 60 ) * 60 ;

       var exuted_time_in_scs = (excuted_sec + excuted_min_to_sec + excuted_hr_to_sec);
       var some_clcs = main_time_in_sec -  exuted_time_in_scs ;
       time_proceed = some_clcs / 60 ;
       var time_object = new Object();

       time_object['time'] = parseInt(time_proceed)  ;
       time_object['type'] = 0 ;

       if ( time_proceed < 1 ){
         time_object['time'] = parseInt (some_clcs)  ;
         time_object['type'] = 1  ;
       }


       return time_object ;
    }


    $scope.current_progress = ( type = 1 ) => {
      var all_questions = $scope._questions_;
      var solved_questions = $scope._user_activity_;
      // console.log(solved_questions);
      if( solved_questions == null ) return  { current_score : 0 , main_score : all_questions.length } ;
      var solved = ( solved_questions.questions_data == undefined ) ? [] : solved_questions.questions_data ;

      if(type == 1 ){
        var calcs = Math.round(solved.length * 100 / all_questions.length );
        return  { current_score : calcs  , main_score : 100 } ;
      }
      if(type == 2 ){
        return  { current_score : solved.length , main_score : all_questions.length } ;
      }

    };
}]);
