$(document).ready(function (){

  // ======================================================================
  // ======>>>>>>>>     Create new Application | Split this api keys into rows
  // ======================================================================
  function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  $(".user-name,.application-name,.email,.password , .passwordx ,.emailx").on("keyup", function (){
    $(this).css({border:"1px solid #eee" , background : "#fff" , color:"#555"});
    var targetELement = $(this).prev(".title-data").children(".required-info");
    if(targetELement.length != 0)
      targetELement.remove();
  });
  $(".create-keys-btn").on("click" , function (e){
    $(this).html("Creating ...");
    var name = $(".user-name").val();
    var appName = $(".application-name").val();
    var email = $(".email").val();
    var password = $(".password").val();
    var required = new Array();

    if(!name || name == '' )
      required[required.length] = "user-name" ;

    if(!appName || appName == '' )
      required[required.length] = "application-name" ;



    if(!email || email == ''  )
      required[required.length] = "email" ;

    if(!password || password == '' )
      required[required.length] = "password" ;

    if(required.length != 0){
      for(var i=0; i < required.length ; i++){
        $(this).html("Create Private keys");
        var targeElement = $("."+required[i]).prev(".title-data").children(".required-info");
        if(targeElement.length == 0 ){
          $("."+required[i]).prev(".title-data").append("<span class='required-info'>Required<span>");
        }

        $("."+required[i]).css({border:"1px solid tomato" , background : "rgba(244, 179, 80 , 0.1)" , color:"#222"});
      }
      return false ;
      e.preventDefault();
    }

    var reqs = new Array();
    if(! validateEmail(email))
    reqs[reqs.length] = "email";
    if(appName.indexOf(' ') >= 0)
    reqs[reqs.length] = "application-name";


    if(reqs.length != 0){
      for(var i=0; i<reqs.length; i++){
        $("."+reqs[i]).css({border:"1px solid tomato", background : "rgba(242, 120, 75 , 0.9)" , color:"#fff"});
        if(reqs[i] == 'email'){
          if($(".email").prev(".title-data").children('.required-info').length == 0 )
          $(".email").prev(".title-data").append("<span class='required-info'>Email Not Valid<span>");
        }
        if(reqs[i] == 'application-name'){
          if($(".application-name").prev(".title-data").children('.required-info').length == 0 )
          $(".application-name").prev(".title-data").append("<span class='required-info'>Should be without spaces<span>");
        }
      }
      return false ;
    }


      var appendedDate = {
        application_name : appName ,
        user_name : name,
        email:email,
        password:password
      }

      $.ajax({
         url: servername + "api/application/create" ,
         type: 'POST' ,
         headers  : { "X-auth-apis" :  "dfV@%4$5v^xs)@5rY*c-!vJ^$90f*&amp;#5$~U5d@!tsd&amp;$90f*&amp;#(cY*c-56)}8$~1100sdk$oprFRTgkEe~$rV9%#t+T@y1DR2VG5YU4XS}+$+&amp;%*tY"  } ,
         data:appendedDate ,
         error: function(err , xdf ,sdds) {
           console.log(err.responseText);
         },
         success: function(APK) {
           console.log(APK.API_KEYS == 0);
           if(APK.API_KEYS == 0) {
             var targetErr = $(".errors-found") ;
             targetErr.html("Your email already exists !");
             targetErr.css({display:"block"});
             setTimeout(function (){
                $(".create-keys").fadeOut(function(){
                  $(".get-keys").fadeIn();
                });
             },2000);
           } else {
             // ==> Appended code of api key
             $('.keys').css({ display : "block" });
             $('.key-settings').attr("apk_id" , APK._id );
             $('.key-settings').html(/*$.trim(APK.API_KEYS)*/ "API KEY FILE IS CREATED" );
             // ==> typed js started here

            }
         }
       });

    $(this).html("Request Completed !");
    $(this).attr("disabled","");;
  });

  // ======================================================================
  // ======>>>>>>>>     Switch between login to api key and register new api key
  // ======================================================================
  $('.have-keys').on("click",function (e){
    $(".create-keys").fadeOut(function(){
      $(".get-keys").fadeIn();
    });
    e.preventDefault();
  });

  $(".havent-keys").on("click",function (e){
    $(".get-keys").fadeOut(function(){
       $(".create-keys").fadeIn();
    });
    e.preventDefault();
  });

  // ======================================================================
  // ======>>>>>>>>     Login to api Key
  // ======================================================================
  $(".getprivatekeys").on("click" , function (){
    $(this).html("Downloading Keys ... ");
    var password = $('.passwordx').val();
    var email = $('.emailx').val();
    var requiredLogin = new Array();

    if(!email || email == ''  )
      requiredLogin[requiredLogin.length] = "emailx" ;

    if(!password || password == '' )
      requiredLogin[requiredLogin.length] = "passwordx" ;

    var reqsLogin = new Array();
      if(! validateEmail(email))
      reqsLogin[reqsLogin.length] = "emailx";

      if(requiredLogin.length != 0){
          $(this).html("Download Keys File");
        for(var i=0; i < requiredLogin.length ; i++){

          var targeElement = $("."+requiredLogin[i]).prev(".title-data").children(".required-info");
          if(targeElement.length == 0 ){
            $("."+requiredLogin[i]).prev(".title-data").append("<span class='required-info'>Required<span>");
          }

          $("."+requiredLogin[i]).css({border:"1px solid tomato" , background : "rgba(244, 179, 80 , 0.1)" , color:"#222"});
        }
        return false ;
        e.preventDefault();
      }

    var data = {
      password : password,
      email : email
    };
    if(reqsLogin.length != 0){
        $(this).html("Download Key File");
      for(var i=0; i<reqsLogin.length; i++){
        $("."+reqsLogin[i]).css({border:"1px solid tomato", background : "rgba(242, 120, 75 , 0.9)" , color:"#fff"});
        if(reqsLogin[i] == 'emailx'){
          if($(".emailx").prev(".title-data").children('.required-info').length == 0 )
          $(".emailx").prev(".title-data").append("<span class='required-info'>Email Not Valid<span>");
        }
      }
      return false ;
    }
     // ==> APP_NAME , API_KEYS
    var url = servername+"api/application/api_key_retrieve";
    $.ajax({
      url : url ,
      data : data ,
      type : "POST",
      success : function (APK){
        console.log(APK);
        if(APK.API_KEYS != 0 ){
          window.location.href = APK.API_KEYS ;
          // window.open(APK.API_KEYS, "_blank");
          // do a permission_denied or this file
            var urlper = servername + "api/application/apk_permission" ;
            setTimeout(function (){
            $.ajax({
              url : urlper ,
              data : { soruce_file :APK.application_name+ "_" +APK._id+'_api_key.zip' } ,
              type :"POST",
              success : function (){
              }
            });
          } , 1 );
        }else {
          $('.err-user-login').html("This Api key does not exists !");
          $('.err-user-login').css({ display:'block' });
        }

      }
    });

    $(this).html("Downloading Keys ... ");
  });

  // ======================================================================
  // ======>>>>>>>>     Download api Key
  // ======================================================================
  $("#download_keys").on("click", function (e){
      var url = servername + "api/application/download_keys" ;
      var headers  = { "X-auth-apis" :  "dfV@%4$5v^xs)@5rY*c-!vJ^$90f*&amp;#5$~U5d@!tsd&amp;$90f*&amp;#(cY*c-56)}8$~1100sdk$oprFRTgkEe~$rV9%#t+T@y1DR2VG5YU4XS}+$+&amp;%*tY"  } ;
      var data = { api_key_id : $('.key-settings').attr("apk_id") } ;

      $.ajax({
        url:url ,
        data:data ,
        headers :headers ,
        type : "POST",
        success: function (resu){
          if (  resu.api_key_file != null ) {
            window.location.href = resu.api_key_file ;

            setTimeout(function (){
            // doin a permission fo this file immediately after downlad it
              var urlper = servername + "api/application/apk_permission" ;
              $.ajax({
                url : urlper ,
                data : {soruce_file:resu.filename} ,
                type :"POST",
                success : function (){

                }
              });
            } , 5000 );
          }else {
            $(".error_value").html(resu);
            // Inform that user that you  cant download this file more than one time
            $(".error_value").fadeIn();
          }
        }

      });

      e.preventDefault();
    });




});
