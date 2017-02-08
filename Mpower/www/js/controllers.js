angular.module('app.controllers', [])

//this chap shares
.controller('sharingCtrl', ['$scope', '$stateParams', '$cordovaSocialSharing',
function ($scope, $stateParams, $cordovaSocialSharing) {
	$scope.postType = $stateParams.postType;
	$scope.share = function() {
		$cordovaSocialSharing.share('Hi! I am learning more about how I can contribute to the communinty of persons with disability with Mpower app! Acceptence, Accessibility, Advocacy for all! Install now to know more: http://provisionasia.org/share/mpower ! ');
	}
	
	$scope.email = function() {
		window.plugins.socialsharing.shareViaEmail(
			'Message: ', 'Mpower Contact Form',
			['mpowercontact@provisionasia.org'], // To
			null, null, null, null, null
		);
	}
	
	$scope.bugReport = function() {
		window.plugins.socialsharing.shareViaEmail(
			'Message: ','Feedback - BugReport',
			['mpower@provisionasia.org'], // To
			null, null, null, null, null
		);
	}
}])

.controller('preloadCtrl', ['$scope', '$http', 'CacheFactory', '$rootScope',
function ($scope, $http, CacheFactory, $rootScope) {
 	
 	if ( !CacheFactory.get('postCache') ) CacheFactory.createCache('postCache',{storageMode:'localStorage'});
	var postCache = CacheFactory.get( 'postCache' );
	
	if ( !CacheFactory.get('imCache') ) CacheFactory.createCache('imCache',{storageMode:'localStorage'});
	var imCache = CacheFactory.get( 'imCache' );
	
	if ( ! CacheFactory.get('resCache') ) CacheFactory.createCache('resCache',{storageMode:'localStorage'});
	var resCache = CacheFactory.get( 'resCache' );
	
	$http.get('http://mpower.provisionasia.org/wp-json/wp/v2/posts?per_page=1&_query=[*].id', {timeout:3000})
		.then(function(response) { $rootScope.isOnline = true; }, function(response) { $rootScope.isOnline = false; } );
	
	var preload = function( type ) {
		if(!($rootScope.loaded_online[type+1])) {
			var query = '_query=[*].{id: id, title: title.rendered, excerpt:excerpt.rendered, content: content.rendered, image: featured_media}';
			var tail;
			switch(type) {
				case 'challenge': tail = 'toolkit?categories=47&order=asc&per_page=30&' + query; break;
				case 'toolkit': tail = 'toolkit?categories=4&per_page=30&order=asc&' + query;break;
				default: tail = type + '?'  + query + '&order=desc'; break;
			}
			$http.get('http://mpower.provisionasia.org/wp-json/wp/v2/' + tail, {timeout:9000} ).then(function(pre_data) {
				pre_data.data.forEach(function(post) {
					var id = post.id;
					if(type == 'toolkit' && id == 268) post.internal_link = '#/content/challenge';
					else post.internal_link='#/post/' + type + '/' + id;
					postCache.put( id , post );
					postCache.remove(type+1);
					postCache.put(type+1, pre_data.data);
					if((post.image>0) && !imCache.get( post.image)) {
						var media_link = 'http://mpower.provisionasia.org/wp-json/wp/v2/' + 'media?include='+post.image+'&_query=[*].media_details.sizes.medium.source_url';
						$http.get( media_link , {timeout:9000} ).then(function(image) {
							imCache.put( post.image , image[post.image] );
						});
					}
					$rootScope.loaded_online[id] = true;
				});
				$rootScope.loaded_online[type+1] = true;
			}, function(pre_data) {
				$rootScope.isOnline = false;
			});
		}
	}
	
	var preload_vid = function( ) {
		if(!($rootScope.loaded_online['309'])) {
			$http.get('http://mpower.provisionasia.org/wp-json/wp/v2/toolkit?include=309&_query=[*].{id: id, content: content.rendered}', {timeout:9000} ).then(function(post) {
				postCache.put('309', post.data[0]);
				$rootScope.loaded_online['309'] = true;
			}, function(pre_data) {
				$rootScope.isOnline = false;
			});
		}
	}
	
	home_init = function() {
		postTypes = ['toolkit','challenge','posts','news'];
		if(angular.isUndefined($rootScope.loaded_online)) $rootScope.loaded_online = {};
		preload_vid();
		postTypes.forEach( function(type) {
			preload(type); 
		});
	}
	
	home_init();
}])

