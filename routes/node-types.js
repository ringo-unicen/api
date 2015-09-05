module.exports = function (app) {
	var elasticsearch = require('../util/elasticsearch.js');
	var _ = require('lodash');
	var crudUtils = require('../util/crud-utils');

	app.route('/nodeType')
	.get(_.partial(crudUtils.list, elasticsearch, 'nodeType'))
	.post(crudUtils.requireBodyAndName, _.partial(crudUtils.save, elasticsearch, 'nodeType'));


	app.route('/nodeType/:nodeTypeId')
		.get(function (req, res) {
			res.json(req.sla);
		})
		.put(crudUtils.requireBodyAndName, _.partial(crudUtils.update, elasticsearch, 'nodeType'))
		.delete(_.partial(crudUtils.remove, elasticsearch, 'nodeType'));

	app.param('nodeTypeId', _.partial(crudUtils.getObject, elasticsearch, 'nodeType'));
};
