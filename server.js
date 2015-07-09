var express = require('express');
var bodyparser = require('body-parser');
var glob = require('glob');
var _ = require('lodash');

console.log('Configuring application');

var app = express();

app.use(bodyparser.urlencoded({
	extended: true
}));
app.use(bodyparser.json());
//app.use(methodOverride());

glob('./routes/*.js', function (err, files) {
	_.each(files, function (file) {
		require(file)(app);
	});
});


app.listen(3000, function () {
	console.log('App started successfully');
});

