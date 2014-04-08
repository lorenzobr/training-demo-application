trainingApp.controller('GlobalController', function GlobalController($scope, $location, $teechio, $acache) {
	
	$scope.loggedinUser  = $acache.get('user') ? 
		$acache.get('user').name.firstname + ' ' + $acache.get('user').name.lastname : '';

	/**
	 * Updates the logged in user info
	 */
	$scope.refresh = function(user) {
		$scope.loggedinUser = user;
	};

	$scope.logout = function() {
		localStorage.clear();
		location.href = "/";
	};
});