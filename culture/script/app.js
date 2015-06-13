/* global angular */
var app = angular.module('StarterApp', ['ngMaterial']);
/**
  Section names are:
    music
    movies
    books
    games
  YOLO, no tiem for constants
*/
app.factory('Music', function($http){
  var MUSIC_API = 'https://jop-culture.herokuapp.com/music/';
  //MUSIC_API = 'http://localhost:3666/music/';
  return {
    saved: function(offset, limit){
      return $http.get(MUSIC_API+ 'saved', {params: {"limit": limit, "offset": offset}});
    }
  };
});
app.factory('Movies', function($http){
  var MOVIES_API = 'https://jop-culture.herokuapp.com/movies/';
  //MOVIES_API = 'http://localhost:3666/movies/';
  return {
    saved: function(offset, limit){
      return $http.get(MOVIES_API+ 'saved', {params: {"limit": limit, "offset": offset}});
    }
  };
});  
app.factory('Books', function($http){
  var BOOKS_API = 'https://jop-culture.herokuapp.com/books/';
  //BOOKS_API = 'http://localhost:3666/books/';
  return {
    saved: function(offset, limit){
      return $http.get(BOOKS_API+ 'saved', {params: {"limit": limit, "offset": offset}});
    }
  };
});
app.factory('Games', function($http){
  var GAMES_API = 'https://jop-culture.herokuapp.com/games/';
  //GAMES_API = 'http://localhost:3666/games/';
  return {
    saved: function(offset, limit){
      return $http.get(GAMES_API+ 'saved', {params: {"limit": limit, "offset": offset}});
    }
  };
});

app.factory('QuoteProvider', function($http){
  var quotes = {};
 
  quotes['books'] = [
    'Harry\'s suspension on disbelief blew completely out the window',
    "I only want power so I can get books",
    "World domination is such an ugly phrase. I prefer to call it world optimisation",
    "Trying and getting hurt can't possibly be worse for you than being... stuck",
    "There is light in the world, and it is us!",
    "I see little hope for democracy as an effective form of government, but I admire the poetry of how it makes its victims complicit in their own destruction",
    "There was Eru, the One, who in Arda is called Ilúvatar"
  ];

  quotes['games'] = [
    "The cake is a lie",
    "A man chooses. A slave obeys.",
    "When life gives you lemons, don't make lemonade. Make life take the lemons back! Get mad! I don't want your damn lemons! What am I supposed to do with these?!",
    "Space? Space! Spaaaaaaaaaace!",
    "BIG DEAL. I CAN USE INNUENDO TOO. TONIGHT'S FIGHT IS BETWEEN FLYBOY AND THE VAULT HUNTER...BLOWJOBS!",
    "Stairs?! Nooooooooo",
    "Rise and shine, Mister Freeman. Rise and... shine.",
    "Heavy machine gun!"
  ];

  quotes['music'] = [
    "Voglio un pensiero superficiale che renda la pella splendida",
    "Forse non è proprio legale sai ma sei bella vestita di lividi",
    "Those who died are justified, for wearing the badge, they're the chosen whites",
    "We are the Priests of the Temples of Syrinx",
    "Tu guarda dove ci ha portato il sole qui intorno è tutto lasciato andare",
    "Io sono il corvo Joe, faccio paura",
    "I've heard the warning, Well curse my name, I'll keep on laughing, No regret, no regret",
    "Morgoth I cried, It's my oath, So don't fear the eyes, Of the dark Lord"
  ];
  quotes['movies'] = [
    "Do not go gentle into that good night; Old age should burn and rave at close of day. Rage, rage against the dying of the light.",
    "Incorrect. I am not AI. My codename is project two-five-zero-one. I am a living, thinking entity that was created in the sea of information.",
    "You take the blue pill - the story ends, you wake up in your bed and believe whatever you want to believe. You take the red pill - you stay in Wonderland and I show you how deep the rabbit-hole goes.",
    "This... is the Construct"
  ];

  return {
    getRandomQuote: function(section){
      var i = Math.floor(Math.random() * quotes[section].length);
      return quotes[section][i];
    }
  };
});

app.factory('DataProvider', ['Music', 'Movies', 'Books', 'Games', function(Music, Movies, Books, Games){

  /* Here's the configurations of data providers */
  var providers = {
    "music": {
      "saved": Music.saved
    },
    "movies": {
      "saved": Movies.saved
    },
    "books": {
      "saved": Books.saved
    },
    "games": {
      "saved": Games.saved
    }
  };

  var selector = function(source){
    return providers[source];
  };
  return selector;
}]);


