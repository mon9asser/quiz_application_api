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

    // ----------------------------------------------------------------
    //---> Tab Slider
    // ---------------------------------------------------------------
    /*  Init The Hiden and display for tabs */
    $(".tab-slider--body").hide();
    $(".tab-slider--body:first").show();
    // $(".tab-slider--body").show();
    // $(".tab-slider--body:first").hide();
    // Do an action for tab ( 1 => editor ) and tab ( 2=> Settings )
    $(".tab-slider--nav li").click(function() {
        $(".tab-slider--body").hide();
        var activeTab = $(this).attr("rel");
        $("#"+activeTab).fadeIn();
        if($(this).attr("rel") == "tab2"){
        $('.tab-slider--tabs').addClass('slide');
        }else{
        $('.tab-slider--tabs').removeClass('slide');
        }
        $(".tab-slider--nav li").removeClass("active");
        $(this).addClass("active");
    });


});
