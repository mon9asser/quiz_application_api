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


     $('.iconx-settings').on('click',function(){

       //
       //.right-menu-settings => right: -340px;
       //.with-side-menu .page-content =>  padding-left : 255px ,  'margin-right': '0px' , 'margin-left': '0px'

       
       if( $('.right-menu-settings').css('right') =='-589px' )
       {
            $('.right-menu-settings').addClass('menu-right');
            $('.with-side-menu .page-content').addClass('page-content-xx');
        } else {

          $('.right-menu-settings').removeClass('menu-right');
            $('.with-side-menu .page-content').removeClass('page-content-xx');

        }


     });


// .with-side-menu .page-content ==> padding-left:255px
//.right-menu-settings => right:-340px;
// .right-menu-settings ==> width 350px;

});
