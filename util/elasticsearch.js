/* global process */
var elasticsearch = require('elasticsearch');

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
});

module.exports = client;
