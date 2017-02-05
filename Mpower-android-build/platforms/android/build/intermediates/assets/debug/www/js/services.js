angular.module('app.services', [])

.factory('basicServices', ['$rootScope', '$cordovaNetwork',

function($rootScope, $cordovaNetwork){
 
	return {
		isOnline: function(){
			if(ionic.Platform.isWebView()){
				return $cordovaNetwork.isOnline();		
			} else {
				return navigator.onLine;
			}
		}
	}
}])

.service('BlankService', [function(){

}]);
