module.exports = function (app) {
	var elasticsearch = require('../util/elasticsearch.js');
	var _ = require('lodash');
	var crudUtils = require('../util/crud-utils');

	var requiredParams = _.partial(crudUtils.requireBodyAndParams, ['sla', 'nodeType']);

	app.route('/node')
	.get(_.partial(crudUtils.list, elasticsearch, 'node'))
	.post(requiredParams, _.partial(crudUtils.save, elasticsearch, 'node'));


	app.route('/node/:nodeId')
		.get(function (req, res) {
			res.json(req.sla);
		})
		.put(requiredParams, _.partial(crudUtils.update, elasticsearch, 'node'))
		.delete(_.partial(crudUtils.remove, elasticsearch, 'node'));

	app.param('nodeId', _.partial(crudUtils.getObject, elasticsearch, 'node'));
};
