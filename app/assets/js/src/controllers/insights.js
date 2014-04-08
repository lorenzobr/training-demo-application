trainingApp.controller('InsightsController', function InsightsController($scope, $route, $routeParams, $teechio) {
	$scope.currentPage = $route.current.$$route.controller;

	$scope.getInsights = function() {
		var lessonID = $routeParams.lesson;

		var insights = [];
		var output = [];

		getCourseAssignments(lessonID, buildInsights);

		// get the assignments for the requested lesson
		// @see http://teech.io/docs/rest-api/#assignments-api
		function getCourseAssignments(lesson, callback) {
			$teechio.get('assignments?query={"module":"' + lesson + '", "type":"exam"}').success(function(res) {
				if(res.length && 0 < res.length) {
					callback(res);
				}
				else {
					console.log('nothing to do')
				}
			}); 
		}

		function buildInsights(assignments) {
			var counter = assignments.length;
			for(i in assignments) {
				getAssignmentInsights(assignments[i], counter);
			}
		}

		// get the assignment insights
		// @see http://teech.io/docs/rest-api/#insights-assignment
		function getAssignmentInsights(assignment, counter) {
			$teechio.get('insights/assignment/' + assignment._id).success(function(res) {
				assignment['insights'] = res;
				output.push(assignment);

				if(counter == output.length) {
					drawChart(output);
				}
			});
		}

		function drawChart(output) {
			var options = {
				chart: {
					renderTo: 'insights-chart',	
					type: 'column',
					borderWidth: 0,
					shadow: false
				},
				title: {
					text: ''
				},
				xAxis: {
					categories: []
				},
				yAxis: {
					min: 0,
					title: ''
				},
				plotOptions: {
	                column: {
	                    stacking: 'percent'
	                }
	            },
				colors: ['#57cd77', '#F04848', '#E2E5E8'],
				series: [
				{
					name: 'advanced',
					data: []
				},
				{
					name: 'critical',
					data: []
				},
				{
					name: 'total',
					data: []
				}
				],
				credits: {
					enabled: false
				}
			};

			var chart = $scope.chart = new Highcharts.Chart(options);
			
			function loadData() {
				var i = 0;
				
				angular.forEach(output, function(assignment, index) {
					options.xAxis.categories.push(assignment.title);
					options.series[0].data.push(assignment.insights.advanced);
					options.series[1].data.push(assignment.insights.critical);
					options.series[2].data.push(assignment.insights.total_submissions);

					$scope.chart = new Highcharts.Chart(options);
				});
				
				var width = angular.element('.rendered-chart').width(),
				    height = angular.element(window).height()/2;

				$scope.chart.setSize(width, height, false);
			}
			loadData();

			angular.element(window).resize(function() {
				var width = angular.element('.rendered-chart').width(),
				    height = angular.element(window).height()/2;

				$scope.chart.setSize(width, height, false);
			});
		}
	};

	$scope.getInsights();
});