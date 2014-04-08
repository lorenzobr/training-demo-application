# Educational web app demo

This simple Angular JS application demonstrates an example of a JS web application built on top of the Teech.io platform.

* Courses are shaped using the modules endpoint http://teech.io/docs/rest-api/#modules-api
* The lesson materials and the quizzes are shaped using the materials endpoint http://teech.io/docs/rest-api/#materials-api
* Starting from each quiz, an assignment it's created using the assignments endpoint http://teech.io/docs/rest-api/#assignments-api
* Each student submission it's registered using the submissions endpoint http://teech.io/docs/rest-api/#submissions-api and assessed using an assessment rule stored using the assessments endpoint http://teech.io/docs/rest-api/#assessments-api and attacched to the correspondant assignment

![Alt text](https://raw.githubusercontent.com/teechio/training-demo-application/master/app/assets/images/screens/insights.png "Insights screenshot")

## Getting started

Clone the repo:
```
git clone git@github.com:teechio/training-demo-application.git
```
Open the file `app.main.js` in `app/assets/js/src` folder and your keys to the Teech.io APIs wrapper service:
```
	...

	trainingApp.factory('$teechio', function($http) {
		var defaults = {
			url: 'http://api.teech.io',
			apikey: '' /* PUT HERE YOUR TEECH.IO API KEY */,
			appid: '' /* PUT HERE YOUR TEECH.IO APPLICATION ID */
		};

	...
```
And finally run the server:
```
node server.js
```

## Live demo

You can find a live demo of this application at <a href="http://training.demo.teech.io" target="_blank">training.demo.teech.io</a>

## Documentation

This simple application is built on top of the Teech.io platform for which you can check the documentation at [teech.io/documentation](http://teech.io/documentation/). If you need support or you just want to ask something technical just drop us an email at support[at]teech.io and/or stalk us on twitter @teech_io.

## Grunt

The project uses Grunt to generate the build and manage the Javascript tasks. If you don't know how to use it you should definitely check it put at [gruntjs.com](http://gruntjs.com/) and read [getting started](http://gruntjs.com/getting-started).

## License 

[MIT](http://opensource.org/licenses/MIT)