app.factory('DataService', ['DataProvider', function(DataProvider){

  var LIMIT = 5;   // number of items retrieved (if any)
  var Loader = function(section){
    this.section = section;

    this.loadMore = function(callback){
      var dataService = dataServices[section];

      var offset = dataService.offset;
      var oldOffset = dataService.oldOffset;

      if (oldOffset < offset && !dataService.isLoading){
        dataService.isLoading = true;
        DataProvider(section).saved(offset, LIMIT).then(

          function(response){
            for (var i = 0; i < response.data.items.length; i++) {
              dataService.cachedData.push(response.data.items[i]);
            };
            dataService.oldOffset = offset;
            dataService.offset = response.data.offset;
            dataService.isLoading = false;
            
            if (callback)
              callback();
        },
          function(error){
            dataService.isLoading = false;
            if (callback)
              callback(error);
          });
      }
      else{
        dataService.hasMoreData = false;
        dataService.isLoading = false;
        if(callback)
          callback();
      }
    };
  };

  var dataServices = {
    "music": {
      cachedData: [],
      name: 'Music',
      offset: 0,
      oldOffset: -1,
      isLoading: false,
      hasMoreData: true,
      loadMore: new Loader('music').loadMore
    },
    "movies": {
      cachedData: [],
      name: 'Movies',
      offset: 0,
      oldOffset: -1,
      isLoading: false,
      hasMoreData: true,
      loadMore: new Loader('movies').loadMore
    },
    "books": {
      cachedData: [],
      name: 'Books',
      offset: 0,
      oldOffset: -1,
      isLoading: false,
      hasMoreData: true,
      loadMore: new Loader('books').loadMore
    },
    "games": {
      cachedData: [],
      name: 'Games',
      offset: 0,
      oldOffset: -1,
      isLoading: false,
      hasMoreData: true,
      loadMore: new Loader('games').loadMore
    }

  };

  var selector = function(source){
    return dataServices[source];
  }
  return selector;
}]);


app.controller('AppCtrl', [
  '$scope', '$window', '$mdMedia', '$mdSidenav',
  function($scope, $window, $mdMedia, $mdSidenav){

    $scope.$watch(function(){
      return $mdMedia('gt-lg');
    }, function(){
      $scope.menuLockedOpen = $mdMedia('gt-lg');
    });

    $scope.toggleMenu = function(){
      $mdSidenav('left').toggle();
    };
    $scope.openMenu = function(){
      $mdSidenav('left').open();
    };
    $scope.closeMenu = function(){
      $mdSidenav('left').close();
    };


    var buildSelectedClass = function(){
      return {
        "music": {
          "selected":  $scope.section == 'music'
        },
        "movies": {
          "selected": $scope.section == 'movies'
        },
        "books": {
          "selected": $scope.section == 'books'
        },
        "games": {
          "selected": $scope.section == 'games'
        }
      };
    };

    $scope.sectionClicked = function (section) {
      $window.location.hash = '/'+section;
      $scope.section = section;
      $scope.selectedClass = buildSelectedClass();
    };
    
    var hash = $window.location.hash;

    var regexp = /^#\/([^\/]+)\/?.*$/;
    var match = regexp.exec(hash);

    if (match != null && match[1] != null){
      $scope.section = match[1];
    }
    else{
      $scope.section = 'music';
    }

    $scope.selectedClass = buildSelectedClass();
  }
]);

app.controller('quoteCtrl', [
  '$scope', 'QuoteProvider',
  function($scope, QuoteProvider){

    $scope.$watch('section', function(newValue, oldValue){
      $scope.quote = QuoteProvider.getRandomQuote($scope.section);
      console.log($scope.section);
    });
  }
]);

app.controller('gridCtrl', [
  '$scope','$element', 'DataService',
  function($scope, $element, DataService){

    $scope.collections = {};
    var containerElement = $element[0];
    var gridElement = $element[0].children[0];

    var isFull = function(){
      var margin = containerElement.scrollHeight - gridElement.scrollHeight;
      return margin < 0;
    }

    $scope.loading = false;

    $scope.loadMore = function(){
      if (!$scope.loading){
        $scope.loading = true;
        DataService($scope.section).loadMore(loadCallback);
      }
    };
    
    var loadCallback = function (error) {
      $scope.loading = false;
      if (!isFull() && DataService($scope.section).hasMoreData){
        $scope.loadMore();
      }

      $scope.hasMoreData = DataService($scope.section).hasMoreData;
      
    };

    $scope.$watch('searchString', function(newValue, oldValue){
      $scope.loadMore();
    });

    $scope.$watch('section', function(newValue, oldValue){
      $scope.currentSection = newValue;
      $scope.collections[newValue] = DataService(newValue).cachedData;
      $scope.gridTitle = DataService(newValue).name;
      $scope.hasMoreData = DataService(newValue).hasMoreData;

      if (newValue == 'music')
        $scope.mdRowHeight = '1:1';
      else if (newValue == 'movies')
        $scope.mdRowHeight = '2:3';
      else if (newValue == 'books')
        $scope.mdRowHeight = '16:25';
      else if (newValue == 'games')
        $scope.mdRowHeight = '8:3';

      $scope.loadMore();
    });
  }
]);


app.directive('imgFallback', function(){
  return{
    restrict: 'A',
    link: function(scope, element, attrs){
      element[0].src = './icons/ic_album_48px.svg';
    }
  };
});

app.directive('scrollLoad', function(){
  return{

    restrict: 'A',
    scope: {
      onScrollEnd: '='
    },

    link: function (scope, element, attrs){
      var gridElement = element[0];
      element.bind('scroll', function(evt){
        var scroll = element[0].scrollTop + element[0].parentElement.scrollHeight;
        var scrollRelative = scroll - element[0].scrollHeight;
        
        var bottomSpace = element[0].parentElement.scrollHeight - element[0].scrollHeight; 
        if (Math.abs(scrollRelative) <= 1 || bottomSpace > 40 ){
          scope.onScrollEnd();
        }
      });
    }
  };
});