//=============================================
// => Javasctipt code lines
//=============================================
Array.prototype.find_unsolved_questions = function (questions_list) {
    return this.filter(function (i) {
      return questions_list.findIndex(x => x.question_id == i._id) === -1;
    });
};


//=============================================
// => Filters
//=============================================
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
        iframe_size.width = "250px";
        iframe_size.height = "160px" ;
      }else {
        video_mp4 = new Object();
        video_mp4['mp4_url'] =  media_object.media_field+'.mp4';
        video_mp4['ogg_url'] =  media_object.media_field+'.ogg';
        iframe_size = new Object();
        iframe_size.width = "250px";
        iframe_size.height = "160px" ;
      }
      switch (media_object.media_type) {
        case 1:
          if( media_object.video_type == 0 ){
            embed_video = "<iframe width='"+iframe_size.width+"' height='"+iframe_size.height+"' src='"+video_path+"' ></iframe>";
          }
          if( media_object.video_type == 1 ){
            embed_video = "<iframe style='border:none;' width='"+iframe_size.width+"' height='"+iframe_size.height+"' src='"+video_path+"' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
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
}]);
apps.filter('trust_this_html_values' , [
  '$sce' , function ($sce){
    return function (returned_val){
       return $sce.trustAsHtml(returned_val);
    }
  }
]);
apps.filter('math_around_it' , [
  '$sce' , function(){
    return (round_p) => {
      return ( Math.round(round_p) ) ? Math.round(round_p): 0  ;
    }
  }
]);
apps.controller("preview_players" , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings' , '$window',
( $scope, $rootScope, $timeout , $http , settings , $window  ) => {

    // ==> Scope init
    var question_status = function (a, b) {
      var correct_answers = a.map( function(x){ return x._id; } );
      var solved_answers = b.map( function(x){ return x.answer_id; } );
      var is_right_question =  (solved_answers.sort().join('') == correct_answers.sort().join(''));
      return is_right_question ;
    };
    $scope.player_time_frame = 300 ;
    $scope.rating_scale_elements = []

    $window.extend_iframe_width = ( __width__ ) => {
      var window_iframe = $(".about-quiz, .screen-container , .question-screen-box");
      window_iframe.each(function(){
        $(this).css('width' ,  __width__ + '%' );
      })
    };
    $window.fill_rating_scale_values = (numbers) => {
      $scope.rating_scale_elements = new Array();
      for (var i = 0; i < numbers ; i++) {
        $scope.rating_scale_elements.push({number : i});
      }
    }

    $scope.spectrum_property = {
            color: "#ECC",
            flat: false,
            showInput: true,
            className: "full-spectrum",
            showInitial: true,
            showPalette: true,
            showSelectionPalette: true,
            maxPaletteSize: 10,
            preferredFormat: "hex",
            localStorageKey: "spectrum.demo" ,
            palette: [
                ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
                "rgb(204, 204, 204)", "rgb(217, 217, 217)","rgb(255, 255, 255)"],
                ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
                "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
                ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
                "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
                "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
                "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
                "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
                "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
                "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
                "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
                "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
                "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
            ]
        };
    $scope.in_app_editor = false ;
    $scope.editor_page = "0";
    $scope.quiz_preview_app    = $('.stylesheet-menu');
    $scope.app_id              = $("#app-id").val();
    $scope.server_ip           = $("#server_ip").val();
    $scope.spurcum_plugin      = $('.style-object');
    $scope.user_id             = $window.location.toString().split("/").pop();
    $scope.question_indexes = {
      alphabetical : ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ],
      numberical : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50]
    }
    $scope.answer_indexes = {
      alphabetical : ['a', 'b', 'c', 'd', 'e',  'f', 'g', 'h', 'i', 'j', 'k', 'm', 'l', 'n', 'o', 'p', 'q',  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ],
      numberical : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50]
    }
    $scope.json_source         = $scope.server_ip + settings.json_source;
    // if( window.parent.location == window.location )
    $scope.__player_object     = null;
    $scope.this_attendee_draft = null;
    $scope.api_key_headers     = null;
    $window.target_height = 50;
    $scope.window_navigation = $(window);
    // ==> Time  objects
    $scope.seconds = 9 ;
    $scope.minutes = 0;
    $scope.hours = 0 ;
    $scope.quiz_time_status_is_counting = true ;
    $scope.warning_at_time = {
       number_1 : 0 ,
       number_2 : 0
    };

    $scope.url_application = $scope.server_ip + "api/" + $scope.app_id +'/application/retrieve';

    $window.player_questions = (questions , sliderIndex) => {
      var newQuestion = questions[sliderIndex] ;
      $scope.slide_screens.noSwiping = true ;
      $scope.__player_object.questions.splice( sliderIndex , 0 , newQuestion );
      $scope.$apply();
      $scope.slide_screens.update();
      $timeout(function(){
        var targetIndex = sliderIndex + 1 ;
        $scope.slide_screens.slideTo ( targetIndex , 200 );
      } , 500);

      $scope.expand_the_current_iframe_object();
    };
    //   title_success_with title_failed_with
    $window.hide_this_access = (thisModel) => {
      if(thisModel == 4 ) // => Success screen
        {
          $('.title_failed_with').css({display : 'none'});
          $('.title_success_with').css({display : 'block'});
        }
      if(thisModel == 5 ) // => Failed screen
        {
          $('.title_failed_with').css({display : 'block'});
          $('.title_success_with').css({display : 'none'});
        }
    };
    $window.view_question_answer = (questionId , questionSettings) => {
      var player = $scope.__player_object.questions.find(x => x._id == questionId );
      if(player != undefined ){
        player.answer_settings = questionSettings;
      }
      $timeout(function (){$scope.$apply()} , 300 );
    }
    $scope.expand_the_current_iframe_object = () => {
      $timeout(function(){
        var parentObject = $($window.parent.document.documentElement).find("iframe#live-preview-iframe");
        var dataContents = $("#preview_player_container");
        parentObject.css({
          height : dataContents.height() + 30 + 'px' ,
          width : '100%'
        });
      } , 5);
      $timeout(function(){  $scope.$apply(); } , 30);
    }

    $window.slideToThisIndex = (index) => {
      $scope.slide_screens.slideTo(index);
    };

    // => Functionalities
    $window.add_data_to_view = (question_id , answer_data) => {
     var this_question_data = $scope.__player_object.questions.find(x => x._id == question_id);
     var questionIndex = $scope.__player_object.questions.findIndex(x => x._id == question_id);
     if( this_question_data != undefined )
        {
           this_question_data.answers_format.push({$$hashKey:null , _id:answer_data._id , value : answer_data.value});
        }

        $timeout(function(){
          $scope.expand_the_current_iframe_object();
        } , 1000 );
        $timeout(function(){ $scope.$apply(); } , 30);
    };
    $window.slide_system = () => {
        $scope.slide_screens = new Swiper('.swiper-container' , {
          speed : $scope.player_time_frame
        }) ;
        $scope.slide_screens.update();
        $scope.slide_screens.on('slideChange' , function (i){
              $scope.touch_move++;
              var lengther = $(this);
              var current_index = lengther[0].activeIndex ;
              if(current_index >= $scope.__player_object.questions.length)
                 current_index = $scope.__player_object.questions.length ;

                 $scope.slide_screens_index(current_index);

                 if (window.location != window.parent.location){   //  alert(current_index - 1);
                    $window.parent.edit_this_question_by_crossing_this_ifrm(current_index - 1);
                 }

                  $scope.curren_question_slide = parseInt(current_index) ;
                //   // => Store current index
                //  $scope.curren_question_slide = current_index ;
                //  $scope.current_index = current_index ;
                //  $scope.previous_index =lengther[0].previousIndex;
              // => load to ui

              // => Load to next index

              // if (window.location != window.parent.location){
              //    var question_lists = $(window.parent.document).find('#docQuestions') ;
              //
              //     $timeout(function(){
              //       if(current_index == 0 ) current_index = 0
              //       else current_index = current_index - 1 ;
              //       question_lists.children('li').eq(current_index).
              //       find('.single-question-container').trigger('click');
              //
              //     } , 50 );
              //  }

        });
    }
    $window.change_data_in_answer_view = (question_id  , model_type = 0 , model_id = null , model_index = null  , model_value  = null  , media_data = null ) => {
      var this_question_data = $scope.__player_object.questions.find(x => x._id == question_id);
      var questionIndex = $scope.__player_object.questions.findIndex(x => x._id == question_id);
      console.log(model_type);
      if(model_type == 0){ // =>> Question
          if(questionIndex != -1){
            if(model_value != null)
              $scope.__player_object.questions[questionIndex].question_body = model_value;

            if(media_data != null ){
              if($scope.__player_object.questions[questionIndex].media_question == undefined)
              $scope.__player_object.questions[questionIndex].media_question  = new Object() ;
              $scope.__player_object.questions[questionIndex].media_question = media_data ;
            }
          }
      }else if (model_type == 1 ){ // =>> Description
        if(questionIndex != -1){
          if(model_value != null)
            $scope.__player_object.questions[questionIndex].question_description = model_value;
        }
      }else if (model_type == 2 ){ // =>> Answer
        if(questionIndex != -1){

            var answerIndex = $scope.__player_object.questions[questionIndex].answers_format.findIndex( x => x._id ==  model_id );
            if(answerIndex != -1 ){
              if(model_value != null)
              $scope.__player_object.questions[questionIndex].answers_format[answerIndex].value = model_value;

              if(media_data != null ){
                var question_object = $scope.__player_object.questions[questionIndex] ;
                var thisAnswer = $scope.__player_object.questions[questionIndex].answers_format[answerIndex];


                if(question_object.question_type == 0 ){
                  // => Text optional with media optional
                    thisAnswer.media_optional = media_data
                }

                if(question_object.question_type == 1 ){

                  if( media_data.media_type == 0 ){
                      if(thisAnswer.media_name == undefined )
                        thisAnswer.media_name = null ;
                      if(thisAnswer.media_src == undefined )
                        thisAnswer.media_src = null ;
                      if(thisAnswer.media_type == undefined )
                        thisAnswer.media_type = null

                      thisAnswer.media_name = media_data.media_name;
                      thisAnswer.media_src= media_data.media_src;
                      thisAnswer.media_type= media_data.media_type;
                      thisAnswer.Media_directory = $scope.server_ip + media_data.media_src;
                  }
                  if( media_data.media_type == 1 ){
                    if(thisAnswer.media_name == undefined )
                    thisAnswer.media_name = null ;
                    if(thisAnswer.media_src == undefined )
                    thisAnswer.media_src = null ;
                    if(thisAnswer.media_type == undefined )
                    thisAnswer.media_type = null

                    if(thisAnswer.Media_directory == undefined )
                    thisAnswer.Media_directory = null
                    if(thisAnswer.embed_path == undefined )
                    thisAnswer.embed_path = null
                    if(thisAnswer.video_id == undefined )
                    thisAnswer.video_id = null
                    if(thisAnswer.video_type == undefined )
                    thisAnswer.video_video_typeid = null

                    thisAnswer.Media_directory = media_data.Media_directory;
                    thisAnswer.embed_path= media_data.embed_path;
                    thisAnswer.video_id= media_data.video_id;
                    thisAnswer.video_type= media_data.video_type;
                    thisAnswer.media_name = media_data.media_name;
                    thisAnswer.media_src= media_data.media_src;
                    thisAnswer.media_type= media_data.media_type;
                    thisAnswer.Media_directory =  media_data.media_src;

                  }

                }

                  console.log({QUESTION_OBJECT__VF__TT : question_object});
              }
            }
        }
      }
      $scope.$apply();

      // ==> Expand the iframe according to content height !
      if(window.location != window.parent.location){
          $timeout(function (){
            console.log(window.parent);
          } , 1000 );
      }
    };
    $window.set_application_settings = (settings) => {

      if($scope.__player_object.settings == undefined )
        $scope.__player_object.settings = new Object();

      $scope.__player_object.settings = settings;
      $scope.$apply();
      $scope.expand_the_current_iframe_object();
    };
    $window.set_application_settings_with_ui_view = (settings) => {

      if($scope.__player_object.settings == undefined )
        $scope.__player_object.settings = new Object();

      $scope.__player_object.settings = settings;

      // ==> Change the answer style ( show or not )

      // => classes_for_this_answer(obj_val.answer_settings , obj_val._id , ansvalue._id)
      $scope.$apply();
      $scope.expand_the_current_iframe_object();
    };
    $window.model_deletion = (model_type , basic_model_id , model_id = null) => {
      var this_question_data = $scope.__player_object.questions.find(x => x._id == basic_model_id);
      var questionIndex = $scope.__player_object.questions.findIndex(x => x._id == basic_model_id);
      if(questionIndex == -1 ) return false ;

      if(model_type == 0 ) {
        // => Bug number 1
        $scope.__player_object.questions.splice(questionIndex , 1);
        $scope.$apply();
      } // Question
      if(model_type == 1 ) {
        var answerIndex = $scope.__player_object.questions[questionIndex].answers_format.findIndex(x => x._id == model_id );
        if(answerIndex  != -1) {
          $scope.__player_object.questions[questionIndex].answers_format.splice(answerIndex , 1);
        }
      } //  Answer
      $scope.$apply();
    };
    $scope.set_image_background = (image_sourc , set_server = null)=>{
      var set_server_ip = $scope.server_ip
      if(set_server != null )
        set_server_ip = '';
        // http://34.215.133.182/img/media-icon.png
      if(image_sourc == set_server_ip+image_sourc)
        set_server_ip = '';
      return {
        "background-image" : "url('"+set_server_ip+image_sourc+"')"
      }
    }
    $scope.get_slide_styles = (question_type) => {
      var classes = '';
        if(question_type == 0 ) classes = 'question_type_texts';
        if(question_type == 1 ) classes = 'question_type_media';
        if(question_type == 2 ) classes = 'question_type_boolean';
        if(question_type == 3 ) classes = 'question_type_rating_scale';
        if(question_type == 4 ) classes = 'question_type_fre_tex';
      return classes;
    };
    $scope.load_qs_theme = (question_type) => {
      var classes = '';
        if(question_type == 0 ) classes = 'question_type_texts_qs_brd';
        if(question_type == 1 ) classes = 'question_type_media_qs_brd';
        if(question_type == 2 ) classes = 'question_type_boolean_qs_brd';
        if(question_type == 3 ) classes = 'question_type_rating_scale_qs_brd';
        if(question_type == 4 ) classes = 'question_type_fre_tex_qs_brd';
      return classes;
    };
    $scope.load_slide_theme = (question_type) => {
      var classes = '';
      if(question_type == 0 ) classes = 'question_type_texts_bg';
      if(question_type == 1 ) classes = 'question_type_media_bg';
      if(question_type == 2 ) classes = 'question_type_boolean_bg';
      if(question_type == 3 ) classes = 'question_type_rating_scale_bg';
      if(question_type == 4 ) classes = 'question_type_fre_text_bg';
      return classes;
    };
    $scope.load_border_styles = (question_type) => {
      var classes = '';
      if(question_type == 0 ) classes = 'question_type_texts_brd';
      if(question_type == 1 ) classes = 'question_type_media_brd';
      if(question_type == 2 ) classes = 'question_type_boolean_brd';
      if(question_type == 3 ) classes = 'question_type_rating_scale_brd';
      if(question_type == 4 ) classes = 'question_type_fre_tex_brd';
      return classes;
    };
    $scope.load_qs_note_theme =  (question_type) => {
      var classes = '';
      if(question_type == 0 ) classes = 'question_type_texts_colr';
      if(question_type == 1 ) classes = 'question_type_media_colr';
      if(question_type == 2 ) classes = 'question_type_boolean_colr';
      if(question_type == 3 ) classes = 'question_type_rating_sacle_colr';
      if(question_type == 4 ) classes = 'question_type_fre_tex_colr';
      return classes;
    };

    $scope.go_to_next_slider = (current_index , val = null) => {
      try {
        // if( window.parent.location == window.location )
          $scope.slide_screens.slideNext();

        // => When button navigation is fired
        // => Move into attendee draft object
        // $scope.this_attendee_draft_collection();
      } catch (e) {

      }
    }
    $scope.slide_to_question_cross_iframe = () => {
      var this_input = $("input#cross_iframe_qs_index_value").val();
      $scope.slide_screens.slideTo(this_input);
    };

    $scope.load_case_many_answer_option =  (question_type , is_single_choice) => {
      var classes = '';
         if((question_type == 0 || question_type == 1 ) && is_single_choice == false )
          classes += 'case_many_answers ';

          if( question_type == 0 && is_single_choice == false ){
            classes += 'question_type_texts_qs_brd ';
          }
          if( question_type == 1 && is_single_choice == false ){
            classes += 'question_type_media_qs_brd ';
          }
         return classes;
    };
    $scope.classes_for_this_answer = (quiz_settings , question_id , answer_id) => {
      var classes = '';
      // => Two blocks per row or else
      if(quiz_settings.choice_style)
          classes += 'ng_inline_block';
          else
          classes += 'ng_block';

      // => check if this is selected answer or not from attendee
      if( $scope.this_attendee_draft != null && $scope.this_attendee_draft.user_id != undefined ){
          var drft_question = $scope.this_attendee_draft.questions_data.find(x => x.question_id == question_id ) ;
          if(drft_question != undefined ){
            var drft_selected_answer = drft_question.answer_ids.findIndex(x => x.answer_id == answer_id );
          if (drft_selected_answer != -1 ){ // => Add ( selected_answers )
            classes += ' selected_answer'
                }
            }
       }

      // => Get Classes according to database
      if($scope.this_attendee_draft != null && $scope.this_attendee_draft.questions_data != undefined ){
        var thisQuestion = $scope.this_attendee_draft.questions_data.find(x => x.question_id == question_id) ;
        if(thisQuestion != undefined) {
          var answers_array = thisQuestion.answer_ids ;
          var answer_object_index = answers_array.findIndex(x => x.answer_id == answer_id);
          if( answer_object_index != -1 ){
            var selected_answer = answers_array[answer_object_index];
            if($scope.__player_object.settings.show_results_per_qs){ // => true
              // =>> check if show the right answer option is true
              if(selected_answer.is_correct){
                classes += ' right_answer';
              }else {
                classes += ' wrong_answer';
              }
            } else classes += ' selected_answer';
          }
        }
      }
      // $timeout( function(){ $scope.$apply() } , 300 )
      return classes ;
    };
    $scope.join_this_quiz = (at_this_array_only = null ) => {
      if($scope.this_attendee_draft != null && $scope.this_attendee_draft.att_draft != undefined && $scope.this_attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) != -1)
        return false ;

      if($scope.this_attendee_draft == null || $scope.this_attendee_draft.application_id == undefined){
        $scope.this_attendee_draft = new Object();
        $scope.this_attendee_draft['att_draft'] = new Array();
        $scope.this_attendee_draft['application_id'] = $scope.app_id ;
        $scope.this_attendee_draft['questionnaire_info'] = $scope.app_id ;
      }

        if($scope.this_attendee_draft.att_draft == undefined)
          $scope.this_attendee_draft.att_draft = new Array();


        var cuIndex = $scope.this_attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) ;
        if(cuIndex == -1 ){
          $scope.this_attendee_draft.att_draft.push({
            'questions_data' : new Array() ,
            'is_loaded':true ,
            'start_expiration_time' : new Date() ,
            'user_id' : $scope.user_id ,
            'user_info':$scope.user_id ,
            'is_completed':false ,
            'impr_application_object':$scope.__player_object
          });
        }


        // $scope.this_attendee_draft = $scope.this_attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);

    };
    $scope.load_time_tracker = () => {

    }
    $scope.load_quiz_timer = () => {
      if($scope.__player_object.settings != undefined ){
         var timeSettings = $scope.__player_object.settings.time_settings;

         if(timeSettings && timeSettings.is_with_time)
            $scope.timer = setTimeout($scope.load_time_tracker , 1000);
       }
    }
    $scope.load_template_timer = () => {
       console.log({
         settings : $scope.__player_object
       });
       if($scope.__player_object != undefined && $scope.__player_object != null && $scope.__player_object.settings != undefined ){
       var timeSettings = $scope.__player_object.settings.time_settings;

         if(timeSettings && timeSettings != undefined || timeSettings.is_with_time){
           $scope.seconds = timeSettings.seconds;
           $scope.minutes = timeSettings.minutes ;
           $scope.hours   = timeSettings.hours;

         }
       }
     }
    $scope.load_time_tracker  = () => {
      if( $scope.quiz_time_status_is_counting){
            var sec  = $('.sec');
            var mins = $('.min');
            var hrs  = $('.hr');
            var is_hourly = $scope.__player_object.settings.time_settings.timer_type ;
            if(is_hourly){
               if($scope.seconds == 0 && $scope.minutes == 0 && $scope.hours == 0)
                  {
                    // $scope.do_an_action_with_closest_time();
                    return false ;
                  }
               }else {
                  if( $scope.seconds == 0 && $scope.minutes == 0 )
                      {
                        // $scope.do_an_action_with_closest_time();
                        return false ;
                      }
            }
            $scope.seconds--;
            if( $scope.seconds < 0 ){
               $scope.seconds = 59;
               $scope.minutes--;
            }

            if(is_hourly){
                 if($scope.minutes < 00 && $scope.hours > 0 ) {
                   $scope.minutes = 59;
                   $scope.hours--;
                 }
            }

          sec.html(($scope.seconds < 10 ) ? '0'+ $scope.seconds : $scope.seconds);
          mins.html(($scope.minutes < 10 ) ? '0'+$scope.minutes:$scope.minutes );
          if(is_hourly){
              hrs.html( ( $scope.hours < 10 ) ? '0'+$scope.hours : $scope.hours);
          }
          // Load time
          $scope.load_quiz_timer();
      }
    }
    $scope.start_this_quiz = () => {
      $scope.join_this_quiz();
      $timeout(function (){
        if( window.location == window.parent.location )
          $scope.load_quiz_timer ();
      } , 30);

      try {
        // if( window.parent.location == window.location )
          $scope.slide_screens.slideNext();

      } catch (e) {

      }
    };
    $scope.back_to_quizzes = () => {
      return window.location.href = $scope.server_ip+'quizzes';
    };
    $scope.load_quiz_status_theme = () => {
      var classes = '';
      // if($scope.quiz_status == 0 ) // =>  take thi quiz
       if ($scope.quiz_status == 1) // =>  Expire warning
      classes = 'expiration_warning_message'
       if ($scope.quiz_status == 2) // =>  is expire
      classes = 'quiz_is_expired'
      if ($scope.quiz_status == 3) // =>  is Completed
      classes = 'completed_quiz'
      return classes ;
    };
    $scope.load_application_for_preview = () => {
          $http({
            url : $scope.url_application ,
            type : "GET" ,
            headers : $scope.api_key_headers
          }).then(function(resp){

            $scope.__player_object = resp.data ;
            $scope.stylesheet_order = $scope.__player_object.stylesheet_properties;

            console.log({
              Player : $scope.__player_object
            });
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
    $scope.time_tracker_layout = () => {
      var layout_template = $scope.__player_object.settings.time_settings.timer_layout;
      return '/time-layouts/layout-'+layout_template+'.hbs';
    };
    $scope.progression_layout = () => {
       var layout_template = $scope.__player_object.settings.progression_bar.progression_bar_layout;
       return '/progressbar-layouts/layout-'+layout_template+'.hbs';
     };
    $scope.back_to_prev_slider = () => {
        // if( window.parent.location == window.location ){
          try { $scope.slide_screens.slidePrev(); } catch (e) { }
        // }
     }
    $scope.slide_screens_index = function (index){

        if($scope.__player_object.settings != undefined ){

         if($scope.__player_object.settings.progression_bar.is_available == true && $scope.__player_object.settings.progression_bar.progression_bar_layout == 0 ){

             var calc = $scope.curren_question_slide * 100 /  $scope.__player_object.questions.length ;
                $('.progress-highlighted').css({width: calc + '%'})
             }
         }
    };
    $scope.progress__calculation_compilation = () =>{
       if($scope.__player_object.settings.progression_bar.is_available ){
         // => Question Numbers
         var question_pro = $('.current-question');

         question_pro.html($scope.__player_object.questions.length);
         // => Question Progress
         $scope.slide_screens_index($scope.__player_object.questions.length);
       }
     };

     $scope.store_into_attendee_draft = (object) => {

       if (  $scope.this_attendee_draft != null && $scope.this_attendee_draft.application_id != undefined)
          { // ==> attendee_draft is not empty
            console.log(object);
              var findAttendeeIndex = $scope.this_attendee_draft.att_draft.findIndex(x => x.user_id == object.user_id);
              var findAttendee = $scope.this_attendee_draft.att_draft.find(x => x.user_id == object.user_id);

              if(findAttendeeIndex != - 1){
                // ==> Attendee Object [FOUND]
                var attendeeInfo = $scope.this_attendee_draft.att_draft[findAttendeeIndex];
                if(attendeeInfo.questions_data == undefined )
                attendeeInfo.questions_data = new Array();
                var findQuestionIndex = attendeeInfo.questions_data.findIndex(x => x.question_id == object.question_id);
                var findQuestion = attendeeInfo.questions_data.find(x => x.question_id == object.question_id);
                if(findQuestionIndex == -1){

                  // ==> Question UNFOUND
                  attendeeInfo.questions_data.push({
                    question_id : object.question_id ,
                    question_index : $scope.slide_screens.activeIndex - 1,
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
                    if( $scope.__player_object.settings  == undefined || $scope.__player_object.settings == null )
                      alert("Something went wrong !")

                    var app_grade_value = parseInt($scope.__player_object.settings.grade_settings.value);
                    var total_app_questions = parseInt($scope.__player_object.questions.length);
                    var correct_questions = parseInt(attendeeInfo.report_questions.right_questions.length);
                    var wrong_questions  = parseInt(attendeeInfo.report_questions.wrong_questions.length);
                    var percentage = Math.round(correct_questions * 100 ) / total_app_questions ;
                    var isPassed = ( percentage >= app_grade_value )? true : false ;
                    var is_completed = ( total_app_questions == attendeeInfo.questions_data.length ) ? true : false ;

                    attendeeInfo.is_completed = is_completed ;
                    attendeeInfo.report_attendee_details.attendee_id = $scope.user_id ;
                    attendeeInfo.report_attendee_details.attendee_information = $scope.user_id ;
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
                      attendeeInfo.report_attendees.attendee_id = $scope.user_id;
                      attendeeInfo.report_attendees.user_information = $scope.user_id;
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



                   var app_grade_value = parseInt($scope.__player_object.settings.grade_settings.value);
                   var total_app_questions = parseInt($scope.__player_object.questions.length);
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
                   attendeeInfo.report_attendees.attendee_id = $scope.user_id;
                   attendeeInfo.report_attendees.user_information = $scope.user_id;
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

          $timeout(function(){  $scope.$apply(); } , 300);
          console.log($scope.this_attendee_draft);
     } // ==> End the view array
     $scope.unfreez_the_quiz_right_now = () => {
      try {
        // ==> Freeze the slider application
          $scope.slide_screens.allowSlidePrev = true ;
          $scope.slide_screens.allowSlideNext = true ;

        // ==> Stop the timer if it active

        if($scope.__player_object != null && $scope.__player_object.settings != undefined){

          $scope.slide_screens.allowTouchMove = $scope.__player_object.allow_touch_move ;
          $scope.slide_screens.noSwiping = false ;

        }

      } catch (e) {

      }
    }
    $scope.freez_the_quiz_right_now = () => {
      try {
        // ==> Freeze the slider application
          $scope.slide_screens.allowSlidePrev = false ;
          $scope.slide_screens.allowSlideNext = false ;
          $scope.slide_screens.allowTouchMove = false ;
          $scope.slide_screens.noSwiping = false ;
        // ==> Stop the timer if it active

        if($scope.__player_object != null && $scope.__player_object.settings != undefined){
          if($scope.__player_object.settings.time_settings.is_with_time)
             $scope.quiz_time_status_is_counting = false ;
        }

      } catch (e) {

      }
    }
     $scope.go_to_not_attended_question = () => {
      if($scope.show_submitter_button == true ){
        $(".warning_case").html("<i class='fa fa-spinner fa-spin'></i> <span class='reponse-da'>please wait while submitting the quiz ...</span>");
        $timeout(function(){
          // $scope.report_quiz_collection();
          $timeout(function(){
              $scope.slide_screens.slideTo($('.swiper-slide').length - 1);
              $scope.freez_the_quiz_right_now();
            } , 1000);
          } , 3000);
      }


      if($scope.this_attendee_draft == null || $scope.this_attendee_draft.att_draft == undefined || $scope.this_attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id) == -1 )
      {
        try {
          $scope.slide_screens.slideTo(1);
        } catch (e) {

        }
        $('.warning_case').css('display','none');
        return false;
      }

      var app_questions = $scope.__player_object.questions;
      var me = $scope.this_attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);

      var solved_questions = me.questions_data ;
      var unsolved = app_questions.find_unsolved_questions(solved_questions);
      if(unsolved && unsolved.length > 0 ){
          var target_slider = unsolved[0]._id;
          var target_slider_index = app_questions.findIndex(x => x._id == target_slider)
          try {
            $scope.slide_screens.slideTo(target_slider_index + 1);
          } catch (e) {

          }
      }
    };
    $scope.review_all_resolved_question = () => {
       $scope.is_review = true ;
       $scope.slide_screens.slideTo(1);
       $scope.slide_screens_index(1);
    }
    $scope.load_main_attendee_application = () => {
      $(".warning_case").css({display : 'none'});
      $scope.this_attendee_draft.att_draft = new Array();
    };
    $scope.retake_this_quiz = () => {
      $scope.load_main_attendee_application();
      $('.retake-this-quiz').children("span").html("Please wait ..");
      $('.retake-this-quiz').children("i").removeClass('fa-repeat')
      $('.retake-this-quiz').children("i").addClass('fa-spinner fa-spin');

      if($scope.this_attendee_draft != null && $scope.this_attendee_draft.att_draft != undefined){
         var curIndex = $scope.this_attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id );
         if(curIndex != -1 ){
           // ==> Delete this user now
           $scope.this_attendee_draft.att_draft.splice(curIndex , 1);
         }
      }
      $scope.quiz_time_status_is_counting = true ;

      $timeout(function(){
        $('.warning_case').removeClass("submit_quiz_now_xx");
        $scope.show_submitter_button = false ;

        $scope.load_template_timer();
        $scope.join_this_quiz();
        $scope.load_quiz_timer ();
        $scope.is_submitted = false ;
        $scope.slide_screens = new Swiper('.swiper-container' , {
          speed : $scope.player_time_frame
        }) ;
        $(".answer-container ul li").removeClass('selected_answer');
        $(".answer-container ul li").removeClass('right_answer');
        $(".answer-container ul li").removeClass('wrong_answer');
        $scope.unfreez_the_quiz_right_now();
        // => Set event handler
        $scope.slide_screens.on('slideChange' , function (i){
          $scope.touch_move++;
          var lengther = $(this);
          var current_index = lengther[0].activeIndex ;
          if(current_index >= $scope.__player_object.questions.length)
             current_index = $scope.__player_object.questions.length ;
        $scope.curren_question_slide = parseInt(current_index) ;
          // => Store current index
         $scope.curren_question_slide = current_index ;
         $scope.current_index = current_index ;
         $scope.previous_index =lengther[0].previousIndex;
          // => load to ui
          $(".current-question").html($scope.curren_question_slide);
          // => Load to next index
          $scope.slide_screens_index(current_index);
        });

        $scope.slide_screens.slideTo(1);
        $('.retake-this-quiz').children("span").html("Retake");
        $('.retake-this-quiz').children("i").removeClass('fa-spinner fa-spin')
        $('.retake-this-quiz').children("i").addClass('fa-repeat');

      } , 4000);
    }
     $scope.show_warning_unsolved_question = () => {
       //  $(".warning_case").removeClass('warning_case_internet_connection');
      if($scope.this_attendee_draft == null || $scope.this_attendee_draft.att_draft == undefined || $scope.this_attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) == -1 ){
        // ==> This attendee didn't solve any thing
        $(".warning_case").html("You didn't solve any question , click here to attend ");
        $(".warning_case").css({display:'block'})
        return false;
      }

        var attendeeIndex = $scope.this_attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) ;
        var attendee = $scope.this_attendee_draft.att_draft.find (x => x.user_id == $scope.user_id) ;
        var all_questions = $scope.__player_object.questions;
        var solved_questions = attendee.questions_data;
        var unsolved_questions = all_questions.find_unsolved_questions(solved_questions);

        if(unsolved_questions && unsolved_questions.length != 0 ) {
          $('.warning_case').html(unsolved_questions.length + " question(s) isn't attended click here to attend ");
          $(".warning_case").css({display:'block'})
          return false;
        } else   $(".warning_case").css({display:'none'});

        return true ;
    };
     $scope.submit_quiz_into_report = () => {
      $scope.is_review = false ;
      $scope.is_submitted = true ;
      $('.submi_the_quiz_handler').children('i').removeClass('fa-arrow-right');
      $('.submi_the_quiz_handler').children('i').addClass("fa-spinner fa-spin");
      $('.submi_the_quiz_handler').children('span').html("Please Wait its submitting the quiz ... ");

      if( $scope.show_warning_unsolved_question() == false ){
           $('.submi_the_quiz_handler').children('i').removeClass('fa-spinner fa-spin');
           $('.submi_the_quiz_handler').children('i').addClass("fa-arrow-right");
           $('.submi_the_quiz_handler').children('span').html("Submit quiz");
         return false ;
       }

      $timeout(function(){
        $timeout(function(){
          $scope.slide_screens.slideNext();
          $('.submi_the_quiz_handler').children('i').removeClass('fa-spinner fa-spin');
          $('.submi_the_quiz_handler').children('i').addClass("fa-arrow-right");
          $('.submi_the_quiz_handler').children('span').html("Quiz is Submitted");
          // freez the slider right now
          // alert( $(".warning_case").children('.reponse-da').length);
          if( $(".warning_case").children('.reponse-da').length != 0 )
              $('.warning_case').css('display','none');
          // $('.warning_case submit_quiz_now_xx').css({ display : 'none'} );
        } , 500)
      } , 500);
    }
     $window.change_answer_style_view = (show_answers) => {
       // =>   $scope.classes_for_this_answer = (quiz_settings , question_id , answer_id)
       var question_containers = $("#question-list") ;
       if($scope.this_attendee_draft == null ) return false ;
       console.log({selected_answer : $scope.this_attendee_draft.att_draft[0] });
       var question_data = $scope.this_attendee_draft.att_draft[0].questions_data;
       for (var i = 0; i < question_data.length; i++) {
         var qs_object = question_data[i];
         var user_answers = qs_object.answer_ids; // => array
         var correct_answer = qs_object.correct_answers; // => array

         var question_id = qs_object.question_id;
         for (var answeri = 0; answeri < user_answers.length; answeri++) {
           var answer_obj = user_answers[answeri];
           var answer_ui = $('.answer_' + answer_obj.answer_id);
           if(show_answers){ // ==> Show
             // ==> Remove selected answer
             if(answer_ui.hasClass('selected_answer')) answer_ui.removeClass('selected_answer');
             // => change it into right and wrong answers
             if (!answer_obj.is_correct){
               answer_ui.addClass('wrong_answer');
               for (var icrr = 0; icrr < correct_answer.length; icrr++) {
                var this_correct_answer =  correct_answer[icrr];
                var crt_answer_ui = $('.answer_' + this_correct_answer._id);
                crt_answer_ui.addClass('right_answer');
               }
             }
             else if (answer_obj.is_correct)  answer_ui.addClass('right_answer');
           }else { // dont show
             // ==> Remove selected answer
             if(answer_ui.hasClass('wrong_answer')) answer_ui.removeClass('wrong_answer');
             if(answer_ui.hasClass('right_answer')) answer_ui.removeClass('right_answer');

             answer_ui.addClass('selected_answer');
             for (var icrr = 0; icrr < correct_answer.length; icrr++) {
              var this_correct_answer =  correct_answer[icrr];
              var crt_answer_ui = $('.answer_' + this_correct_answer._id);
              if(crt_answer_ui.hasClass('right_answer'))
                 crt_answer_ui.removeClass('right_answer');
             }
           }
         }

         console.log(question_id);
       }
     }
     $scope.select_this_answer = ( questionId , answerId , question , answer , app_id , user_id , is_correct , answerIndex) => {
       var user_id = window.location.toString().split("/").pop();
       // ==> Register First Action
       if( $scope.this_attendee_draft == null )
             {
                $scope.this_attendee_draft = new Object();
                $scope.this_attendee_draft['att_draft'] = new Array();
                $scope.this_attendee_draft['application_id'] = $scope.app_id;
                $scope.this_attendee_draft['questionnaire_info'] = $scope.app_id;
                var cuIndex = $scope.this_attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) ;
                   if(cuIndex == -1 ){
                     $scope.this_attendee_draft.att_draft.push({
                       'questions_data' : new Array() ,
                       'is_loaded':true ,
                       'start_expiration_time' : new Date() ,
                       'user_id' : $scope.user_id ,
                       'user_info':$scope.user_id ,
                       'is_completed':false ,
                       'impr_application_object':$scope.__player_object
                     });
                   }
             }


   // ==> Consider the followings :-
   // => Make sure from require qs option

   /*+++++++++++++++++++++++++++++++++++*/
   // Givens ======= *****
   /*+++++++++++++++++++++++++++++++++++*/
   // => consider ( show results per qs setting ) => ?
   var show_results_setting =  ( $scope.__player_object.settings != undefined ) ? $scope.__player_object.settings.show_results_per_qs : false ;
   // => consider ( review setting )
   var review_setting =  ( $scope.__player_object.settings != undefined ) ? $scope.__player_object.settings.review_setting : false ;
   // => consider ( multi answers  )
   var is_single_choice_setting = ( question.answer_settings.single_choice != undefined) ?  question.answer_settings.single_choice : true ;
   // => consider auto slide when answer select if it only single answer
   var auto_slide_setting = ( $scope.__player_object.settings != undefined ) ? $scope.__player_object.settings.auto_slide : false ;


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



           //---------------------------------------------------------------
           // ==============>> Multiple Choices ( Texts Or Media )
           //---------------------------------------------------------------
           if( question.question_type == 0 || question.question_type == 1 )
               {
                   if( is_single_choice_setting ){ // 1 - case this question has single answer
                                   // =====> Single Answer
                         if(review_setting && show_results_setting == false ){
                                       /* Many clicks ! */
                                      // => Delete the-old highlited answer and Highlight the new selected answer
                                      answer_iu_list.removeClass('selected_answer animated shake');
                                      this_answer.addClass('selected_answer animated shake');

                                       if($scope.this_attendee_draft.att_draft != undefined){
                                         // remove old answer answer_ids
                                         var question_id = stored_object.question_id ;
                                         // question_id
                                         var attendee_part = $scope.this_attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
                                         if(attendee_part != undefined){
                                           var target_question = attendee_part.questions_data.find(x => x.question_id == question_id);
                                           if(target_question != undefined)
                                           target_question.answer_ids = new Array();
                                         }
                                       }
                                      // => No need to show the correct answer here
                                      // => Angular backend ( attendee_draft  ) do this --->  allow attendee change the answer
                                      // => Mongo status => move the data into mongo ( attendee draft )
                                      $scope.store_into_attendee_draft(stored_object); // => Mongo VS Angular
                                      // => Auto slide status ( true ) => move to next slide directly
                                      if(auto_slide_setting) $scope.go_to_next_question();
                         }else if(review_setting == false && show_results_setting ) {
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
                                     $scope.store_into_attendee_draft(stored_object); // => Mongo VS Angular
                                     // => Auto slide status ( true ) => move to next slide directly after few moments ( timeframe )
                                     if(auto_slide_setting) $scope.go_to_next_question();
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
                                     $scope.store_into_attendee_draft(stored_object); // => Mongo VS Angular
                                     // => Auto slide status ( true ) => move to next slide directly
                                     if(auto_slide_setting) $scope.go_to_next_question();
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
                                     $scope.store_into_attendee_draft(stored_object); // => Mongo VS Angular
                                     // => Auto slide status ( true ) => move to next slide directly after few moments ( timeframe )
                                     if(auto_slide_setting) $scope.go_to_next_question();
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
                                   $scope.store_into_attendee_draft( stored_object , false );
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
                                   $scope.store_into_attendee_draft( stored_object , false );
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
                                   $scope.store_into_attendee_draft( stored_object , false );
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
                                   $scope.store_into_attendee_draft( stored_object , false );
                                   // => Auto slide status ( NO need to go to the next slide ) only continue button do this action
                         }
                   }  //  => ( End multi answers With single answer )
               } // End multiple Choices OR Media answers
           //---------------------------------------------------------------
           // ==============>>  True False ( Questions )
           //---------------------------------------------------------------
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
                  $scope.store_into_attendee_draft( stored_object );
                  // => Auto slide status ( true ) => move to next slide directly
                  if(auto_slide_setting) $scope.go_to_next_question();
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
                  $scope.store_into_attendee_draft( stored_object );
                  // => Auto slide status ( true ) => move to next slide directly after few moments ( timeframe )
                  if(auto_slide_setting) $scope.go_to_next_question();
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
                 if($scope.this_attendee_draft.att_draft != undefined){
                     // remove old answer answer_ids
                     var question_id = stored_object.question_id ;
                     // question_id
                     var attendee_part = $scope.this_attendee_draft.att_draft.find(x => x.user_id == $scope.user_id);
                     var attendee_inx = $scope.this_attendee_draft.att_draft.findIndex(x => x.user_id == $scope.user_id);

                     if(attendee_inx != -1 ){
                         var target_question = attendee_part.questions_data.find(x => x.question_id == question_id);
                         if(target_question != undefined)
                           target_question.answer_ids = new Array();
                      }
                   }
                 // => No need to show the correct answer here
                 // => Angular backend ( attendee_draft  ) do this --->  allow attendee change the answer
                 // => Mongo status => move the data into mongo ( attendee draft )
                 $scope.store_into_attendee_draft( stored_object );
                 // => Auto slide status ( true ) => move to next slide directly
                  if(auto_slide_setting) $scope.go_to_next_question();
              } else if ( review_setting == false && show_results_setting  == false ){
                  var is_selected_answer = false ;
                   answer_iu_list.each(function(){
                     var there = $(this);
                     if(there.hasClass('selected_answer')) is_selected_answer = true ;
                   });
                   if(is_selected_answer) return false ;
                  this_answer.addClass('selected_answer animated shake');
                  $scope.store_into_attendee_draft(stored_object);
                  if(auto_slide_setting) $scope.go_to_next_question();
              }
           } // => End true/false question

           if($scope.is_submitted)
              $scope.fill_unsolved_question_counts();
             else
             $('.warning_case').css({display:'none'});

    };

    $scope.fill_unsolved_question_counts = () => {

     if($scope.this_attendee_draft.att_draft == undefined || $scope.this_attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) == -1 ){
       // ==> This attendee didn't solve any thing
       $(".warning_case").html("You didn't solve any question , click here to attend ");
       $(".warning_case").css({display:'block'})
       return false;
     }

       var attendeeIndex = $scope.this_attendee_draft.att_draft.findIndex (x => x.user_id == $scope.user_id) ;
       var attendee = $scope.this_attendee_draft.att_draft.find (x => x.user_id == $scope.user_id) ;
       var all_questions = $scope.__player_object.questions;
       var solved_questions = attendee.questions_data;
       var unsolved_questions = all_questions.find_unsolved_questions(solved_questions);

       if(unsolved_questions && unsolved_questions.length != 0 ) {
         $('.warning_case').html(unsolved_questions.length + " question(s) isn't attended click here to attend ");
         $(".warning_case").css({display:'block'})
         return false;
       } else {
           if(unsolved_questions.length < 1 ) {
               // ==> Submit the quiz
               $('.warning_case').addClass("submit_quiz_now_xx");
               $('.warning_case').html("Submit this quiz by clicking here");
               $scope.show_submitter_button = true ;
           }
          // $(".warning_case").css({display:'none'})
       };
   }

    // => Fire those fn.
    $scope.load_application_keys();

    // => Fire after time
    $timeout(function () {
        $scope.slide_screens = new Swiper('.swiper-container' , {
          speed : $scope.player_time_frame
        }) ;
        $window.slide_screens = new Swiper('.swiper-container' , {
          speed : $scope.player_time_frame
        }) ;
        $scope.load_template_timer();
        $scope.slide_screens.on('slideChange' , function (i){
              $scope.touch_move++;
              var lengther = $(this);
              var current_index = lengther[0].activeIndex ;

              if(current_index >= $scope.__player_object.questions.length)
                 current_index = $scope.__player_object.questions.length ;

              if($scope.curren_question_slide > $scope.__player_object.questions.length )
              $scope.curren_question_slide =  $scope.__player_object.questions.length
              else
              $scope.curren_question_slide = current_index ;
              $scope.slide_screens_index(current_index);

              // => Load to next index
              if (window.location != window.parent.location){
                 $window.parent.edit_this_question_by_crossing_this_ifrm(current_index - 1);
              }

            $timeout(function(){ $scope.$apply(); } , 300 );
        });
    }, 1000);

    $window.randomize_all_questions = (questions  ) => {
        $scope.__player_object.questions = questions ;
        $timeout(function(){$scope.$apply();} , 300 );
    };
    $scope.randomize_arries = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor( Math.random() * currentIndex );
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
        }
        return array;
      }
    // ===========================================>>>> Window Objects
    // $window
    $window.new_sorting_for_questions = (oldIndex , newIndex , newPosition ) => {
      $scope.__player_object.questions.splice(oldIndex , 1);
      $scope.__player_object.questions.splice(newIndex , 0 , newPosition);
      $scope.$apply();
    };
    $window.slide_to_question_in_index_number = (indexNumber) => {
       if($scope.slide_screens == undefined)
       {$scope.slide_screens =  new Swiper('.swiper-container' , {
         speed : $scope.player_time_frame
       }) ;}
      $scope.slide_screens.slideTo(indexNumber);
      $scope.expand_the_current_iframe_object();
    };

    $window.change_editor_model = () => {
      $scope.in_app_editor = true ;
      $timeout( function(){$scope.$apply()} , 300 );
    }

    $scope.window_navigation.on("load" , function (){

      // var script_style = $('.editor-stylesheet');
      // script_style.each(function(){
      //   var outsource_files = $(this).attr('data-type') ;
      //   if(window.parent.location == window.location){
      //       if(outsource_files == 'css') $(this).attr('href', $scope.server_ip + 'ext/css/app-editor.css' );
      //       if(outsource_files == 'js')  $(this).attr('src', $scope.server_ip + 'ext/js/app-editor.js' );
      //   }
      // });

      $scope.spurcum_plugin.spectrum($scope.spectrum_property);
      if( $window.parent.location != $window.location ){
          $scope.quiz_preview_app.css({"display" : "none"});
          $('body').css({
            marginLeft: "auto"
          })
       }
      if($window.parent.location != $window.location )
         {
           $scope.player_time_frame = 0 ;
           if($scope.slide_screens == undefined)
             {
               $scope.slide_screens = new Swiper('.swiper-container' , {
                 speed : $scope.player_time_frame
               });
             }
         }
    });




}]);
