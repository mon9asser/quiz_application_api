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
     // Image Uploader handler !!
     //-------------------------------------------------------
     

});
