apps.filter( 'striphtmltags' , ($sce) => {
  return function (specs){
    var div = $("<div>"+ specs + "</div>");
    var text_values = div.text() ;
    var spesificChars = '' ;
    var char_counts = 35 ;

    if( text_values == undefined )
      spesificChars = text_values ;
      else {
          for (var i = 0; i < text_values.length; i++) {
            if(i < char_counts) {
              spesificChars += text_values[i];
              if(i == (char_counts - 1) )
                spesificChars += " ... ";
            }
          }
      }

    // spesificChars =  spesificChars.textContent || spesificChars.innerText || "";
    // remove ( &nbsp; ) from text

     return spesificChars ;
  }
})
apps.controller("apps-controller" , [
'$scope','$http' , '$timeout','$window','$rootScope' , '$sce' ,
( $scope , $http , $timeout , $window , $rootScope , $sce  ) => {
  // ==> Veriables
 $scope.server_ip = $("#serverIp").val();
 $scope.json_source = $scope.server_ip + "ext/json/json-keys.json";
  // ==> Api Links
 $.getJSON( $scope.json_source , function ( api_key_data ){
  $scope.server_ip = $("#serverIp").val();
  $scope.user_id = $("#userId").val();
  $scope.app_id = $("#applicationId").val();
  $scope.switching_editor_preview_value = false ;
  $scope._application_ = null ;
  $scope._questions_ = null ;
  $scope._settings_ = null ;

  $scope.retrieve_data_url = $scope.server_ip + "api/"+$scope.app_id+"/application/retrieve" ;

  $scope.header_data = {
     "X-api-keys": api_key_data.API_KEY,
     "X-api-app-name": api_key_data.APP_NAME
   };
   $http({
      method : "POST" ,
      url : $scope.retrieve_data_url ,
      headers : $scope.header_data ,
      data : { creator_id : $scope.user_id }
   }).then(( resp )=>{
    /* Start Code From Here */
      // =============================================================>>
      $scope._application_ = resp.data ;
      $scope._questions_ = $scope._application_.questions ;
      $scope._settings_ = $scope._application_.settings ;



      // ==> Switching between View and editor

      $scope.switching_editor_preview = () => {
          if($scope.switching_editor_preview_value == false ) {
            // => Editor
              
          }else {
            // => Preview

          }
          // alert($(".preview-container").css('display'));
      };


      // =============================================================>>
    /* End Code of Document here */
});});}]);
