module.exports = function (app) {
	app.route('/sla').get(function (req, res) {
		res.json({text: 'Slas!'});
	});
};
