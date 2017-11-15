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

     



     //-------------------------------------------------------
     // Enable description Handler // Comment this func once working with angularjs
     //-------------------------------------------------------
    //  $('.description-enable-handler').on('click' , function (){
    //    var $targetTextarea = $(this).next('textarea');
    //    var $targetCheckbox = $(this).children('div').children('input');
    //    if($targetCheckbox.hasClass('enabled'))
    //    {
    //      $targetTextarea.removeAttr('disabled');
    //      $targetCheckbox.removeClass('enabled');
    //    }else{
    //      $targetTextarea.attr('disabled');
    //      $targetCheckbox.addClass('enabled');
    //    }
    //    console.log($targetTextarea.attr('class'));
     //
    //  });




});
