
apps.controller("apps-controller" , ['$scope','$http' , '$timeout' , function ($scope , $http , $timeout){

  //--------------------------------------------------------
  // ==>  Callback Finder
  //--------------------------------------------------------
  $scope.question_id = null ;
  $scope.callback_index = function (object){
    return object._id == $scope.question_id ;
  };
  $scope.question_tag = "Data Editor";

  //--------------------------------------------------------
  // ==>  Default Values
  //--------------------------------------------------------
   $scope.server_ip = $("#serverIp").val();
   $scope.user_id = $("#userId").val();
   $scope.app_id = $("#applicationId").val();

   $scope.mongoose_id = null;
   $scope.mongoose_answer_id = null;
   $scope.mongoose_date = null;

   // -------------------------------------------------------
   // ==>  Question Action ( Trash - Edit )
   // -------------------------------------------------------
   $scope.quesion_actions = "<ul class='question-option'>"+
    "<li class='right' style='opacity: 0;'>"+
      "<i style='cursor:pointer;' class='fa fa-trash iconx-trashable question-deletion'></i>" // for trash
      +
    "</li>"
      +
    "<li class='right' style='opacity: 0;'>"
      +
      "<i style='cursor:pointer;' class='fa fa-pencil iconex-movable'></i>" // for edit
    +"</li>"
   +"</ul>";

   //--------------------------------------------------------
   // ==>  api urls
   //--------------------------------------------------------
   $scope.api_url_current_app         = $scope.server_ip + "api/"+$scope.app_id+"/application/retrieve"
   $scope.json_apk_file               = $scope.server_ip + "ext/json/json-keys.json";
   $scope.api_url_create_question     = null;
   $scope.api_url_delete_question     = $scope.server_ip + "api/"+$scope.app_id+"/question/delete";
   $scope.api_url_edit_question       = null;
   $scope.api_url_create_answer       = null;
   $scope.api_url_delete_answer       = null;
   $scope.api_url_edit_answer         = null;
   $scope.api_url_init_id_date        = $scope.server_ip + "api/generate/new/data";
   $scope.api_url_question_creation   = $scope.server_ip + "api/" + $scope.app_id + "/question/creation"

   // -------------------------------------------------------
   // ----> Init current App
   // -------------------------------------------------------
   $scope.questions_list = null ; // loading questions here from mongoDB
   $scope.application_settings = null ;
   $scope.application_stylesheet = null ;
   $.getJSON( $scope.json_apk_file , function (api_key_data ){
       $http({
             method : "POST" ,
             url    : $scope.api_url_current_app ,
             headers: {
               "X-api-keys": api_key_data.API_KEY,
               "X-api-app-name": api_key_data.APP_NAME
             },
             data: {
               creator_id : $scope.user_id
             }
          }).then(function(resp){
            // Questions
            $scope.questions_list = resp.data.questions;
            // Settings
            $scope.application_settings =  resp.data.settings;
            // Stylesheets
            $scope.application_stylesheet =  resp.data.theme_style;

          },function(err){
       });
   }); // End Json Data

      // ==> to find question by id
      //  $timeout(function (){
      //    $scope.question_id = "5a87024f41355238299396ae";
      //    console.log($scope.questions_list.find($scope.callback_index));
      //  } , 300 );

   //--------------------------------------------------------
   // ==> Sliding editor elements to show question details
   //--------------------------------------------------------
   $scope.slide_edditor_slices = $(".x-editor-x-title");
   $scope.slide_edditor_slices.on("click",function (){
      var targetId = $(this).attr('data-toggle');
      var targetAll = $(".x-editor-x-body").height() ;
      var targetH = $(targetId).height() ;
      $(targetId).slideToggle();
   });

   //--------------------------------------------------------
   // ==> Delete Question
   //--------------------------------------------------------
   $scope.delete_this_question = function(questionId){

     $(".qs-delete-"+questionId).removeClass("fa-trash");
     $(".qs-delete-"+questionId).addClass("fa-refresh fa-spin tomato-font");
      var element = $(".qs-"+questionId);
      element.css({background:"rgba(255, 99, 71, 0.4)" , color:"rgba(255, 99, 71, 0.4)" , border:"1px solid rgba(255, 99, 71, 0.7)"});
      $(".fa-spin").css("color","tomato");
      $(".fa-spin").parent("li").css({border:"1px solid rgba(255, 99, 71, 0.7)"});

     $.getJSON($scope.json_apk_file , function(api_key_data){
       $timeout(function (){
         $http({
              method : "PATCH",
              url : $scope.api_url_delete_question ,
              headers: {
      					"X-api-keys": api_key_data.API_KEY,
      					"X-api-app-name": api_key_data.APP_NAME
    				  },
              data : {
                creator_id  : $scope.user_id ,
                question_id : questionId
              }
          }).then(function(resp){
            console.log("-----------------------------");
            console.log(element.prop("className"));
            console.log("-----------------------------");
            //  element.addClass("animated rotateOutUpLeft");//rollOut

             // Delete From angular array
             $scope.question_id = questionId ;
             element.addClass("animated rotateOutUpLeft");//rollOut
             $timeout(function(){
                element.remove();
                var found_qs = $scope.questions_list.find($scope.callback_index);
                var targetIndex = $scope.questions_list.indexOf(found_qs);
                if(targetIndex != -1 ){
                  $scope.questions_list.splice(targetIndex, 1);
                }
             },1000);
          },function(err){
            console.log(err);
          });
       }, 1200 );
     });
   };

   //--------------------------------------------------------
   // ==> Create Question
   //--------------------------------------------------------
   // Sorting the exisitng questions
   $scope.sort_handler = document.getElementById("docQuestions");
   Sortable.create($scope.sort_handler , {
     ghostClass: 'shadow_element' ,
     group: "question-list" ,
     disabled: false ,
     onStart : function (evt){
       console.log(evt.item);
      // var targetEl = $(evt.item).hasClass("draggable-x");
     } ,
     onEnd : function (evt){

       var itemEl = evt.item;  // dragged HTMLElement
       var newIndex = evt.newIndex ;
       var oldIndex = evt.oldIndex ;
       $scope.question_id = $(itemEl).attr("data-question-id");
       var question_sor = $scope.questions_list.find($scope.callback_index);

       // store values
       var newPosition = question_sor;
       // remove old index
       $scope.questions_list.splice(oldIndex, 1);
       // relocate new position
       $scope.questions_list.splice(newIndex ,0,  newPosition );
       // Save change in db
       $.getJSON($scope.json_apk_file , function(api_key_data){
         $http({
               url   : $scope.api_url_question_creation ,
               method : "PATCH",
               data  : {
                 "sorted_question": $scope.questions_list ,
                 "creator_id":$scope.user_id
               } ,
               headers: {
                 "X-api-keys": api_key_data.API_KEY,
                 "X-api-app-name": api_key_data.APP_NAME
               }
             }).then(function(resp){

             },function(err){
               console.log(err);
             });
       });
     }
   }); // end sortable
   // Add New Quiz
   $scope.sortble_draggable_handler = document.getElementById("qs-sortable");
   Sortable.create($scope.sortble_draggable_handler , {
     ghostClass: 'shadow_element' ,
     sort: false,
     group: {
        name: "question-list",
        pull: "clone",
        revertClone: false,
     },
     onStart : function (evt){
       // ---------------------------------------------------
       // ------->> Get Id from mongoDB
       // ---------------------------------------------------
       $http({
           url : $scope.api_url_init_id_date ,
           method : "GET"
         }).then(function(resp){
           $scope.mongoose_id = resp.data.id;
           $scope.mongoose_answer_id = resp.data.id_1;
           $scope.mongoose_date = resp.data.date;;
         },function(err){
           console.log(err);
       });

      var qsLength = $("#docQuestions").children("li").length ;
      if(qsLength == 0 ){
        $("#docQuestions").css({
          minHeight:"20px" ,
          background:"#eee"
        });
      }


     } ,
     onEnd : function (evt){
        var htmlVal = $("#docQuestions ").find(evt.item);
        $("#docQuestions").css({
          background :"#fff"
        });


          // ---------------------------------------------------
          // ------->> push and update indexes in array
          // ---------------------------------------------------
          var itemType = $(evt.item).attr('data-type');
          var questionType = $(evt.item).attr('data-question-type');
          var new_question = {
            _id:$scope.mongoose_id,
            question_type :questionType,
            question_body :"Edit Model",
            created_at :$scope.mongoose_date,
            answer_settings : {
                answer_char_max : 200 ,
                choice_style : "inline" ,
                is_randomized : false,
                is_required : false,
                single_choice : true,
                super_size : false
            },
            answers_format : []
          };
          // Push Default answer ( one answer )
          var answer_obj = new Object() ;
          // answer_obj['creator_id'] = $scope.user_id ;
          answer_obj['is_correct'] = false ;
          answer_obj['_id'] = $scope.mongoose_answer_id  ;
          if(questionType == 0 ){
            answer_obj['value'] = 'Answer 1';
          }
          if(questionType == 1 ){
            answer_obj['media_src'] = $scope.server_ip + "img/media-icon.png";
          }
          if(questionType == 2 ){
            answer_obj['boolean_type'] = "true/false";
            answer_obj['boolean_value'] = false;

            new_question.answers_format.push({
              '_id': $scope.mongoose_answer_id.toString()+'12f',
              'creator_id' : $scope.user_id ,
              'is_correct' : true ,
              'boolean_type' : "true/false" ,
              'boolean_value': true
            });
          }
          new_question.answers_format.push(answer_obj);
          //-----------------------------
          if($scope.mongoose_id == null ){

            // ---------------------------------------------------
            // ------->> Get Id from mongoDB
            // ---------------------------------------------------
            $http({
                url : $scope.api_url_init_id_date ,
                method : "GET"
              }).then(function(resp){
                new_question['_id'] = resp.data.id;
                new_question['created_at'] = resp.data.date;;

                new_question.answers_format[0]['_id'] = resp.data.id_1;
                if(questionType == 2 ){
                  new_question.answers_format[1]['_id'] = resp.data.id_1+'12fd';
                }
              },function(err){
                console.log(err);
            });

          }

          // ---------------------------------------------------
          // ------->>>>> Mongo Database
          // ---------------------------------------------------
          $timeout(function (){
            // Push to array w index
            var index_in_array = evt.newIndex;
            $scope.questions_list.splice(index_in_array,0, new_question );

            htmlVal.find("ul.question-option").find("li.right").addClass("animated bounceIn");
            htmlVal.remove();

            if(itemType == 'qst'){ //=> Question
              $.getJSON($scope.json_apk_file , function(api_key_data){
                $http({
                      url   : $scope.api_url_question_creation ,
                      method : "PATCH",
                      data  : {
                        "sorted_question": $scope.questions_list ,
                        "creator_id":$scope.user_id
                      } ,
                      headers: {
              					"X-api-keys": api_key_data.API_KEY,
              					"X-api-app-name": api_key_data.APP_NAME
            				  }
                    }).then(function(resp){
                      console.log(resp);
                    },function(err){
                      console.log(err);
                    });
              });
            }
            if(itemType == 'text'){ //=> Welcome / close message

            }
          } , 300 );

          // ---------------------------------------------------
          // ------->>>>> Ui Design
          // ---------------------------------------------------

          // build current element
          // htmlVal.find("span.titles").html("Edit Model");
          // // build action handler
          // htmlVal.append($scope.quesion_actions);
          // // Add animation for this question
          // htmlVal.find("ul.question-option").find("li.right").addClass("animated bounceIn");

      //  } , 300);

     },
   }); // end sortable draggable


  //--------------------------------------------------------
  // ==> Edit Current Question     color: #89d7d7;
  //--------------------------------------------------------
  $scope.edit_this_question = function ( qs_id ){
     $scope.question_id = qs_id ;
    // qs-edit-'+qs_id
    $(".qs-edit-"+$scope.question_id).removeClass("fa-pencil");
    $(".iconex-movable").each(function(){
      if($(this).hasClass("fa-cog")){
        $(this).removeClass("fa-cog fa-spin");
        $(this).addClass("fa-pencil");
        $(this).css({color:"tan"});
      }
    });
    $(".qs-edit-"+$scope.question_id).css({"color":"#89d7d7"});
    $(".qs-edit-"+$scope.question_id).addClass("fa-cog fa-spin -font");
    $(".question-li-x").removeClass("highlighted-question");


    $(".qs-"+$scope.question_id).addClass("highlighted-question");
    // highlighted-question

    // =====================================> Edit in array
    var taget_question = $scope.questions_list.find($scope.callback_index);
    console.log("This Question For Edit !!");
    console.log(taget_question);
    //---------------------------------------
    // setup data of question into ui design
    //---------------------------------------
    // 1- question
    $scope.question_body = taget_question.question_body;
    $scope.question_description = taget_question.question_description;
    $scope.question_id = taget_question._id;
    $scope.question_type = taget_question.question_type;
    // 2- answers
    $scope.asnwers = taget_question.answers_format
    // 3 settings
  }; // edit curr question

}]);
