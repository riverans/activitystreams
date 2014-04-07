
var express = require('express');
var http = require('http');

module.exports = {
    fakeServer: function(options) {

        var server = express()
            .use(function(req, res) {
                res.send(options.code, options.respond);
                server.close();
            })
            .listen(sails.config.test.authPolicy.endpoint.port);

        return server;
    },

    createTestJSON: function() {

        return JSON.stringify({
            actor: {
                type: 'user',
                aid: 1
            },
            object: {
                type: 'photo',
                photo_id: '1'
            },
            verb: {
                type: 'FAVORITED'
            }
        });
    },

    createRequestOptions: function(method, path, json) {
        return {
            methodhostname: 'localhost',
            method: method,
            path: path,
            port: sails.config.port,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': json.length,
                'Cookie': 'mmdbsessionid=fake'
            }
        };
    },

    makeRequest: function(options, body, callback) {
        var request = http.request(options, callback);
        request.write(body);
        request.end();
        return request;
    },
}
