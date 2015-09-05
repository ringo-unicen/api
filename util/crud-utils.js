var _ = require('lodash');

var placeInRequest = function (req, type, entity) {
  req[type] = entity;  
};

exports.hitMapper = function (props, hit) {
    var result = _.pick(hit, props);
    _.merge(result, hit._source);
    return result;
};

exports.requireBodyAndParams = function (params, req, res, next) {
    if (!req.body) {
        return next(new Error('Request body is required'));
    }
    var missing = _.difference(params, _.keys(req.body));
    if (missing.length > 0) {
        return next(new Error('Missing required properties:' + missing));
    }
    next();
};

exports.requireBodyAndName = _.partial(exports.requireBodyAndParams, ['name']);

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

exports.list = function (elasticsearch, type, req, res, next) {
    var q = _.reduce(req.query, function (query, value, key) {
        if (query !== '') {
            query += ' AND ';
        }
        return query + key + ':' + value;
    }, '');
    if (q === '') {
        q = '*';
    }
    console.log('Executing query for', type, q);
    elasticsearch.search({
        index: 'ringo',
        type: type,
        q: q
    }).then(function(results) {
        return results.hits.hits;
    }).then(function (hits) {
        return _.map(hits, _.partial(exports.hitMapper, '_id'));
    }).then(res.jsonp.bind(res)).catch(next);
};

exports.save = function (elasticsearch, type, req, res, next) {
    console.log('Storing', type, req.body);
    elasticsearch.index({
        index: 'ringo',
        type: type,
        body: req.body
    }).then(exports.populate(req.body)).then(_.partial(placeInRequest, req, type)).finally(next);
};

exports.respondEntity = function (type, req, res) {
    res.jsonp(req[type]);  
};

exports.update = function (elasticsearch, type, req, res, next) {
    var entity = _.merge(req[type], req.body);
    elasticsearch.update({
        index: 'ringo',
        type: type,
        id: entity._id,
        body: entity
    }).then(exports.populate(entity)).then(res.json.bind(res)).catch(next);
};

exports.remove = function (elasticsearch, type, req, res, next) {
    console.log('Removing', type, req[type]._id);
    elasticsearch.delete({
        index: 'ringo',
        type: type,
        id: req[type]._id
    }).then(res.json.bind(res)).catch(next);
};

exports.search = function(elasticsearch, type, req, res, next) {
    console.log('Searching for', type, 'with query', req.body);
    elasticsearch.search({
        index: 'ringo',
        type: type,
        body: req.body
    }).then(res.jsonp.bind(res)).catch(next);
};
