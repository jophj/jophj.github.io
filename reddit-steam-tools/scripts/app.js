(function () {
	/* global angular */
	var app = angular.module('reddit-steam-tools', ['ngMaterial']);

	app.factory('SteamAppProvider',['$http', function ($http) {
			
		var HOST = 'localhost:3666';
		HOST = 'reddit-steam-tools-server.herokuapp.com';
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
				$http.get('http://' + HOST + iSteamAppsApi).then(
					function(resp){
						appDB = resp.data.applist.apps;
						callback();
					}
				);

				// var iSteamAppsRequest = new XMLHttpRequest();
				
				// iSteamAppsRequest.onload = function (evt) {
				// 	appDB = JSON.parse(iSteamAppsRequest.responseText).applist.apps;
					
				// 	if(callback)
				// 		callback();
				// };
				
				// iSteamAppsRequest.open("GET", 'http://' + HOST + iSteamAppsApi);
				// iSteamAppsRequest.send();
			},
			
			search: function (searchString) { //TODO split words and add .+
				var tokens = searchString.split(' ');
				var toReturn = [];

				appDB.forEach(function(app) {
					var match = true;

					tokens.forEach(function(token){
						var regexp = new RegExp(token, 'i');
						if(app.name.search(regexp) < 0)
							match = false;
					}, this);	

					if (match)
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

			$scope.isLoading = true;
			$scope.choosenApps = [];
			$scope.searchString = 'half';

			// SteamAppProvider.initDB(function(){
			// 	$scope.isLoading = false;
			// });

			$scope.clearResults = function(){
				$scope.apps = [];
			};
			$scope.addApp = function(index){
				var app = $scope.apps[index];
				$scope.choosenApps.push(app);
				SteamAppProvider.getAppInfo(app.appid, function(appInfo){
					app.appInfo = appInfo;
				});
			};

			$scope.removeApp = function(index){
				$scope.apps.push($scope.choosenApps[index]);
				$scope.choosenApps.splice(index, 1);
			};

			$scope.$watch('searchString', function(newValue, oldValue){
				$scope.onSearchApp();
			});
			$scope.onSearchApp = function(){
				if ($scope.searchString.length > 0)
					$scope.apps = SteamAppProvider.search($scope.searchString);
				else
					$scope.apps = [];

				$scope.choosenApps = $scope.apps.splice(0, 3);
			};

			$scope.onSearchApp();

			$scope.generateText = function(){

				var stringToken = function(string){
					redditTable += "|"+string;
				};
				var urlToken = function(name, url){
					redditTable += "|[" + name + "](" + url + ")";
				};
				var platformToken = function(platforms){
					redditTable += "|";
					redditTable += platforms.windows ? 'W' : '';
					redditTable += platforms.mac ? 'M' : '';
					redditTable += platforms.linux ? 'L' : '';
				};

				var redditTable = "|Title|Disc.|$USD|$CAD|€EUR|£GBP|AU ($USD)|BRL$|Metascore|Platform|Cards|PCGW|\n";
				redditTable += "|:-|-:|-:|-:|-:|-:|-:|-:|-:|:-:|:-:|:-:|\n";
				
				for (var i = 0; i < $scope.choosenApps.length; i++) {
					var appInfo = $scope.choosenApps[i].appInfo;
					urlToken(appInfo.name, appInfo.appUrl);
					
					stringToken(appInfo.prices['us']['discount_percent']);

					stringToken(appInfo.prices['us']['final']/100);
					stringToken(appInfo.prices['ca']['final']/100);
					stringToken(appInfo.prices['eur']['final']/100);
					stringToken(appInfo.prices['uk']['final']/100);
					stringToken(appInfo.prices['au']['final']/100);
					stringToken(appInfo.prices['br']['final']/100);

					// stringToken(appInfo.prices['ru']['discount_percent']);
					// stringToken(appInfo.prices['ru']['final']/100);

					if (appInfo.metacritic){
						urlToken(appInfo.metacritic.score, appInfo.metacritic.url);
					}
					else{
						stringToken('N/A');
					}

					platformToken(appInfo.platforms);

					stringToken(appInfo.cards ? 'Yes' : 'No');

					if (appInfo.pcgwUrl){
						urlToken('YES', appInfo.pcgwUrl);
					}
					else{
						stringToken('No');
					}

					stringToken('\n');

					$scope.redditTable = redditTable;
				};
			};
		}
	]);
})();