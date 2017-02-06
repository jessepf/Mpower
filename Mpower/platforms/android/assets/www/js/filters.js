angular.module('app.filters', [])

.filter('html_filters', function ($sce, $rootScope) {

	return function(text) {

		var htmlObject = document.createElement('div');
		htmlObject.innerHTML = text;
		
		var list = htmlObject.getElementsByTagName('UL');
		
		for (var i = 0; i < list.length; i++) {
			list[i].setAttribute('style', 'list-style-type: disc;padding-left:5%;');
		}

		var links = htmlObject.getElementsByTagName('a');
				
		for (var i = 0; i < links.length; i++) {
			var link = links[i].getAttribute('href');
			if(link[0]!=='#') {
				links[i].removeAttribute('href');
				links[i].setAttribute('onclick', 'window.open("'+ link +'", "_system", "location=yes,enableViewportScale=yes")');
			}
		}
		var iframe = htmlObject.getElementsByTagName('iframe');
		

		for (var i = 0; i < iframe.length; i++) {
			if(iframe[i].getAttribute('class') == 'wp-embedded-content') {
				if($rootScope.isOnline) iframe[i].setAttribute('style', 'position:relative;width:100%;height:500px');
				else angular.element(iframe[i]).replaceWith('<div style="margin: 0px; line-height: 150px; background-color: rgb(232, 235, 239); text-align: center;"><i class="icon ion-images" style="font-size: 64px; color: rgb(136, 136, 136); vertical-align: middle;"></i></div>');
			}
			else if(iframe[i].getAttribute('class') == null) {
				if($rootScope.isOnline) {
					iframe[i].setAttribute('style',"position:absolute;top:0;left:0;width:100%;height:100%;");
					iframe[i].setAttribute('frameborder',"0");
					iframe[i].setAttribute('allowfullscreen',"");
					iframe[i].removeAttribute('height');
					iframe[i].removeAttribute('width');
					angular.element(iframe[i]).wrap('<div style="position:relative;overflow:hidden;padding-bottom:56.25%;height:0;"></div>');
				}
				else angular.element(iframe[i]).replaceWith('<div style="margin: 0px; line-height: 150px; background-color: rgb(232, 235, 239); text-align: center;"><i class="icon ion-ios-videocam" style="font-size: 64px; color: rgb(136, 136, 136); vertical-align: middle;"></i></div>');
			}
		}
		return $sce.trustAsHtml(htmlObject.outerHTML);
	}
})

.filter('video_filters', function ($sce, $rootScope) {

	return function(text) {

		var htmlObject = document.createElement('div');
		htmlObject.innerHTML = text;
		
		var iframe = htmlObject.getElementsByTagName('iframe');
		if(iframe[0]) {
			if($rootScope.isOnline) {
				iframe[0].setAttribute('style',"position:absolute;top:0;left:0;width:100%;height:100%;");
				iframe[0].setAttribute('frameborder',"0");
				iframe[0].setAttribute('allowfullscreen',"");
				iframe[0].removeAttribute('height');
				iframe[0].removeAttribute('width');
				angular.element(iframe[0]).wrap('<div style="position:relative;overflow:hidden;padding-bottom:56.25%;height:0;"></div>');
			} else angular.element(iframe[0]).replaceWith('');
		}
		return $sce.trustAsHtml(htmlObject.outerHTML);
	}
});

