module.exports = function (app) {
    var elasticsearch = require('../util/elasticsearch.js');
    var _ = require('lodash');
    var crudUtils = require('../util/crud-utils');

    var requiredParams = _.partial(crudUtils.requireBodyAndParams, ['sla', 'nodeType']);

    app.route('/node')
    .get(_.partial(crudUtils.list, elasticsearch, 'node'))
    .post(requiredParams, _.partial(crudUtils.save, elasticsearch, 'node'), function (req, res, next) {
        var nodeManager = require('../util/node-manager');
        
        nodeManager.create(req.node._id, req.node.nodeType)
            .then(function (id) {
                console.log('Successfully created VM', id);
            }).finally(next);
    }, _.partial(crudUtils.respondEntity, 'node'));


    app.route('/node/:nodeId')
        .get(function (req, res) {
            res.json(req.node);
        })
        .put(requiredParams, _.partial(crudUtils.update, elasticsearch, 'node'))
        .delete(_.partial(crudUtils.remove, elasticsearch, 'node'));
 
    app.route('/node/:nodeId/created')
        .post(function (req, res) {
            console.log('Received creation callback for node', req.node, 'with info', req.body);
            res.status(200).send({message: 'OK'});
        });

    app.param('nodeId', _.partial(crudUtils.getObject, elasticsearch, 'node'));
};
