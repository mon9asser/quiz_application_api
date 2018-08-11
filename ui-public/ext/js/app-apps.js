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
});
apps.filter('trust_iframe_url' , ( $sce ) => {
  return function (url){
    return  $sce.trustAsResourceUrl(url);
  };
});
apps.controller("apps-controller" , [
'$scope','$http' , '$timeout','$window','$rootScope' , '$sce' ,
( $scope , $http , $timeout , $window , $rootScope , $sce  ) => {
  $rootScope.media_type = 0 ;
  $rootScope.server_ip = $("#serverIp").val();
  $rootScope.user_id = $("#userId").val();
  $rootScope.app_id = $("#applicationId").val();
  $rootScope.json_source = $rootScope.server_ip + "ext/json/json-keys.json";
  $rootScope.swiper_data = null ;
  $rootScope.switching_editor_preview_value = false ;
  $rootScope.is_add_new_unsaved = false;
  $rootScope.is_unsaved_data = false ;
  $rootScope.media_for = 'questions' ;
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
    // ==> Calling Funcs
    $rootScope.init_first_question();
  });
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
  $scope.media_links_are_changed = () => {

    var youtube =   $scope.media_link.toLowerCase().includes("youtube") ;
    var vimeo =   $scope.media_link.toLowerCase().includes("vimeo") ;
    var mp4 =   $scope.media_link.toLowerCase().includes(".mp4") ;
    var video = $scope.media_link ;
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
  // ==> Switching Slide Mode
  $rootScope.switching_editor_preview = () => {

       if( $rootScope.switching_editor_preview_value == false ) {
           // => Editor
           $rootScope.swiper_data.slideTo(0);
         }else {
           // => Preview
           $(".x-editor-x-body").css("display" , 'none');
           $rootScope.swiper_data.slideTo(1);
       }
         // console.log($(".preview-container").css('display'));
  };
  // => Add new question (click-event)
  $rootScope.add_new_question = ( question_type , atIndex = null ,  other_types = null ) => {
    if($rootScope._questions_.length > 200 )
    return false ;
    var question_object = new Object() , answer_object = new Object() ;
    // => Build Default Question
    question_object['_id'] = $rootScope.question_ids['id_' +  $rootScope._questions_.length  ];
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
    answer_object['_id'] = $rootScope.answer_ids[ 'id_' + question_object.answers_format.length] + '' + $rootScope._questions_.length ;
    if( question_type == 0 ) {
      answer_object['value'] = "Answer " + ( question_object.answers_format.length + 1 )
      if ( $rootScope._application_.app_type == 1 )
      answer_object['is_correct'] = false ;
      // => Push To Answer Array
      question_object.answers_format.push( answer_object );
    }
    if( question_type == 1 ){
       // answer_object['_id'] = $rootScope.answer_ids[ 'id_' + question_object.answers_format.length ];
       answer_object['media_src'] = "No Media Here !";
       if ( $rootScope._application_.app_type == 1 )
       answer_object['is_correct'] = false ;
       // => Push To Answer Array
       question_object.answers_format.push( answer_object );
    }
    if( question_type == 2 ){
       answer_object['_id'] = $rootScope.answer_ids[ 'id_' + question_object.answers_format.length ] + '' + $rootScope._questions_.length +'_a';
       answer_object['boolean_type'] = "true/false";
       answer_object['boolean_value'] = true ;
       if ( $rootScope._application_.app_type == 1 )
       answer_object['is_correct'] = false ;
       // => Push To Answer Array
       question_object.answers_format.push( answer_object );
       answer_object['_id'] = $rootScope.answer_ids[ 'id_' + question_object.answers_format.length ] + '' + $rootScope._questions_.length +'_b';;
       answer_object['boolean_type'] = "true/false";
       answer_object['boolean_value'] = false ;
       if ( $rootScope._application_.app_type == 1 )
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
        $rootScope.fill_boxes_with_question_objects(questionId);
        // ==> Detect if Unsaved data is happened
        // $rootScope.detect_if_there_unsaved_data ($rootScope.is_unsaved_data )
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
            $(".redactor-in-1").html(question.question_description);
            $(".redactor-in-0 , #editor-quest-data").on("input" , function (){
                var question_value = $(this).html() ;
                $timeout(function(){
                    $rootScope._questions_[$rootScope.question_index].question_body = $R('#editor-quest-data' , 'source.getCode');
                    $rootScope.is_unsaved_data = true ;
                } , 500 );
            });

            $(".redactor-in-1 , #editor-desc-data").on("input" , function (){
                var question_value = $(this).html() ;
                $timeout(function(){
                    $rootScope._questions_[$rootScope.question_index].question_description = $R('#editor-desc-data' , 'source.getCode');
                    $rootScope.is_unsaved_data = true ;
                } , 500 );
            });

            $timeout(function(){
              $rootScope.$apply();
            });

          }
  //==> Show Media Link in input
  $rootScope.show_media_link = () => {
      $rootScope.media_type = 1;
      $(".media-inputs").css("display" , "block");
  }
  // => Image Uploader
  $rootScope.upload_image_handler = () => {
      $scope.media_image_model = '';
      $rootScope.media_type = 0 ;
      return $rootScope.media_image_uploader.trigger('click');
  }
  // => Show Image
  $rootScope.image_uploader_is_touched = () => {
      console.log($rootScope.media_image_model[0].files[0]);
  }
  // Init swiperJs
  $rootScope.init_swiperJs = () => {
         $rootScope.swiper_data = new Swiper ('.swiper-data' , {
           allowTouchMove : false
         });
         $rootScope.swiper_data.update();
  }
  // ==> Display first question
  $rootScope.init_first_question = () => {
            if($rootScope._questions_.length != 0 ){
              $rootScope.highlighted_question($rootScope._questions_[0]._id);
              $timeout(function(){ $rootScope.sorting_answers_in_list(); } , 300);
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
  $rootScope.make_answer_classes = (answer) => {
    var classes = '';
    if( answer.is_correct == true ) classes = 'modified_correct_answer '
    return classes ;
  }
  // ===> Delete This Answer
  $rootScope.make_this_correct_incorrect_answer = (answerId) => {
    var question = $rootScope._questions_[$rootScope.question_index];
    if(question._id == undefined) return false ;
    var answer = question.answers_format.find(x => x._id == answerId);
    if(answer == undefined ) return false ;
      answer.is_correct = ! answer.is_correct ;
  }
  // ===> Delete This Answer
  $rootScope.delete_this_answer = (answerId) => {
    var question = $rootScope._questions_[$rootScope.question_index];
    if(question._id == undefined) return false ;
    var answer_index = question.answers_format.findIndex(x => x._id == answerId);
    if(answer_index == -1) return false ;
    question.answers_format.splice (answer_index , 1);
  }
  // ==> Add New Answer
  $rootScope.add_new_media_for_question = () => {
        $rootScope.media_for = 'questions' ; // => Question
        $(".box-data").css({ top :'148px'});
        $('.box-overlay').height($(document).height());

        $(".media-uploader").fadeIn();
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
        var reader = new FileReader();
        var read_file = reader.readAsDataURL(file);
        reader.onload = ( e ) => {
          $rootScope.image_view_source =  e.target.result  ;
          var img_data = '<img id="cropping_system" src="'+ $rootScope.image_view_source +'" alt="Image">';
          var loader_data = "<div class='loading_data'></div>" ;
          $(".live_preview_image").html(loader_data + img_data);
          $('.loading_data').fadeOut(1000);
          $('.box-overlay').height($(document).height() + 50);
          $rootScope.$apply();
        }

        // console.log($rootScope.media_image_uploader[0].files[0]);
  };

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
                                    $rootScope.read_image_file($(this));
                                    // ==> Calling Cropping liberary
                                    $rootScope.init_cropping_image();

                                    $timeout(function(){
                                      $rootScope.$apply();
                                    });
                                });





   $rootScope.storing_image_with_cropped_data = () => {
     // => $rootScope.media_for (questions - answer) $rootScope.media_type ( 0 - 1)

     if ( $rootScope.media_for == 'questions' ) {
       if ( $rootScope.media_type == 0 ) $rootScope.storing_cropped_image_for_media_question();
       if ( $rootScope.media_type == 1 ) $rootScope.storing_video_for_media_question();
     }else if ($rootScope.media_for == 'answer') {
       if ( $rootScope.media_type == 0 ) $rootScope.storing_cropped_image_for_media_answer();
       if ( $rootScope.media_type == 1 ) $rootScope.storing_video_for_media_answer( );
     }
     $timeout(function(){
          $rootScope.close_current_image_uploader();
     } , 800 );
   };

   $rootScope.storing_cropped_image_for_media_question = (   ) => {

        $("#file_extension").val( $rootScope.media_image_uploader[0].files[0].name.split('.').pop());
        var questionId = $("#question_id").val();
        var x = $('#cropping-image-x').val();
        var y = $('#cropping-image-y').val();
        var width = $('#cropping-image-width').val();
        var height = $('#cropping-image-height').val();

        var progressHandler = (event) => {
           console.log( "Uploaded "+event.loaded+" bytes of "+event.total );
           var percent = Math.round (event.loaded / event.total) * 100;
           $('.highlighted_progress').css({width : percent + '%' });
        };

        var completeHandler = () => {

            var image_extension = $("#file_extension").val();
           var ThisQuestion = $rootScope._questions_.find(x => x._id == $("#question_id").val());
           if($rootScope.media_for == 'questions'){
                if(ThisQuestion.media_question == undefined)
                      ThisQuestion['media_question'] = new Object();
                      var cropped_image_path = $rootScope.server_ip + "themeimages/question_" + ThisQuestion._id +'.' +image_extension ;
                      var main_image_path = $rootScope.server_ip + "themeimages/__question_" + ThisQuestion._id  +'.'  +image_extension ;
                      var updated_date = new Date();
                      ThisQuestion['media_question']['media_type'] = 0 ;
                      ThisQuestion['media_question']['media_name'] ="question_" + ThisQuestion._id +image_extension ;
                      ThisQuestion['media_question']['media_field'] = "themeimages/question_" + ThisQuestion._id +image_extension ;
                      ThisQuestion['media_question']['Media_directory'] = cropped_image_path ;
                      ThisQuestion['media_question']['image_cropped'] = "question_" + ThisQuestion._id +image_extension
                      ThisQuestion['media_question']['image_full'] ="__question_" + ThisQuestion._id +image_extension
                      ThisQuestion['media_question']['image_updated_date'] = updated_date ;
            }
          $timeout(function(){
            $rootScope.$apply();

            $timeout(function(){
              $('.highlighted_progress').css({width : 0 + '%' });
            } , 300);
          }, 300);
        }; // end complete

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
               progress : function (event ){
                        console.log( "Uploaded "+event.loaded+" bytes of "+event.total );
                        var percent = Math.round (event.loaded / event.total) * 100;
                        $('.highlighted_progress').css({width : percent + '%' });
                        if (event.loaded == event.total) {

                        }
                   }
               }
        }).then(()=>{
          $timeout(function(){
            completeHandler();
          } , 1000 );
        });
       //  $http({
       //    url : cropping_url ,
       //    method : "POST" ,
       //    data : formImageData ,
       //    headers : { 'Content-Type' : undefined} ,
       //    uploadEventHandlers : {
       //    progress : function (event ){
       //             console.log( "Uploaded "+event.loaded+" bytes of "+event.total );
       //             var percent = Math.round (event.loaded / event.total) * 100;
       //             $('.highlighted_progress').css({width : percent + '%' });
       //             if (event.loaded == event.total) {
       //
       //             }
       //        }
       //    }
       //  }).then((response)=>{
       //    $timeout(function(){
       //
       //      // $rootScope._application_ = response.data ;
       //      // $timeout(function(){ $rootScope.$apply(); } , 300 )
       //          completeHandler();
       //    },1000);
       // });;
   };
   $rootScope.storing_video_for_media_question = (   )         => {
      var video_object = $rootScope.current_media_video ;
      var target_question = $rootScope._questions_[$rootScope.question_index] ;
      if( target_question.media_question == undefined ) target_question['media_question'] = new Object();
      target_question.media_question = video_object.media_question;

      // ==> Saving Data
      $timeout(function(){
        $rootScope.storing_questions_into_database();
      } , 300);
   };
   $rootScope.storing_cropped_image_for_media_answer = (   )   => {
            $("#file_extension").val( $rootScope.media_image_uploader[0].files[0].name.split('.').pop() );
          var questionId = $("#question_id").val();
          var answerId = $rootScope.current_answer_id ;
          var x = $('#cropping-image-x').val();
          var y = $('#cropping-image-y').val();
          var width = $('#cropping-image-width').val();
          var height = $('#cropping-image-height').val();

          var progressHandler = (event) => {
             console.log( "Uploaded "+event.loaded+" bytes of "+event.total );
             var percent = Math.round (event.loaded / event.total) * 100;
             $('.highlighted_progress').css({width : percent + '%' });
          };
          var completeHandler = ( new_imag  ) => {


             var image_extension = $("#file_extension").val() ;
             console.log(image_extension);
             var ThisQuestion = $rootScope._questions_.find(x => x._id == $("#question_id").val());
             var current_answer = ThisQuestion.answers_format.find(x => x._id == answerId );
             if( current_answer == undefined )return false ;

             if( current_answer.media_optional == undefined )
             current_answer['media_optional'] = new Object();

             var server_path = $rootScope.server_ip + "themeimages/" ;
             var cropped_image_src = server_path + 'answer_media_' + answerId +'.' + image_extension;
             var cropped_image_name = 'answer_media_' + answerId +'.' + image_extension;
             var full_image_name = "___answer_media_" +answerId + '.' +image_extension;
             var image_updated_date = new Date()  ;
             if( ThisQuestion.question_type == 0){
               current_answer.media_optional['media_name'] = cropped_image_name ;
               current_answer.media_optional['media_type'] = 0;
               current_answer.media_optional['Media_directory'] = cropped_image_src ;
               current_answer.media_optional['image_cropped'] = cropped_image_name
               current_answer.media_optional['image_full'] = full_image_name ;
               current_answer.media_optional['image_updated_date'] = image_updated_date ;
             }else if (ThisQuestion.question_type == 1){
               current_answer['media_name'] = cropped_image_name ;
               current_answer['media_type'] = 0;
               current_answer['Media_directory'] = cropped_image_src ;
               current_answer['image_cropped'] = cropped_image_name
               current_answer['image_full'] = full_image_name ;
               current_answer['image_updated_date'] = image_updated_date ;
             }
             $timeout(function(){
                $rootScope.$apply();

                $timeout(function(){
                  $('.highlighted_progress').css({width : 0 + '%' });
                } , 300);
            }, 300);
          }; // end complete

         var formImageData = new FormData();
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
             progress : function (event) {
               console.log( "Uploaded "+event.loaded+" bytes of "+event.total );
               var percent = Math.round (event.loaded / event.total) * 100;
               $('.highlighted_progress').css({width : percent + '%' });
               if (event.loaded == event.total) {

               }
             }
           }
         }).then((response)=>{
            $timeout(function(){
              completeHandler(response.data.img_path);
            },1000);
         });;
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
     } , 300);
   };


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
  }
  // ==> Sorting Questions
  $rootScope.init_drag_drop = () => {
    Sortable.create (document.getElementById("qs-sortable") , {
      sort: false,
       disabled: false,
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
          $rootScope.add_new_question ( question_type , evt.newIndex ,  null ) ;
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
  // ==> Calling Methods Here
  $rootScope.init_drag_drop();
  $timeout(function(){
    $rootScope.init_swiperJs();
    $rootScope.init_bootstrap_tooltip();

  }, 400);
  //


}]);
