trainingApp.controller('ExamController', function ExamController($scope, $route, $routeParams, $teechio, $acache) {
	$scope.currentPage = $route.current.$$route.controller;

	$scope.assignments = []

	/**
	 * Loads the exam page rendering the quiz or the statistics
	 * based on the current logged in user
	 */
	$scope.load = function() {
		// 1.
		// get the user submissions
		// @see http://teech.io/docs/rest-api/#submissions-api
		function checkSubmissions(user, callback) {
			$teechio.get('submissions?query={"user":"' + user + '"}')
			.success(function(res) {
				callback(null, res);
			})
			.error(function(err) {
				callback(err);
			});
		}

		// 2.
		// load the exam or render the statistics for the user
		function getExam(submissions, callback) {
			if(submissions.length != 0) {
				// if the user already has submissions
				// render his stats instead of the exam
				$scope.issueCertificate(submissions);
			} else {
				// if the user does not have submissions yet
				// get the exam assignments
				// @see http://teech.io/docs/rest-api/#assignments-api
				$teechio.get('assignments?query={"module":"52dd3555e4b00f9da019a70f", "type":"exam"}').success(function(res) {
					async.each(res, getMaterial, function(err) {
						console.log(err);
					});
				});
			}
		}

		// 3.
		// get the material attached to the exam assignment
		// - this function is executed for each assignment attached the the lesson module
		function getMaterial(entry) {
			$teechio.get('materials/' + entry.material).success(function(res) {
				res.assignment_id = entry._id;
				$scope.assignments.push(res);
			});
		}

		// we need to execute a bunch of functions sequentially 
		// and we use the awesome async library to achieve that
		// @see https://github.com/caolan/async
		var startLoad = async.compose(getExam, checkSubmissions);
		startLoad($acache.get('user')._id, function(err, result) {
			console.log(result)
		});
	};

	/**
	 * Registers exam submissions for the current logged in user
	 * and render the statistics
	 */
	$scope.submitExam = function() {
		// avoid the user to change on the fly its submissions
		// while submitting answers
		angular.element('input[type="radio"]').attr('disabled', true);

		var totalSubmissions = [];

		function saveSubmission(entry, completed) {
			var item = angular.element('input[name="' + entry._id + '"]:checked');
			// build the submission object to save in teech.io's backend
			// @see http://teech.io/docs/rest-api/#submissions-api
			var submission = {
				assignment: entry.assignment_id,
				user: $acache.get('user')._id,
				body: item.attr('value')
			};
			// get the score of the user's answer
			var score = { score: item.attr('data-score') };

			// 1. store the submissions and...
			function store(data, callback) {
				$teechio.post('submissions', data.submission)
				.success(function(res) {
					callback(null, res._id, data.score);
				})
				.error(function(err) {
					callback(err, null);
				});
			}

			// 2. score: the teech.io's backend will automatically evaluate 
			// the user performance based on the registered score
			// @see http://teech.io/docs/rest-api/#grading-submission
			function getPerformance(submissionID, score, callback) {
				$teechio.put('submissions/' + submissionID + '/score', score).success(function(res) {
					callback(null, res);
				});
			}

			var storenscore = async.compose(getPerformance, store);
	
			storenscore({submission: submission, score: score}, function(err, result) {
				console.log(err);
				console.log(result);
				totalSubmissions.push(result);
				$scope.issueCertificate(totalSubmissions);
			});
		}

		// submit the related answer for each assignment in the exam
		async.each($scope.assignments, saveSubmission, function(err) {
			console.log(err);
		});
	};

	/**
	 * Renders the statistics for the current logged in user
	 */
	$scope.issueCertificate = function(submissions) {
		// hide the exam page...
		angular.element('#exam-assignments').slideUp();
		// and show the certificate
		angular.element('#certificate').slideDown();

		var certificate = {
			advanced: 0,
			critical: 0
		};

		// get the performance level for each submission
		// and render the chart
		submissions.forEach(function(entry, index) {
			if('CRITICAL' == entry.performance_level) 
				certificate.critical ++;
			if('ADVANCED' == entry.performance_level) 
				certificate.advanced ++;

			if(index == submissions.length-1) {
       			$('#results-chart').highcharts({
       				colors: ['#57cd77', '#F04848'],
			        chart: {
			        	backgroundColor: '#f8f8f8',
			            plotBackgroundColor: null,
			            plotBorderWidth: null,
			            plotShadow: false
			        },
			        title: {
			            text: ''
			        },
			        credits: {
			        	enabled: false
			        },
			        tooltip: {
			    	    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			        },
			        plotOptions: {
			            pie: {
			                allowPointSelect: true,
			                cursor: 'pointer',
			                dataLabels: {
			                    enabled: false,
			                    color: '#5e5e5e',
			                    connectorColor: '#5e5e5e',
			                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
			                }
			            }
			        },
			        series: [{
			            type: 'pie',
			            name: '',
			            data: [
			                ['correct', certificate.advanced],
			                ['wrong', certificate.critical],
			            ]
			        }]
			    });
				// a simple calculation to show the passed/fail message to our user
				$scope.finalScore = Math.round((certificate.advanced*100)/(certificate.advanced+certificate.critical));
			}
		});
	};

	$scope.load();
});