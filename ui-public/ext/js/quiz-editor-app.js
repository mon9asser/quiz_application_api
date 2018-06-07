var apps = angular.module("app-quiz" , []);
apps.config([
  "$interpolateProvider" , "$qProvider" ,
  function($interpolateProvider , $qProvider) {
      $interpolateProvider.startSymbol('{>');
      $interpolateProvider.endSymbol('<}');
      $qProvider.errorOnUnhandledRejections(false);
  }
]);
apps.filter('strip_html_tags' , [() => {
  return (specs) => {
    var html_element = $("<span>" + specs +"</span>");
    var text_values = html_element.text();
    var char_counts = 35 ;
    var dotted = '';
    if(text_values.length > char_counts ) dotted = '...'
    var chars = text_values.substring( 0 , char_counts );
    return chars + ' ' + dotted ;
  };
}]);
apps.controller("page-controller" , [
  "$scope", "$timeout" , "$http",
   ( $scope , $timeout , $http) => {
     // ==> Start Application From Here !

     /* => Variables */
     $scope.user_id = $("#userId").val();
     $scope.server_ip = $("#serverIp").val();
     $scope.app_id = $("#applicationId").val(); ;
     $scope.application = new Object();
     $scope.api_keys = new Object();
     $scope.unique_items = new Object();
     $scope.question = null ;
     /* => Selectors */


     /* => API urls */
     $scope.json_apk_file  = $scope.server_ip + "ext/json/json-keys.json";
     $scope.application_data_api_uri = $scope.server_ip + "api/"+$scope.app_id+"/application/retrieve" ;
     $scope.uniqu_id_api_uri = $scope.server_ip + "api/generate/new/data";
     $scope.question_creation_uri = $scope.server_ip + "api/" + $scope.app_id + "/question/creation";

     /* => functionalities */
     $scope.loading_application_data = () => {
       $http({
         method : "GET" ,
         url    : $scope.application_data_api_uri ,
         headers : $scope.api_keys
       }).then(function( app_data ){
         /* => Application Object*/
         $scope.application = app_data.data;
         $scope.question = ( app_data.data.questions.length > 0) ? app_data.data.questions[0] : null ;
         console.log( $scope.application);
       } , function(error){
         console.log(error);
       });
     }
     $scope.generate_unique_ids = () => {
       alert($scope.uniqu_id_api_uri);
       $http({
          url : $scope.uniqu_id_api_uri ,
          method : "GET"
       }).then(function( provider ){
         console.log({provider : provider.data});
         $scope.unique_items['mongoose_id'] = provider.data.id;
         $scope.unique_items['mongoose_answer_id'] = provider.data.id_1;
         $scope.unique_items['mongoose_date'] = provider.data.date;
       } , function(err){
         console.log({err : err});
       });
     }
     $scope.edit_this_question = ( question_id , index ) => {
       var question_index = $scope.application.questions.findIndex(x => x._id == question_id );
       if(question_index != -1){
         // ==> Question Object
         $scope.question =  $scope.application.questions[question_index];
         // ==> Mark current question with highlighted-question class
         $scope.highlight_this_question();
       }
     }
     $scope.highlight_this_question = () => { // .highlighted-question
         var question_list = $("#docQuestions");
      //  var question = $('#questoin_tag_' + );
      //  console.log(question_list.children(question));
      var question_index = $scope.application.questions.findIndex(x => x._id == $scope.question._id);
      question_list.children("li").removeClass('highlighted-question');
      if(question_index != -1)
        question_list.children("li").eq(question_index).addClass('highlighted-question');

      //  question_list.children(question).addClass('highlighted-question');
     }
     $scope.drop_question_into_list = (evt) => {
       var itemEl = evt.item;
       var newIndex = evt.newIndex;
       var oldIndex = evt.oldIndex;


       // => Html Values
       $("#docQuestions").css({background : "transparent"});

       // => Build default data of question
       $timeout(function(){
         // => Givines with attributes
         var html_built_in = $("#docQuestions").find(evt.item);
         var item_type = html_built_in.attr("data-type");
         var question_type = $(evt.item).attr("data-question-type");
         var question_id = html_built_in.attr("data-question-id");

         // => Question Data
         var question_data = new Object();
         question_data['_id'] = $scope.unique_items.mongoose_id;
         question_data['question_type']= question_type ;
         question_data['question_body']= "Add your question here !";
         question_data['enable_description']= false;
         question_data['created_at'] = $scope.unique_items.mongoose_date;
         question_data['answer_settings']= new Object();
         question_data['answers_format']= new Array();
         // => Answer Data
         var another_answer_id = $scope.unique_items.mongoose_answer_id + '15fc'
         var answer_data = new Object();
         if($scope.application != null && $scope.application.app_type == 1 )
         answer_data['is_correct'] = false ;
         answer_data['_id'] =  $scope.unique_items.mongoose_answer_id;

         // => Build default answers according to question type
         if( question_type == 0 ) answer_data['value'] = "Answer 1";
         if( question_type == 1 ) { answer_data['media_type'] = 0; answer_data['media_src'] =  $scope.server_ip + "img/media-icon.png"; }
         if( question_type == 2 ) {
             answer_data['boolean_type']= "true/false" ;
             answer_data['boolean_value'] = false;
             question_data.answers_format.push({
               _id: another_answer_id,
               is_correct : true ,
               boolean_type : "true/false",
               boolean_value : true
             });
         }
         if( question_type == 3 ) {
           alert("inProgress");
         }
         if( question_type == 4 ) {
           alert("inProgress");
         }
         // ==> Storing question object into application
         question_data.answers_format.push(answer_data);
         if( $scope.application.questions == undefined ) $scope.application['questions'] = new Array();
        //  if( $scope.application.questions == undefined ) $scope.application['stored_questions'] = new Array();

         // ==> Add to question list
         $scope.application.questions.push(question_data);
        //  $scope.application.stored_questions.push(question_data);


         // ==> Storing object
         $scope.question = question_data ;

         // ==> Setup question lists => $scope.question_creation_uri
         $scope.storing_questions_into_db();

       } , 100);
     }
     $scope.storing_questions_into_db = () => {
       $http({
         url: $scope.question_creation_uri ,
         method : "PATCH",
         data : {
           "sorted_question": $scope.application.questions ,
           "creator_id":$scope.user_id
         },
         headers : $scope.api_keys
       }).then(function( provider ){
             $scope.highlight_this_question ();
       } , function(){});
     };
     $scope.sorting_items = () => {
        Sortable.create( document.getElementById("qs-sortable") , {
           sort: false,
           disabled: false,
           animation: 180 ,
           group : {
             name: "question-list",
             pull: "clone",
             revertClone: false
           } ,
           onStart : () => {
             // => Generate new Ids
             $scope.generate_unique_ids();
             // => Highlighting question place
             var qsLength = $("#docQuestions").children("li").length ;
             if(qsLength == 0 ){
               $("#docQuestions").css({ minHeight:"20px" , background:"ghostwhite" });
             }
           },
           onEnd   : (evt) => {
              // => Drop question into question list
              $scope.generate_unique_ids();
              $timeout(function(){
                // => Drop question into question list
                $scope.drop_question_into_list(evt);
                // => Remove Highlighting
                var html_built_in = $("#docQuestions").find(evt.item);
                html_built_in.remove();

                console.log(  $scope.unique_items.mongoose_answer_id );
              } , 500 );
           },
           onMove  : (evt) => {
              // => Build Quztion ui list
              var dragged = evt.dragged;
              var draggedRect = evt.draggedRect;
              var related = evt.related;
              var relatedRect = evt.relatedRect;
              var ParentID = $(dragged).parent().prop("id");
              var ParentEl = $(dragged).parent();
              if(ParentID == "qs-sortable") {
                ParentEl.find(dragged).html("");
                ParentEl.find(dragged).addClass("animated wobble");
                ParentEl.find(dragged).css({ minHeight : '40px' , background : "ghostwhite" });
              }
           }
        });
        Sortable.create( document.getElementById("docQuestions") , {
          group: "question-list" ,
          ghostClass: 'shadow_element' ,
          disabled: false ,
          animation: 250 ,
          handle: '.drag-handler' ,
          onStart : () => {}  ,
          onEnd   : ( evt ) => {
            alert();
            var itemEl = evt.item;
            var newIndex = evt.newIndex;
            var oldIndex = evt.oldIndex;
            // current question
            var newPosition = $scope.question;
            // remove old index
            $scope.application.questions.splice( oldIndex , 1 );
            // relocate new position
            $scope.application.questions.splice( newIndex , 0 ,  newPosition );
            // Save it into our database
            $scope.storing_questions_into_db();
          }
        });
     };
     $scope.init = () => {

       // ==> Load APi Keys
       $.getJSON( $scope.json_apk_file , ( data ) => {
          $scope.api_keys['X-api-keys'] = data.API_KEY ;
          $scope.api_keys['X-api-app-name']  = data.APP_NAME ;
       });

       // ==> Do an actions here
       $timeout(function(){
         $scope.loading_application_data();
         $scope.sorting_items();
       } , 200);
     }
     $scope.onclick_items = (question_type , id)=>{

        var evt = {
            item :  $("#"+id),
            newIndex :  ( $("#docQuestions li" ).length > 0 ) ? $("#docQuestions li" ).length  : 0
        };
      $scope.drop_question_into_list(evt)
     }


     /* => Execute all functionalities*/
     $scope.init();


     // ==> End App Controller Here
   }]);
