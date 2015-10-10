/// <reference path="../typings/bluebird/bluebird.d.ts"/>
module.exports = function (app) {
    var elasticsearch = require('../util/elasticsearch.js');
    var _ = require('lodash');
    var crudUtils = require('../util/crud-utils');
    var bluebird = require('bluebird');

    var requiredParams = _.partial(crudUtils.requireBodyAndParams, ['sla', 'nodeType']);
    var changeState = function (state, req, res, next) {
        req.body.state = state;
        next();
    };

    app.route('/node')
    .get(_.partial(crudUtils.list, elasticsearch, 'node'))
    .post(requiredParams, _.partial(changeState, 'CREATED'), _.partial(crudUtils.save, elasticsearch, 'node'), function (req, res, next) {
        var nodeManager = require('../util/node-manager');
        
        nodeManager.create(req.node._id, req.node.nodeType)
            .then(function (id) {
                console.log('Successfully created VM', id);
            }).finally(next);
    }, _.partial(crudUtils.respondEntity, 'node'));

    app.route('/node/search')
        .put(_.partial(crudUtils.search, elasticsearch, 'node'));

    app.route('/node/:nodeId')
        .get(function (req, res) {
            res.json(req.node);
        })
        .put(requiredParams, _.partial(crudUtils.update, elasticsearch, 'node'))
        .delete(_.partial(changeState, 'TERMINATED'), _.partial(crudUtils.update, elasticsearch, 'node'));
 
    app.route('/node/:nodeId/created')
        .post(function (req, res) {
            console.log('Received creation callback for node', req.node);
            var node = req.node;

            //Pick a random node
            var existingPromise = elasticsearch.search({
                    index: 'ringo',
                    type: 'node'
                })
                .then(_.property('hits'))
                .then(_.property('hits'))
                .then(_.first);


            bluebird.join(node, existingPromise)
                .spread(function (node, existing) {
                    var nextNode = existing.next;
                    //Set next on the existing node to the new node
                    //TODO Make sure the IP is there
                    existing.next = req.body.ip;
                    //Set next on the new node to the existing node's next
                    node.next = nextNode;
                    //Update the new node
                    return elasticsearch.update({
                        index: 'ringo',
                        type: 'node',
                        id: node._id,
                        body: {
                            doc: {
                                vm: req.body,
                                next: node.next
                            }
                        }
                    }).then(function () {
                        //Configure the agent
                    }).then(function () {
                        //Start the agent
                    }).then(function () {
                        //Configure the agent for the existing node
                    }).then(function () {
                        //Update existing node and set new node to started.
                        elasticsearch.update({
                            index: 'ringo',
                            type: 'node',
                            id: node._id,
                            body: {
                                doc: {
                                    vm: req.body,
                                    state: 'STARTED'
                                }
                            }
                        });
                    });
                }).then(function (response) {
                    res.status(200).send({message: 'OK'});
                }).catch(function (error) {
                    res.status(500).jsonp({error: JSON.stringify(error)});
                });
    });

    app.param('nodeId', _.partial(crudUtils.getObject, elasticsearch, 'node'), function (req, res, next) {
        if (req.node && req.node.state == 'TERMINATED') {
            delete req.node;
        }
        next();
    }, _.partial(crudUtils.notFound, 'node'));
};
