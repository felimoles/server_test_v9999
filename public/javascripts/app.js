// Angular module, defining routes for the app
angular.module('pollz', ['pollServices', 'ui.bootstrap.modal']).
	config(['$routeProvider','$locationProvider', function($routeProvider, $locationProvider, $http) {
	
		$routeProvider.
			when('/polls', { templateUrl: 'partials/list.html', controller: PollListCtrl }).
			when('/mostrarEn/:pollId', { templateUrl: 'partials/mostrarEncuesta.html', controller: PollItemCtrl,
				resolve: {
					Poll: function($http, $route){
					return $http.get('/polls/'+$route.current.params.pollId)
						.then(function(response){
							return response.data;
						})
					}
				}
			 }).
			when('/polled/:pollId', { templateUrl: 'partials/item.html', controller: PollItemCtrl2, resolve: {
					Poll: function($http, $route){
					return $http.get('/polls/'+$route.current.params.pollId)
						.then(function(response){
							return response.data;
						})
					}
				}
			 }).
			 
			when('/pollpop/:pollId', { templateUrl: 'partials/edit.html', controller: PollEditCtrl, resolve: {
					Poll2: function($http, $route){
					return $http.get('/polls/'+$route.current.params.pollId)
						.then(function(response){
							
							return response.data;
						})
					}
				}
			 }).
			when('/new', { templateUrl: 'partials/new.html', controller: PollNewCtrl }).
			when('/newcat', { templateUrl: 'partials/newcat.html', controller: PollNewCtrl }).
			when('/config', { templateUrl: 'partials/config.html', controller: PollConfigCrtl,resolve:{
							Data: function($http, $route){
					return $http.get('/index')
						.then(function(response){
							
							return response.data;
						})
					}

			} }).
			// If invalid route, just redirect to the main list view
			otherwise({ redirectTo: '/polls' });
			
			//$locationProvider.html5mode(true);
    		
	}]);

/*angular.module('pollz', [])
  .config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('red')
      .primaryPalette('red');

    $mdThemingProvider.theme('blue')
      .primaryPalette('blue');

  });*/