.controller('wordpressCtrl', ['$scope', '$stateParams', '$http', 'CacheFactory', '$ionicLoading', '$rootScope',
function ($scope, $stateParams, $http, CacheFactory, $ionicLoading, $rootScope) {

	var baseUrl = 'http://mpower.provisionasia.org/wp-json/wp/v2/';
	var postType = $stateParams.postType;
	var postId = $stateParams.postId;
	var http_ops = {timeout:9000};
	var warning = 0;
	var page = 1;
	$scope.moreItems = (((postType == 'toolkit') || (postType == 'challenge'))?false:true);

	$scope.warning_data = { state: false,	message: '', icon:'' };
	
	$scope.class = function() {
		return ((postType == 'challenge')?'toolkit':postType);
	}
	
	$scope.title = function() {
		switch(postType) {
			case 'challenge':
			case 'toolkit': $scope.background = '251, 156, 108';return 'Engage Disability Toolkit'; break;
			case 'posts': $scope.background = '47,178,183';return 'Articles'; break;
			case 'news': $scope.background = '219,36,30';return 'News'; break;
		}
	}
 	
 	if ( ! CacheFactory.get('postCache') ) CacheFactory.createCache('postCache',{storageMode:'localStorage'});
	var postCache = CacheFactory.get( 'postCache' );
	
	if ( ! CacheFactory.get('imCache') ) CacheFactory.createCache('imCache',{storageMode:'localStorage'});
	var imCache = CacheFactory.get( 'imCache' );

	$scope.post = [], image = [];

	$scope.$watch(function() {
		return warning;
	}, function() {
		if(warning == 2 && $rootScope.isOnline) warning = 0;
		switch(warning) {
			case 0: $scope.warning_data = { "state":false }; break;
			case 1: $scope.warning_data = {
					"state":true,
					"message":'Request timed out. Please make sure that you are connected to the internet.',
					"icon":"ion-connection-bars"
				}; break;
			case 2: $scope.warning_data = {
					"state":true,
					"message":'You are offline. Some functions may not work as expected while offline.',
					"icon":"ion-ios-world-outline"
					}; break;
			case 3: $scope.warning_data = {
					"state":true,
					"message":'Trouble connecting. Showing cached version of articles.',
					"icon":"ion-connection-bars"
					}; break;
			case 4: $scope.warning_data = {
					"state":true,
					"message":'No ' + $scope.title() + ' found.',
					"icon":"ion-ios-list-outline"
					}; break;
		}
	});
	
	var checkOnline = function() {
		$http.get('http://mpower.provisionasia.org/wp-json/wp/v2/posts?per_page=1&_query=[*].id', {timeout: 3000} ).then(function(response) { 
			$rootScope.isOnline = true; 
			warning = 0;
		},function() { 
			$rootScope.isOnline = false; 
			warning = 3; 
		});
	}
	
	checkOnline();
	
	var loading = function( truth ) {
		if(page == 1) {
			if(truth) $ionicLoading.show({template: 'Loading...', duration: 5000 });
			else $ionicLoading.hide();
		}
		$scope.loading = truth;
	}
	
	$scope.getImage = function( id ) { return image[id]; }
	
	var wpLoader = function( type ) {
		var cache;
		var first_done = false;
		if(postId) {
			if($rootScope.loaded_online[postId] && postCache.get(postId)) cache = true;
			else cache = false;
		} else { 
			if ($rootScope.loaded_online[type+page] && postCache.get(type+page)) cache = true;
			else cache = false;
		}
		if(postId == 3) $scope.showShare = true;
		if(cache) {
			if(postId) $scope.post.push(postCache.get(postId));
			else {
				var posts = postCache.get(type+page);
				posts.forEach(function(post) {
					$scope.post.push(post);
					if((post.image>0) && !imCache.get(post.image)) {
						var media_link = baseUrl + 'media?include='+post.image+'&_query=[*].media_details.sizes.medium.source_url';
						$http.get( media_link , http_ops ).then(function(image) {
							image[post.image] = image.data[0];
							imCache.put( post.image , image.data[0] );
						},function(response) {
							console.log('image failed',response.status);
						});
					} else if(imCache.get( post.image)) image[post.image] = imCache.get( post.image);
				});
			}
			checkOnline();
			loading(false);
		} else {
			var query = '_query=[*].{id: id, title: title.rendered, excerpt:excerpt.rendered, content: content.rendered, image: featured_media}';
			var tail;
			if(postId == 309) tail = 'toolkit?' + query;
			else switch(type) {
				case 'challenge': tail = 'toolkit?categories=47&order=asc&per_page=30&' + query; break;
				case 'toolkit': tail = 'toolkit?categories=4&per_page=30&order=asc&' + query;break;
				default: tail = type + '?'  + query + '&order=desc&page=' + page; break;
			}
			if(postId) tail = tail + '&include=' + postId;
			$http.get(baseUrl + tail, http_ops ).then(function(response) {
				response.data.forEach(function(post) {
					var id = post.id;
					if(type == 'toolkit' && id == 268) post.internal_link = '#/content/challenge';
					else post.internal_link='#/post/' + type + '/' + id;
					var i = $scope.post.length;
					$scope.post.push(post);
					postCache.remove(id);
					postCache.put( id , post );
					if(!postId) {
						postCache.remove(type+page);
						postCache.put(type+page, response.data);
					}
					if((post.image>0) && !imCache.get( post.image)) {
						var media_link = baseUrl + 'media?include='+post.image+'&_query=[*].media_details.sizes.medium.source_url';
						$http.get( media_link , http_ops ).then(function(image) {
							image[post.image] = image.data[0];
							imCache.put( post.image , image[post.image] );
						});
					} else if(imCache.get( post.image)) image[post.image] = imCache.get( post.image);
					$rootScope.loaded_online[id] = true;
				});
				if(!postId) $rootScope.loaded_online[type+page] = true;
				warning = 0;
				$rootScope.isOnline = true;
				$scope.moreItems = ((angular.isUndefined(response.data[0])) || (postType == 'toolkit') || (postType == 'challenge'))?false:true;
				loading(false);
			}, function(response) {
				if(postCache.get(type+page) && !postId) {
					data = postCache.get(type+page);
					data.forEach(function(post) {
						$scope.post.push(post);
					});
					warning = 3;
					loading(false);
				} else if(postId && postCache.get(postId)) {
					$scope.post.push(postCache.get(postId));
					warning = 3;
					loading(false);
				} else if(((type == 'toolkit') || (type == 'challenge')) && !postId) {
					$http.get('assets/toolkit/' + type + '_meta.json', http_ops ).then(function(offline) {
						$scope.post = offline.data;
						$scope.post.forEach(function(post) {
							if(type == 'toolkit' && post.id == 268) post.internal_link = '#/content/challenge';
							else post.internal_link='#/post/' + type + '/' + post.id;
							postCache.put(post.id,post);
						});
						loading(false);
					});
					warning = 3;
					$rootScope.loaded_online[type+page] = false;
				} else {
					console.log('Data read error (Error Code: ' + response.status + ')');
					warning = 1;
					loading(false);
				}
				$rootScope.isOnline = false;
			});
		}
	}
	
	$scope.init = function() {
		$scope.post = [];
		loading(true);
		if(((postType == 'toolkit' && postId) || (postType == 'challenge' && !postId)) && angular.isUndefined($scope.resource_id)) {
			var cat_url = baseUrl + 'categories?_query=[*].id&slug=' + ((postType == 'challenge')?268:postId);
			$http.get( cat_url , {timeout: 3000, cache:true} )
			.then(function(response) { 
				$scope.resource_id =  response.data[0];
				postCache.put(postType + (postId?postId:'') + 'res',response.data[0]);
			}, function() { 
				if(postCache.get(postType + (postId?postId:'') + 'res')) 
					$scope.resource_id = postCache.get(postType + (postId?postId:'') + 'res');
				warning = 1; 
			});
		}
		wpLoader(postType);	
	}

	$scope.doRefresh = function( other ) {
		if(!$scope.loading) {
			loading(true);
			page = 1;
			if(postId) $rootScope.loaded_online[postId] = false;
			else {
				for(var i=1;i<page+1;i=i+1) {
					$rootScope.loaded_online[postType+i] = false;
				}
			}
			$scope.post = [];
			page = 1;
			wpLoader(postType);
		}
		$scope.$broadcast('scroll.refreshComplete');
 	}
	
 	$scope.loadMore = function( ) {
		if(!$scope.loading) {
			$scope.loading = true;
			page = page + 1;
			wpLoader(postType);
		}
		$scope.$broadcast('scroll.infiniteScrollComplete');
	}
}])

