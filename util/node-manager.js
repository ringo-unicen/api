/// <reference path="../typings/node/node.d.ts"/>
var request = require('request-promise');
var elastic = require('./elasticsearch');

var url = process.env.NODE_MANAGER_URL || 'http://localhost:3001/vm';

exports.create = function (id, type) {
    return elastic.getSource({
        index: 'ringo',
        type: 'nodeType',
        id: type
    }).then(function (nodeType) {
      return request.post({
            url: url,
            json: {
                id: id,
                type: nodeType.name
            },
            resolveWithFullResponse: true
        });  
    }).then(function (response) {
        //The response should be 201 with a Location header. Need to parse that to return the id
        if (response.statusCode != 201) {
            console.error('Invadlid response received', response);
            throw new Error('Unexpected status code ' + response.statusCode); 
        }
        var location = response.headers.location;
        console.log('Parsing Location header', location);
        return location.substring(location.lastIndexOf('/') + 1);
    });
};
