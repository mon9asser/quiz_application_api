
attendeeApp.filter("set_iframe" , [
      "$timeout" ,"$sce" ,
  function (  $timeout , $sce){
    return function (media_object){
      var embed_video , video_path , video_mp4  , iframe_size ;

      if( media_object.embed_path != null)
      {
         video_path = media_object.embed_path ;
         iframe_size = new Object();
         iframe_size.width = "100%";
         iframe_size.height = "130px" ;
      }
      else
      {
         video_path = media_object.video_source ;
         iframe_size = new Object();
         iframe_size.width = "100%";
         iframe_size.height = "130px" ;
      }

      if(media_object.mp4_option != undefined || media_object.mp4_option != null ){
        video_mp4 = new Object();
        video_mp4['mp4_url'] = media_object.mp4_option.mp4_url ;
        video_mp4['ogg_url'] = media_object.mp4_option.ogg_url ;

        iframe_size = new Object();
        iframe_size.width = "100%";
        iframe_size.height = "130px" ;
      }else {
        video_mp4 = new Object();
        video_mp4['mp4_url'] =  media_object.media_field+'.mp4';
        video_mp4['ogg_url'] =  media_object.media_field+'.ogg';
        iframe_size = new Object();
        iframe_size.width = "100%";
        iframe_size.height = "130px" ;
      }
      switch (media_object.media_type) {
        case 1:
          if( media_object.video_type == 0 ){
            embed_video = "<iframe width='"+iframe_size.width+"' height='"+iframe_size.height+"' src='"+video_path+"' ></iframe>";
          }
          if( media_object.video_type == 1 ){
            embed_video = "<iframe width='"+iframe_size.width+"' height='"+iframe_size.height+"' src='"+video_path+"' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
          }
          if( media_object.video_type == 2 ){
            embed_video = '<video style="width:'+iframe_size.width+'; height:'+iframe_size.height+';" controls>' +
                          '<source src="'+video_mp4.mp4_url+'" type="video/mp4">'+
                          '<source src="'+video_mp4.ogg_url+'" type="video/ogg">'+
                          'Your browser does not support the video tag.' +
                        '</video>';
          }
        break;
      }

      return $sce.trustAsHtml(embed_video) ;
    };
}]);

// >> true html value inside element
attendeeApp.filter('trust_this_html_values' , [
  '$sce' , function ($sce){
    return function (returned_val){
       return $sce.trustAsHtml(returned_val);
    }
  }
]);

attendeeApp.controller('players' , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings',
  function ($scope, $rootScope, $timeout , $http , settings ){
     // => Scopes
     $scope.user_id = $("#userId").val();
     $scope.application_id = $("#appId").val();
     $scope.server_ip = settings.server_ip ;
     $scope.app_screens = null ;
     $scope.json_source = settings.server_ip + settings.json_source;
     $scope.__player_object = null ;
     $scope.__report_object = null ;
     $timeout(function (){
       console.log($scope.__player_object);
     } , 2000 );
     // ==> Functionalities
     // ==>> Load all applications into angular object
    //  alert(settings.server_ip + 'api/'+$scope.application_id+'/application/retrieve');
     $scope.load_attendee_application = function (){
       $.getJSON( $scope.json_source , function (keys_object){
         $http({
           url : settings.server_ip + 'api/'+$scope.application_id+'/application/retrieve' ,
           type : "GET" ,
           headers: {
             "X-api-keys": keys_object.API_KEY,
             "X-api-app-name": keys_object.APP_NAME
           }
         }).then(function (resps){
            $scope.__player_object = resps.data ;
         } , function (err){
              console.log(err);
         });
       }); // End JSON
     };

     $scope.back_to_quizzes = function (){
       return window.location.href = settings.server_ip + "quizzes";
     };
     // return new Array(num);
     // ==> Calling Functionalities
     $scope.load_attendee_application();
     $timeout(function (){
       $scope.app_screens = $('.slide_screens').slick({
         infinite: true,
         slidesToShow: 1,
         slidesToScroll:1 ,
         mobileFirst : true ,
         prevArrow : '' ,
         nextArrow : ''
       });
     }, 1000);


  }]);
