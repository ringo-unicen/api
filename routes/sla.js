module.exports = function (app) {
	var elasticsearch = require('../util/elasticsearch.js');
	var _ = require('lodash');

	app.route('/sla').get(function (req, res, next) {
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
			return _.map(hits, function (hit) {
				return {
					_id: hit._id,
					name: hit._source.name
				};
			});
		}).then(res.jsonp.bind(res)).catch(next);
	});
};
