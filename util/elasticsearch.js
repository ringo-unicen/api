/// <reference path="../typings/lodash/lodash.d.ts"/>
var elasticsearch = require('elasticsearch');
var fs = require('bluebird').promisifyAll(require('fs'));
var _ = require('lodash');

var client = new elasticsearch.Client({
    _index: 'ringo',
    server: {
        host: process.env.ES_URL || 'localhost:9200',
        log: "trace"
    }
});

client.indices.create({
    index: 'ringo'
}, function (err, res) {
    if (err) {
        console.log('Index ringo already existed');
        return;
    }
    console.log('Index named ringo successfully created');
    fs.readFileAsync('./mappings/ringo.json')
        .then(JSON.parse).then(_.property('mappings'))
        .then(function (mappings) {
            return _.map(mappings, function (mapping, type) {
                console.log('Creating mapping for type', type, 'with value', mapping);
                return client.indices.putMapping({
                    index: 'ringo',
                    type: type,
                    body: mapping
                });
            });
        }).then(function (result) {
            console.log('Successfully created', result.length, 'mappings');
        }).catch(function (error) {
            console.log('Error creating mappings', error);
        });
});

module.exports = client;
