
var express = require('express');
var http = require('http');
var util = require('util');

module.exports = {


    /**
     * Creates a lightweight express server that mocks http requests
     * @param  {object} options   An object hash
     * @param {number}  options.code  The status code returned by the fake server
     * @param {object} options.respond  The response body returned by the fake server
     * @return {object} server  The fake server returned
     */
    fakeServer: function(options) {

        respond = JSON.stringify(options.respond);

        var server = express()
            .use(function(req, res) {
                res.send(options.code, respond);
                server.close();
            })
            .listen(sails.config.authPolicy.endpoint.port);

        return server;
    },

    /**
     * A test Activity in a Json string format
     * @return {string} returns A test Activity in a Json string format
     */
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


    /**
     * Creates request options hash which will be used to make a request to a mock server
     * @param  {string} method  the http method the request will be 'GET' or 'POST'
     * @param  {string} path    the path used for the request
     * @param  {string} json    Json String you wish to send over to the request
     * @return {object} options  the object hash used to send a request
     */
    createRequestOptions: function(method, path, json) {

        var sessionCookie = util.format('%s=%s',
            sails.config.authPolicy.endpoint.sessionCookie, 'fake');

        return {
            methodhostname: 'localhost',
            method: method,
            path: path,
            port: sails.config.port,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': json.length,
                'Cookie': sessionCookie
                },
            body:  json
        };
    },

    /**
     * An http request that will be used to hit the mock server
     * @param  {object}   options   hash of request options to use for the request
     * @param  {Function} callback  callback form the server response
     * @return {object}   request   request object
     */
    makeRequest: function(options, callback) {
        var request = http.request(options, callback);
        request.write(options.body);
        request.end();
        return request;
    },
}
