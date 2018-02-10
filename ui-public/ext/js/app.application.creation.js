$(document).ready(function(){
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
      var targetEl = $(evt.item).hasClass("draggable-x");
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
        setTimeout(function(){
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
                      +'<button class="btn btn-primary-outline" type="button" name="button" tabindex="0">'
                      +'Continue'
                      +'</button>'
                      +'</div>'

                      +'</li>' ;

                      $('.question-lists').slick('slickAdd' ,  newSlide );
                }
            });
          });
          itemEl.remove();
          $(".editor-overlay").fadeOut();
        } , 2000 );

    }

  });
});
