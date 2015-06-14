(function () {
	
	

	/* global angular */
	var app = angular.module('reddit-steam-tools', ['ngMaterial']);

	app.factory('SteamAppProvider',['$http', function ($http) {
			
		var HOST = 'localhost:3666';
		HOST = 'reddit-steam-tools-server.herokuapp.com/'
		var iSteamAppsApi = '/ISteamApps/GetAppList/v2/';
		var appDB = [
					{
						"appid": 5,
						"name": "Dedicated Server"
					},
					{
						"appid": 7,
						"name": "Steam Client"
					},
					{
						"appid": 8,
						"name": "winui2"
					},
					{
						"appid": 10,
						"name": "Counter-Strike"
					},
					{
						"appid": 20,
						"name": "Team Fortress Classic"
					},
					{
						"appid": 30,
						"name": "Day of Defeat"
					},
					{
						"appid": 40,
						"name": "Deathmatch Classic"
					},
					{
						"appid": 50,
						"name": "Half-Life: Opposing Force"
					},
					{
						"appid": 60,
						"name": "Ricochet"
					},
					{
						"appid": 70,
						"name": "Half-Life"
					},
					{
						"appid": 80,
						"name": "Counter-Strike: Condition Zero"
					},
					{
						"appid": 90,
						"name": "Half-Life Dedicated Server"
					},
					{
						"appid": 92,
						"name": "Codename Gordon"
					},
					{
						"appid": 100,
						"name": "Counter-Strike: Condition Zero Deleted Scenes"
					},
					{
						"appid": 130,
						"name": "Half-Life: Blue Shift"
					}];
					
		return{
			initDB: function (callback) {
				var iSteamAppsRequest = new XMLHttpRequest();
				
				iSteamAppsRequest.onload = function (evt) {
					appDB = JSON.parse(iSteamAppsRequest.responseText).applist.apps;
					
					if(callback)
						callback();
				};
				
				iSteamAppsRequest.open("GET", 'http://' + HOST + iSteamAppsApi);
				iSteamAppsRequest.send();
			},
			
			search: function (searchString) { //TODO split words and add .+
				var regexp = new RegExp(searchString, 'i');
				var toReturn = [];
				appDB.forEach(function(app) {
					if(app.name.search(regexp) >= 0)
						toReturn.push(app);
				}, this);
				return toReturn;				
			},
			isLoading: function () {
				return appDB == null;
			},

			getAppInfo: function(appId, callback){
				$http.get('http://' + HOST + '/info/' + appId).then(
					function(resp){
						callback(resp.data);
					}
				);
				return null;
			}
		};
	}]);

	app.controller('appCtrl',[
		'$scope', 'SteamAppProvider',
		function($scope, SteamAppProvider){
			SteamAppProvider.initDB(function(){
				$scope.isLoading = false;
			});

			$scope.isLoading = true;
			$scope.choosenApps = [];

			$scope.addApp = function(index){
				var app = $scope.apps[index];
				$scope.choosenApps.push(app);
				$scope.apps.splice(index, 1);
				SteamAppProvider.getAppInfo(app.appid, function(appInfo){
					app.appInfo = appInfo;
				});
			};

			$scope.removeApp = function(index){
				$scope.apps.push($scope.choosenApps[index]);
				$scope.choosenApps.splice(index, 1);
			};

			$scope.onSearchApp = function(){
				if ($scope.searchString.length > 0)
					$scope.apps = SteamAppProvider.search($scope.searchString);
				else
					$scope.apps = [];
			};

			$scope.generateText = function(){
				var redditTable = "|Title|Disc.|$USD|$CAD|€EUR|£GBP|AU ($USD)|BRL$|Metascore|Platform|Cards|PCGW|\n";
				redditTable += "|:-|-:|-:|-:|-:|-:|-:|-:|-:|:-:|:-:|:-:|";
				var appInfo = $scope.choosenApps[0].appInfo;
				redditTable += "|[" + appInfo.name + "](www.google.com)|";
				redditTable += appInfo.prices['discount_percent'] + "|"+appInfo.prices['us'];

				$scope.redditTable = redditTable;
			};
		}
	]);

})();