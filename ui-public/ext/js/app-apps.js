
apps.controller("apps-controller" , ['$scope','$http' , '$timeout' , function ($scope , $http , $timeout){

  //--------------------------------------------------------
  // ==>  Callback Finder
  //--------------------------------------------------------
  $scope.question_id = null ;
  $scope.callback_index = function (object){
    return object._id == $scope.question_id ;
  };

  $scope.answer_id = null ;
  $scope.callback_answer_index = function (object){
    return object._id == $scope.answer_id ;
  };



  $scope.question_tag = "Data Editor";
  $scope.indexes = 1 ;
  $scope.labels = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'm',
    'l',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ];
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

   //--------------------------------------------------------
   // ==>  Default Settings
   //--------------------------------------------------------
    $scope.unique_ids = null ;
    $scope.question_settings = {
     is_required           : false ,
     single_choice  : false ,
     is_randomized          : false ,
     super_size         : false
    }

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
            // console.log("-----------------------------");
            // console.log(element.prop("className"));
            // console.log("-----------------------------");
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
      //  console.log(evt.item);
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
           $scope.unique_ids = resp.data.list_of_ids ;

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
                $scope.unique_ids = resp.data.list_of_ids ;
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
            $scope.edit_this_question(new_question._id);

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

                      // $scope.questions_list = resp.questions;

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
     $scope.indexes = 1 ;
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
         $scope.unique_ids = resp.data.list_of_ids ;

       },function(err){
         console.log(err);
     });

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
    // console.log("This Question For Edit !!");
    if(taget_question.answers_format.length > 1){
      $scope.indexes = taget_question.answers_format.length ;
    }



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
    // 3 Question settings
    $scope.question_settings = {
      is_required           : taget_question.answer_settings.is_required ,
      single_choice   : taget_question.answer_settings.single_choice ,
      is_randomized          : taget_question.answer_settings.is_randomized ,
      super_size         : taget_question.answer_settings.super_size
    }

  }; // edit curr question


  // =====================================
  // ===> Question Settings
  // =====================================
  $("#MultipleResponse-option , #Randomize-option , #SuperSize-option , #required-option").on("change",function(){
     // sotre settings in array => $scope.question_id
     var question_selected = $scope.questions_list.find($scope.callback_index);
     question_selected.answer_settings = $scope.question_settings ;
    //  question_selected.answer_settings =
     // Remove the current list from array
     var targetIndex = $scope.questions_list.indexOf(question_selected);
     if(targetIndex != -1 ){
       $scope.questions_list.splice(targetIndex, 1);
     }
     // ==============================
    //  alert(question_selected.answer_settings.single_choice);
     if(question_selected.answer_settings.single_choice == true ) {
       var all_answers = question_selected.answers_format;
       for (var i = 0; i < all_answers.length; i++) {
           all_answers[i].is_correct = false;
       }
     }
     console.log(question_selected);


     // Push to array with index
     $scope.questions_list.splice(targetIndex, 0, question_selected);

    //  console.log($scope.questions_list);
  });
  // =====================================
  // ===> Answer Creation
  // =====================================
  $scope.create_new_answer = function (){

    if($scope.question_id == null ){
      alert("Please select question from question list");
    }

    var question_selected = $scope.questions_list.find($scope.callback_index);
    var answer_length = question_selected.answers_format.length ;

    $scope.indexes = answer_length+1;
    if($scope.unique_ids[$scope.indexes] == undefined)
    {
      $(".add-new-option").css({
        background : "rgba(221,34,34,0.24)" ,
        color : '#ff5252'
      });
      $(".add-new-option").html("You couldn't able create more answers !!");
      return false ;
    }
    var new_answer = {
         is_correct: false,
         _id : $scope.unique_ids[$scope.indexes]
       };

       if($scope.question_type == 0 )
          new_answer['value'] = "Answer " + $scope.indexes;

       if( $scope.question_type == 1 )
        new_answer['media_src'] = $scope.server_ip + "img/media-icon.png" ;

         question_selected.answers_format.push(new_answer);
         console.log($scope.questions_list);

  };

  // ============================================
  // =====>> Delete Answers from array
  // ============================================
  $scope.question_answer_deletion = function (answer_id){
    // ==> This Answer
    $scope.answer_id = answer_id ;
    var question_selected = $scope.questions_list.find($scope.callback_index);
    var answer_selected = question_selected.answers_format.find($scope.callback_answer_index);

    // let's excute our func here
    var targetIndex = question_selected.answers_format.indexOf(answer_selected);
    if(targetIndex != -1 ){
      question_selected.answers_format.splice(targetIndex, 1);
    }
  };



  // ============================================
  // =====>> Mark this answer as a right
  // ============================================
  $scope.question_answer_mark_it_correct = function (answer_id){
    // ==> This Answer
    $scope.answer_id = answer_id ;
    var question_selected = $scope.questions_list.find($scope.callback_index);
    var answer_selected = question_selected.answers_format.find($scope.callback_answer_index);

    if( question_selected.question_type == 2 ){
      var all_answers = question_selected.answers_format;
      for (var i = 0; i < all_answers.length; i++) {
        all_answers[i].is_correct = false;
      }
      answer_selected.is_correct = !answer_selected.is_correct ;

      return false ;
    }
    // let's excute our func here
    if(question_selected.answer_settings.single_choice == true ) { // only one response
      var all_answers = question_selected.answers_format;
      for (var i = 0; i < all_answers.length; i++) {
        all_answers[i].is_correct = false;
      }
      answer_selected.is_correct = !answer_selected.is_correct ;
    }else { // multiple response
      answer_selected.is_correct = !answer_selected.is_correct ;
    }


  };
  // ============================================
  // =====>> Edit Question Text
  // ============================================
  $("#editor-question-body").on('keydown change keypress keyup' , function (){
    var question_value = $(this).val();
    if($scope.question_id == null )
      {
        alert("please select question to edit it first !");
        return false ;
      }

    // Select Question From Array
      var question_selected = $scope.questions_list.find($scope.callback_index);
      question_selected.question_body = question_value;

  });

  // ============================================
  // =====>> Question Description
  // ============================================

  $("#editor-question-desc").on('keydown change keypress keyup' , function (){
    var question_value = $(this).val();
    if($scope.question_id == null )
      {
        alert("please select question to edit it first !");
        return false ;
      }

    // Select Question From Array
      var question_selected = $scope.questions_list.find($scope.callback_index);
      question_selected.question_description = question_value;
      console.log(question_selected);
  });



  // ==============================================================
  // =====>> Save Changes that completed in angular backend
  // ==============================================================
  $scope.save_changes_in_angular_backend = function (){
    if($scope.question_id == null ){
      alert("You should select question from question list to allow you edit it");
      return false ;
    }
    var changes_button = $(".save_changes");
    changes_button.html("Saving Changes ....");



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
            changes_button.html("Save Changes");

          },function(err){
            console.log(err);
          });
    });

  }
}]);
