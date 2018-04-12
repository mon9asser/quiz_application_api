//=============================================
// => Javasctipt code lines
//=============================================
Array.prototype.find_unsolved_questions = function (questions_list) {
    return this.filter(function (i) {
      return questions_list.findIndex(x => x.question_id == i._id) === -1;
    });
};
//=============================================
// => Filters
//=============================================
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
        iframe_size.width = "250px";
        iframe_size.height = "160px" ;
      }else {
        video_mp4 = new Object();
        video_mp4['mp4_url'] =  media_object.media_field+'.mp4';
        video_mp4['ogg_url'] =  media_object.media_field+'.ogg';
        iframe_size = new Object();
        iframe_size.width = "250px";
        iframe_size.height = "160px" ;
      }
      switch (media_object.media_type) {
        case 1:
          if( media_object.video_type == 0 ){
            embed_video = "<iframe width='"+iframe_size.width+"' height='"+iframe_size.height+"' src='"+video_path+"' ></iframe>";
          }
          if( media_object.video_type == 1 ){
            embed_video = "<iframe style='border:none;' width='"+iframe_size.width+"' height='"+iframe_size.height+"' src='"+video_path+"' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
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
attendeeApp.filter('trust_this_html_values' , [
  '$sce' , function ($sce){
    return function (returned_val){
       return $sce.trustAsHtml(returned_val);
    }
  }
]);
attendeeApp.controller("preview_player" , [
  '$scope' , '$rootScope' , '$timeout' , '$http' , 'settings' , '$window',
( $scope, $rootScope, $timeout , $http , settings , $window  ) => {
  // => Scopes
  $scope.__player_object = null ;
  $scope.server_ip = $("#server_ip").val();
  $scope.user_id = $("#user_id").val();
  $scope.app_id = $("input").val();
  $scope.slide_screens = null;
  $scope.json_source = $scope.server_ip + settings.json_source;
  $scope.quiz_status = 0 ;
  $scope.api_key_headers = null ;
  // => Urls
  $scope.url_application = $scope.server_ip + "api/" + $scope.app_id +'/application/retrieve';
  alert($("input").eq(2).attr('id');

  // => application key

  // => funcs

  $scope.load_application_for_preview = () => {

    alert($scope.url_application)
    $http({
      url : $scope.url_application ,
      type : "GET" ,
      headers : $scope.api_key_headers
    }).then(function(resp){
      $scope.__player_object = resp.data ;
      console.log($scope.__player_object);
      $scope.slide_screens = Swiper('.swiper-container') ;
    },function(err){ console.log(err); });
  }
  $scope.load_application_keys = () => {
    $.getJSON( $scope.json_source , function (apk_keys){
      $scope.api_key_headers = {
        "X-api-app-name":apk_keys.APP_NAME ,
        "X-api-keys":apk_keys.API_KEY
      }
       $scope.api_key_headers ;

       // ==> calling funcstionalities
       $scope.load_application_for_preview();
       // ...
    });
  }

  // ==> Exc funcs
  $scope.load_application_keys();


}]);
