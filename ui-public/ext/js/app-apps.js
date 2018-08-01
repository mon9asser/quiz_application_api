

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
  $scope.swiper_data ;
  $scope.switching_editor_preview_value = false ;
  $scope._application_ = null ;
  $scope._questions_ = null ;
  $scope._settings_ = null ;
  $scope.database_data = null ;
  $scope.question_ids  = null ;
  $scope.answer_ids  = null ;
  $scope.active_question_id = null ;
  $scope.retrieve_data_url = $scope.server_ip + "api/"+$scope.app_id+"/application/get/all";
  $scope.question_index = null;

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
      $scope.air_redactor_object = {
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
      };

      // => Load First Question in list
      $scope.first_callback_question = () => {
        if( $scope._questions_.length == 0 ) return false ;
        $scope.active_question_id = $scope._questions_[0]._id ;
        $scope.init_this_question($scope.active_question_id);
        $timeout(function(){
          $(".redactor-in-0").addClass('redactor-placeholder');
          $('.redactor-in-0').attr('placeholder' ,  $scope._questions_[0].question_body);
          $('.redactor-in-0').on('input' , function(){
              $scope._questions_[$scope.question_index].question_body = $('.redactor-in-0').html();
              $timeout(function(){
                $scope.$apply();
              })
          });

        });
      }
      // Fill Texts with request questions
      $scope.fill_textarea_parts = (question_id) => {
        var question_object = $scope._questions_.find(x => x._id == question_id );
        if( question_object == undefined ) return false ;
        $(".redactor-in-0").attr( 'placeholder' , $( "<span>"+ question_object.question_body +"<span>" ).text() );
      };
      // => When Changing question Text area
      $scope.when_changing_question_text_area = (question_data) => {
          $scope._questions_[$scope.question_index].question_body = question_data ;
          console.log($scope._questions_);
      }
      // => Select Current Question
      $scope.mark_current_question_in_list = (question_id) => {

        // ==> Remove Old selected question.
        $("#docQuestions").children("li").each(function(){
          if( $(this).hasClass('marked_question') )
          $(this).removeClass('marked_question');
        });
        // alert($("#docQuestions").children('li.qs-'+question_id.toString()).prop('className') )
        $timeout(function(){
          $("#docQuestions").children('li.qs-'+question_id.toString()).addClass('marked_question');
        })
        // $("#docQuestions").children('li').removeClass('marked_question');

        // marked_question
        // alert(question_index);
      }
      // => Init this question
      $scope.init_this_question = ( question_id ) => {
         // Init Question to edit
         var question_index = $scope._questions_.findIndex(x => x._id == question_id );
         if( question_index == -1  ) return false;
         // => Storing Question Index
         $scope.question_index = question_index ;
         // => Truncate Question Textarea
         // $('#editor-quest-data').val('');
         // => Select current question
        $timeout(function(){
          $scope.mark_current_question_in_list(question_id) ;
          $scope.fill_textarea_parts(question_id);
        })
      }
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


        // ==> Slide To Bottom
        $(".qsdragged-list , html , body").animate({
          scrollTop: 1000000000000
        }, 10 );

      }
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
        // => Slide toggle between tags
      $scope.expand_collapsed_items = function (id){
         var targetId = id ;
         var targetAll = $(".x-editor-x-body").height() ;
         var targetH = $(targetId).height() ;
         $(targetId).slideToggle();
       };
      // Init swiperJs
      $scope.init_swiperJs = () => {
          $scope.swiper_data = new Swiper ('.swiper-data' , {
           allowTouchMove : false
          });
          $scope.swiper_data.update();
      }

      // Loading Functions
      $scope.first_callback_question();
      $scope.init_swiperJs();
      // =============================================================>>
    /* End Code of Document here */
});});}]);
