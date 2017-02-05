angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js
	$stateProvider
		
	

		.state('home', {
			url: '/page1',
			templateUrl: 'templates/home.html',
			controller: 'preloadCtrl'
		})

		.state('engageDisabilityToolkit', {
			url: '/page2/:postType/:postId',
			templateUrl: 'templates/engageDisabilityToolkit.html',
			controller: 'wordpressCtrl'
		})

		.state('contents', {
			url: '/content/:postType',
			templateUrl: 'templates/contents.html',
			controller: 'wordpressCtrl'
		})

		.state('postTemplate', {
			url: '/post/:postType/:postId',
			templateUrl: 'templates/postTemplate.html',
			controller: 'wordpressCtrl'
		})
		
		.state('addRes', {
			url: '/addRes/:postType/:options/:op',
			templateUrl: 'templates/addRes.html',
			controller: 'addResCtrl'
		})

		.state('aboutTheApp', {
			url: '/page6/:postType',
			templateUrl: 'templates/aboutTheApp.html',
			controller: 'sharingCtrl'
		})

	$urlRouterProvider.otherwise('/page1')

	

});
