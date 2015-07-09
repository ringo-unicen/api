module.exports = function (app) {
	var elasticsearch = require('../util/elasticsearch.js');
	var _ = require('lodash');
	var crudUtils = require('../util/crud-utils');

	app.route('/sla')
	.get(function (req, res, next) {
		var q = '*';
		if (req.query.name) {
			q = 'name:' + req.query.name;
		}
		console.log('Executing query for SLAs', q);
		elasticsearch.search({
			index: 'ringo',
			type: 'sla',
			q: q
		}).then(function(results) {
			return results.hits.hits;
		}).then(function (hits) {
			return _.map(hits, _.partial(crudUtils.hitMapper, '_id'));
		}).then(res.jsonp.bind(res)).catch(next);
	})
	.post(crudUtils.requireBodyAndName, function (req, res, next) {
		console.log('Storing SLA', req.body);
		elasticsearch.index({
			index: 'ringo',
			type: 'sla',
			body: req.body
		}).then(crudUtils.populate(req.body)).then(res.jsonp.bind(res)).catch(next);
	});

	var getSla = _.partial(crudUtils.getObject, elasticsearch, 'sla');

	app.route('/sla/:slaId')
		.get(function (req, res) {
			res.json(req.sla);
		})
		.put(crudUtils.requireBodyAndName, function (req, res, next) {
			var sla = _.merge(req.sla, req.body);
			elasticsearch.update({
				index: 'ringo',
				type: 'sla',
				id: sla._id,
				body: sla
			}).then(crudUtils.populate(sla)).then(res.json.bind(res)).catch(next);
		})
		.delete(function (req, res, next) {
			elasticsearch.delete({
				index: 'ringo',
				type: 'sla',
				id: req.sla._id
			}).then(res.json.bind(res)).catch(next);
		});

	app.param('slaId', getSla);
};
