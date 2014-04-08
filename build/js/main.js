angular.module('filters', [])
	.filter('truncate', function () {
        return function (text, length, end) 
        {
            if(undefined === text)
                return;
            
            if (isNaN(length))
                length = 10;
 
            if (end === undefined)
                end = "...";
            
            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }
        }
    });
(function(window, document, undefined) {
	'use strict';

	var trainingApp = angular.module('trainingApp', ['filters', 'ngRoute']);

	trainingApp.config(
		function($interpolateProvider) { 
			$interpolateProvider.startSymbol('{[').endSymbol(']}') 
		}
	);

	trainingApp.config(
		function($routeProvider) { 
			$routeProvider
				.when('/', {
					templateUrl: 'partials/home.html',
					controller: 'HomeController'
				})
				.when('/insights/:lesson', {
					templateUrl: 'partials/insights.html',
					controller: 'InsightsController'
				})
				.when('/lesson/:id', {
					templateUrl: 'partials/lesson.html',
					controller: 'LessonController'
				})
				.when('/exam/:lesson', {
					templateUrl: 'partials/exam.html',
					controller: 'ExamController'
				});
		}
	);
	
	/**
	 * By default HTML5 localStorage supports only strings;
	 * this service is used to cache data locally as strings or objects as well
	 */
	trainingApp.factory('$acache', function($cacheFactory) {
		return {
			get: function(key) {
				var cache = localStorage.getItem(key);
				try {
					cache = JSON.parse(localStorage.getItem(key));
					return cache;
				}
				catch(err) { return cache }
			},
			put: function(key, value) {
				(typeof value === 'string') 
				? localStorage.setItem(key, value) : localStorage.setItem(key, JSON.stringify(value));
			},
			remove: function(key) {
				localStorage.removeItem(key);
			}
		}
	});

	/**
	 * Teech.io APIs wrapper service for HTTP verbs
	 */
	trainingApp.factory('$teechio', function($http) {
		var defaults = {
			url: 'http://api.teech.io',
			apikey: 'cccLK40rRAt7uS0yD6GpaUXjKpEC1ZIF2GhuS9lb' /* PUT HERE YOUR TEECH.IO API KEY */,
			appid: '56xSnA7MY881dZH7JGEpG2aMRy5Apsyh' /* PUT HERE YOUR TEECH.IO APPLICATION ID */
		};

		var client = function(httpMethod, method, data) {
			var h = {
				method: httpMethod,
				url: defaults.url + '/' + method,
				headers: {
					"Teech-REST-API-Key": defaults.apikey,
					"Teech-Application-Id": defaults.appid
				}
			};
			
			if(undefined != data) {
				h['Content-Type'] = 'application/json';
				h['data'] = data;
			}	
			return $http(h);
		};

		return {
			get: function(method) {
				return client('GET', method);
			},
			put: function(method, data) {
				return client('PUT', method, data);
			},
			post: function(method, data) {
				return client('POST', method, data);
			},
			delete: function(method) {
				return client('DELETE', method);
			}
		}
	});

	window.trainingApp = trainingApp;
})(window, document);
trainingApp.directive('bodyId', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      scope.$watch('currentPage', function (value) {
        if ('HomeController' == value) {
          $('body').attr('id', 'homepage');
        }
        if ('LessonController' == value) {
          $('body').attr('id', 'lesson');
        }
      });
    }
  };
});
trainingApp.directive('basicStyles', function () {
  return function (scope, element, attr) {
  };
});
trainingApp.directive('fauxRadio', function () {
  return function (scope, element, attr) {
    element.click(function (e) {
      e.preventDefault();
      $(this).parent('ul').find('li').removeClass('selected');
      $(this).addClass('selected');
      $('input[type="radio"]', this).attr('checked', true);
    });
  };
});
trainingApp.controller('ExamController', function ExamController($scope, $route, $routeParams, $teechio, $acache) {
  $scope.currentPage = $route.current.$$route.controller;
  $scope.assignments = [];
  $scope.load = function () {
    function checkSubmissions(user, callback) {
      $teechio.get('submissions?query={"user":"' + user + '"}').success(function (res) {
        callback(null, res);
      }).error(function (err) {
        callback(err);
      });
    }
    function getExam(submissions, callback) {
      if (submissions.length != 0) {
        $scope.issueCertificate(submissions);
      } else {
        $teechio.get('assignments?query={"module":"52dd3555e4b00f9da019a70f", "type":"exam"}').success(function (res) {
          async.each(res, getMaterial, function (err) {
            console.log(err);
          });
        });
      }
    }
    function getMaterial(entry) {
      $teechio.get('materials/' + entry.material).success(function (res) {
        res.assignment_id = entry._id;
        $scope.assignments.push(res);
      });
    }
    var startLoad = async.compose(getExam, checkSubmissions);
    startLoad($acache.get('user')._id, function (err, result) {
      console.log(result);
    });
  };
  $scope.submitExam = function () {
    angular.element('input[type="radio"]').attr('disabled', true);
    var totalSubmissions = [];
    function saveSubmission(entry, completed) {
      var item = angular.element('input[name="' + entry._id + '"]:checked');
      var submission = {
          assignment: entry.assignment_id,
          user: $acache.get('user')._id,
          body: item.attr('value')
        };
      var score = { score: item.attr('data-score') };
      function store(data, callback) {
        $teechio.post('submissions', data.submission).success(function (res) {
          callback(null, res._id, data.score);
        }).error(function (err) {
          callback(err, null);
        });
      }
      function getPerformance(submissionID, score, callback) {
        $teechio.put('submissions/' + submissionID + '/score', score).success(function (res) {
          callback(null, res);
        });
      }
      var storenscore = async.compose(getPerformance, store);
      storenscore({
        submission: submission,
        score: score
      }, function (err, result) {
        console.log(err);
        console.log(result);
        totalSubmissions.push(result);
        $scope.issueCertificate(totalSubmissions);
      });
    }
    async.each($scope.assignments, saveSubmission, function (err) {
      console.log(err);
    });
  };
  $scope.issueCertificate = function (submissions) {
    angular.element('#exam-assignments').slideUp();
    angular.element('#certificate').slideDown();
    var certificate = {
        advanced: 0,
        critical: 0
      };
    submissions.forEach(function (entry, index) {
      if ('CRITICAL' == entry.performance_level)
        certificate.critical++;
      if ('ADVANCED' == entry.performance_level)
        certificate.advanced++;
      if (index == submissions.length - 1) {
        $('#results-chart').highcharts({
          colors: [
            '#57cd77',
            '#F04848'
          ],
          chart: {
            backgroundColor: '#f8f8f8',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
          },
          title: { text: '' },
          credits: { enabled: false },
          tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
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
                [
                  'correct',
                  certificate.advanced
                ],
                [
                  'wrong',
                  certificate.critical
                ]
              ]
            }]
        });
        $scope.finalScore = Math.round(certificate.advanced * 100 / (certificate.advanced + certificate.critical));
      }
    });
  };
  $scope.load();
});
trainingApp.controller('GlobalController', function GlobalController($scope, $location, $teechio, $acache) {
  $scope.loggedinUser = $acache.get('user') ? $acache.get('user').name.firstname + ' ' + $acache.get('user').name.lastname : '';
  $scope.refresh = function (user) {
    $scope.loggedinUser = user;
  };
  $scope.logout = function () {
    localStorage.clear();
    location.href = '/';
  };
});
trainingApp.controller('HomeController', function HomeController($scope, $route, $teechio, $acache) {
  $scope.currentPage = $route.current.$$route.controller;
  $scope.init = function () {
    $teechio.get('modules').success(function (res) {
      $scope.lessons = res;
    });
    $scope.login();
  };
  $scope.login = function () {
    var user = $acache.get('user');
    if (!user) {
      user = {
        username: chance.string(),
        password: 'demo',
        name: {
          firstname: chance.first(),
          lastname: chance.last()
        }
      };
      console.log('creating user... ');
      $teechio.post('users', user).success(function (res) {
        $acache.put('user', res);
        $scope.refresh(user.name.firstname + ' ' + user.name.lastname);
      });
    }
  };
  $scope.init();
});
trainingApp.controller('InsightsController', function InsightsController($scope, $route, $routeParams, $teechio) {
  $scope.currentPage = $route.current.$$route.controller;
  $scope.getInsights = function () {
    var lessonID = $routeParams.lesson;
    var insights = [];
    var output = [];
    getCourseAssignments(lessonID, buildInsights);
    function getCourseAssignments(lesson, callback) {
      $teechio.get('assignments?query={"module":"' + lesson + '", "type":"exam"}').success(function (res) {
        if (res.length && 0 < res.length) {
          callback(res);
        } else {
          console.log('nothing to do');
        }
      });
    }
    function buildInsights(assignments) {
      var counter = assignments.length;
      for (i in assignments) {
        getAssignmentInsights(assignments[i], counter);
      }
    }
    function getAssignmentInsights(assignment, counter) {
      $teechio.get('insights/assignment/' + assignment._id).success(function (res) {
        assignment['insights'] = res;
        output.push(assignment);
        if (counter == output.length) {
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
          title: { text: '' },
          xAxis: { categories: [] },
          yAxis: {
            min: 0,
            title: ''
          },
          plotOptions: { column: { stacking: 'percent' } },
          colors: [
            '#57cd77',
            '#F04848',
            '#E2E5E8'
          ],
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
          credits: { enabled: false }
        };
      var chart = $scope.chart = new Highcharts.Chart(options);
      function loadData() {
        var i = 0;
        angular.forEach(output, function (assignment, index) {
          options.xAxis.categories.push(assignment.title);
          options.series[0].data.push(assignment.insights.advanced);
          options.series[1].data.push(assignment.insights.critical);
          options.series[2].data.push(assignment.insights.total_submissions);
          $scope.chart = new Highcharts.Chart(options);
        });
        var width = angular.element('.rendered-chart').width(), height = angular.element(window).height() / 2;
        $scope.chart.setSize(width, height, false);
      }
      loadData();
      angular.element(window).resize(function () {
        var width = angular.element('.rendered-chart').width(), height = angular.element(window).height() / 2;
        $scope.chart.setSize(width, height, false);
      });
    }
  };
  $scope.getInsights();
});
trainingApp.controller('LessonController', function LessonController($scope, $route, $routeParams, $teechio, $sce) {
  $scope.currentPage = $route.current.$$route.controller;
  $scope.load = function () {
    var lessonID = $routeParams.id;
    $teechio.get('modules/' + lessonID).success(function (res) {
      $scope.lesson = res;
    });
    $teechio.get('assignments?query={"module":"' + lessonID + '", "type":"teaching_video"}').success(function (res) {
      var material = res[0].material;
      $teechio.get('materials/' + material).success(function (res) {
        $scope.embeddedVideo = 'http://www.youtube.com/embed/' + res.source_meta.vid + '?rel=0';
      });
    });
  };
  $scope.trustSrc = function (src) {
    return $sce.trustAsResourceUrl(src);
  };
  $scope.load();
});