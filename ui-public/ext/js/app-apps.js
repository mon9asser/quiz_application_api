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
  $rootScope.media_links_are_changed = () => {
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
    var questionId = $("#question_id").val();
    var this_question = $scope._questions_.find (x => x._id == questionId );
    if(this_question != undefined){
      // ==> if it question
      if( $rootScope.media_for == 'questions' ) {
            if( this_question.media_question == undefined )
              this_question['media_question'] = new Object();
              this_question.media_question['media_src'] = urlInput;
              this_question.media_question['Media_directory'] = urlInput;
              this_question.media_question['media_type'] = 1;
              this_question.media_question['media_name'] = urlInput;
              this_question.media_question['video_id'] = videoId;
              this_question.media_question['video_type'] = video_type ;
              this_question.media_question['embed_path'] = video_src;
              if (video_type == 2 ) {
                this_question.media_question['mp4_option'] = {
                  mp4_url: video_src +'.mp4' ,
                  ogg_url : video_src +'.ogg'
                };
              }

              $timeout(function(){
                 $rootScope.$apply();
              } , 300 );
      }
      if( $rootScope.media_for ==  'answer' ) {
        alert("its answer video");
      }
      // ==> if it answer
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
  // ==> Add
  $rootScope.add_new_media_for_question = () => {
        $rootScope.media_for = 'questions' ; // => Question
        $(".media-uploader").fadeIn();
      }
  // ==> Add media for question
  $rootScope.add_new_media_for_answer = () => {
            $rootScope.media_for = 'answer' ; // => Question
            $(".media-uploader").fadeIn();
          }
  // => Close Current window
  $rootScope.close_current_image_uploader = () => {
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
                        $('#cropping-image-x').val(evt.detail.x);
                        $('#cropping-image-y').val(evt.detail.y);
                        $('#cropping-image-width').val(evt.detail.width);
                        $('#cropping-image-height').val(evt.detail.height);

                        // $rootScope.cropper_results['rotate'] = event.detail.rotate;
                        // $rootScope.cropper_results['scaleX'] = evt.detail.scaleX;
                        // $rootScope.cropper_results['scaleY'] = evt.detail.scaleY;
                      };
  // ==> Reading current Image then blob
  $rootScope.init_blob_data = (image_file) => {
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
          $rootScope.$apply();
        }
  };
  // => Image Uploader Changes and inputs
  $rootScope.media_image_uploader.on('change , input' , function(){
                                    // ==> Detect if question is in exists

                                    var question_id = $("#question_id").val() ;
                                    var question = $rootScope._questions_.find(x => x._id == question_id );

                                    if(question == undefined ) return false ;
                                    $(".live_preview_image , .progrbar").fadeIn();
                                    // ==> Reading Image file
                                    $rootScope.init_blob_data($(this));
                                    // ==> Calling Cropping liberary
                                    $rootScope.init_cropping_image();


                                    $timeout(function(){
                                      $rootScope.$apply();
                                    });
                                });
  // => Storing copped data in $rootScope object
  $rootScope.storing_image_with_cropped_data = ( ) => {

      var questionId = $("#question_id").val();
      var model ;
      if($rootScope.media_for == 'questions' ) model = 'question';
      else model = 'answer';



            var x = $('#cropping-image-x').val();
            var y = $('#cropping-image-y').val();
            var width = $('#cropping-image-width').val();
            var height = $('#cropping-image-height').val();
            var formImageData = new FormData();
            formImageData.append('media_field' , $rootScope.media_image_uploader[0].files[0]   );
            formImageData.append('height' , height  );
            formImageData.append('width' , width  );
            formImageData.append('x' ,x  );
            formImageData.append('y' , y  );
            formImageData.append('questions' , $rootScope._questions_ );

           // ==> Send Data To Api
            var progressHandler = (event) => {
            console.log( "Uploaded "+event.loaded+" bytes of "+event.total );
            var percent = Math.round (event.loaded / event.total) * 100;
            $('.highlighted_progress').css({width : percent + '%' });
            };
            var completeHandler = (   ) => {
                        var image_extension = $rootScope.media_image_uploader[0].files[0].name.split('.').pop() ;
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

                  // ==> If it answer
                      if($rootScope.media_for == 'answer') {
                        alert("its answer !!");
                      }
                      $timeout(function(){
                       // ==> Refresh status
                         $rootScope.$apply();
                       // ==> Close Navigation part
                      $timeout(function(){
                         $rootScope.close_current_image_uploader();
                       } , 150);
                       $timeout(function(){
                         $('.highlighted_progress').css({width : 0 + '%' });
                       } , 300 );
                       } , 300 );
                }; // end complete

   var cropping_url = $rootScope.server_ip + "api/" + $rootScope.app_id + '/' +  model +  "/" + questionId + "/cropping_system" ;
   $http({
     url : cropping_url ,
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
   }).then((response)=>{
      $timeout(function(){
            completeHandler();
      },300);
   });


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
  $scope.remove_question_media = (question_id) => {
    var Question = $scope._questions_.find(x => x._id == question_id );
    if(Question == undefined ) return false ;
    if(Question.media_question == undefined ) return false ;

    return Question.media_question = undefined ;
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
  // => init tooltip
  $rootScope.init_bootstrap_tooltip = ( ) => {
      return $('[data-toggle="tooltip"]').tooltip();
         }
  // ==> Calling Methods Here
  $timeout(function(){
    $rootScope.init_swiperJs();
    $rootScope.init_bootstrap_tooltip();
  }, 400);

}]);
