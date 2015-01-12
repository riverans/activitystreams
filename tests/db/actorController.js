var request = require('request'),
    url = require('url'),
    assert = require('assert'),
    testUtils = require('../utils'),
    http = require('http');

describe('Test Actor Controller  ', function () {
    before(function(done) {
        /** Disable caching. */
        sails.config.cacheEnabled = false;
        /** Create activity for actor test */
        server = testUtils.fakeServer({code:200, respond:{userId: 1}});
        var postBody = testUtils.createTestJSON();
        var requestOptions = testUtils.createRequestOptions('POST', '/api/v1/activity', postBody);

        server.on("listening", function() {
            testUtils.makeRequest(requestOptions, function (res) {
                assert.equal(res.statusCode, 200);

                var postBodyTarget = testUtils.createTestTargetJSON();
                var requestTargetOptions = testUtils.createRequestOptions('POST', '/api/v1/activity', postBodyTarget);
                testUtils.makeRequest(requestTargetOptions, function (res) {
                    assert.equal(res.statusCode, 200);
                    server.close(done);
                });
            });
        });
    });

    after(function(done) {
        /** Enable caching. */
        sails.config.cacheEnabled = true;
        done();
    });

    describe('Check Actor GET Requests', function () {
        it('GET: actor/{appname_model} (getAllActorsOfType)', function (done) {
            baseUrl.pathname += 'actor/test_actor';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body)[0];

                assert.equal(response.statusCode, 200);
                assert.equal(bodyResponse.actor.data.type,"test_actor");
                done();
            });
        });

        it('GET: actor/{appname_model}/{id} (getSpecificActor)', function (done) {
            baseUrl.pathname += 'actor/test_actor/1';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body)[0];

                assert.equal(response.statusCode, 200);
                assert.equal(bodyResponse.actor.data.type,"test_actor");
                assert.equal(bodyResponse.actor.data.aid,1);
                done();
            });
        });

        it('GET: actor/{appname_model}/{id}/activities (getAllActivitiesByActor)', function (done) {
            baseUrl.pathname += 'actor/test_actor/1/activities';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body);

                assert.equal(response.statusCode, 200);
                assert.equal(bodyResponse.length, 2);
                assert.equal(bodyResponse[0].verb,"FAVORITED");
                assert.equal(bodyResponse[0].totalItems,1);
                assert.equal(bodyResponse[0].items[0].actor.data.type,"test_actor");
                assert.equal(bodyResponse[0].items[0].actor.data.aid,1);
                assert.equal(bodyResponse[0].items[0].verb.type,"FAVORITED");
                assert.ok(bodyResponse[0].items[0].object);
                assert.ok(!bodyResponse[0].items[0].target.id);
                assert.equal(bodyResponse[1].verb,"WROTE");
                assert.equal(bodyResponse[1].totalItems,1);
                assert.equal(bodyResponse[1].items[0].actor.data.type,"test_actor");
                assert.equal(bodyResponse[1].items[0].actor.data.aid,1);
                assert.equal(bodyResponse[1].items[0].verb.type,"WROTE");
                assert.ok(bodyResponse[1].items[0].object);
                assert.ok(bodyResponse[1].items[0].target.id);
                done();
            });
        });

        it('GET: actor/{appname_model}/{id}/{verb} (getAllObjectsVerbedByActor)', function (done) {
            baseUrl.pathname += 'actor/test_actor/1/FAVORITED';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body)[0];

                assert.equal(response.statusCode, 200);
                assert.equal(bodyResponse.totalItems,1);
                assert.equal(bodyResponse.items[0].actor.data.type,"test_actor");
                assert.equal(bodyResponse.items[0].actor.data.aid,1);
                assert.equal(bodyResponse.items[0].verb.type,"FAVORITED");
                assert.ok(bodyResponse.items[0].object);
                assert.ok(!bodyResponse.items[0].target.id);
                done();
            });
        });

        it('GET: actor/{appname_model}/{id}/{verb}/{appname_model} (getSpecificObjectTypeVerbedByActor)', function (done) {
            baseUrl.pathname += 'actor/test_actor/1/FAVORITED/test_object';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body)[0];

                assert.equal(response.statusCode, 200);
                assert.equal(bodyResponse.totalItems,1);
                assert.equal(bodyResponse.items[0].actor.data.type,"test_actor");
                assert.equal(bodyResponse.items[0].actor.data.aid,1);
                assert.equal(bodyResponse.items[0].verb.type,"FAVORITED");
                assert.equal(bodyResponse.items[0].object.data.type,"test_object");
                assert.ok(!bodyResponse.items[0].target.id);
                done();

            });
        });

        it('GET with TARGET: actor/{appname_model}/{id}/{verb}/{appname_model} (getSpecificObjectTypeVerbedByActor)', function (done) {
            baseUrl.pathname += 'actor/test_actor/1/WROTE/test_object';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body)[0];

                assert.equal(response.statusCode, 200);
                assert.equal(bodyResponse.totalItems,1);
                assert.equal(bodyResponse.items[0].actor.data.type,"test_actor");
                assert.equal(bodyResponse.items[0].actor.data.aid,1);
                assert.equal(bodyResponse.items[0].verb.type,"WROTE");
                assert.equal(bodyResponse.items[0].object.data.type,"test_object");
                assert.ok(bodyResponse.items[0].target.id);
                done();

            });
        });

        it('GET: actor/{appname_model}/{id}/{verb}/{appname_model}/{id} (getActivityByActor)', function (done) {
            baseUrl.pathname += 'actor/test_actor/1/FAVORITED/test_object/1';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body);

                assert.equal(response.statusCode, 200);
                assert.strictEqual(bodyResponse.length,1);
                assert.ok(bodyResponse[0].actor);
                assert.ok(bodyResponse[0].verb);
                assert.ok(bodyResponse[0].object);
                assert.ok(!bodyResponse[0].target.id);
                done();

            });
        });
    });

    describe('Check Actor DELETE Requests', function () {

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

        it('DELETE: actor/{appname_model}/{id} (deleteSpecificActor) with a valid session', function (done) {
            server = testUtils.fakeServer({code:200, respond:{userId: 1}});
            var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/actor/test_actor/1', '');

            server.on("listening", function() {
                testUtils.makeRequest(requestOptions, function (res) {
                    assert.equal(res.statusCode, 200);
                    server.close(done);
                });
            });
        });

        it('DELETE: actor/{appname_model}/{id} (deleteSpecificActor) when the node doesn\'t exist', function (done) {
            server = testUtils.fakeServer({code:200, respond:{userId: 1}});
            var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/actor/test_actor/1', '');

            server.on("listening", function() {
                testUtils.makeRequest(requestOptions, function (res) {
                    assert.equal(res.statusCode, 200);
                    server.close(done);
                });
            });
        });
    });
});
