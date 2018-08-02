

apps.filter( 'striphtmltags' , ($sce) => {
  return function (specs){
    var div = $("<div>"+ specs + "</div>");
    var text_values = div.text() ;
    var spesificChars = '' ;
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
    
    // spesificChars =  spesificChars.textContent || spesificChars.innerText || "";
    // remove ( &nbsp; ) from text

     return spesificChars ;
  }
})
apps.controller("apps-controller" , [
'$scope','$http' , '$timeout','$window','$rootScope' , '$sce' ,
( $scope , $http , $timeout , $window , $rootScope , $sce  ) => {
  // ==> Veriables
 $scope.server_ip = $("#serverIp").val();
 $scope.json_source = $scope.server_ip + "ext/json/json-keys.json";
  // ==> Api Links
 $.getJSON( $scope.json_source , function ( api_key_data ){
  $scope.server_ip = $("#serverIp").val();
  $scope.user_id = $("#userId").val();
  $scope.app_id = $("#applicationId").val();
  $scope.swiper_data = null ;
  $scope.switching_editor_preview_value = false ;
  $scope.media_for = 'questions' ;
  $scope._application_ = null ;
  $scope._questions_ = null ;
  $scope._settings_ = null ;
  $scope.database_data = null ;
  $scope.question_ids  = null ;
  $scope.answer_ids  = null ;
  $scope.active_question_id = null ;
  $scope.retrieve_data_url = $scope.server_ip + "api/"+$scope.app_id+"/application/get/all";
  $scope.question_index = null;
  $scope.media_image_uploader = $('.image-uploader-x');
  $scope.header_data = {
     "X-api-keys": api_key_data.API_KEY ,
     "X-api-app-name": api_key_data.APP_NAME
   };

   $http({
      method : "GET" ,
      url : $scope.retrieve_data_url
   }).then(( resp )=>{

    /* Start Code From Here */
    // =============================================================>>
    // Main Data Object
      $scope.database_data  = resp.data ;
      $scope._application_  = resp.data ;
      $scope._questions_    = $scope._application_.questions;
      $scope._settings_     = $scope._application_.settings;
      $scope.question_ids  = $scope._application_.question_ids;
      $scope.answer_ids  = $scope._application_.answer_ids ;

      // +++++++++++++++++++++++++++ Calling From UI  Design
      // ==> Switching between View and editor
      $scope.switching_editor_preview = () => {

         if( $scope.switching_editor_preview_value == false ) {
             // => Editor
             $scope.swiper_data.slideTo(0);
           }else {
             // => Preview
             $(".x-editor-x-body").css("display" , 'none');
             $scope.swiper_data.slideTo(1);
         }
           // alert($(".preview-container").css('display'));
       };
      // => Add new question (click-event)
      $scope.add_new_question = ( question_type , atIndex = null ,  other_types = null ) => {

         if($scope._questions_.length > 200 )
           return false ;

         var question_object = new Object() , answer_object = new Object() ;


         // => Build Default Question
         question_object['_id'] = $scope.question_ids['id_' +  $scope._questions_.length  ];
         question_object['question_body'] =  "Add Your Question Here !";
         question_object['answers_format'] = new Array();
         question_object['question_type'] =  parseInt(question_type);
         question_object['created_at'] = new Date();

         question_object['question_description'] = {
           'value' :'' ,
           'is_enabled': false
         }
         // question_object['media_question'] =
         question_object['answer_settings'] = new Object();
         $scope.active_question_id = question_object._id ;

         // ==> Storing Answers
         answer_object['_id'] = $scope.answer_ids[ 'id_' + question_object.answers_format.length] + '' + $scope._questions_.length ;
         if( question_type == 0 ) {
           answer_object['value'] = "Answer " + ( question_object.answers_format.length + 1 )
           if ( $scope._application_.app_type == 1 )
           answer_object['is_correct'] = false ;
           // => Push To Answer Array
           question_object.answers_format.push( answer_object );
         }
         if( question_type == 1 ){
           // answer_object['_id'] = $scope.answer_ids[ 'id_' + question_object.answers_format.length ];
           answer_object['media_src'] = "No Media Here !";
           if ( $scope._application_.app_type == 1 )
             answer_object['is_correct'] = false ;
             // => Push To Answer Array
             question_object.answers_format.push( answer_object );
         }
         if( question_type == 2 ){
           answer_object['_id'] = $scope.answer_ids[ 'id_' + question_object.answers_format.length ] + '' + $scope._questions_.length +'_a';
           answer_object['boolean_type'] = "true/false";
           answer_object['boolean_value'] = true ;
           if ( $scope._application_.app_type == 1 )
           answer_object['is_correct'] = false ;
           // => Push To Answer Array
           question_object.answers_format.push( answer_object );

           answer_object['_id'] = $scope.answer_ids[ 'id_' + question_object.answers_format.length ] + '' + $scope._questions_.length +'_b';;
           answer_object['boolean_type'] = "true/false";
           answer_object['boolean_value'] = false ;
           if ( $scope._application_.app_type == 1 )
           answer_object['is_correct'] = true ;
           // => Push To Answer Array
           question_object.answers_format.push( answer_object );
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
         }
         if( question_type == 4 ){
          // ...
         }



         // => Push To Question Array
         if( atIndex == null )
           $scope._questions_.push( question_object );
         else
           $scope._questions_.splice( atIndex , 0 ,  question_object );

         // ==> Selecting according to question index
         $scope.highlighted_question(question_object._id);
         // ==> Slide To Bottom
         $(".qsdragged-list , html , body").animate({
           scrollTop: 1000000000000
         }, 10 );

       }
      // => Slide toggle between tags
      $scope.expand_collapsed_items = function (id){
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
      // => Highlighting current question
      $scope.highlighted_question = (questionId) => {
        // => detect current question is exists or not
        var questionIndex = $scope._questions_.findIndex( x=> x._id == questionId );
        if( questionIndex == -1 ) return false ;

        $scope.question_index = questionIndex ;
        $("#docQuestions").children("li").each(function(){
           if( $(this).hasClass('marked_question') )
           $(this).removeClass('marked_question');
        });

        $timeout(function(){
          $("#docQuestions").children('li.qs-'+questionId.toString()).addClass('marked_question');
        });

        // ==> Fill and binding event handler with textarea box
        $scope.fill_boxes_with_question_objects(questionId);
      }
      // ==> Fill Question Boxes
      $scope.fill_boxes_with_question_objects = ( questionId ) => {

        var questionIndex = $scope._questions_.findIndex( x=> x._id == questionId );
        if( questionIndex == -1 ) return false ;

        var question = $scope._questions_.find ( x => x._id == questionId );
        $scope.active_question_id = questionId ;


        // ==> Distrbute question data
        // ==> Question Text
        $(".redactor-in-0").html(question.question_body);
        $(".redactor-in-1").html(question.question_description);
        $(".redactor-in-0 , #editor-quest-data").on("input" , function (){
            var question_value = $(this).html() ;
            $timeout(function(){
                $scope._questions_[$scope.question_index].question_body = $R('#editor-quest-data' , 'source.getCode');
            } , 500 );
        });

        $(".redactor-in-1 , #editor-desc-data").on("input" , function (){
            var question_value = $(this).html() ;
            $timeout(function(){
                $scope._questions_[$scope.question_index].question_description = $R('#editor-desc-data' , 'source.getCode');
            } , 500 );
        });

        $timeout(function(){
          $scope.$apply();
        });

      }
      //==> Show Media Link in input
      $scope.show_media_link = () => {
        $(".media-inputs").css("display" , "block");
      }
      // => Image Uploader
      $scope.upload_image_handler = () => {
        return $scope.media_image_uploader.trigger('click');
      }
      // => Show Image
      $scope.image_uploader_is_touched = () => {
        console.log($scope.media_image_model[0].files[0]);
      }
      // +++++++++++++++++++++++++++++ Calling with backend
      // Init swiperJs
      $scope.init_swiperJs = () => {
         $scope.swiper_data = new Swiper ('.swiper-data' , {
          allowTouchMove : false
         });
         $scope.swiper_data.update();
      }
      // ==> Display first question
      $scope.init_first_question = () => {
        if($scope._questions_.length != 0 )
          $scope.highlighted_question($scope._questions_[0]._id);
      }
      // ==> Display media data
      $scope.calling_media_uploader = () => {
        $(".media-imgvid-uploader").fadeIn();
      }
      // ==> Add
      $scope.add_new_media_for_question = () => {
        $scope.media_for = 'questions' ; // => Question
        $(".media-uploader").fadeIn();
      }
      // => Close Current window
      $scope.close_current_image_uploader = () => {
        return $(".media-uploader").fadeOut();
      };
      $scope.media_image_uploader.on('change' , function(){
        if($scope.media_for == 'questions')
          {
              var question_id = $scope.active_question_id;
              var question = $scope._questions_.find(x => x._id == question_id );
              if(question == undefined ) return false ;
              alert(question_id);
              console.log(question);
              var image_file = $(this);
              var file = image_file[0].files[0] ;
              var reader = new FileReader();
              var read_file = reader.readAsDataURL(file);
              reader.onload = ( e ) => {
                var image_src_blob_data = e.target.result ;
              }
          }else if ($scope.media_for == 'answers' ) {}
      })

      // ==> Calling Funcs
      $scope.init_swiperJs();
      $scope.init_first_question();
    // =============================================================>>
    /* End Code of Document here */
});});}]);
