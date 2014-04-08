var express = require('express');
var app = express();

/**
 * Application configuration file
 * @type json
 */
var config = require('./config.json');

/**
 * General application configuration
 */
app.configure(function() 
{
        app.set('views', __dirname + '/app/views');
        app.set('view engine', 'jade');

        app.use(express.static(__dirname + '/build'));
});

/**
 * Application start
 */
app.listen(process.env.PORT || config.listening_port);
console.log('application: started and listening on port ' + config.listening_port);