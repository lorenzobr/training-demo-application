trainingApp.controller('LessonController', function LessonController($scope, $route, $routeParams, $teechio, $sce) {
	$scope.currentPage = $route.current.$$route.controller;

	/**
	 * Loads the lesson contents
	 */
	$scope.load = function() {
		var lessonID = $routeParams.id;

		// get lesson information
		// @see http://teech.io/docs/rest-api/#modules-api
		$teechio.get('modules/' + lessonID).success(function(res) {
			$scope.lesson = res;
		});

		// get the assignment for this lesson
		// @see http://teech.io/docs/rest-api/#assignments-api
		$teechio.get('assignments?query={"module":"' + lessonID + '", "type":"teaching_video"}').success(function(res) {
			var material = res[0].material;

			// get the material attached to the assignment
			// @see http://teech.io/docs/rest-api/#materials-api
			$teechio.get('materials/' + material).success(function(res) {
				$scope.embeddedVideo = 'http://www.youtube.com/embed/' + res.source_meta.vid + '?rel=0';
			});
		});
	};

	/**
	 * Fix in order to avoid errors on iframe source 
	 * @see http://stackoverflow.com/questions/20045150/angular-js-how-to-set-an-iframe-src-attribute-from-a-variable
	 */
	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	};

	$scope.load();
});