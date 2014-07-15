var request = require('request'),
    url = require('url'),
    assert = require('assert'),
    testUtils = require('./utils'),
    http = require('http'),
    nock = require('nock');

var authService = nock('https://localhost')
    .persist()
    .log(console.log)
    .get('/fakeSession=fake')
    .times(10)
    .reply(401, {
        msg: 'noob'
    });

describe('Test Object Controller  ', function () {

    beforeEach(function (done) {
        nock.restore();
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

    describe('Check Object Requests', function () {
        it('GET: object/{appname_model} (getAllObjectsOfType)', function(done) {
            baseUrl.pathname += 'object/photo';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('GET: object/{appname_model}/{id} (getSpecificObject)', function(done) {
            baseUrl.pathname += 'object/photo/10010';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body){
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('GET: object/{appname_model}/{id}/activities (getAllActivitiesByObject)', function (done) {
            baseUrl.pathname += 'object/photo/10010/activites';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('GET: object/{appname_model}/{id}/{verb} (getAllActorsWhoVerbedObject)', function (done) {
            baseUrl.pathname += 'object/photo/10010/FAVORITED';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body){
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('GET: object/{appname_model}/{id}/{verb}/{appname_model} (getSpecificActorTypeWhoVerbedObject)', function(done) {
            baseUrl.pathname += 'object/photo/10010/FAVORITED/user';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();

            });
        });

        it('GET: object/{appname_model}/{id}/{verb}/{appname_model}/{id} (getActivityByObject)', function(done) {
            baseUrl.pathname += 'object/photo/10010/FAVORITED/user/1';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();

            });
        });
    });

    describe('Check Object DELETE Requests', function () {

        it('DELETE: object/{appname_model}/{id} (deleteSpecificObject) without a valid session', function (done) {
            // var authService = nock('https://localhost')
            //     .get('/fakeSession=fake')
            //     .reply(401, {
            //         msg: 'noob'
            //     });
            // console.log(authService);
            var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/object/app_object/1', '');

            testUtils.makeRequest(requestOptions, function (res) {
                console.log(res);
                assert.equal(res.statusCode, 401);
                authService.done();
                done();
            });
        });

        it('DELETE: object/{appname_model}/{id} (deleteSpecificObject) with a valid session', function (done) {
            // var authService = nock('https://localhost')
            //     .get('/fakeSession=fake')
            //     .reply(200, {
            //         userId: 1121
            //     });
            var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/object/app_object/1', '');

            testUtils.makeRequest(requestOptions, function (res) {
                assert.equal(res.statusCode, 200);
                authService.done();
                done();
            });
        });

        it('DELETE: object/{appname_model}/{id} (deleteSpecificObject) when the node doesn\'t exist', function (done) {
            // var authService = nock('https://localhost')
            //     .get('/fakeSession=fake')
            //     .reply(200, {
            //         userId: 1121
            //     });

            var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/object/app_object/1', '');

            testUtils.makeRequest(requestOptions, function (res) {
                assert.equal(res.statusCode, 200);
                authService.done();
                done();
            });
        });
    });
});