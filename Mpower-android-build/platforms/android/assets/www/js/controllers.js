angular.module("app.controllers",[]).controller("sharingCtrl",["$scope","$stateParams","$cordovaSocialSharing",function($scope,$stateParams,$cordovaSocialSharing){$scope.postType=$stateParams.postType,$scope.share=function(){$cordovaSocialSharing.share("Hi! I am learning more about how I can contribute to the communinty of persons with disabillity with Mpower app! Acceptence, Accessibility, Advicacy for all! Install now to know more: http://provisionasia.org/share/mpower ! ")},$scope.email=function(){window.plugins.socialsharing.shareViaEmail("Message: ","Subject | Mpower Contact Form",["mpower@provisionasia.org"],null,null,null,void 0,void 0)},$scope.bugReport=function(){window.plugins.socialsharing.shareViaEmail("Message: ","Subject | Feedback/BugReport",["mpower@provisionasia.org","jessepfrancis@provisionasia.org"],null,null,null,void 0,void 0)}}]).controller("preloadCtrl",["$scope","$stateParams","$http","CacheFactory","$timeout","$rootScope",function($scope,$stateParams,$http,CacheFactory,$timeout,$rootScope){CacheFactory.get("postCache")||CacheFactory.createCache("postCache",{storageMode:"localStorage"});var postCache=CacheFactory.get("postCache");CacheFactory.get("imCache")||CacheFactory.createCache("imCache",{storageMode:"localStorage"});var imCache=CacheFactory.get("imCache");CacheFactory.get("resCache")||CacheFactory.createCache("resCache",{storageMode:"localStorage"});CacheFactory.get("resCache");$http.get("http://mpower.provisionasia.org/wp-json/wp/v2/posts?per_page=1&_query=[*].id",{timeout:3e3}).then(function(){$rootScope.isOnline=!0},function(){$rootScope.isOnline=!1});var preload=function(type){if(!$rootScope.loaded_online[type+1]){var tail,query="_query=[*].{id: id, title: title.rendered, excerpt:excerpt.rendered, content: content.rendered, image: featured_media}";switch(type){case"challenge":tail="toolkit?categories=47&order=asc&per_page=30&"+query;break;case"toolkit":tail="toolkit?categories=4&per_page=30&order=asc&"+query;break;default:tail=type+"?"+query+"&order=desc"}$http.get("http://mpower.provisionasia.org/wp-json/wp/v2/"+tail,{timeout:9e3}).then(function(pre_data){pre_data.data.forEach(function(post){var id=post.id;if(post.internal_link="toolkit"==type&&268==id?"#/content/challenge":"#/post/"+type+"/"+id,postCache.put(id,post),postCache.remove(type+1),postCache.put(type+1,pre_data.data),post.image>0&&!imCache.get(post.image)){var media_link="http://mpower.provisionasia.org/wp-json/wp/v2/media?include="+post.image+"&_query=[*].media_details.sizes.medium.source_url";$http.get(media_link,{timeout:9e3}).then(function(image){imCache.put(post.image,image[post.image])})}$rootScope.loaded_online[id]=!0}),$rootScope.loaded_online[type+1]=!0},function(){$rootScope.isOnline=!1})}};(home_init=function(){postTypes=["toolkit","challenge","posts","news"],angular.isUndefined($rootScope.loaded_online)&&($rootScope.loaded_online={}),$http.get("http://mpower.provisionasia.org/wp-json/wp/v2/posts?per_page=1&_query=[*].id",{timeout:3e3}).then(function(){postTypes.forEach(function(type){preload(type)})},function(){$rootScope.isOnline=!1})})()}]).controller("wordpressCtrl",["$scope","$stateParams","basicServices","$http","CacheFactory","$sce","$timeout","$ionicLoading","$rootScope",function($scope,$stateParams,basicServices,$http,CacheFactory,$sce,$timeout,$ionicLoading,$rootScope){baseUrl="http://mpower.provisionasia.org/wp-json/wp/v2/",postType=$stateParams.postType,postId=$stateParams.postId,http_ops={timeout:9e3},warning=0,page=1,moreItems="toolkit"!==postType&&"challenge"!==postType?!1:!0;var view_post=!1;$scope.page={resource_id:null,warning_data:{state:!1,message:"",icon:""},loading:!1},$scope.class=function(){return"challenge"==postType?"toolkit":postType},$scope.title=function(){switch(postType){case"challenge":case"toolkit":return $scope.background="251, 156, 108","Engage Disability Toolkit";case"posts":return $scope.background="139,41,97","Articles";case"news":return $scope.background="203,88,91","News"}},CacheFactory.get("postCache")||CacheFactory.createCache("postCache",{storageMode:"localStorage"});var postCache=CacheFactory.get("postCache");CacheFactory.get("imCache")||CacheFactory.createCache("imCache",{storageMode:"localStorage"});var imCache=CacheFactory.get("imCache");$scope.post=[],image=[],$http.get("http://mpower.provisionasia.org/wp-json/wp/v2/posts?per_page=1&_query=[*].id",{timeout:3e3}).then(function(){$rootScope.isOnline=!0},function(){$rootScope.isOnline=!1}),$scope.$watch(function(){return warning},function(){switch(2==warning&&$rootScope.isOnline&&(warning=0),warning){case 0:$scope.page.warning_data={state:!1};break;case 1:$scope.page.warning_data={state:!0,message:"Request timed out. Please make sure that you are connected to the internet.",icon:"ion-connection-bars"};break;case 2:$scope.page.warning_data={state:!0,message:"You are offline. Some functions may not work as expected while offline.",icon:"ion-ios-world-outline"};break;case 3:$scope.page.warning_data={state:!0,message:"Trouble connecting. Showing cached version of articles.",icon:"ion-connection-bars"};break;case 4:$scope.page.warning_data={state:!0,message:"No "+$scope.title()+" found.",icon:"ion-ios-list-outline"}}});var loading=function(truth){1==page&&(truth?$ionicLoading.show({template:"Loading...",duration:5e3}):$ionicLoading.hide()),$scope.page.loading=truth};$scope.getImage=function(id){return image[id]};var wpLoader=function(type){var cache;if(cache=postId?$rootScope.loaded_online[postId]&&postCache.get(postId)?!0:!1:$rootScope.loaded_online[type+page]&&postCache.get(type+page)?!0:!1,view_post&&cache)postId?$scope.post.push(postCache.get(postId)):$scope.post=postCache.get(type+page),$scope.post.forEach(function(post){if(post.title_size="1.7em",view_post&&post.image>0&&!imCache.get(post.image)){var media_link=baseUrl+"media?include="+post.image+"&_query=[*].media_details.sizes.medium.source_url";$http.get(media_link,http_ops).then(function(image){image[post.image]=image.data[0],imCache.put(post.image,image.data[0])},function(response){})}else imCache.get(post.image)&&(image[post.image]=imCache.get(post.image))}),$http.get(baseUrl+"posts?per_page=1&_query=[*].id",http_ops).then(function(){warning=0},function(){warning=3}),loading(!1);else{var tail,query="_query=[*].{id: id, title: title.rendered, excerpt:excerpt.rendered, content: content.rendered, image: featured_media}";if(309==postId)tail="toolkit?"+query;else switch(type){case"challenge":tail="toolkit?categories=47&order=asc&per_page=30&"+query;break;case"toolkit":tail="toolkit?categories=4&per_page=30&order=asc&"+query;break;default:tail=type+"?"+query+"&order=desc&page="+page}postId&&(tail=tail+"&include="+postId),$http.get(baseUrl+tail,http_ops).then(function(response){response.data.forEach(function(post){var id=post.id;if(post.internal_link="toolkit"==type&&268==id?"#/content/challenge":"#/post/"+type+"/"+id,post.title_size="1.7em",view_post){$scope.post.length}if(view_post&&$scope.post.push(post),postCache.remove(id),postCache.put(id,post),postId||(postCache.remove(type+page),postCache.put(type+page,response.data)),view_post&&post.image>0&&!imCache.get(post.image)){var media_link=baseUrl+"media?include="+post.image+"&_query=[*].media_details.sizes.medium.source_url";$http.get(media_link,http_ops).then(function(image){image[post.image]=image.data[0],imCache.put(post.image,image[post.image])})}else imCache.get(post.image)&&(image[post.image]=imCache.get(post.image));$rootScope.loaded_online[id]=!0}),loading(!1),postId||($rootScope.loaded_online[type+page]=!0),warning=0,angular.isUndefined(response.data[0])&&(moreItems=!1)},function(response){response.status>0?(moreItems=!1,loading(!1)):postCache.get(type+page)&&view_post&&!postId?(data=postCache.get(type+page),data.forEach(function(post){$scope.post.push(post)}),warning=3,loading(!1)):postId&&view_post&&postCache.get(postId)?($scope.post.push(postCache.get(postId)),warning=3,loading(!1)):view_post&&("toolkit"!=type&&"challenge"!=type||postId?postId&&postCache.get(postId)?($scope.post.push(postCache.get(postId)),loading(!1),$rootScope.loaded_online[type+page]=!1):(warning=1,loading(!1)):($http.get("assets/toolkit/"+type+"_meta.json",http_ops).then(function(offline){$scope.post=offline.data,$scope.post.forEach(function(post){post.title_size="1.7em",post.internal_link="toolkit"==type&&268==post.id?"#/content/challenge":"#/post/"+type+"/"+post.id,postCache.put(post.id,post)}),loading(!1)}),warning=3,$rootScope.loaded_online[type+page]=!1))})}};$scope.init=function(){if($scope.post=[],loading(!0),("toolkit"==postType&&postId||"challenge"==postType&&!postId)&&angular.isUndefined($scope.resource_id)){var cat_url=baseUrl+"categories?_query=[*].id&slug="+("challenge"==postType?268:postId);$http.get(cat_url,{timeout:3e3,cache:!0}).then(function(response){$scope.resource_id=response.data[0],postCache.put(postType+(postId?postId:"")+"res",response.data[0])},function(){postCache.get(postType+(postId?postId:"")+"res")&&($scope.resource_id=postCache.get(postType+(postId?postId:"")+"res")),warning=1})}view_post=!0,wpLoader(postType)},$scope.doRefresh=function(){$scope.page.loading||(loading(!0),$rootScope.isOnline&&(page=1,postCache.remove(postId?postId:("challenge"==postType?"toolkit":postType)+page)),$scope.post=[],page=1,wpLoader(postType)),$scope.$broadcast("scroll.refreshComplete")},$scope.more=function(){switch(postType){case"toolkit":return!1;case"challenge":return!1;default:return moreItems}},$scope.loadMore=function(){$scope.page.loading||(page+=1,wpLoader(postType)),$scope.$broadcast("scroll.infiniteScrollComplete")}}]).controller("addResCtrl",["$scope","$stateParams","$http","CacheFactory","$sce","$ionicLoading","$cordovaInAppBrowser","$rootScope","basicServices",function($scope,$stateParams,$http,CacheFactory,$sce,$ionicLoading,$cordovaInAppBrowser,$rootScope){$scope.post=[];var page=1;$scope.postType=$stateParams.postType,$scope.op=$stateParams.op,$scope.baseURL="http://mpower.provisionasia.org/wp-json/wp/v2/",$scope.linkBaseURL=$scope.baseURL+$scope.postType,angular.isUndefined($rootScope.loadedRes)&&($rootScope.loadedRes={}),$scope.no_item=1;var http_ops={timeout:9e3};$scope.warning_data={state:!1,message:"",icon:""},warning=0,CacheFactory.get("resCache")||CacheFactory.createCache("resCache",{storageMode:"localStorage"});var resCache=CacheFactory.get("resCache");CacheFactory.get("imCache")||CacheFactory.createCache("imCache",{storageMode:"localStorage"});var imCache=CacheFactory.get("imCache");$http.get("http://mpower.provisionasia.org/wp-json/wp/v2/posts?per_page=1&_query=[*].id",{timeout:1e3}).success(function(){$rootScope.isOnline=!0}).error(function(){$rootScope.isOnline=!1}),$scope.title=function(){return $scope.options=JSON.parse($stateParams.options),$scope.options.title};var loading=function(truth){1==page&&(truth?$ionicLoading.show({template:"Loading "+$scope.title()+"...",duration:2e4}):$ionicLoading.hide()),$scope.loading=truth};$scope.clickText=function(){switch($scope.options.tagName){case"Videos":return"Watch now";case"Books":return"Buy the book";case"Articles":return"Read the article";case"Websites":return"Visit the website";default:return"Click here"}},$scope.$watch(function(){return warning},function(){switch(2==warning&&$rootScope.isOnline&&(warning=0),warning){case 0:$scope.warning_data.state=!1;break;case 1:$scope.warning_data.state=!0,$scope.warning_data.message="Request timed out. Please make sure that you are connected to the internet.",$scope.warning_data.icon="ion-connection-bars";break;case 2:$scope.warning_data.state=!0,$scope.warning_data.message="You are offline. Using Cached versions of articles.",$scope.warning_data.icon="ion-ios-world-outline";break;case 3:$scope.warning_data.state=!0,$scope.warning_data.message="No additional resources found for this section.",$scope.warning_data.icon="ion-ios-list-outline";break;case 3:$scope.warning_data.state=!0,$scope.warning_data.message="Trouble connecting to internet.",$scope.warning_data.icon="ion-ios-world-outline"}}),$scope.openBrowser=function(url){$cordovaInAppBrowser.open($sce.trustAsUrl(url),"_system")},$scope.sketchImage=function(i,id,quality){var media_link=$scope.baseURL+"media?include="+id+"&_query=[*].media_details.sizes."+quality+".source_url";imCache.get(id)?$scope.post[i].image_url=imCache.get(id):$http.get(media_link,{timeout:4e3,cache:!0}).then(function(response){$scope.post[i].image_url=$sce.trustAsUrl(response.data[0]),imCache.put(id,response.data[0])},function(){imCache.get(id)&&($scope.post[i].image_url=imCache.get(id))})},$scope.$watch(function(){return $scope.no_item},function(){0==$scope.no_item&&(warning=3)});var op0=function(){if($scope.moreItems=!1,$rootScope.loadedRes.tag_list&&resCache.get("tag_list"))$scope.post=resCache.get("tag_list"),loading(!1);else{var local_url=$scope.baseURL+"tags?_query=[*].{title:name, id: id, icon: description}";$http.get(local_url,http_ops).then(function(response){$scope.no_item=response.data.length,response.data.forEach(function(value){var tag_check_url=$scope.linkBaseURL+"?_query=[*].id&tags="+value.id;$http.get(tag_check_url,http_ops).then(function(list){if(list.data[0]>0){$scope.post.push(value);var i=$scope.post.length-1;$scope.post[i].internal_link='#/addRes/resource_link/{"title":"'+value.title+'","topic":1,"tag":'+$scope.post[i].id+',"tagName":"'+$scope.post[i].title+'"}/2',$scope.post[i].class=$scope.post[i].icon?"item-icon-left dark item-text-wrap":"item dark item-text-wrap",resCache.put("tag_list",$scope.post)}else $scope.no_item--})}),$rootScope.loadedRes.tag_list=!0,loading(!1)},function(){resCache.get("tag_list")?($scope.post=resCache.get("tag_list"),warning=2):warning=1,loading(!1)})}},op1=function(){if($scope.moreItems=!1,$rootScope.loadedRes[$scope.options.topic]&&resCache.get($scope.options.topic))$scope.post=resCache.get($scope.options.topic),loading(!1);else{var local_url=$scope.baseURL+"tags?_query=[*].{title:name, id: id, icon: description}";$http.get(local_url,http_ops).then(function(response){$scope.no_item=response.data.length,response.data.forEach(function(value){var tag_check_url=$scope.linkBaseURL+"?_query=[*].id&categories="+$scope.options.topic+"&tags="+value.id;$http.get(tag_check_url,http_ops).then(function(list){if(list.data[0]>0){$scope.post.push(value);var i=$scope.post.length-1;$scope.post[i].internal_link='#/addRes/resource_link/{"title":"'+$scope.options.title+'","topic":'+$scope.options.topic+',"tag":'+$scope.post[i].id+',"tagName":"'+$scope.post[i].title+'"}/2',$scope.post[i].class=$scope.post[i].icon?"item-icon-left dark item-text-wrap":"item dark item-text-wrap",resCache.put($scope.options.topic,$scope.post)}else $scope.no_item--})}),$rootScope.loadedRes[$scope.options.topic]=!0,loading(!1)},function(){resCache.get($scope.options.topic)?($scope.post=resCache.get($scope.options.topic),warning=2):warning=1,loading(!1)})}},op2=function(){if($rootScope.loadedRes[$scope.options.topic+"+"+$scope.options.tag+"+"+page]&&resCache.get($scope.options.topic+"+"+$scope.options.tag+"+"+page)){$scope.post=resCache.get($scope.options.topic+"+"+$scope.options.tag+"+"+page);for(var i=0;i<$scope.post.length;i+=1)$scope.post[i].image>0&&$scope.sketchImage(i,$scope.post[i].image,"medium");$http.get($scope.linkBaseURL+"?_query=[*].id&per_page=1",http_ops).then(function(){$rootScope.isOnline=!0,warning=0},function(){$rootScope.isOnline=!0,warning=2}),loading(!1)}else local_url=$scope.linkBaseURL+"?_query=[*].{id:id,title:title.rendered,excerpt:excerpt.rendered,content:content.rendered,image:featured_media}&categories="+$scope.options.topic+"&tags="+$scope.options.tag+"&page="+page,$http.get(local_url,http_ops).then(function(response){response.data.forEach(function(value){$scope.post.push(value);var i=$scope.post.length-1,htmlObject=document.createElement("div");htmlObject.innerHTML=$scope.post[i].excerpt;var link=htmlObject.getElementsByTagName("p");$scope.post[i].link=link[0].innerHTML,$scope.post[i].class=$scope.post[i].image?"item-thumbnail-left dark item-text-wrap":"item dark item-text-wrap",resCache.remove($scope.options.topic+"+"+$scope.options.tag+"+"+page,$scope.post),resCache.put($scope.options.topic+"+"+$scope.options.tag+"+"+page,$scope.post),value.image>0&&$scope.sketchImage(i,value.image,"medium")}),$rootScope.loadedRes[$scope.options.topic+"+"+$scope.options.tag+"+"+page]=!0,loading(!1),$scope.moreItems=angular.isDefined(response.data[0])?!0:!1,warning=0},function(){resCache.get($scope.options.topic+"+"+$scope.options.tag+"+"+page)?($scope.post=resCache.get($scope.options.topic+"+"+$scope.options.tag+"+"+page),warning=2):warning=1,loading(!1)})},starter=function(){if(!$scope.loading)switch(loading(!0),$scope.moreItems=!1,$scope.post=[],page=1,$scope.op){case"0":op0();break;case"1":op1();break;case"2":op2()}};starter(),$scope.refresh=function(){if($rootScope.isOnline&&($rootScope.loadedRes[$scope.options.topic+($scope.options.tag?"+"+$scope.options.tag+"+"+page:"")]=!1),!$scope.loading){switch($scope.op){case"0":resCache.remove("tag_list");break;case"1":resCache.remove($scope.options.topic);break;case"2":resCache.remove($scope.options.topic+"+"+$scope.options.tag+"+"+page)}starter()}$scope.$broadcast("scroll.refreshComplete")},$scope.loadMore=function(){$rootScope.isOnline&&2==$scope.op&&($scope.loading=!0,page+=1,op2()),$scope.$broadcast("scroll.infiniteScrollComplete")}}]);