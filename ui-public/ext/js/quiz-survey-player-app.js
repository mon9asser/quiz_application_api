apps.controller("player", [
'$rootScope','$scope' , '$http' , '$timeout' , 'settings' , function ( $rootScope , $scope , $http , $timeout , settings ) {

    $scope.server_ip = settings.server_ip ;
    $scope.application_id = $("#appId").val();
    $scope.user_id = $("#userId").val();

    // ==> Veriable scopes
    $scope._applications_   = {} ;
    $scope._questions_      = null ;
    $scope._settings_       = null ;
    $scope._online_report_  = null ;
    $scope._offline_report_ = null ;
    $rootScope._stylesheet_ = null ;
    $scope._user_activity_  = {} ;


    // ==> Funcs
    $scope.isEmpty = ( obj ) => {
      for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
      }
      return true;
    };
    // ==> Loading Application
    $scope.loading_application_data = () => {
        $http({
          url :  $scope.server_ip + 'api/'+ $scope.application_id +'/player/data'
        }).then((results) => {
            var app = results.data;
            $scope._applications_ = app;
            $scope._questions_ = $scope._applications_.questions;
            $scope._settings_ = $scope._applications_.settings;
            $scope._online_report_ = $scope._applications_.att__draft;
            $scope._offline_report_ = $scope._applications_.app_report;
            $rootScope._stylesheet_ = $scope.server_ip + "themes/stylesheet_of_app_" + $scope.application_id +'.css';

            // ==> Storing current attendee draft
            if( $scope._online_report_ != undefined && $scope._online_report_.att_draft != undefined && $scope._online_report_.att_draft != null )
              {
                var user_act = $scope._online_report_.att_draft.find( x => x.user_id == $scope.user_id ) ;
                if(user_act!= undefined ) $scope._user_activity_ = user_act ;
              }

            // ==> Detect if this quiz is expired && expiration sys is enabled
            var expire_options = $scope._settings_.expiration;
            // ==> Case window is loaded
            if( $scope.isEmpty( $scope._user_activity_ ) == false  && $scope._user_activity_.is_loaded != undefined  ){

            }
            if()
            // ==> resume the quiz message
            // ==> Enable swipperJs

            // ==> Hide loading div

        }).catch((error) => {
          console.log(error);
        });
    };
    // ==> Loading Application
    $scope.loading_application_data();

    // ==> Setup application data with ui
    $timeout( function(){
      console.log( $scope._applications_ );
    } , 120 );
}]);