.controller('addResCtrl', ['$scope', '$stateParams', '$http', 'CacheFactory','$sce', '$ionicLoading', '$cordovaInAppBrowser','$rootScope',
function ($scope, $stateParams, $http, CacheFactory, $sce, $ionicLoading, $cordovaInAppBrowser, $rootScope) {

	$scope.post = [];
	var page = 1;
	$scope.postType = $stateParams.postType;
	$scope.op = $stateParams.op;
	$scope.baseURL = 'http://mpower.provisionasia.org/wp-json/wp/v2/';
	$scope.linkBaseURL = $scope.baseURL + $scope.postType;
	if(angular.isUndefined($rootScope.loadedRes)) $rootScope.loadedRes = {};

	$scope.no_item = 1;
	var http_ops = { timeout: 9000 };
	$scope.warning_data = {
		"state":false,
		"message":'',
		"icon":""
	}
	var warning = 0;
	
	if ( ! CacheFactory.get('resCache') ) CacheFactory.createCache('resCache',{storageMode:'localStorage'});
	var resCache = CacheFactory.get( 'resCache' );
	
	if ( ! CacheFactory.get('imCache') ) CacheFactory.createCache('imCache',{storageMode:'localStorage'});
	var imCache = CacheFactory.get( 'imCache' );
	
	var checkOnline = function() {
		$http.get('http://mpower.provisionasia.org/wp-json/wp/v2/posts?per_page=1&_query=[*].id', {timeout: 3000} ).then(function(response) { 
			$rootScope.isOnline = true; 
			warning = 0;
		},function() { 
			$rootScope.isOnline = false; 
			warning = 2; 
		});
	}
	
	checkOnline();
	
	$scope.title = function() {
		$scope.options = JSON.parse($stateParams.options);
		return $scope.options.title;
	}

	var loading = function( truth ) {
		if(page == 1) {
			if(truth) $ionicLoading.show({template: 'Loading '+ $scope.title() + '...',duration: 20000});
			else $ionicLoading.hide();
		}
		$scope.loading = truth;
	}

	$scope.clickText = function() {
		switch($scope.options.tagName) {
			case 'Videos':return 'Watch now';
				break;
			case 'Books':return 'Buy the book';
				break;
			case 'Articles':return 'Read the article';
				break;
			case 'Websites':return 'Visit the website';
				break;
			default: return 'Click here';
		}
	}

	$scope.$watch(function() {
		return warning;
	}, function() {
		if(warning == 2 && $rootScope.isOnline) warning = 0;
		switch(warning) {
			case 0: $scope.warning_data.state = false; break;
			case 1: $scope.warning_data['state'] = true;
					$scope.warning_data['message'] = 'Request timed out. Please make sure that you are connected to the internet.';
					$scope.warning_data['icon'] = "ion-connection-bars";
					break;
			case 2: $scope.warning_data['state'] = true;
					$scope.warning_data['message'] = 'You are offline. Using Cached versions of articles.';
					$scope.warning_data['icon'] = "ion-ios-world-outline";
					break;
			case 3: $scope.warning_data['state'] = true;
					$scope.warning_data['message'] = 'No additional resources found for this section.';
					$scope.warning_data['icon'] = 'ion-ios-list-outline';
					break;
		}
	});

	$scope.openBrowser = function(url) {
		$cordovaInAppBrowser.open($sce.trustAsUrl(url), '_system');
   }

	$scope.sketchImage = function( i , id , quality ) {
		var media_link = $scope.baseURL + 'media?include='+id+'&_query=[*].media_details.sizes.'+quality+'.source_url';
		if(imCache.get(id)) $scope.post[i].image_url = imCache.get(id);
		else {
			$http.get( media_link , { timeout: 4000, cache:true } ).then(function(response) {
				$scope.post[i].image_url = $sce.trustAsUrl(response.data[0]);
				imCache.put(id, response.data[0]);
				$rootScope.isOnline = true;
			}, function() {
				if(imCache.get(id)) $scope.post[i].image_url = imCache.get(id);
				$rootScope.isOnline = false;
			});
		}
	}
	
	$scope.$watch(function() { return $scope.no_item; }, function() {
		if($scope.no_item == 0) warning = 3;
	});

	var op1 = function() {
		$scope.moreItems = false;
		if($rootScope.loadedRes[$scope.options.topic] && resCache.get($scope.options.topic)) {
			$scope.post = resCache.get($scope.options.topic);
			loading(false);
			checkOnline();
		} else {
			var local_url = $scope.baseURL + 'tags?_query=[*].{title:name, id: id, icon: description}';
			$http.get( local_url , http_ops ).then( function(response) {
				$scope.no_item = response.data.length;
				response.data.forEach(function(value) {
					var tag_check_url =$scope.linkBaseURL + '?_query=[*].id&per_page=1&categories=' + $scope.options.topic + '&tags=' + value.id;
					$http.get( tag_check_url , http_ops ).then( function(list) {
						if(list.data[0]>0){
							$scope.post.push(value);
							var i = $scope.post.length - 1;
							$scope.post[i].internal_link = '#/addRes/resource_link/{"title":"'+$scope.options.title + ': ' + $scope.post[i].title + '","topic":'+ $scope.options.topic + ',"tag":' + $scope.post[i].id + ',"tagName":"' + $scope.post[i].title + '"}/2';
							$scope.post[i].class = ($scope.post[i].icon)?'item-icon-left dark item-text-wrap':'item dark item-text-wrap';
							resCache.put($scope.options.topic, $scope.post);
						} else $scope.no_item--;
					});
				});
				$rootScope.isOnline = true;
				$rootScope.loadedRes[$scope.options.topic] = true;
				loading(false);
			}, function() {
				if(resCache.get($scope.options.topic)) {
					$scope.post = resCache.get($scope.options.topic);
					warning = 2;
				} else warning = 1;
				loading(false);
				$rootScope.isOnline = false;
			});
		}
	}

	var op2 = function() {
		$scope.moreItems = true;
		if($rootScope.loadedRes[$scope.options.topic+'+'+$scope.options.tag+'+'+page] && resCache.get($scope.options.topic+'+'+$scope.options.tag+'+'+page)) {
			var posts = resCache.get($scope.options.topic+'+'+$scope.options.tag+'+'+page);
			posts.forEach(function(post) {
				$scope.post.push(post);
				var i = $scope.post.length - 1;
				if(($scope.post[i].image > 0) && !$scope.post[i].image_url) $scope.sketchImage(i,$scope.post[i].image,'medium');
			});
			checkOnline();
			loading(false);
		} else {
			local_url = $scope.linkBaseURL + '?_query=[*].{id:id,title:title.rendered,excerpt:excerpt.rendered,content:content.rendered,image:featured_media}&categories='+$scope.options.topic+'&tags='+$scope.options.tag+'&page=' + page;
			$http.get( local_url , http_ops ).then( function(response) {
				response.data.forEach(function(value) {
					$scope.post.push(value);
					var i = $scope.post.length - 1;
					//extract links from excerpt
					var htmlObject = document.createElement('div');
					htmlObject.innerHTML = $scope.post[i].excerpt;
					var link = htmlObject.getElementsByTagName('p');
					$scope.post[i].link = link[0].innerHTML;
					$scope.post[i].class = ($scope.post[i].image)?'item-thumbnail-left dark item-text-wrap':'item dark item-text-wrap';
					resCache.remove($scope.options.topic+'+'+$scope.options.tag+'+'+page,$scope.post);
					resCache.put($scope.options.topic+'+'+$scope.options.tag+'+'+page,$scope.post);
					if(value.image > 0) $scope.sketchImage(i,value.image,'medium');
				});
				$rootScope.loadedRes[$scope.options.topic+'+'+$scope.options.tag+'+'+page] = true;
				loading(false);
				$scope.moreItems = (angular.isDefined(response.data[0]))?true:false;
				warning = 0;
				$rootScope.isOnline = true;
			}, function(response) {
				if(resCache.get($scope.options.topic+'+'+$scope.options.tag+'+'+page)) {
					$scope.post = resCache.get($scope.options.topic+'+'+$scope.options.tag+'+'+page);
					warning = 2;
				} else warning = 1;
				loading(false);
				$rootScope.isOnline = false;
			});
		}
	}

	var starter = function( ) {
		if(!$scope.loading) {
			loading(true);
			$scope.moreItems = false;
			$scope.post = [];
			page = 1;
			switch($scope.op) {
				case '1':op1(); break;
				case '2':op2(); break;
			}
		}
 	}
 	starter();
 	
 	$scope.refresh = function( other ) {
		if($rootScope.isOnline && !$scope.loading) {
			for(var i = 1;i<page + 1; i= i+1) {
				$rootScope.loadedRes[$scope.options.topic+($scope.options.tag?'+'+$scope.options.tag+'+'+i:'')] = false;
			}
			starter();
		}
		$scope.$broadcast('scroll.refreshComplete');
	}

	$scope.loadMore = function( ) {
		if(($scope.op == 2) && !$scope.loading ) {
			$scope.loading = true;
			page = page + 1;
			op2();
		}
		$scope.$broadcast('scroll.infiniteScrollComplete');
	}
}]);
