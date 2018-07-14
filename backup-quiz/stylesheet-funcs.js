// =======================================================
  // =========>>>> Editor Work !
  // =======================================================
  // ==> Loading Current styles


  $scope.stylesheet = {
      current_selector : "player_opg_editor"  ,
      old_selector : "player_opg_editor" ,
      selector : function ( ){
            ($(this.old_selector).hasClass("outlined_blocks")) ? $(this.old_selector).removeClass("outlined_blocks"):'';
             $(this.current_selector).addClass("outlined_blocks");
      }   , // => Show Body By Default

      // ==> All selector
      selected_items : $(".player_opg_editor , .screen_opg_editor , .question_opg_editor , .question_opg_editor_block , .answer_opg_editor ") ,
      // ==> ALl Properties
      property_block : $(".background-property-block , .color-property-block , .numbering-property-block , .font-family-property-block , .font-size-property-block , .font-type-property-block , .border-property-block") ,

      // ==> ALl Blocks in css
      player_page :$(".background-property-block, .font-family-property-block") ,
      screens :$(".background-property-block, .border-property-block") ,
      slider_box : $(".background-property-block, .border-property-block") ,
      question_box : $(".background-property-block,.border-property-block ,.font-family-property-block , .font-size-property-block , .font-type-property-block , .color-property-block , .numbering-property-block"),
      answer_box : $(".border-property-block ,.font-family-property-block ,.font-size-property-block ,.font-type-property-block , .color-property-block ,  .numbering-property-block ") ,

      // ==> Stored Array & objects
      applied_stylesheets : new Array ()
  };
  $scope.stylcheet_properties = () => {

  };
  $scope.block_selector =  () => {
    var elements_selected_before = $(".outlined_blocks");
    $scope.stylesheet.property_block.css({display:"none"});

    if( elements_selected_before.length ){
       elements_selected_before.removeClass('outlined_blocks');
       $scope.stylesheet.old_selector = elements_selected_before.prop('className').split(" ").pop();
       if($scope.stylesheet.old_selector == 'ng_block')
         {
           var thisElement = elements_selected_before.prop('className').split(" ");
           $scope.stylesheet.old_selector = thisElement[thisElement.length - 2];
         }
    }

    if($scope.editor_page == 0 ){// => Player Page
      $scope.stylesheet.current_selector = "body";
      $scope.stylesheet.player_page.css({display:"block"});
    }
    if($scope.editor_page == 1 ){//=> Screens
      $scope.stylesheet.current_selector = "screen_opg_editor";
      $scope.stylesheet.screens.css({display:"block"});

      if($scope.slide_screens != null && $scope.slide_screens != undefined)
      $scope.slide_screens.slideTo(0);

    }
    if($scope.editor_page == 2 ){//=> Slide Box
      $scope.stylesheet.current_selector = "question_opg_editor_block";
      $scope.stylesheet.slider_box.css({display:"block"});

      if($scope.slide_screens != null && $scope.slide_screens != undefined)
      $scope.slide_screens.slideTo(1);


      // => Border
      var borders = $( '.'+ $scope.stylesheet.current_selector).css('border') ;
      console.log(borders);
    }
    if($scope.editor_page == 3 ){//=> Question Box
      $scope.stylesheet.current_selector = "question_opg_editor";
      $scope.stylesheet.question_box.css({display:"block"});

      if($scope.slide_screens != null && $scope.slide_screens != undefined)
      $scope.slide_screens.slideTo(1);
    }
    if($scope.editor_page == 4 ){//=> Answer Box
      $scope.stylesheet.current_selector = "answer_opg_editor";
      $scope.stylesheet.answer_box.css({display:"block"})

      if($scope.slide_screens != null && $scope.slide_screens != undefined)
      $scope.slide_screens.slideTo(1);
    }

   // ==> Excute
   $('.'+$scope.stylesheet.current_selector).addClass("outlined_blocks");

  };


  $scope.apply_stylesheets = (property) => { // data-property
    if(property == 'background'){
      var background = $scope.background_property ;

      if( $scope.stylesheet.current_selector == 'body' ){
        $("body").css("background" , background );
      }

      if( $scope.stylesheet.current_selector == 'screen_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("background" , background );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor_block' ){
        $('.'+$scope.stylesheet.current_selector).css("background" , background );

      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("background" , background );
      }

    }
    if(property == 'border-color'){
      if( $scope.stylesheet.current_selector == 'screen_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-color" , $scope.border_color_property );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor_block' ){
        $('.'+$scope.stylesheet.current_selector).css("border-color" , $scope.border_color_property );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-color" , $scope.border_color_property );
      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ) {
        $('.'+$scope.stylesheet.current_selector).css("border-color" , $scope.border_color_property );
      }

      $scope.border_color_property
    }
    if(property == 'border-left-width'){
      // alert($scope.border_width_property_left);
      // alert($scope.border_width_property_left);
      if( $scope.stylesheet.current_selector == 'screen_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-left-width" , $scope.border_width_property_left );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor_block' ){
        $('.'+$scope.stylesheet.current_selector).css("border-left-width" , $scope.border_width_property_left );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-left-width" , $scope.border_width_property_left );
      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ) {
        $('.'+$scope.stylesheet.current_selector).css("border-left-width" , $scope.border_width_property_left );
      }
    }
    if(property == 'border-left-style'){
      //  alert($scope.border_type_property_left);
      if( $scope.stylesheet.current_selector == 'screen_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-left-style" , $scope.border_type_property_left );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor_block' ){
        $('.'+$scope.stylesheet.current_selector).css("border-left-style" , $scope.border_type_property_left );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-left-style" , $scope.border_type_property_left );
      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ) {
        $('.'+$scope.stylesheet.current_selector).css("border-left-style" , $scope.border_type_property_left );
      }
    }
    if(property == 'border-right-width'){
      $scope.border_width_property_right
      if( $scope.stylesheet.current_selector == 'screen_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-right-width" , $scope.border_width_property_right );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor_block' ){
        $('.'+$scope.stylesheet.current_selector).css("border-right-width" , $scope.border_width_property_right );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-right-width" , $scope.border_width_property_right );
      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ) {
        $('.'+$scope.stylesheet.current_selector).css("border-right-width" , $scope.border_width_property_right );
      }
    }
    if(property == 'border-right-style'){
      $scope.border_type_property_right
      if( $scope.stylesheet.current_selector == 'screen_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-right-style" , $scope.border_type_property_right );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor_block' ){
        $('.'+$scope.stylesheet.current_selector).css("border-right-style" , $scope.border_type_property_right );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-right-style" , $scope.border_type_property_right );
      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ) {
        $('.'+$scope.stylesheet.current_selector).css("border-right-style" , $scope.border_type_property_right );
      }
    }
    if(property == 'border-bottom-width'){
      $scope.border_width_property_bottom
      if( $scope.stylesheet.current_selector == 'screen_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-bottom-width" , $scope.border_width_property_bottom );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor_block' ){
        $('.'+$scope.stylesheet.current_selector).css("border-bottom-width" , $scope.border_width_property_bottom );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-bottom-width" , $scope.border_width_property_bottom );
      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ) {
        $('.'+$scope.stylesheet.current_selector).css("border-bottom-width" , $scope.border_width_property_bottom );
      }
    }
    if(property == 'border-bottom-style'){
      $scope.border_type_property_bottom
      if( $scope.stylesheet.current_selector == 'screen_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-bottom-style" , $scope.border_type_property_bottom );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor_block' ){
        $('.'+$scope.stylesheet.current_selector).css("border-bottom-style" , $scope.border_type_property_bottom );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-bottom-style" , $scope.border_type_property_bottom );
      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ) {
        $('.'+$scope.stylesheet.current_selector).css("border-bottom-style" , $scope.border_type_property_bottom );
      }
    }
    if(property == 'border-top-width'){
      $scope.border_width_property_top
      if( $scope.stylesheet.current_selector == 'screen_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-top-width" , $scope.border_width_property_top );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor_block' ){
        $('.'+$scope.stylesheet.current_selector).css("border-top-width" , $scope.border_width_property_top );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-top-width" , $scope.border_width_property_top );
      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ) {
        $('.'+$scope.stylesheet.current_selector).css("border-top-width" , $scope.border_width_property_top );
      }
    }
    if(property == 'border-top-style'){
      $scope.border_type_property_top
      if( $scope.stylesheet.current_selector == 'screen_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-top-style" , $scope.border_type_property_top );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor_block' ){
        $('.'+$scope.stylesheet.current_selector).css("border-top-style" , $scope.border_type_property_top );
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css("border-top-style" , $scope.border_type_property_top );
      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ) {
        $('.'+$scope.stylesheet.current_selector).css("border-top-style" , $scope.border_type_property_top );
      }
    }
    if(property == 'color'){
      $scope.color_property
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css('color' , $scope.color_property);
      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ){
        $('.'+$scope.stylesheet.current_selector).css('color' , $scope.color_property);
      }
    }
    if(property == 'font-family'){

      if( $scope.stylesheet.current_selector == 'body' ){
        $("."+$scope.stylesheet.current_selector).css("font-family" , $scope.font_family_property)
      }
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $("."+$scope.stylesheet.current_selector).css("font-family"  , $scope.font_family_property )
      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ){
        $("."+$scope.stylesheet.current_selector).css("font-family"  , $scope.font_family_property)
      }

    }
    if(property == 'font-size'){
      $scope.font_size_property

      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $(".qs-numericals , ."+$scope.stylesheet.current_selector).css("font-size"  , $scope.font_size_property + 'px')

      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ){
        $("."+$scope.stylesheet.current_selector + " .text-values , .answer-contents .labels").css("font-size"  , $scope.font_size_property + 'px')
      }
    }
    if(property == 'font-weight'){
      $scope.font_type_property
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $(".qs-numericals , ."+ $scope.stylesheet.current_selector).css("font-weight"  , $scope.font_type_property );

      }
      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ){
        $("."+$scope.stylesheet.current_selector + " .text-values , .answer-contents .labels").css("font-weight"  , $scope.font_type_property  );
      }
    }
    if(property == 'numbering'){
      if( $scope.stylesheet.current_selector == 'question_opg_editor' ){
        $(".default_theme_texts_bg").css("background" , $scope.numbering_property );
        $(".default_theme_brd").css("border-left-color" , $scope.numbering_property );
      }

      if( $scope.stylesheet.current_selector == 'answer_opg_editor' ){
        $(".labels").css("background" , $scope.numbering_property );
        // $(".default_theme_brd").css("border-left-color" , $scope.numbering_property );
      }
    }
  };


  $scope.show_hovred_element = (classNameO) => {};
  $scope.show_selecter_line = (element , on_slide ) => {

  };
  $scope.window_navigation.on('load' , function (){
    if($window.parent.location != $window.location){

        $scope.select_numbers = $(".select_numbers");
        $scope.select_box = $(".select_box");
        $scope.select_box_brd = $(".select_box_brd");
        $scope.select_button = $(".select_button");
        $scope.select_box_data = $(".select_box_data");
        $scope.select_brd = $(".select_brd");

    }
  });


 























   $scope.block_selector = () => {
      $("#welcome-screens,#goodbye-screens,#result-screens ,#question-screens").css({display:'none' });
      //  $scope.editor_page
      if($scope.editor_page == 0 ){ // => Welcome Screen
        $("#welcome-screens").css("display","block");
         // ==> Slide To Target Element
         $scope.iframe_access.slide_to_question_in_index_number(0);
        $($scope.iframe_object).find(".welcome-screen-block").addClass("outlined_object");
      }
      if($scope.editor_page == 1 ){ // => GoodBye Screen
        $("#goodbye-screens").css("display","block");
        // ==> Slide To Target Element
        $scope.iframe_access.slide_to_question_in_index_number($scope.questions_list.length + 1 );
       $($scope.iframe_object).find(".goodbye-screen-block").addClass("outlined_object");
      }
      if($scope.editor_page == 2 ){ // => Result Screen
        $("#result-screens").css("display","block");
        // ==> Slide To Target Element
        // ==> outline it
        $scope.iframe_access.slide_to_question_in_index_number($scope.questions_list.length + 2);
       $($scope.iframe_object).find(".result-screen-block").addClass("outlined_object");
      }
      if($scope.editor_page == 3 ){ // => Question Screen
        $("#question-screens").css("display","block");
        // ==> Slide To Target Element
        // ==> outline it
        $scope.iframe_access.slide_to_question_in_index_number(1);
       $($scope.iframe_object).find(".question-screen-block").addClass("outlined_object");
      }
      if($scope.editor_page == 4 ){ // => Time - progress Screen

      }
    };

    
