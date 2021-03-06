// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives','app.services','app.filters','ngCordova','angular-cache'])

.config(function($ionicConfigProvider, $sceDelegateProvider){
	
	$sceDelegateProvider.resourceUrlWhitelist([ 'self','*://*.*.*/**']);
	
})

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		if(window.cordova && window.cordova.plugins.Keyboard) {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

			// Don't remove this line unless you know what you are doing. It stops the viewport
			// from snapping when text inputs are focused. Ionic handles this internally for
			// a much nicer keyboard experience.
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if(window.StatusBar) {
			StatusBar.styleDefault();
		}
	});
})

/*
	This directive is used to disable the "drag to open" functionality of the Side-Menu
	when you are dragging a Slider component.
*/
.directive('disableSideMenuDrag', ['$ionicSideMenuDelegate', '$rootScope', function($ionicSideMenuDelegate, $rootScope) {
	return {
		restrict: "A",	
		controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
			function stopDrag(){
				$ionicSideMenuDelegate.canDragContent(false);
			}

			function allowDrag(){
				$ionicSideMenuDelegate.canDragContent(true);
			}

			$rootScope.$on('$ionicSlides.slideChangeEnd', allowDrag);
			$element.on('touchstart', stopDrag);
			$element.on('touchend', allowDrag);
			$element.on('mousedown', stopDrag);
			$element.on('mouseup', allowDrag);

		}]
	};
}])

/*
	This directive is used to open regular and dynamic href links inside of inappbrowser.
*/
.directive('hrefInappbrowser', function() {
	return {
		restrict: 'A',
		replace: false,
		transclude: false,
		link: function(scope, element, attrs) {
			var href = attrs['hrefInappbrowser'];

			attrs.$observe('hrefInappbrowser', function(val){
				href = val;
			});
			
			element.bind('click', function (event) {
				window.open(href, '_system', 'location=yes');
				event.preventDefault();
				event.stopPropagation();
			});
		}
	};
});
