$(document).ready(function(){
  setTimeout(function(){



      var stylesheet = {
              current_selector : "player_opg_editor"  ,
              old_selector : "player_opg_editor" ,
              selector : function ( )  {
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

   $("#change_editor_mode").on('select' , function (){
       var mode = $(this).val();
      //  var elements_selected_before = $(".outlined_blocks");
       alert(mode);
       //alert(elements_selected_before.length);

       if ( mode == 0 ){ // => player_opg_editor

       }
       if ( mode == 1 ){ // => screen_opg_editor

       }
       if ( mode == 2 ){ // => question_opg_editor_block ---- > Slider

       }
       if ( mode == 3 ){

       }
       if ( mode == 4 ){

       }
       if ( mode == 5 ){

       }
   });


   } , 500);
});
