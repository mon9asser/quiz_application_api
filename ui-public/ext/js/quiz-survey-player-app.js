var application_exception = {
  expire_through : 0 ,
  date_started : 0
};
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
      "{{ day_counts }}" ,
      "{{ time_ago }}"
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
apps.filter("apply_html" , ($sce) => {
  return (val) => {
    return $sce.trustAsHtml(val)
  };
});
apps.filter('trust_iframe_url' , ( $sce ) => {
  return function (url){
    return  $sce.trustAsResourceUrl(url);
  };
});
apps.controller("player", [
'$rootScope','$scope' , '$http' , '$timeout' , 'settings' , function ( $rootScope , $scope , $http , $timeout , settings ) {

    $scope.server_ip = settings.server_ip ;
    $scope.application_id = $("#appId").val();
    $scope.user_id = $("#userId").val();

    $scope.question_labels = {
      label_0 : ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ],
      label_1 : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50]
    }
    $scope.answer_labels = {
      label_0 : ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ],
      label_1 : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50]
    }

    // ==> Veriable scopes
    $scope.starting_screens = 0 ; // ==> (0) welcome screen (1) resume screen
    $scope._application_   = {} ;
    $scope._questions_      = null ;
    $scope._settings_       = null ;
    $scope._online_report_  = null ;
    $scope._offline_report_ = null ;
    $rootScope._stylesheet_ = null ;
    $scope._user_activity_  = {} ;
    $scope.swipperJs = null;

    // ==> Funcs
    $scope.isEmpty = ( obj ) => {
      for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
      }
      return true;
    };
    // ==> Loading Application
    $scope.loading_application_data = () => {
        $http({
          url :  $scope.server_ip + 'api/'+ $scope.application_id +'/player/data'
        }).then((results) => {
            var app = results.data;
            $scope._application_ = app;
            $scope._questions_ = $scope._application_.questions;
            $scope._settings_ = $scope._application_.settings;
            $scope._online_report_ = $scope._application_.att__draft;
            $scope._offline_report_ = $scope._application_.app_report;
            $rootScope._stylesheet_ = $scope.server_ip + "themes/stylesheet_of_app_" + $scope.application_id +'.css';

            // ==> Storing current attendee draft
            if( $scope._online_report_ != undefined && $scope._online_report_.att_draft != undefined && $scope._online_report_.att_draft != null )
              {
                var user_act = $scope._online_report_.att_draft.find( x => x.user_id == $scope.user_id ) ;
                if(user_act!= undefined ){
                   $scope._user_activity_ = user_act ;
                   application_exception.expire_through =   $scope._user_activity_.impr_application_object.settings.expiration.through_time;
                   application_exception.date_started = $scope._user_activity_.start_expiration_time ;
                 } ;
              }

            // ==> Detect if this quiz is expired && expiration sys is enabled
            var expire_options = $scope._settings_.expiration;
            // ==> Case window is loaded
            if( $scope.isEmpty( $scope._user_activity_ ) == false  && $scope._user_activity_.is_loaded != undefined  ){
               $scope.starting_screens = 1 ; // ==> Resume screen
            }
            // ==> Case it first time
            else if (  $scope.isEmpty( $scope._user_activity_ ) == true &&  $scope._user_activity_.is_loaded == undefined ){
               $scope.starting_screens = 0 ; // ==> welcome screen
            }
            // ==> resume the quiz message

            // ==> Enable swipperJs

            // ==> Hide loading div

            // ==> Loading swipperJs
            $timeout(function(){
              try {
                  $scope.swipperJs = new Swiper('.swiper-container');
                  if($scope._settings_ != null ){
                    if( $scope._settings_.allow_touch_move != undefined )
                      $scope.swipperJs.allowTouchMove = $scope._settings_.allow_touch_move;
                  }
                  $scope.swipperJs.on('slideChange' , function(){
                    var this_slide  = $(this);
                    var current_index = this_slide[0].activeIndex;
                    var previous_index = this_slide[0].previousIndex;

                    console.log(this_slide[0]);
                    $scope.progress_proccess();
                    if( $scope._settings_.allow_touch_move == true && $scope._settings_.navigation_btns == false )
                      {
                        // ==> case it first slide
                          if( current_index == 1 && previous_index == 0 ) $scope.join_this_quiz();

                        // ==> case it in second slide

                      }
                  });
              } catch (e){}
            } , 1000 )
        }).catch((error) => {
          console.log(error);
        });
    };
    // ==> Loading Application
    $scope.loading_application_data();
    $scope.join_this_quiz = () => {

      if($scope.isEmpty( $scope._online_report_ ) == true ) {
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
          'impr_application_object': $scope._application_
        });
      }

      // ==> Storing _user_activity_ in scope object
      $scope._user_activity_ = $scope._online_report_.att_draft.find(x => x.user_id == $scope.user_id);

      // ====> Storing into database
      $scope._online_report_collection();

    }
    $scope.progress_proccess = () => {
      console.log("Progress Proccess !");
    }
    $scope.timer_proccess = () => {
      console.log("Timer Proccess !");
    }
    $scope.go_to_prev = () => {
      $scope.swipperJs.slidePrev();
    };
    $scope.go_to_next = () => {
      $scope.swipperJs.slideNext();
    };
    $scope._online_report_collection = () => {
       var url = $scope.server_ip+"api/"+$scope.application_id+"/attendee_collection/"+$scope.user_id ;
       var dataString = new Object();
       console.log($scope._online_report_);
       if($scope._online_report_ != null ){
           dataString['att_draft']  = new Array();
           dataString['application_id'] = $scope.application_id;
           dataString['questionnaire_info'] = $scope.application_id  ;
           var user_act = $scope._online_report_.att_draft.find (x => x.user_id == $scope.user_id) ;
           if(user_act != undefined )
            dataString.att_draft.push(  $scope._online_report_.att_draft.find(x => x.user_id == $scope.user_id));
        }
       $http({
         url : url ,
         method: "POST",
         data : { attendee_draft : dataString } ,
         headers : { "Content-Type": "application/json" }
       }).then((response) => {
         var data = response.data ;
       }).catch((error)=>{
         console.log(error);
       });
    };
    $scope.start_the_quiz = () => {
      // ==> Joing to quiz
      $scope.join_this_quiz();
      // ==> Start timer
      $scope.timer_proccess();
      // ==> Progress proccess
      $scope.progress_proccess();
      // ==> Go to next slide
      $scope.go_to_next();
    };
    $scope.list_answer_classes = (index) => {
      var classes = "";
      if( $scope._questions_[index].answer_settings.super_size == true || $scope._questions_[index].question_type == 2)
      classes += "super_size_class ";

       return classes ;
    }
    // ==> Setup application data with ui
    $timeout( function(){
      console.log( $scope._application_ );
    } , 120 );
}]);
