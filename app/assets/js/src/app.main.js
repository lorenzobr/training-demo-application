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
			apikey: '' /* PUT HERE YOUR TEECH.IO API KEY */,
			appid: '' /* PUT HERE YOUR TEECH.IO APPLICATION ID */
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