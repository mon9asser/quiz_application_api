$(document).ready(function(){
    "use strict"

    var application = {
      reg_usr : {
        is_creator : 0 ,
        name : null ,
        email : null ,
        password : null
      }
    };
   // ==============================================================
   /* --------------------- Register New User ------------------- */
   // ==============================================================
   $('input.signup , input.login , select.signup').on('change , keyup' , function(){
     // => Rset Error Message
      $(this).css({
         "border-color" : "#ccc"
      });
      $(this).prev('.error-message').html('');
      $(this).parent().parent().prev('.error-msg-response').html('');
     // ==> Fill Target Values
     var targetElemen  = $(this).attr('name');
     switch (targetElemen) {
            case 'name':
              application.reg_usr.name = $(this).val();
              break;

            case 'access_type.is_creator':
              application.reg_usr.is_creator = $(this).val();
              break;

            case 'email':
              application.reg_usr.email =$(this).val() ;
              break;

            case 'password':
               application.reg_usr.password = $(this).val();
               break;
         }
   });
   // == -----------------------------------------------------------------
   // == --------------------------> Register part
   // == -----------------------------------------------------------------
   $('#signup_user').on('click' , function (e){
    $.ajax({
        type : 'post',
        data : application.reg_usr ,
        url : "/api/users/create",
        success : function(res){
          window.location.href = res.redirectTo ;
        }  ,
        error : function (err) {
          if(err.responseJSON.errors.email){
              $('input[name="'+err.responseJSON.errors.email.path+'"]')
              .prev('.error-message').html(err.responseJSON.errors.email.message);
            $('input[name="'+err.responseJSON.errors.email.path+'"]').css({
                border:'1px solid red'
            });
          }
          console.log(err);
          if(err.responseJSON.errors.name){
            $('input[name="'+err.responseJSON.errors.name.path+'"]')
            .prev('.error-message').html(err.responseJSON.errors.name.message);
            $('input[name="'+err.responseJSON.errors.name.path+'"]').css({
                border:'1px solid red'
            });
          }
          console.log(err.responseJSON.errors);
          if(err.responseJSON.errors.password){
            $('input[name="'+err.responseJSON.errors.password.path+'"]')
            .prev('.error-message').html(err.responseJSON.errors.password.message);
            $('input[name="'+err.responseJSON.errors.password.path+'"]').css({
                border:'1px solid red'
            });
          }
          }

     });

     e.preventDefault();
   });

   // == -----------------------------------------------------------------
   // == --------------------------> Login part
   // == -----------------------------------------------------------------
   $('#login_user').on('click' , function (e){

     if(application.reg_usr.email == null )
      {
        $("input[name='email']").css({
            border : "1px solid tomato"
        });

      }

    if(application.reg_usr.password == null ){
        $("input[name='password']").css({
          border : "1px solid tomato"
        });
    }

    if(application.reg_usr.password == null && application.reg_usr.email == null){
      return false ;
    }

    $.ajax({
        type : 'post',
        data : {email:application.reg_usr.email , password:application.reg_usr.password} ,
        url : "/api/users/login",
        success : function(res){
            window.location.href = res.redirectTo ;
         }  ,
        error : function (err) {

           try {
             if(err){
             if(err.responseJSON.errorMSG){
             $('.error-msg-response').html(err.responseJSON.errorMSG);
             }
           }
           } catch (err) {
             console.log(err);
           }
      }

   });

    e.preventDefault();
});
});
