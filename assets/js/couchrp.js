var app = angular.module( 'couchrp', [] );


app.config( function( $routeProvider, $locationProvider ) {
	$routeProvider
		.when( '/', { controller: HomeCtrl, templateUrl: '/partials/home.html' } )

		.when( '/contact', { controller: ContactCtrl, templateUrl: '/partials/contact.html' } )
		.when( '/contact/:user', { controller: ContactDetailCtrl, templateUrl: '/partials/contactDetail.html' } )

		.when( '/schedule', { controller: ScheduleCtrl, templateUrl: '/partials/schedule.html' } )
		.when( '/schedule/:item', { controller: ScheduleDetailCtrl, templateUrl: '/partials/scheduleDetail.html' } )

		.when( '/task', { controller: TaskCtrl, templateUrl: '/partials/task.html' } )
		.when( '/task/:task', { controller: TaskDetailCtrl, templateUrl: '/partials/taskDetail.html' } )

		.when( '/knowledge', { controller: KnowledgeCtrl, templateUrl: '/partials/knowledge.html' } )
		.when( '/knowledge/:entry', { controller: KnowledgeDetailCtrl, templateUrl: '/partials/knowledgeDetail.html' } )

		.otherwise( { redirectTo: '/' } );

	$locationProvider.html5Mode( true ).hashPrefix( '!' );
});


app.factory( 'Meta', function() {
	var title = 'Start';

	return {
		title: function( t ) { if ( t ) title = t; else return title; }
	}
});


function MetaCtrl( $scope, Meta ) {
	$scope.Meta = Meta;
}


function MainCtrl( $scope, $route, $routeParams, $location ) {
	$scope.$route = $route;
	$scope.$routeParams = $routeParams;
	$scope.$location = $location;
}


function HomeCtrl( $scope, Meta ) {
	var contact = { 
			anchor: '/contact', 
			title: 'Kontakte' 
		}
	  , schedule = {
	  		anchor: '/schedule', 
	  		title: 'Termine' 
	  	}
	  , task = { 
	  		anchor: '/task', 
	  		title: 'Aufgaben'
	  	}
	  , knowledge = { 
	  		anchor: '/knowledge', 
	  		title: 'Wissen' 
	  	};

	Meta.title( 'Start' );

	$scope.routes = [ contact, schedule, task, knowledge ];
}


function ContactCtrl( $scope, $http, Meta ) {
	Meta.title( 'Kontakte' );

	$scope.createText = 'Kontakt anlegen';
	$scope.users = [];

	$http
		.get( '/api/user' )
		.success( function( result ) {
			for ( var i = 0; i < result.length; i++ ) {
				$http
					.get( '/api/user/' + result[ i ] )
					.success( function( r ) {
						$scope.users.push( r );
					} );
			}
		} );
}


function ContactDetailCtrl( $scope, $routeParams, Meta ) {
	Meta.title( $routeParams.user )
	$scope.title = $routeParams.user;
}


function ScheduleCtrl( $scope, Meta ) {
	Meta.title( 'Termine' );
}


function ScheduleDetailCtrl( $scope, $routeParams, Meta ) {
	Meta.title( $routeParams.item );
	$scope.title = $routeParams.item;
}


function TaskCtrl( $scope, Meta ) {
	Meta.title( 'Aufgaben' );
}


function TaskDetailCtrl( $scope, $routeParams, Meta ) {
	Meta.title( $routeParams.task );
	$scope.title = $routeParams.task;
}


function KnowledgeCtrl( $scope, Meta ) {
	Meta.title( 'Wissen' );
}


function KnowledgeDetailCtrl( $scope, $routeParams, Meta ) {
	Meta.title( $routeParams.entry );
	$scope.title = $routeParams.entry;
}