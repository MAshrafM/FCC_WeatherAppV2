(function(){


var app = angular.module("weatherApp", ["ngResource"]);
setBackground();
// Service to fetch geolocation
app.service('geoLoc', ["$q", "$window", function($q, $window){
	var deferred = $q.defer();
	$window.navigator.geolocation.getCurrentPosition(function(position){
        deferred.resolve(position);
    });
	return deferred.promise;
}]);

app.service('revLoc', ["$resource", function($resource){
	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
	var call = "&sensor=false";
	
	this.revLocal = function(lat, lon){
		return $resource(url+lat+','+lon+call, null,{query:{method: "GET", isArray:false}});
	};
}]);
// Service to fetch weather data
app.service('localWeather', ["$resource", function($resource){
	//base url
	var url = "https://api.forecast.io/forecast/";
	// api key put in .env
	var API = "ca67ce55c79f10f3323455777752623c/";
	// depend on geolocation latitude and longitude
	this.getLocal = function(lat,lon){
		return $resource(url+API+lat+","+lon, null,{
			jsonpquery: {method: 'JSONP',  params: {callback: 'JSON_CALLBACK'}}
		});
	};
}]);

// Main Controller
app.controller("MainController", ['$scope', 'geoLoc', 'localWeather', 'revLoc', function($scope, geoLoc, localWeather, revLoc){
		// Query for the geolocation
		geoLoc.then(function(data){
			$scope.lat = data.coords.latitude;
			$scope.lon = data.coords.longitude;

			// from geolocation get Weather data
			localWeather.getLocal($scope.lat, $scope.lon).jsonpquery().$promise.then(function(response){
				$scope.weather = response.currently.temperature.toFixed(2);
				$scope.icon = response.currently.icon;
				document.getElementById("container").style.display="block";
				document.getElementsByClassName("diamond")[0].setAttribute('class', 'diamond');
			});
			
			revLoc.revLocal($scope.lat, $scope.lon).query().$promise.then(function(response){
				angular.forEach( response['results'],function(i, val) {
					angular.forEach( i['address_components'],function(i, val) {
						if (i['types'][0] == "administrative_area_level_1") {
							if (i['long_name']!="") {
								$scope.city = i['long_name'];
							}
							else {
								$scope.city = "N/A";
							}
						}
						
						if (i['types'][0] == "country") {
							if (i['long_name']!="") {
								$scope.country = i['long_name'];
							}
							else {
								$scope.country = "N/A";
							}
						}
					});
				});
			});
		});
		
		
		// start from Celsius.
		// convert base. Celsius to Fahrenheit 
		$scope.degree = function showDegree(){
			if($scope.degC){
				return Math.floor($scope.weather) + '\u00b0F';
			}
			else{
				var tinC = (5/9 * ($scope.weather - 32)).toFixed(2);
				return  Math.floor(tinC) + '\u00b0C';
			}
		}
		
		// SVG weather icons.
		$scope.glyph = function(){
			var path = './assets/img/';
			switch($scope.icon){
				case 'clear-day' || 'clear-day':
					return path + 'sunny.svg';
					break;
				case 'partly-cloudy-day' || 'partly-cloudy-night':
					return path + 'partly-sunny.svg';
					break;
				case 'cloudy':
					return path + 'cloudy.svg';
					break;
				case 'rain':
					return path + 'rain.svg';
					break;
				case 'snow':
					return path + 'snow.svg';
					break;
				default:
					return path + 'sunny.svg';
					break;
			}
		};

}]);

function setBackground(){
	// change background image depending on the season.
	var d = new Date();
	var month = d.getMonth();
	var url;
	if(month == 11 || month < 2){
		url = "url('./assets/img/bg-3.jpg')";
	}
	else if(month > 1 && month < 5){
		url = "url('./assets/img/bg-4.jpg')";
	}
	else if(month > 4 && month < 8){
		url = "url('./assets/img/bg-1.jpg')";
	}
	else if(month > 7 && month < 12){
		url = "url('./assets/img/bg-2.jpg')";
	}
	document.body.style.backgroundImage = url;
}

})();
