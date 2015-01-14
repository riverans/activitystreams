var request = require('request');
var assert = require('assert');
var url = require('url');
var http = require('http');
var testUtils = require('../utils');

describe('Test Activity Controller  ', function () {
    before(function(done) {
        /** Disable caching. */
        sails.config.cacheEnabled = false;
        done();
    });

    after(function(done) {
        sails.config.cacheEnabled = true;
        done();
    });

    describe('Test POST responses ', function () {
        it('POST: /activity {activity} (postSpecificActivity)', function (done) {
            server = testUtils.fakeServer({code:200, respond:{userId: 1}});
            var postBody = testUtils.createTestJSON();
            var requestOptions = testUtils.createRequestOptions('POST', '/api/v1/activity', postBody);

            server.on("listening", function() {
                testUtils.makeRequest(requestOptions, function (res) {
                    var body = "";

                    res.on("data",function(chunk){
                        body += chunk;
                    });

                    res.on("end",function(){
                        var bodyPOST = JSON.parse(requestOptions.body),
                            bodyResponse = JSON.parse(body)[0];

                        assert.equal(res.statusCode, 200);
                        assert.strictEqual(bodyResponse.actor.data.type,bodyPOST.actor.type);
                        assert.strictEqual(bodyResponse.object.data.type,bodyPOST.object.type);
                        assert.strictEqual(bodyResponse.verb.type,bodyPOST.verb.type);
                        assert.ok(!bodyResponse.target);
                        assert.ok(bodyResponse.actor);
                        assert.ok(bodyResponse.object);
                        assert.ok(bodyResponse.verb);
                        server.close(done);
                    });
                });
            });
        });

        it('POST with TARGET: /activity {activity} (postSpecificActivity)', function (done) {
            server = testUtils.fakeServer({code:200, respond:{userId: 1}});
            var postBody = testUtils.createTestTargetJSON();
            var requestOptions = testUtils.createRequestOptions('POST', '/api/v1/activity', postBody);

            server.on("listening", function() {
                testUtils.makeRequest(requestOptions, function (res) {
                    var body = "";

                    res.on("data",function(chunk){
                        body += chunk;
                    });

                    res.on("end",function(){
                        var bodyPOST = JSON.parse(requestOptions.body),
                            bodyResponse = JSON.parse(body)[0];

                        assert.equal(res.statusCode, 200);
                        assert.strictEqual(bodyResponse.verb.data.target_id, bodyPOST.target.aid);
                        assert.ok(bodyResponse.actor);
                        assert.ok(bodyResponse.object);
                        assert.ok(bodyResponse.verb);
                        assert.ok(bodyResponse.target.id);
                        server.close(done);
                    });
                });
            });
        });
    });

    describe('Test GET Actions', function () {
        it('GET: /activity/{appname_model}/{id}/{verb}/{appname_model}/{id} (getSpecificActivity)', function (done) {
            baseUrl.pathname += 'activity/test_actor/1/FAVORITED/test_object/1';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body);

                assert.equal(response.statusCode, 200);
                assert.strictEqual(bodyResponse.length, 1);
                assert.equal(bodyResponse[0].actor.data.type, "test_actor");
                assert.equal(bodyResponse[0].actor.data.aid, 1);
                assert.equal(bodyResponse[0].verb.type, "FAVORITED");
                assert.equal(bodyResponse[0].object.data.type, "test_object");
                assert.equal(bodyResponse[0].object.data.aid, 1);
                assert.ok(!bodyResponse[0].target.id);
                done();
            });
        });

        it('GET with TARGET: /activity/{appname_model}/{id}/{verb}/{appname_model}/{id} (getSpecificActivity)', function (done) {
            baseUrl.pathname += 'activity/test_actor/1/WROTE/test_object/1';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body);

                assert.equal(response.statusCode, 200);
                assert.strictEqual(bodyResponse.length, 1);
                assert.equal(bodyResponse[0].actor.data.type, "test_actor");
                assert.equal(bodyResponse[0].actor.data.aid, 1);
                assert.equal(bodyResponse[0].verb.type, "WROTE");
                assert.equal(bodyResponse[0].verb.data.target_id, bodyResponse[0].target.data.aid);
                assert.equal(bodyResponse[0].verb.data.target_type, bodyResponse[0].target.data.type);
                assert.equal(bodyResponse[0].object.data.type, "test_object");
                assert.equal(bodyResponse[0].object.data.aid, 1);

                done();
            });
        });
    });

    describe('Test DELETE Actions', function () {
        it('DELETE: /activity/{appname_model}/{id}/{verb}/{appname_model}/{id} (deleteSpecificActivity)', function (done) {
            server = testUtils.fakeServer({code:200, respond:{userId: 1}});
            var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/activity/test_actor/1/FAVORITED/test_object/1', '');

            server.on("listening", function() {
                testUtils.makeRequest(requestOptions, function (res) {
                    assert.equal(res.statusCode, 200);
                    server.close(done);
                });
            });
        });

        it('DELETE TARGET activity: /activity/{appname_model}/{id}/{verb}/{appname_model}/{id} (deleteSpecificActivity)', function (done) {
            server = testUtils.fakeServer({code:200, respond:{userId: 1}});
            var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/activity/test_actor/1/WROTE/test_object/1', '');

            server.on("listening", function() {
                testUtils.makeRequest(requestOptions, function (res) {
                    assert.equal(res.statusCode, 200);
                    server.close(done);
                });
            });
        });
    });
});
