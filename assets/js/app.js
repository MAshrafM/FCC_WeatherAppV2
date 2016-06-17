(function(){


var app = angular.module("weatherApp", ["ngResource"]);



app.service('geoLoc', ["$resource", function($resource){
	return $resource('http://ip-api.com/json', null, {
		query:{
			method: 'GET',
			isArray: false
		}
	});
}]);

app.service('localWeather', ["$resource", "geoLoc", function($resource, geoLoc){
	var url = "https://api.forecast.io/forecast/";
	var API = "ca67ce55c79f10f3323455777752623c/";
	
	this.getLocal = function(lat,lon){
		return $resource(url+API+lat+","+lon, null,{query:{method: "GET", isArray:false}});
	};
}]);


app.controller("MainController", ['$scope', 'geoLoc', 'localWeather', function($scope, geoLoc, localWeather){
		geoLoc.query().$promise.then(function(data){
			$scope.lat = data.lat;
			$scope.lon = data.lon;
			$scope.city = data.city;
			$scope.country = data.country;
			console.log($scope.lat);	
			console.log($scope.lon);
			localWeather.getLocal($scope.lat, $scope.lon).query().$promise.then(function(response){
				$scope.weather = response.currently.temperature.toFixed(2);
				$scope.icon = response.currently.icon;
				console.log($scope.weather);
				console.log($scope.icon);
			});
		});

		$scope.degc = true;
		$scope.degree = function showDegree(){
			if($scope.degC){
				return Math.floor($scope.weather) + '\u00b0F';
			}
			else{
				var tinC = (5/9 * ($scope.weather - 32)).toFixed(2);
				return  Math.floor(tinC) + '\u00b0C';
			}
		}
		
		$scope.glyph = function(){
			var path = 'assets/img/';
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
		
	var d = new Date();
	var month = d.getMonth();
	var url;
	if(month == 11 || month < 2){
		url = "url('assets/img/bg-3.jpg')";
	}
	else if(month > 1 && month < 5){
		url = "url('assets/img/bg-4.jpg')";
	}
	else if(month > 4 && month < 8){
		url = "url('assets/img/bg-1.jpg')";
	}
	else if(month > 7 && month < 12){
		url = "url('assets/img/bg-2.jpg')";
	}
	document.body.style.backgroundImage = url;

}]);



})();