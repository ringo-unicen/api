module.exports = function (app) {

    var elastic = require('../util/elasticsearch');
    var crudUtils = require('../util/crud-utils');
    var _ = require('lodash');

    var requiredParams = _.partial(crudUtils.requireBodyAndParams, ['sla', 'node', 'type', 'value', 'timestamp']);

    app.route('/metrics')
        .post(requiredParams,  _.partial(crudUtils.save, elastic, 'metric'), _.partial(crudUtils.respondEntity, 'metric'))
        .get(function(req, res, next) {
            elastic.search({
                index: 'ringo',
                type: 'metric',
                body: req.body
            }).then(res.jsonp.bind(res)).catch(next);
        });
};
