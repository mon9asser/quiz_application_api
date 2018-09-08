apps.controller("list-apps" , [
'$scope' , '$rootScope' , '$timeout' , '$http' , 'settings' , ( $scope , $rootScope , $timeout , $http , settings ) => {
  $scope.server_ip = settings.server_ip ;
  $scope.api_url =  $scope.server_ip + 'api/applications/list/data' ;
  $scope._applications_ = [] ;
  console.log($scope.api_url);
  $http({
    method : "GET" ,
    url : $scope.api_url
  }).then(( response ) => {
    $scope._applications_ = response.data ;
  }).catch((err)=>{
    console.log(err);
  });
}]);
