  $(document).ready(function(){



  $("span.edit-options-answer").on("click",function (){
     $(".overlay-answer-section").fadeIn();
  });

  $("a.answer-video-handler").on("click",function (){
   $(".media-iserver_ipnp-answer").css({
     display:'block'
   });
  });

 $(".trigger-upload-answer-media").on("click", function (){
   $(".media-answer-up").trigger("click");
 });
 $(".media-answer-up").on("change", function (){
   var fileImage = $('.media-answer-up')[0].files[0] ;
   if(fileImage.type != "image/jpeg" && fileImage.type != "image/jpg" && fileImage.type != "image/png" && fileImage.type != "image/jpg")
   {
     alert("Image should end with png or gif or jpg</b>");
     return false ;
   }
   var appId = $("#x-app-id-x").val();
   if(appId == '')
   {
     alert("There is no any question selected !")
     return false ;
   }
   var questionId = $("#x-question-id-x").val();
   var creatorIdx = $("#x-creator-id-x").val() ;
   var formObject = new FormData();
   formObject.append("media_src", fileImage  );
   formObject.append("question_id", questionId );
   formObject.append("creator_id",  creatorIdx );

  //  var apiUrl =
  var server_ip = $("#serverId_app").attr("serverIp");
   var apiUrl = server_ip +"api/" + appId +"/question/"+questionId+"/answer/create"
       alert(apiUrl);
  //  media_src
  //  choices_value
  //  is_correct
 });

// ===> tooltip related answer options
$('[data-toggle="asnwers-options"]').tooltip();

//-----------------------------------------
// ------->>>>>> tab orders
//-------------------------------------------
$(".x-editor-x-title").on('click', function (){

  var targetId = $(this).attr('data-toggle');
  var targetAll = $(".x-editor-x-body").height() ;
  var targetH = $(targetId).height() ;
  // $('.x-editor-x-body').each(function(i){
  //
  // });

  $(targetId).slideToggle();
  // $(this).css({'margin-top':'10px' , display:'block'})
});


$('.video-handler').on('click' , function (){
  $(".media-inputs").css("display",'block');
});
$('.image-handler').on('click' , function (){
  // ---------------------------------------
  // ----->>>>> Image Uploader
  // ---------------------------------------
  $('.image-uploader-x').trigger("click");
});


$('.image-uploader-x').on("change", function (){


    var fileImage = $('.image-uploader-x')[0].files[0] ;
    console.log(fileImage.type);
    if(fileImage.type != "image/jpeg" && fileImage.type != "image/jpg" && fileImage.type != "image/png" && fileImage.type != "image/jpg")
    {
      $(".media-x-preview").html("<b style='color:red;color: red;padding-top: 20px;display: block;'>Image should end with png or gif or jpg</b>")
      return false ;
    }

    var questionId = $('#x-question-id-x').val()  ;
    var appId = $("#x-app-id-x").val();
    var creatorIdx = $("#x-creator-id-x").val();

    var formObject = new FormData();
    formObject.append("media_field", fileImage  );
    formObject.append("question_id", questionId );
    formObject.append("creator_id",  creatorIdx );
    $('.media-inputs').fadeOut();
    var server_ip = $("#serverId_app").attr("serverIp");
    var url = server_ip +'api/'+ appId +"/question/edit";
    var jsonFile = server_ip + "ext/js/json.app.keys.json";

    $.getJSON(jsonFile , function (api_key_data){
      $.ajax({
        url : url ,
        type : "PATCH" ,
        data : formObject ,
        processData: false,
        contentType: false ,
        headers : {
          "X-api-app-name": api_key_data.APP_NAME ,
          "X-api-keys"    : api_key_data.API_KEY ,
          "Content-Type"  : undefined
        } ,
        success : function (qsData){
          var imageMedia = '<div style="height:250px;background-image:url('+qsData.Media_directory+')" class="img-resp-exrtacted"></div>';
          $('.media-x-preview').html(imageMedia);
          $('.media-inputs').val(qsData.Media_directory);
          $('.btn-close-media').trigger("click");
        }
      });

    });

});






$('input.media-inputs').on('change keydown' , function (){
   alert("Extract media here!!")
});
// =================> Meia Uploader
 window.edit_media_part = function (){
  $(".box-overlay , .box-data").fadeIn();
 };
$(".box-overlay , .btn-close-media").on("click" , function (){
    $(".box-overlay , .box-data , .overlay-answer-section").fadeOut();
});
 //---------------------------------------------------
 // ==> Sliding Items Via Slick
 //--------------------------------------------------
 $('.question-lists').slick({
      draggable : true ,
      slidesToShow : 1 ,
      infinite: false ,
      swipe: true ,
      autoplay: false
  });


  //---------------------------------------------------
  // ==> Remove question from list and slack slider
  //--------------------------------------------------
  $(".question-deletion").on("click",function(){
      // =====> Delete Question From Slider slick
       $('.question-lists').slick('slickRemove', 1);
  });

  //---------------------------------------------------
  // ==> Resorting items inside list
  //---------------------------------------------------

  var obj = {
      disabled : false
  }
  var sortable_items = document.getElementById("docQuestions")
  var sorted = Sortable.create(sortable_items, {
     ghostClass: 'shadow_element' ,
     group: "question-list" ,
     disabled: obj.disabled ,
     onStart : function (evt){
      // var targetEl = $(evt.item).hasClass("draggable-x");
     } ,
     onEnd : function (evt){
       // Sorting it into mongoDb

     }
   });
 //---------------------------------------------------
 // ==> geting sortable items from another list
 //---------------------------------------------------

 var qs_types = document.getElementById("qs-sortable");
 Sortable.create(qs_types, {
  ghostClass: 'shadow_element' ,
  sort : false ,
    group: {
      name: "question-list",
      pull: "clone",
      revertClone: false,
    } ,
    onEnd: function (evt) {
        // ======> Loader Page
        $(".editor-overlay").fadeIn();

          var itemEl = evt.item;  // dragged HTMLElement
          var parentElement = $("#docQuestions") ;
          var server_ip = $("#serverId_app").attr("serverIp");
          var target_qsType = $( itemEl ).attr("question-data");
          // ===> Storing data into UI
            $.ajax({
              url : server_ip + target_qsType,
              type : "GET",
              success : function (questionTypeElement){
                // Append Question Type !
                $(questionTypeElement).insertBefore( parentElement.children("li").eq(evt.newIndex));
              }
            });
            itemEl.remove();


          // ==> Storing data into mongodb
          var appId = $("#appId").attr("applicationId");
          var creatorId = $("#creatorId").attr("creatorId");
          var url = server_ip+"api/"+appId+"/question/create"
          var file = server_ip + "ext/js/json.app.keys.json";
          var qsType = $(itemEl).attr("data-question-type") ;
          var question_text ;
          if(qsType == 0 )
          question_text = "Write your multiple choices question text here !!";
          else if (qsType == 1 )
          question_text = "Write your media choices question text here !!";
          else if (qsType == 2)
          question_text = "Write your boolean question text here !!";
          setTimeout(function(){

          $.getJSON(file , function (api_keys){
              $.ajax({
                url:url,
                type :'PATCH',
                headers : {
                   "X-api-app-name":api_keys.APP_NAME,
                   "X-api-keys":api_keys.API_KEY ,
                   "Content-Type":undefined
                } ,
                data :{
                  "creator_id":creatorId,
                  "question_type": qsType,
                  "question_body":question_text
                },
                success : function (responseData){
                  var newSlide =
                   '<li class="question-tags slick-slide slick-current slick-active" data-slick-index="0" aria-hidden="false" tabindex="0" style="width: 70px;">'
                      +'<div class="quiz-qs-preview">'
                      +'<div class="question-head">'
                      +'<p>'
                      + responseData.Question_details.question_body
                      +'</p>'
                      +'<div class="clearFix"></div>'
                      +'</div>'
                      +'</div>'
                      +'<b>There are no answers here !</b> <a href="#">Add new answer</a></b>'
                      +'<div class="controller-btns">'
                      +'<button class="btn btn-danger-outline" type="button" name="button" tabindex="0">'
                      +'Back'
                      +'</button>'
                      +'<button style="margin-left:5px;" class="btn btn-primary-outline" type="button" name="button" tabindex="0">'
                      +'Continue'
                      +'</button>'
                      +'</div>'

                      +'</li>' ;

                      $('.question-lists').slick('slickAdd' ,  newSlide );
                }
            });
          });


          $(".editor-overlay").fadeOut();
          } , 2000 );

    }

  });


  $(".true-fals-yes-no-type").on("change", function (){
    var currVal = $(this).val(); // 0 => true-false  1 => yes-no
    // build the answer body according to
    // check if this question has an answer or not
    // edit the existing answer
    var appId = $("#x-app-id-x").val();
    var questionId = $("#x-question-id-x").val();
    var creatorIdx = $("#x-creator-id-x").val() ;
    var server_ip = $("#serverId_app").attr("serverIp");
    var apiUrl = server_ip +"api/" + appId +"/question/"+questionId+"/answer/create";

    var server_ip = $("#serverId_app").attr("serverIp");
    var jsonFile = server_ip + "ext/js/json.app.keys.json";
    $.getJSON(jsonFile , function (api_key_data){
      // ===> Get question from mongoDb
      var questionUrl =  server_ip+"api/"+appId+"/application/questions";
      $.ajax({
          url : questionUrl ,
          type : "POST" ,
          data : {
            "target_id": questionId ,
            "creator_id" : creatorIdx
          } ,
          headers : {
            "X-api-app-name": api_key_data.APP_NAME ,
            "X-api-keys"    : api_key_data.API_KEY ,
            "Content-Type"  : undefined
           } ,
           success :  function (questionResp) {
             var answer_delete = server_ip+"api/"+appId+"/question/"+questionId+"/answer/delete";
              if(  questionResp.answers_format.length > 0) {// create new
                $.ajax({
                   url : answer_delete ,
                   type : "PATCH" ,
                   data : {
                      "creator_id":creatorIdx,
                      "answer_id" : questionResp.answers_format[0]._id
                   } ,
                   headers : {
                     "X-api-app-name": api_key_data.APP_NAME ,
                     "X-api-keys"    : api_key_data.API_KEY ,
                     "Content-Type"  : undefined
                   } ,
                   success : function (deletedAnswer) {
                     console.log(deletedAnswer);
                   }
                 });
               }


               var answer_creation =  server_ip+"api/"+appId+"/question/"+questionId+"/answer/create";
               setTimeout(function(){
                 $.ajax({
                    url : answer_creation ,
                    type : "PATCH" ,
                    data : {
                      "boolean_type": ( currVal == 0 ) ? "true/false" : "yes/no",
                      "creator_id":creatorIdx,
                      "is_correct":false ,
                      "boolean_value":false
                    } ,
                    headers : {
                      "X-api-app-name": api_key_data.APP_NAME ,
                      "X-api-keys"    : api_key_data.API_KEY ,
                      "Content-Type"  : undefined
                    } ,
                    success : function (newAnswer) {
                      // Element Creation
                      var parentAnswers = $(".choices-part");
                      if (parentAnswers.children("li").length > 0) { // update
                        if( currVal == 0 )  { //"true/false"
                            parentAnswers.children("li").eq(0).children("div.text-answers").children("span").html("True");
                            parentAnswers.children("li").eq(1).children("div.text-answers").children("span").html("False");
                          } else { //"yes/no"
                          parentAnswers.children("li").eq(0).children("div.text-answers").children("span").html("Yes");
                          parentAnswers.children("li").eq(1).children("div.text-answers").children("span").html("No");
                        }
                      }else { // create
                        var   trueVal = "Yes" ;
                        var falseVal = "No" ;
                        if( currVal == 0 )  { //"true/false"
                              trueVal = "True" ;
                              falseVal = "False" ;
                        }

                        var booleanVals =
                        '<li>'
                           +'<ul class="answer-pt-controller ">'
                             +'<li data-toggle="asnwers-options" title="" data-original-title="Make it Correct Answer">'
                               +'<span class="fa fa-check"></span>'
                             +'</li>'
                           +'</ul>'
                           +'<div class="text-answers">'
                               +'<span class="text-field-inpu">'+trueVal+'</span>'
                           +'</div>'
                         +'</li>'

                         + '<li>'
                            +'<ul class="answer-pt-controller ">'
                              +'<li data-toggle="asnwers-options" title="" data-original-title="Make it Correct Answer">'
                                +'<span class="fa fa-check"></span>'
                              +'</li>'
                            +'</ul>'
                            +'<div class="text-answers">'
                                +'<span class="text-field-inpu">'+falseVal+'</span>'
                            +'</div>'
                          +'</li>';

                          parentAnswers.html(booleanVals);

                          }
                    }
                  });
               } , 50);
           }
        });
      }) ;


  });
  // ======================================
  // ========>>> Create New Answer
  // ======================================
  $(".add-new-answer-pt").on("click" , function (){
     var question_type = $("#x-question-type-x").val();
     if(question_type == ''){
       alert("You couldn't able add answer right now !");
       return false ;
     }

     var answer_part = '';
     var answer_val ;
     var server_ip = $("#serverId_app").attr("serverIp");
     var jsonFile = server_ip + "ext/js/json.app.keys.json";

     var appId = $("#x-app-id-x").val();
     var questionId = $("#x-question-id-x").val();
     var creatorIdx = $("#x-creator-id-x").val() ;
     var server_ip = $("#serverId_app").attr("serverIp");
     var apiUrl = server_ip +"api/" + appId +"/question/"+questionId+"/answer/create";
     // ==> Fill with default answers
     var dataString = new Object () ;
     dataString['creator_id'] = creatorIdx
     dataString['is_correct'] = false


     if(question_type == 0){// Image
       answer_val = "Write option answer here !"
       answer_part += '<li>';
       answer_part += '<ul class="answer-pt-controller ">';
       answer_part += '<li data-toggle="asnwers-options" title="Make it Correct Answer">';
       answer_part += '<span class="fa fa-check"></span>';
       answer_part += '</li>';
       answer_part += '<li data-toggle="asnwers-options" title="Edit it with media">';
       answer_part += '<span class="fa fa-pencil edit-options-answer"></span>';
       answer_part += '</li>';
       answer_part += '<li data-toggle="asnwers-options" title="Delete this answer">';
       answer_part += '<span class="fa fa-trash"></span>';
       answer_part += '</li>';
       answer_part += '</ul>';
       answer_part += '<div class="text-answers">';
       answer_part += '<input onKeydown="edit_text(this)" onKeyup="edit_text(this)" onChange="edit_text(this)" type="text" name="" value="'+answer_val+'" placeholder="Write new answer here !!">';
       answer_part += '</div>';
       answer_part += '</li>';

       // Append to element
     $(".choices-part").append(answer_part);
       // append to mongodb ( default creation api )
       dataString['choices_value'] = answer_val ;

     } else if (question_type == 1 ){ // Media
        answer_val = server_ip + "img/media-choices.jpg";
        answer_part += '<li>';
        answer_part += '<ul class="answer-pt-controller ">';
        answer_part += '<li data-toggle="asnwers-options" title="Make it Correct Answer">';
        answer_part += '<span class="fa fa-check"></span>';
        answer_part += '</li>';
        answer_part += '<li data-toggle="asnwers-options" title="Edit it with media">';
        answer_part += '<span class="fa fa-pencil edit-options-answer"></span>';
        answer_part += '</li>';
        answer_part += '<li data-toggle="asnwers-options" title="Delete this answer">';
        answer_part += '<span class="fa fa-trash"></span>';
        answer_part += '</li>';
        answer_part += '</ul>';
        answer_part += '<div class="text-answers">';
        answer_part += '<div style="    background-position: 50% 40% !important;background:url('+answer_val+')" class="media-answers"></div>';
        answer_part += '</div>';
        answer_part += '</li>';
        dataString['media_src'] = answer_val ;
        // Append to element
      $(".choices-part").append(answer_part);

     } else if (question_type == 2 ){ // true false

     } else if (question_type == 3 ){ // rating scale

     } else if (question_type == 4 ){ // free texts

     }
     console.log("------------------");
     console.log(question_type);
      console.log(dataString);


     // ==> Append it to Mongo db
     $.getJSON(jsonFile , function (api_key_data){

       $.ajax({
          url : apiUrl ,
          type : "PATCH" ,
          data : dataString ,
          headers : {
            "X-api-app-name": api_key_data.APP_NAME ,
            "X-api-keys"    : api_key_data.API_KEY ,
            "Content-Type"  : undefined
          } ,
          success : function (dataResponsed){
            console.log(dataResponsed);
            $("#x-curr-answer-id-x").val(dataResponsed._id);
          }
       });
     });

  }); // End Create new Answer




// ======================================
// ========>>> Edit new text value
// ======================================
  window.edit_text = function (thisInput){

    var val = $(thisInput).val();
    var questionId = $("#x-question-id-x").val();
    var creatorIdx = $("#x-creator-id-x").val() ;
    var targetAnswerX =  $("#x-curr-answer-id-x").val() ;
    var app_id = $("#x-app-id-x").val();

    var formObject = new FormData();

    var server_ip = $("#serverId_app").attr("serverIp");
    var apiUrl = server_ip+"api/"+app_id+"/question/"+questionId+"/answer/edit"

    var server_ip = $("#serverId_app").attr("serverIp");
    var jsonFile = server_ip + "ext/js/json.app.keys.json";

    $.getJSON(jsonFile , function (api_key_data){
      // alert(creatorIdx);
      $.ajax({
        url : apiUrl ,
        type:"PATCH",
        data : {
          "creator_id":creatorIdx,
          "answer_id" :targetAnswerX ,
          "choices_value": val
        },
        headers : {
          "X-api-app-name": api_key_data.APP_NAME ,
          "X-api-keys"    : api_key_data.API_KEY ,
          "Content-Type"  : undefined
        },
        success : function (responsedItems){
          // console.log(responsedItems);
        }
      });
    });
  }; // End Edit text Value


});
