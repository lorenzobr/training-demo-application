trainingApp.controller('HomeController', function HomeController($scope, $route, $teechio, $acache) {
	$scope.currentPage = $route.current.$$route.controller;

	/**
	 * Loads the application homepage loading all the
	 * lessons and logging in the user
	 *
	 * @see http://teech.io/docs/rest-api/#modules-api
	 */
	$scope.init = function() {
		$teechio.get('modules').success(function(res) {
			$scope.lessons = res;
		});
		$scope.login();
	};

	/**
	 * Authenticates the user into the application
	 */
	$scope.login = function() {
		// check if the user is already logged in
		var user = $acache.get('user');

		// for the purpose of this sample we don't want to go
		// through the users registration process, so on each homepage
		// load we create a fake user in our backend
		// note: we create a user only if there isn't one already in the local cache 
		if(!user) {	
			user = {
				username: chance.string(),
				password: 'demo',
				name: {
					firstname: chance.first(),
					lastname: chance.last()
				}
			}
			console.log('creating user... ');
			$teechio.post('users', user).success(function(res) {
				// save the just created user info inside the local cache
				$acache.put('user', res);
				// @see global.js
				$scope.refresh(user.name.firstname + ' ' + user.name.lastname);
			});
		}
	};

	$scope.init();
});