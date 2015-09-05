var express = require('express');
var bodyparser = require('body-parser');
var glob = require('glob');
var _ = require('lodash');
var morgan = require('morgan');

console.log('Configuring application');

var app = express();

app.use(bodyparser.urlencoded({
	extended: true
}));
app.use(bodyparser.json());
//app.use(methodOverride());

var files = glob.sync('./routes/*.js');
_.each(files, function (file) {
	require(file)(app);
});

app.use(function (err, req, res, next) {
	console.log ('Error executing request: ', err);
	next();
});

app.use(morgan('combined'));

app.listen(3000, function () {
	console.log('App started successfully');
});

