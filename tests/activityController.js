var request = require('request');
var assert = require('assert');
var url = require('url');
var http = require('http');
var testUtils = require('./utils');
var nock = require('nock');

describe('Test Activity Controller  ', function () {

    beforeEach(function(done) {
        // testEndpoint Auth Policy Setup
        var testEndpoint = {
            host: 'https://localhost',
            port: 443,
            path: '/fakeSession=%s',
            sessionCookie: 'fakeSession'
        };
        sails.config.authPolicy.endpoint = testEndpoint;
        done();
    });

    describe('Test GET Actions', function() {

        it('GET: /activity/{appname_model}/{id}/{verb}/{appname_model}/{id} (getSpecificActivity)', function (done) {
            baseUrl.pathname += 'activity/user/1/FAVORITED/picture/10010';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
    });

    describe('Test POST responses ', function (){

        it('should reject post activity with no session cookie', function (done) {
            baseUrl.pathname += 'activity';
            apiUrl = url.format(baseUrl);
            request.post(apiUrl, function (err, res, body) {
                assert.equal(res.statusCode, 401);
                done();
            });

        });

        it('should reject post activity with an unauthroized user',  function (done) {

            var authService = nock('https://localhost')
                .get('/fakeSession=fake')
                .reply(401, {});

            var postBody = testUtils.createTestJSON();
            var requestOptions = testUtils.createRequestOptions('POST', '/api/v1/activity', postBody);

            testUtils.makeRequest(requestOptions, function(res){
                assert.equal(res.statusCode, 401);
                authService.done();
                done();
            });
        });


        it('POST: /activity {activity} (postSpecificActivity)', function(done) {

            var authService = nock('https://localhost')
                .get('/fakeSession=fake')
                .reply(200, {userId: 1121});

            var postBody = testUtils.createTestJSON();
            var requestOptions = testUtils.createRequestOptions('POST', '/api/v1/activity', postBody);

            testUtils.makeRequest(requestOptions, function(res){
                assert.equal(res.statusCode, 200);
                authService.done();
                done();
            });

        });
    });

    describe('Test DELETE Actions', function() {

        it('should reject del activity with an unauthroized user', function(done) {
            var authService = nock('https://localhost')
                .get('/fakeSession=fake')
                .reply(401, {msg: 'noob'});

            var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/activity/user/1/VERBED/object/1', '');

            testUtils.makeRequest(requestOptions, function(res){
                assert.equal(res.statusCode, 401);
                authService.done();
                done();
            });
        });

        it('DELETE: /activity/{appname_model}/{id}/{verb}/{appname_model}/{id} (deleteSpecificActivity)', function(done) {

            var authService = nock('https://localhost')
                .get('/fakeSession=fake')
                .reply(200, {userId: 1121});

            var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/activity/user/1/VERBED/object/1', '');

            testUtils.makeRequest(requestOptions, function(res){
                assert.equal(res.statusCode, 200);
                authService.done();
                done();
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
