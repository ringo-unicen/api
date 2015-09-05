module.exports = function (app) {
    var elasticsearch = require('../util/elasticsearch.js');
    var _ = require('lodash');
    var crudUtils = require('../util/crud-utils');

    app.route('/sla')
    .get(_.partial(crudUtils.list, elasticsearch, 'sla'))
    .post(crudUtils.requireBodyAndName, _.partial(crudUtils.save, elasticsearch, 'sla'), _.partial(crudUtils.respondEntity, 'sla'));

    app.route('/sla/:slaId')
        .get(function (req, res) {
            res.json(req.sla);
        })
        .put(crudUtils.requireBodyAndName, _.partial(crudUtils.update, elasticsearch, 'sla'))
        .delete(_.partial(crudUtils.remove, elasticsearch, 'sla'));

    app.param('slaId', _.partial(crudUtils.getObject, elasticsearch, 'sla'), _.partial(crudUtils.notFound, 'sla'));
};

