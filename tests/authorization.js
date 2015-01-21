var request = require('request');
var assert = require('assert');
var url = require('url');
var http = require('http');
var testUtils = require('./utils');

describe('Test Authorization', function () {
    before(function(done) {
        /** Disable caching. */
        sails.config.cacheEnabled = false;
        done();
    });

    after(function(done) {
        /** Enable caching. */
        sails.config.cacheEnabled = true;
        done();
    });

    describe('Activity controller', function () {
        describe('Test POST Actions', function () {
            it('should reject post activity with no session cookie', function (done) {
                baseUrl.pathname += 'activity';
                apiUrl = url.format(baseUrl);
                request.post(apiUrl, function (err, res, body) {
                    assert.equal(res.statusCode, 401);
                    done();
                });
            });

            it('should reject post activity with an unauthroized user', function (done) {
                server = testUtils.fakeServer({code:401, respond:{}});
                var postBody = testUtils.createTestJSON();
                var requestOptions = testUtils.createRequestOptions('POST', '/api/v1/activity', postBody);
                server.on("listening", function() {
                    testUtils.makeRequest(requestOptions, function (res) {
                        assert.equal(res.statusCode, 401);
                        server.close(done);
                    });
                });
            });

           it('should reject post activity with an actor id different from the user id registered', function (done) {
                server = testUtils.fakeServer({code:200, respond:{userId: 12}});
                var postBody = testUtils.createTestJSON();
                var requestOptions = testUtils.createRequestOptions('POST', '/api/v1/activity', postBody);
                server.on("listening", function() {
                    testUtils.makeRequest(requestOptions, function (res) {
                        assert.equal(res.statusCode, 401);
                        server.close(done);
                    });
                });
            });
        });

        describe('Test DELETE Actions', function () {
            it('should reject del activity with an unauthroized user', function (done) {
                server = testUtils.fakeServer({code:401, respond:{}});
                var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/activity/user/1/VERBED/object/1', '');
                server.on("listening", function() {
                    testUtils.makeRequest(requestOptions, function (res) {
                        assert.equal(res.statusCode, 401);
                        server.close(done);
                    });
                });
            });

            it('should reject del activity with an actor id different from the user id registered', function (done) {
                server = testUtils.fakeServer({code:200, respond:{userId: 12}});
                var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/activity/user/1/FAVORITED/object/1', '');

                server.on("listening", function() {
                    testUtils.makeRequest(requestOptions, function (res) {
                        assert.equal(res.statusCode, 401);
                        server.close(done);
                    });
                });
            });

            it('should reject del request with no session cookie', function (done) {
                baseUrl.pathname = 'api/v1/activity/user/1/VERBED/object/1';
                apiUrl = url.format(baseUrl);
                request.del(apiUrl, function (err, res, body) {
                    assert.equal(res.statusCode, 401);
                    done();
                });
            });
        });
    });

    describe('Actor controller', function () {
        describe('Test DELETE Actions', function () {
            it('DELETE: actor/{appname_model}/{id} (deleteSpecificActor) without a valid session', function (done) {
                server = testUtils.fakeServer({code:401, respond:{}});
                var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/actor/user/1', '');

                server.on("listening", function() {
                    testUtils.makeRequest(requestOptions, function (res) {
                        assert.equal(res.statusCode, 401);
                        server.close(done);
                    });
                });
            });

            it('should reject del activity with an actor id different from the user id registered', function (done) {
                server = testUtils.fakeServer({code:200, respond:{userId: 12}});
                var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/actor/user/1', '');

                server.on("listening", function() {
                    testUtils.makeRequest(requestOptions, function (res) {
                        assert.equal(res.statusCode, 401);
                        server.close(done);
                    });
                });
            });

            it('should reject del request with no session cookie', function (done) {
                baseUrl.pathname = 'api/v1/activity/user/1/VERBED/object/1';
                apiUrl = url.format(baseUrl);
                request.del(apiUrl, function (err, res, body) {
                    assert.equal(res.statusCode, 401);
                    done();
                });
            });
        });
    });
});
