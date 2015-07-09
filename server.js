var express = require('express');
var bodyparser = require('body-parser');

console.log('Configuring application');

var app = express();

app.use(bodyparser.urlencoded({
	extended: true
}));
app.use(bodyparser.json());
//app.use(methodOverride());

app.use('/', function (req, res, next) {
	res.json({text: 'Hola mundo'});
});


app.listen(3000, function () {
	console.log('App started successfully');
});

