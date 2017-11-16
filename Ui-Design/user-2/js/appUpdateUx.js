$(document).ready(function(){

     //-------------------------------------------------------
     // Video Url Editor !!
     //-------------------------------------------------------
     $('.youtubeurl-handler').on('click' , function(){
        var target = $($(this).attr('data-target-to'));
        if(target.css('display') =='none')
        target.css('display','block');
        else {
          target.css('display','none');
        }
     });


     //----------------------------------------------
     // Label Check box with other colors and icon
     //----------------------------------------------
     $("label[target='label']").on('click' , function (){
       var targetCheckbox = $(this) ;
       if(targetCheckbox.hasClass('check_boxx'))
       targetCheckbox.removeClass('check_boxx')
       else {
          targetCheckbox.addClass('check_boxx')
       }
     });


     //----------------------------------------------
     // Collapse Right menu settings
     //----------------------------------------------
     $('.control-item-header').on('click' , function(){
        var targetCollapse = $(this);
        var targetIndex = targetCollapse.parent('li').index() ;
        $('.set-panel-container li').each(function(i){
            if(targetIndex != i )
            {
                $('.set-panel-container li').children('.control-item-content').css('height' , '0px');
            }
        });
        if(targetCollapse.next('.control-item-content').css('height') == '0px')
          {
              // Open This COllapse !
              targetCollapse.next('.control-item-content').css('height' , 'auto');
          }else {
              // Close This COllapse
              targetCollapse.next('.control-item-content').css('height' , '0px')
          }

     });

     //----------------------------------------------
     // Open Close ( Slide Effects ) Right menu settings
     //----------------------------------------------
     $('.iconx-settings').on('click',function(){
        if( $('.right-menu-settings').css('right') == '-589px'  )
       {
          //  $(this).children('i').addClass('fa-spin');
            $('.right-menu-settings').addClass('menu-right');
            $('.data-page-laout-2').addClass('page-content-xx');
        }   {
          //$(this).children('i').removeClass('fa-spin');
          $('.right-menu-settings').removeClass('menu-right');
            $('.data-page-laout-2').removeClass('page-content-xx');
         }
       });



       //----------------------------------------------
       // Slide The Questions
       //----------------------------------------------
      //  var swiper = new Swiper('.ques-slider', {
      //     navigation: {
      //      nextEl: '.next-questions',
      //      prevEl: '.previouse-questions',
      //    },
      //  });

       new Swiper('.slide-mode-w-preview' , {allowTouchMove:false ,
           navigation: {
            nextEl: '.next-hidden-btn-x',
            prevEl: '.prev-hidden-btn-x',
          }
       });
       /*
       <span class="prev-hidden-btn-x"></span>
       <span class="next-hidden-btn-x"></span>
       */
       // ================================================
       // => Switch mode from view to editor and so else
       //=================================================
       $('#mode-chox-option').on('change' , function(){
         //live-preview-questions question-editor




           if ($(this).val() == 'on')  // Editor Mode Here !! visibility: visible;
            {
              $('.next-hidden-btn-x').trigger('click');
               $(this).val('off');
            }else {    // Preview Mode Here !!
              $('.prev-hidden-btn-x').trigger('click');
              $(this).val('on');
            }



       });



       //====================================================
       // => Collapse more or less options
       //====================================================
       $('.button-view-more').on('click' , function(){
         var buttonContents = $(this);
         var bodyContents = $(".body-view-more");
         if(bodyContents.css("display") =='none')
         {
           bodyContents.css("display" , 'block');
           $("bod,html").animate({
             scrollTop:'1500px'
           } , 1000);
           buttonContents.html("Less options");

         }else {
           bodyContents.css("display" , 'none');
           buttonContents.html("View more options");
         }
       });
      // $('.slidest-slick').slick();
});
