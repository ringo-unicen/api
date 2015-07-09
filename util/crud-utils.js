var _ = require('lodash');

exports.hitMapper = function (props, hit) {
	var result = _.pick(hit, props);
	_.merge(result, hit._source);
	return result;
};

exports.requireBodyAndName = function (req, res, next) {
	console.log('Validating', req.body);
	if (!req.body || !req.body.name) {
		return next(new Error('Missing parameters'));
	}
	next();
};

exports.getObject = function (elasticsearch, type, req, res, next, id) {
	elasticsearch.getSource({
		index: 'ringo',
		type: type,
		id: id
	}).then(function (object) {
		req[type] = object;
		req[type]._id = id;
	}).finally(next);
};

exports.populate = function (original) {
	return function (result) {
		original._id = result._id;
		return original;
	};
};

