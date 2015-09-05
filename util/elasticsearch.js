/// <reference path="../typings/lodash/lodash.d.ts"/>
var elasticsearch = require('elasticsearch');
var fs = require('bluebird').promisifyAll(require('fs'));
var _ = require('lodash');

var url = process.env.ES_URL || 'localhost:9200';
console.log('Connecting to elasticsearch on', url);

var client = new elasticsearch.Client({
    _index: 'ringo',
    host: url,
    log: "debug"
});

var populate = function () {
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
}

var interval = setInterval(function () {
    client.indices.create({
        index: 'ringo'
    }, function (err, res) {
        if (!err) {
            console.log('Index named ringo successfully created');
            clearInterval(interval);
            populate();
            return;
        }
        console.log('Error creating the index', err);
        if (err.message == 'No Living connections') {
            console.log('Connection could not be established, retrying');
            return;
        }
        console.log('Index already existed');
        clearInterval(interval);
    });

}, 1000);


module.exports = client;
