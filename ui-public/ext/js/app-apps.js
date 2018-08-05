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
apps.controller("apps-controller" , [
'$scope','$http' , '$timeout','$window','$rootScope' , '$sce' ,
( $scope , $http , $timeout , $window , $rootScope , $sce  ) => {

  $scope.server_ip = $("#serverIp").val();
  $scope.user_id = $("#userId").val();
  $scope.app_id = $("#applicationId").val();
  $scope.json_source = $scope.server_ip + "ext/json/json-keys.json";
  $scope.swiper_data = null ;
  $scope.switching_editor_preview_value = false ;
  $scope.is_add_new_unsaved = false;
  $scope.is_unsaved_data = false ;
  $scope.media_for = 'questions' ;
  $scope._application_ = null ;
  $scope._questions_ = null ;
  $scope._settings_ = null ;
  $scope.database_data = [] ;
  $scope.question_ids  = [] ;
  $scope.answer_ids  = [] ;
  $scope.question_id   = $("#question_id").val()  ;
  $scope.retrieve_data_url = $scope.server_ip + "api/"+$scope.app_id+"/application/get/all";
  $scope.question_index = null;
  $scope.media_image_uploader = $('.image-uploader-x');
  $scope.image_view_source = null ;
  $scope.header_data = null ;
  $scope._application_ = null ;
  $scope._questions_   =  null;
  $scope._settings_    =  null;
  $scope.question_ids  =  null;
  $scope.answer_ids    = null;
  $scope.cropper = null ;
  $scope.current_media_question = undefined ;
  $scope.cropper_results = new Object() ;
  // $.getJSON( $scope.json_source , function ( api_key_data ){
  //   $scope.header_data = {
  //      "X-api-keys": api_key_data.API_KEY ,
  //      "X-api-app-name": api_key_data.APP_NAME
  //    };
  // });
  // ==> Loading Applications
  $http({ method : "GET" , url : $scope.retrieve_data_url }).then(( resp )=>{
    $scope._application_ =  resp.data ;
    $scope._settings_    =  $scope._application_.settings;
    $scope.question_ids  =  $scope._application_.question_ids;
    $scope.answer_ids    =  $scope._application_.answer_ids;
    $scope._questions_   =  $scope._application_.questions;
  });

  // ==> Calculate the momory size of
  $scope.memory_size_of_object  = ( obj ) => {
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
  $scope.switching_editor_preview = () => {

       if( $scope.switching_editor_preview_value == false ) {
           // => Editor
           $scope.swiper_data.slideTo(0);
         }else {
           // => Preview
           $(".x-editor-x-body").css("display" , 'none');
           $scope.swiper_data.slideTo(1);
       }
         // console.log($(".preview-container").css('display'));
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
    // => Push To Question Array
     if( atIndex == null )
       $scope._questions_.push( question_object );
       else
       $scope._questions_.splice( atIndex , 0 ,  question_object );
       // ==> Selecting according to question index
        $scope.highlighted_question(question_object._id);
        // ==> Slide To Bottom
        var scroll_top = 0 ;
        if($scope._questions_.length >= 8 ){
        scroll_top = 1000000000000
        }else  scroll_top = 0
        $(".qsdragged-list , html , body").animate({
        scrollTop: scroll_top
        }, 10 );
        // ==> Storing Question into DB
     $scope.storing_questions_into_database();
  };
  // ==> Expan collapse between editor
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
  // => Mark Selected Question
  $scope.highlighted_question = (questionId) => {
        // => detect current question is exists or not
        var questionIndex = $scope._questions_.findIndex( x=> x._id == questionId );
        if( questionIndex == -1 ) return false ;


        $("#docQuestions").children("li").each(function(){
           if( $(this).hasClass('marked_question') )
           $(this).removeClass('marked_question');
        });

        $timeout(function(){
          $("#docQuestions").children('li.qs-'+questionId.toString()).addClass('marked_question');
        });

        $scope.question_index = questionIndex ;
        $("#question_id").val(questionId)

        // ==> Fill and binding event handler with textarea box
        $scope.fill_boxes_with_question_objects(questionId);
        // ==> Detect if Unsaved data is happened
        // $scope.detect_if_there_unsaved_data ($scope.is_unsaved_data )
      }
  // ==> Fill Question Boxes
  $scope.fill_boxes_with_question_objects = ( questionId ) => {

            var questionIndex = $scope._questions_.findIndex( x=> x._id == questionId );
            if( questionIndex == -1 ) return false ;

            var question = $scope._questions_.find ( x => x._id == questionId );
            if(question == undefined ) return false;

            $scope.current_media_question = ( question.media_question == undefined ) ? undefined : question.media_question ;

            // ==> Distrbute question data
            // ==> Question Text
            $(".redactor-in-0").html(question.question_body);
            $(".redactor-in-1").html(question.question_description);
            $(".redactor-in-0 , #editor-quest-data").on("input" , function (){
                var question_value = $(this).html() ;
                $timeout(function(){
                    $scope._questions_[$scope.question_index].question_body = $R('#editor-quest-data' , 'source.getCode');
                    $scope.is_unsaved_data = true ;
                } , 500 );
            });

            $(".redactor-in-1 , #editor-desc-data").on("input" , function (){
                var question_value = $(this).html() ;
                $timeout(function(){
                    $scope._questions_[$scope.question_index].question_description = $R('#editor-desc-data' , 'source.getCode');
                    $scope.is_unsaved_data = true ;
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
  // Init swiperJs
  $scope.init_swiperJs = () => {
         $scope.swiper_data = new Swiper ('.swiper-data' , {
          allowTouchMove : false
         });
         $scope.swiper_data.update();
      }
  // ==> Display first question
  $scope.init_first_question = () => {
            if($scope._questions_.length != 0 ){
              $scope.highlighted_question($scope._questions_[0]._id);
              $scope.current_media_question = ( $scope._questions_[0].media_question == undefined ) ? undefined : $scope._questions_[0].media_question ;
            }
          }
  // ==> Display media data
  $scope.calling_media_uploader = () => {
                $(".media-imgvid-uploader").fadeIn();
              }
  // ==> Display Image in question
  $scope.loading_question_image = (img_src) => {
  };
  // ==> Add
  $scope.add_new_media_for_question = () => {
        $scope.media_for = 'questions' ; // => Question
        $(".media-uploader").fadeIn();
      }
  // ==> Add media for question
  $scope.add_new_media_for_answer = () => {
            $scope.media_for = 'answer' ; // => Question
            $(".media-uploader").fadeIn();
          }
  // => Close Current window
  $scope.close_current_image_uploader = () => {
                return $(".media-uploader , .live_preview_image").fadeOut();
              };
  // => Start cropping image
  $scope.init_cropping_image = () => {
                    $timeout(function(){
                      var image_data = document.getElementById("cropping_system");
                      $scope.cropper =  new Cropper ( image_data , {
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
                          $scope.store_cropping_data (event);
                           //  $scope.cropper_results['x'] = event.detail.x;
                           // $scope.cropper_results['y'] = event.detail.y;
                           // $scope.cropper_results['width'] = event.detail.width;
                           // $scope.cropper_results['height'] = event.detail.height;
                           // // $scope.cropper_results['rotate'] = event.detail.rotate;
                           // $scope.cropper_results['scaleX'] = event.detail.scaleX;
                           // $scope.cropper_results['scaleY'] = event.detail.scaleY;
                        }
                      } );
                    }, 250 );
                  };
  // => Storing Copping results
  $scope.store_cropping_data = (evt) => {
                        $('#cropping-image-x').val(evt.detail.x);
                        $('#cropping-image-y').val(evt.detail.y);
                        $('#cropping-image-width').val(evt.detail.width);
                        $('#cropping-image-height').val(evt.detail.height);

                        // $scope.cropper_results['rotate'] = event.detail.rotate;
                        // $scope.cropper_results['scaleX'] = evt.detail.scaleX;
                        // $scope.cropper_results['scaleY'] = evt.detail.scaleY;
                      };
  // ==> Reading current Image then blob
  $scope.init_blob_data = (image_file) => {
                              $scope.image_view_source = null ;
                              var file = image_file[0].files[0] ;

                              $scope.cropper_results['file'] = file ;
                              var reader = new FileReader();
                              var read_file = reader.readAsDataURL(file);
                              reader.onload = ( e ) => {
                                $scope.image_view_source =  e.target.result  ;
                                var img_data = '<img id="cropping_system" src="'+ $scope.image_view_source +'" alt="Image">';
                                var loader_data = "<div class='loading_data'></div>" ;
                                $(".live_preview_image").html(loader_data + img_data);
                                $('.loading_data').fadeOut(1000);
                                $scope.$apply();
                              }
                            }
  // => Image Uploader Changes and inputs
  $scope.media_image_uploader.on('change , input' , function(){
                                    // ==> Detect if question is in exists

                                    var question_id = $("#question_id").val() ;
                                    var question = $scope._questions_.find(x => x._id == question_id );

                                    if(question == undefined ) return false ;
                                    $(".live_preview_image").fadeIn();
                                    // ==> Reading Image file
                                    $scope.init_blob_data($(this));
                                    // ==> Calling Cropping liberary
                                    $scope.init_cropping_image();


                                    $timeout(function(){
                                      $scope.$apply();
                                    });
                                });
  // => Storing copped data in $scope object
  $scope.storing_image_with_cropped_data = ( ) => {

          var questionId = $("#question_id").val();
                                        var model ;
                                        if($scope.media_for == 'questions' ) model = 'question';
                                        else model = 'answer';

                                          var x = $('#cropping-image-x').val();
                                          var y = $('#cropping-image-y').val();
                                          var width = $('#cropping-image-width').val();
                                          var height = $('#cropping-image-height').val();

                                          var formImageData = new FormData();
                                          formImageData.append('media_field' , $scope.media_image_uploader[0].files[0]   );
                                          formImageData.append('height' , height  );
                                          formImageData.append('width' , width  );
                                          formImageData.append('x' ,x  );
                                          formImageData.append('y' , y  );
                                          formImageData.append('questions' , $scope._questions_ );

                                       // ==> Send Data To Api
                                       var progressHandler = (event) => {
                                         console.log( "Uploaded "+event.loaded+" bytes of "+event.total );
                                         var percent = Math.round (event.loaded / event.total) * 100;
                                         console.log(percent);
                                       };
                                       var completeHandler = ( event ) => {
                                         console.log(event.target);

                                         $http({ method : "GET" , url : $scope.retrieve_data_url }).then( ( resp ) => {
                                           var qs = resp.data.questions;
                                           var rarget_question = qs.find(x => x._id == $("#question_id").val());
                                           $scope.current_media_question = (rarget_question.media_question == undefined ) ? undefined : rarget_question.media_question ;
                                          });
                                         // => ___question_5b58789124398227ee908f4d.jpg
                                         // =>    question_5b58789124398227ee908f4d.jpg
                                       };
                                       var errorHandler = ( event ) => { "Upload Failed"  };
                                       var abortHandler = ( event ) => { "Upload Aborted" };
                                       var ajax = new XMLHttpRequest();
                                       ajax.upload.addEventListener("progress", progressHandler, false);
                                       ajax.addEventListener("load", completeHandler, false);
                                       ajax.addEventListener("error", errorHandler, false);
                                       ajax.addEventListener("abort", abortHandler, false);
                                       ajax.open("POST",  $scope.server_ip + "api/" + $scope.app_id + '/' +  model +  "/" + questionId + "/cropping_system" );
                                       // ajax.setRequestHeader("Content-type", undefined );
                                       ajax.send(formImageData);


          };
  // => load_image_media
  $scope.load_image_media = () => {
    var img = $scope.current_media_question.Media_directory;
    var image_data =$scope.current_media_question.image_updated_date;
    var img_src = img +'?' + image_data ;

    return {
        'background-image':'url("'+img_src+'")'
    };
  }
  // => Storing Data of questions into db
  $scope.storing_questions_into_database = () => {
                                          $http({
                                            url : $scope.server_ip + 'api/' + $scope.app_id + "/add/questions" ,
                                            method : "POST" ,
                                            data : { data : $scope._questions_ }
                                          }).then((response)=>{
                                            console.log(response.data);
                                          });

                                        }
  // => init tooltip
  $scope.init_bootstrap_tooltip = ( ) => {
      return $('[data-toggle="tooltip"]').tooltip();
         }
  // ==> Calling Methods Here
  $timeout(function(){
    $scope.init_swiperJs();
    $scope.init_first_question();
    $scope.init_bootstrap_tooltip();
  }, 400);

}]);
